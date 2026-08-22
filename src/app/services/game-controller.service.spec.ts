import { fakeAsync, flush, flushMicrotasks, TestBed, tick } from '@angular/core/testing';
import { Rank } from '../core/models/card.model';
import {
  BattleCardsRevealedEvent,
  GameEvent,
} from '../core/models/game-events.model';
import { DeckColor, GameOutcome, PlayerType } from '../core/models/game-state.model';
import { CampaignProgressionService } from '../core/services/campaign-progression.service';
import { CardComparisonService, ComparisonResult } from '../core/services/card-comparison.service';
import { GameStateService } from '../core/services/game-state.service';
import { OpponentAIService } from '../core/services/opponent-ai.service';
import { SettingsService } from '../core/services/settings.service';
import { TurnResolutionService } from '../core/services/turn-resolution.service';
import { GameEventBusService } from './game-event-bus.service';
import {
  GameControllerService,
  PresentationState,
} from './game-controller.service';
import { StoryBookService } from './story-book.service';

describe('GameControllerService presentation integration', () => {
  let controller: GameControllerService;
  let gameState: GameStateService;
  let comparison: CardComparisonService;
  let opponentAI: OpponentAIService;
  let settings: SettingsService;
  let turnResolution: TurnResolutionService;
  let eventBus: GameEventBusService;
  let storyBook: StoryBookService;
  let progression: CampaignProgressionService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    controller = TestBed.inject(GameControllerService);
    gameState = TestBed.inject(GameStateService);
    comparison = TestBed.inject(CardComparisonService);
    opponentAI = TestBed.inject(OpponentAIService);
    settings = TestBed.inject(SettingsService);
    turnResolution = TestBed.inject(TurnResolutionService);
    eventBus = TestBed.inject(GameEventBusService);
    storyBook = TestBed.inject(StoryBookService);
    progression = TestBed.inject(CampaignProgressionService);

    settings.setTutorialEnabled(false);
    settings.setSoundEnabled(false);
    gameState.initializeGame({ shuffle: false, playerDeckColor: DeckColor.RED });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('keeps a motion-free result readable, then clears it after one Continue', fakeAsync(() => {
    settings.setAutoPlayAnimations(false);
    spyOn(comparison, 'compareCards').and.returnValue(ComparisonResult.PLAYER_WINS);
    spyOn(comparison, 'isSpecialAceVsTwoRule').and.returnValue(false);
    spyOn(opponentAI, 'shouldChallenge').and.returnValue(false);

    expect(controller.playerDrawCard()).toBeTrue();
    flushMicrotasks();

    const result = controller.comparisonPresentation();
    expect(controller.presentationState()).toBe(PresentationState.CLASH_RESOLUTION);
    expect(result?.resolved).toBeTrue();
    expect(result?.player.state).toBe('winner');
    expect(result?.opponent.state).toBe('defeated');
    expect(controller.presentationCanAdvance()).toBeTrue();

    expect(controller.advancePresentation()).toBeTrue();
    expect(controller.advancePresentation()).toBeFalse();
    expect(controller.presentationState()).toBe(PresentationState.CLASH_RESOLUTION);
    tick(15);
    expect(controller.presentationState()).toBe(PresentationState.CLASH_RESOLUTION);
    tick(1);
    flushMicrotasks();

    expect(controller.presentationState()).toBe(PresentationState.READY);
    expect(controller.comparisonPresentation()).toBeNull();
    flush();
  }));

  it('advances only the current visual beat and leaves the next beat timed', fakeAsync(() => {
    settings.setAutoPlayAnimations(true);
    settings.setAnimationSpeed('normal');
    spyOn(comparison, 'compareCards').and.returnValue(ComparisonResult.PLAYER_WINS);
    spyOn(comparison, 'isSpecialAceVsTwoRule').and.returnValue(false);
    spyOn(opponentAI, 'shouldChallenge').and.returnValue(false);

    controller.playerDrawCard();
    expect(controller.presentationState()).toBe(PresentationState.DRAWING);
    expect(controller.advancePresentation()).toBeTrue();
    expect(controller.presentationStepSkipped()).toBeTrue();
    expect(controller.advancePresentation()).toBeFalse();

    tick(16);
    flushMicrotasks();
    expect(controller.presentationState()).toBe(PresentationState.CLASH_REVEAL);
    expect(controller.presentationStepSkipped()).toBeFalse();

    // Normal speed is 1.15x: the 360 ms reveal beat lasts 414 ms.
    tick(413);
    expect(controller.presentationState()).toBe(PresentationState.CLASH_REVEAL);
    tick(1);
    flushMicrotasks();
    expect(controller.presentationState()).toBe(PresentationState.CLASH_RESOLUTION);
    flush();
  }));

  it('replaces the beaten card with the reinforcement for the exact comparison', fakeAsync(() => {
    settings.setAutoPlayAnimations(false);
    const compare = spyOn(comparison, 'compareCards').and.returnValues(
      ComparisonResult.OPPONENT_WINS,
      ComparisonResult.PLAYER_WINS,
    );
    spyOn(comparison, 'isSpecialAceVsTwoRule').and.returnValue(false);

    controller.playerDrawCard();
    flushMicrotasks();
    tick(650);
    flushMicrotasks();
    expect(controller.presentationState()).toBe(PresentationState.PLAYER_CHALLENGE_DECISION);

    const beatenCard = controller.activePlayerCard()!;
    const originalWinner = controller.activeOpponentCard()!;
    controller.handleChallenge(true);
    flushMicrotasks();

    const reinforcement = controller.playerChallengeCard()!;
    const presented = controller.comparisonPresentation();
    expect(reinforcement.rank).toBe(Rank.THREE);
    expect(compare.calls.argsFor(1)).toEqual([reinforcement, originalWinner]);
    expect(presented?.player.cardId).toBe(reinforcement.id);
    expect(presented?.opponent.cardId).toBe(originalWinner.id);
    expect(presented?.player.cardId).not.toBe(beatenCard.id);
    expect(presented?.resolved).toBeTrue();
    expect(controller.isInactiveComparator(beatenCard.id)).toBeFalse();

    controller.advancePresentation();
    tick(16);
    flushMicrotasks();
    expect(controller.presentationState()).toBe(PresentationState.READY);
    expect(controller.comparisonPresentation()).toBeNull();
    flush();
  }));

  it('uses one authoritative physical-card selection through resolver, table, event, and Chronicle', fakeAsync(() => {
    settings.setAutoPlayAnimations(false);
    const compare = spyOn(comparison, 'compareCards').and.returnValues(
      ComparisonResult.TIE,
      ComparisonResult.PLAYER_WINS,
    );
    spyOn(comparison, 'isSpecialAceVsTwoRule').and.returnValue(false);
    spyOn(opponentAI, 'selectBattleTarget').and.returnValue(0);
    const resolveSelection = spyOn(turnResolution, 'resolveBattleSelection').and.callThrough();
    const emitted: GameEvent[] = [];
    const subscription = eventBus.events$.subscribe((event) => emitted.push(event));

    controller.playerDrawCard();
    flushMicrotasks();
    tick(650);
    flushMicrotasks();
    expect(controller.presentationState()).toBe(PresentationState.PLAYER_TARGET_SELECTION);

    const layerBefore = controller.battleLayers().at(-1)!;
    const humanTarget = layerBefore.opponentCards[1];
    const foeTarget = layerBefore.playerCards[0];
    controller.selectBattleCard(humanTarget.id);
    flushMicrotasks();

    const authoritative = resolveSelection.calls.mostRecent().returnValue.battleSelection!;
    const reveal = emitted.find(
      (event): event is BattleCardsRevealedEvent => event.type === 'battle_cards_revealed',
    )!;
    const tableLayer = controller.battleLayers().at(-1)!;
    const tablePlayerSelection = tableLayer.playerCards.find((card) => card.selected)!;
    const tableOpponentSelection = tableLayer.opponentCards.find((card) => card.selected)!;
    const chronicleReveal = storyBook.entries().find((entry) => entry.type === 'battle_reveal')!;

    expect(compare.calls.argsFor(1).map((card) => card.id)).toEqual([
      foeTarget.id,
      humanTarget.id,
    ]);
    expect(authoritative.playerCardId).toBe(foeTarget.id);
    expect(authoritative.opponentCardId).toBe(humanTarget.id);
    expect(reveal.selection).toBe(authoritative);
    expect(reveal.playerChosenCard.id).toBe(authoritative.playerCardId);
    expect(reveal.opponentChosenCard.id).toBe(authoritative.opponentCardId);
    expect(controller.comparisonPresentation()?.player.cardId).toBe(authoritative.playerCardId);
    expect(controller.comparisonPresentation()?.opponent.cardId).toBe(
      authoritative.opponentCardId,
    );
    expect(tablePlayerSelection.id).toBe(authoritative.playerCardId);
    expect(tableOpponentSelection.id).toBe(authoritative.opponentCardId);
    expect(chronicleReveal.cards?.map((card) => card.id)).toEqual([
      authoritative.playerCardId,
      authoritative.opponentCardId,
    ]);

    subscription.unsubscribe();
    flush();
  }));

  it('holds the final 1 badge through settlement, then pops it instead of showing 0', fakeAsync(() => {
    settings.setAutoPlayAnimations(true);
    settings.setAnimationSpeed('normal');
    const compare = spyOn(comparison, 'compareCards').and.returnValue(
      ComparisonResult.OPPONENT_WINS,
    );
    spyOn(comparison, 'isSpecialAceVsTwoRule').and.returnValue(false);

    // Reach a valid one-card state through real settlements so conservation and
    // ownership remain intact; only comparison outcomes are made deterministic.
    while (gameState.playerCardCount() > 1) {
      const cards = gameState.startTurn();
      if (!cards.playerCard || !cards.opponentCard) {
        throw new Error('Expected both cards while preparing the low-deck state');
      }
      turnResolution.resolveTurn(cards.playerCard, cards.opponentCard);
      turnResolution.resolveChallengeConcession(PlayerType.PLAYER);
    }
    expect(gameState.cardConservationReport().valid).toBeTrue();
    expect(gameState.playerCardCount()).toBe(1);

    controller.playerDrawCard();
    expect(gameState.playerCardCount()).toBe(0);
    expect(controller.playerDeckDisplayCount()).toBe(1);

    const finishCurrentBeat = (): void => {
      expect(controller.presentationCanAdvance()).toBeTrue();
      expect(controller.advancePresentation()).toBeTrue();
      tick(16);
      flushMicrotasks();
    };

    finishCurrentBeat(); // deal -> reveal
    finishCurrentBeat(); // reveal -> comparison result
    finishCurrentBeat(); // comparison -> return winner cards
    finishCurrentBeat(); // winner return -> casualty hold
    finishCurrentBeat(); // casualty hold -> Boneyard movement
    finishCurrentBeat(); // Boneyard movement -> final badge pop

    expect(controller.presentationState()).toBe(PresentationState.DECK_DEFEAT_POP);
    expect(controller.deckDefeatPopOwner()).toBe(PlayerType.PLAYER);
    expect(controller.playerDeckDisplayCount()).toBe(1);

    finishCurrentBeat();
    expect(controller.presentationState()).toBe(PresentationState.GAME_OVER);
    expect(controller.deckDefeatPopOwner()).toBeNull();
    expect(controller.playerDeckDisplayCount()).toBe(0);
    expect(gameState.cardConservationReport().valid).toBeTrue();
    expect(compare).toHaveBeenCalled();
    flush();
  }));

  it('records a resolved tied War exactly once and never advances Campaign on abandonment', () => {
    const recordWar = spyOn(progression, 'recordResolvedWar').and.callThrough();
    const internal = controller as unknown as {
      currentWarId: string;
      finishAtGameOver(): void;
    };

    internal.currentWarId = 'resolved-tie-once';
    gameState.endGame(GameOutcome.TIE);
    internal.finishAtGameOver();
    internal.finishAtGameOver();

    expect(recordWar).toHaveBeenCalledTimes(1);
    expect(recordWar.calls.mostRecent().args[0]).toEqual(
      jasmine.objectContaining({
        warId: 'resolved-tie-once',
        outcome: GameOutcome.TIE,
      }),
    );

    recordWar.calls.reset();
    controller.startNewGame();
    const cards = gameState.startTurn();
    expect(cards.playerCard).not.toBeNull();
    expect(gameState.hasMeaningfulUnresolvedGame()).toBeTrue();
    controller.startNewGame('abandon');

    expect(recordWar).not.toHaveBeenCalled();
    expect(progression.currentCampaign().wars.length).toBe(1);
  });
});

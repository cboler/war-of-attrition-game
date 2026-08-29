import { fakeAsync, flush, flushMicrotasks, TestBed, tick } from '@angular/core/testing';
import { Rank } from '../core/models/card.model';
import {
  BattleCardsRevealedEvent,
  GameEvent,
} from '../core/models/game-events.model';
import { DeckColor, GameOutcome, PlayerType } from '../core/models/game-state.model';
import { AuthService } from '../core/services/auth.service';
import { CampaignProgressionService } from '../core/services/campaign-progression.service';
import { CardComparisonService, ComparisonResult } from '../core/services/card-comparison.service';
import { GameStateService } from '../core/services/game-state.service';
import { OpponentAIService } from '../core/services/opponent-ai.service';
import { SettingsService } from '../core/services/settings.service';
import { SoundService } from '../core/services/sound.service';
import { TurnResolutionService } from '../core/services/turn-resolution.service';
import { GameEventBusService } from './game-event-bus.service';
import {
  GameControllerService,
  PresentationState,
} from './game-controller.service';
import { StoryBookService } from './story-book.service';
import { BattleAnimationService } from './battle-animation.service';
import { PresentationSequencerService } from './presentation-sequencer.service';
import { TableReactionService } from './table-reaction.service';

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
  let auth: AuthService;
  let sound: SoundService;
  let battleAnimation: BattleAnimationService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    auth = TestBed.inject(AuthService);
    controller = TestBed.inject(GameControllerService);
    gameState = TestBed.inject(GameStateService);
    comparison = TestBed.inject(CardComparisonService);
    opponentAI = TestBed.inject(OpponentAIService);
    settings = TestBed.inject(SettingsService);
    turnResolution = TestBed.inject(TurnResolutionService);
    eventBus = TestBed.inject(GameEventBusService);
    storyBook = TestBed.inject(StoryBookService);
    progression = TestBed.inject(CampaignProgressionService);
    sound = TestBed.inject(SoundService);
    battleAnimation = TestBed.inject(BattleAnimationService);

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

  it('plays one positive result cue for a player clash win and does not replay it on Continue', fakeAsync(() => {
    settings.setAutoPlayAnimations(false);
    const positive = spyOn(sound, 'playPositiveResolution');
    const negative = spyOn(sound, 'playNegativeResolution');
    spyOn(comparison, 'compareCards').and.returnValue(ComparisonResult.PLAYER_WINS);
    spyOn(comparison, 'isSpecialAceVsTwoRule').and.returnValue(false);
    spyOn(opponentAI, 'shouldChallenge').and.returnValue(false);

    controller.playerDrawCard();
    flushMicrotasks();

    expect(positive).toHaveBeenCalledTimes(1);
    expect(negative).not.toHaveBeenCalled();
    controller.advancePresentation();
    tick(16);
    flushMicrotasks();
    expect(positive).toHaveBeenCalledTimes(1);
    flush();
  }));

  it('plays a negative clash cue, then the reinforcement outcome from the human perspective', fakeAsync(() => {
    settings.setAutoPlayAnimations(false);
    const positive = spyOn(sound, 'playPositiveResolution');
    const negative = spyOn(sound, 'playNegativeResolution');
    spyOn(comparison, 'compareCards').and.returnValues(
      ComparisonResult.OPPONENT_WINS,
      ComparisonResult.PLAYER_WINS,
    );
    spyOn(comparison, 'isSpecialAceVsTwoRule').and.returnValue(false);

    controller.playerDrawCard();
    flushMicrotasks();
    tick(650);
    flushMicrotasks();
    expect(negative).toHaveBeenCalledTimes(1);
    expect(controller.presentationState()).toBe(PresentationState.PLAYER_CHALLENGE_DECISION);

    controller.handleChallenge(true);
    flushMicrotasks();

    expect(positive).toHaveBeenCalledTimes(1);
    expect(negative).toHaveBeenCalledTimes(1);
    flush();
  }));

  it('plays a second negative cue when a player reinforcement fails', fakeAsync(() => {
    settings.setAutoPlayAnimations(false);
    const positive = spyOn(sound, 'playPositiveResolution');
    const negative = spyOn(sound, 'playNegativeResolution');
    spyOn(comparison, 'compareCards').and.returnValues(
      ComparisonResult.OPPONENT_WINS,
      ComparisonResult.OPPONENT_WINS,
    );
    spyOn(comparison, 'isSpecialAceVsTwoRule').and.returnValue(false);

    controller.playerDrawCard();
    flushMicrotasks();
    tick(650);
    flushMicrotasks();
    controller.handleChallenge(true);
    flushMicrotasks();

    expect(positive).not.toHaveBeenCalled();
    expect(negative).toHaveBeenCalledTimes(2);
    flush();
  }));

  it('maps all reinforcement and Battle outcomes from the human perspective without cueing ties', () => {
    const positive = spyOn(sound, 'playPositiveResolution');
    const negative = spyOn(sound, 'playNegativeResolution');
    const battleVictory = spyOn(sound, 'playBattleVictory');
    const battleDefeat = spyOn(sound, 'playBattleDefeat');
    const internal = controller as unknown as {
      playComparisonResolutionSound(result: ComparisonResult, isBattle?: boolean): void;
    };

    internal.playComparisonResolutionSound(ComparisonResult.PLAYER_WINS);
    internal.playComparisonResolutionSound(ComparisonResult.OPPONENT_WINS);
    internal.playComparisonResolutionSound(ComparisonResult.PLAYER_WINS, true);
    internal.playComparisonResolutionSound(ComparisonResult.OPPONENT_WINS, true);
    internal.playComparisonResolutionSound(ComparisonResult.TIE);
    internal.playComparisonResolutionSound(ComparisonResult.TIE, true);

    expect(positive).toHaveBeenCalledTimes(1);
    expect(negative).toHaveBeenCalledTimes(1);
    expect(battleVictory).toHaveBeenCalledTimes(1);
    expect(battleDefeat).toHaveBeenCalledTimes(1);
  });

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
    expect(controller.presentationState()).toBe(
      PresentationState.OPPONENT_CONSIDERING_CHALLENGE,
    );
    expect(controller.battleAnimation()).toBeNull();
    expect(controller.visibleOpponentChallengeCard()).toBeNull();
    flush();
  }));

  it('clears the summoned armies when Continue skips their visual beat', fakeAsync(() => {
    settings.setAutoPlayAnimations(true);
    const sequencer = TestBed.inject(PresentationSequencerService);
    const version = sequencer.begin();
    const internal = controller as unknown as {
      playComparisonSkirmish(winner: PlayerType, sequenceVersion: number): Promise<void>;
    };
    let completed = false;

    void internal.playComparisonSkirmish(PlayerType.OPPONENT, version).then(() => {
      completed = true;
    });

    expect(controller.battleAnimation()?.winner).toBe(PlayerType.OPPONENT);
    expect(controller.presentationCanAdvance()).toBeTrue();
    expect(controller.advancePresentation()).toBeTrue();
    tick(16);
    flushMicrotasks();

    expect(completed).toBeTrue();
    expect(controller.battleAnimation()).toBeNull();
    flush();
  }));

  it('waits for a public AI concession before summoning the player victory skirmish', fakeAsync(() => {
    settings.setAutoPlayAnimations(true);
    settings.setAnimationSpeed('normal');
    spyOn(comparison, 'compareCards').and.returnValue(ComparisonResult.PLAYER_WINS);
    spyOn(comparison, 'isSpecialAceVsTwoRule').and.returnValue(false);
    spyOn(opponentAI, 'shouldChallenge').and.returnValue(false);
    const request = spyOn(battleAnimation, 'request').and.callThrough();

    controller.playerDrawCard();
    tick(322);
    flushMicrotasks();
    tick(414);
    flushMicrotasks();

    expect(controller.presentationState()).toBe(
      PresentationState.OPPONENT_CONSIDERING_CHALLENGE,
    );
    expect(request).not.toHaveBeenCalled();
    expect(controller.battleAnimation()).toBeNull();
    expect(controller.visibleOpponentChallengeCard()).toBeNull();
    expect(controller.cardsMovingToBoneyard()).toEqual([]);
    expect(controller.cardsReturningHome()).toEqual([]);

    // Three consideration beats complete before the branch becomes public.
    tick(794);
    flushMicrotasks();
    expect(controller.presentationState()).toBe(PresentationState.CLASH_RESOLUTION);
    expect(controller.tableMessage()).toBe('Opponent concedes.');
    expect(request).not.toHaveBeenCalled();

    // The final skirmish starts only after the public concession hold.
    tick(345);
    flushMicrotasks();
    expect(request).toHaveBeenCalledOnceWith(PlayerType.PLAYER, DeckColor.RED);
    expect(controller.battleAnimation()).toEqual(jasmine.objectContaining({
      winner: PlayerType.PLAYER,
      loser: PlayerType.OPPONENT,
    }));

    controller.advancePresentation();
    tick(16);
    flushMicrotasks();
    expect(controller.battleAnimation()).toBeNull();
    flush();
  }));

  it('keeps challenge and concession branches presentation-equivalent while the AI considers', fakeAsync(() => {
    settings.setAutoPlayAnimations(true);
    settings.setAnimationSpeed('normal');
    spyOn(comparison, 'compareCards').and.returnValue(ComparisonResult.PLAYER_WINS);
    spyOn(comparison, 'isSpecialAceVsTwoRule').and.returnValue(false);
    const decision = spyOn(opponentAI, 'shouldChallenge');

    const snapshotAtConsideration = (willChallenge: boolean) => {
      decision.and.returnValue(willChallenge);
      controller.playerDrawCard();
      tick(322);
      flushMicrotasks();
      tick(414);
      flushMicrotasks();

      expect(controller.presentationState()).toBe(
        PresentationState.OPPONENT_CONSIDERING_CHALLENGE,
      );
      const snapshot = {
        message: controller.tableMessage(),
        playerDeck: controller.playerDeckDisplayCount(),
        opponentDeck: controller.opponentDeckDisplayCount(),
        playerAtRisk: controller.playerCardsAtRisk(),
        opponentAtRisk: controller.opponentCardsAtRisk(),
        visibleReinforcement: controller.visibleOpponentChallengeCard()?.id ?? null,
        rawReinforcement: controller.opponentChallengeCard()?.id ?? null,
        animation: controller.battleAnimation(),
        movingToBoneyard: [...controller.cardsMovingToBoneyard()],
        returningHome: [...controller.cardsReturningHome()],
        reaction: controller.tableReaction(),
        expression: controller.opponentExpression(),
        boneyardCount: controller.visibleBoneyardCount(),
        activeTurnPresent: gameState.currentState.activeTurn !== null,
      };
      controller.startNewGame();
      flushMicrotasks();
      return snapshot;
    };

    const concessionBranch = snapshotAtConsideration(false);
    const challengeBranch = snapshotAtConsideration(true);

    expect(challengeBranch).toEqual(concessionBranch);
    expect(challengeBranch).toEqual(
      jasmine.objectContaining({
        visibleReinforcement: null,
        rawReinforcement: null,
        animation: null,
        movingToBoneyard: [],
        returningHome: [],
        reaction: null,
        boneyardCount: 0,
        activeTurnPresent: true,
      }),
    );
    controller.startNewGame();
    flush();
  }));

  it('gates a committed AI reinforcement until its public deal and reveal phases', fakeAsync(() => {
    settings.setAutoPlayAnimations(true);
    settings.setAnimationSpeed('normal');
    spyOn(comparison, 'compareCards').and.returnValues(
      ComparisonResult.PLAYER_WINS,
      ComparisonResult.OPPONENT_WINS,
    );
    spyOn(comparison, 'isSpecialAceVsTwoRule').and.returnValue(false);
    spyOn(opponentAI, 'shouldChallenge').and.returnValue(true);

    controller.playerDrawCard();
    tick(322);
    flushMicrotasks();
    tick(414);
    flushMicrotasks();
    expect(controller.presentationState()).toBe(
      PresentationState.OPPONENT_CONSIDERING_CHALLENGE,
    );
    expect(controller.visibleOpponentChallengeCard()).toBeNull();
    expect(controller.battleAnimation()).toBeNull();

    tick(794);
    flushMicrotasks();
    expect(controller.presentationState()).toBe(PresentationState.CHALLENGE_DRAW);
    expect(controller.tableMessage()).toBe('Opponent challenges.');
    expect(controller.opponentChallengeCard()).toBeNull();
    expect(controller.visibleOpponentChallengeCard()).toBeNull();

    tick(300);
    flushMicrotasks();
    const reinforcement = controller.opponentChallengeCard();
    expect(reinforcement).not.toBeNull();
    expect(controller.visibleOpponentChallengeCard()).toBe(reinforcement);
    expect(controller.presentationState()).toBe(PresentationState.CHALLENGE_DRAW);
    expect(controller.battleAnimation()).toBeNull();

    tick(437);
    flushMicrotasks();
    expect(controller.presentationState()).toBe(PresentationState.CHALLENGE_CLASH);
    expect(controller.visibleOpponentChallengeCard()).toBe(reinforcement);
    expect(controller.battleAnimation()).toBeNull();

    tick(552);
    flushMicrotasks();
    expect(controller.battleAnimation()?.winner).toBe(PlayerType.OPPONENT);
    flush();
  }));

  it('does not render a privately committed reinforcement in a consideration fixture', () => {
    const cards = gameState.startTurn();
    expect(cards.playerCard).not.toBeNull();
    expect(cards.opponentCard).not.toBeNull();
    const reinforcement = gameState.beginChallenge(PlayerType.OPPONENT);
    const turn = gameState.currentState.activeTurn;
    expect(reinforcement).not.toBeNull();
    expect(turn).not.toBeNull();

    controller.loadFixtureState({
      phase: PresentationState.OPPONENT_CONSIDERING_CHALLENGE,
      message: 'Reinforce ...',
      presentedTurn: turn,
    });
    expect(controller.opponentChallengeCard()).toBe(reinforcement);
    expect(controller.visibleOpponentChallengeCard()).toBeNull();

    controller.loadFixtureState({
      phase: PresentationState.CHALLENGE_DRAW,
      message: 'Opponent sends reinforcement.',
      presentedTurn: turn,
    });
    expect(controller.visibleOpponentChallengeCard()).toBe(reinforcement);
  });

  it('keeps routine comparison status out of the transient stack but in accessible status and Chronicle', fakeAsync(() => {
    settings.setAutoPlayAnimations(false);
    spyOn(comparison, 'compareCards').and.returnValue(ComparisonResult.PLAYER_WINS);
    spyOn(comparison, 'isSpecialAceVsTwoRule').and.returnValue(false);
    spyOn(opponentAI, 'shouldChallenge').and.returnValue(false);

    controller.playerDrawCard();
    flushMicrotasks();

    const clashEntry = storyBook.entries().find((entry) => entry.type === 'clash');
    expect(clashEntry).toBeDefined();
    const resultMessage = clashEntry!.text;
    expect(resultMessage).toBe('Your card holds. Opponent is considering reinforcement.');
    expect(controller.battlefieldMessages().map((message) => message.text))
      .not.toContain(resultMessage);
    expect(controller.battleAnimation()).toBeNull();
    flush();
  }));

  it('does not let procedural chatter replace authored dialogue or build a queue', fakeAsync(() => {
    const internal = controller as unknown as {
      speakReaction(reaction: {
        speaker: PlayerType;
        message: string;
        category: 'introduction' | 'narrow_clash';
        authored?: boolean;
      }): void;
    };
    const authored = {
      speaker: PlayerType.OPPONENT,
      message: 'The archive has the floor.',
      category: 'introduction' as const,
      authored: true,
    };

    internal.speakReaction(authored);
    internal.speakReaction({
      speaker: PlayerType.PLAYER,
      message: 'One rank was enough.',
      category: 'narrow_clash',
      authored: false,
    });

    expect(controller.tableReaction()).toBe(authored);
    tick(7499);
    expect(controller.tableReaction()).toBe(authored);
    tick(1);
    expect(controller.tableReaction()).toBeNull();
  }));

  it('keeps commander expression presentation-only and returns it to Calm on expiry', fakeAsync(() => {
    const internal = controller as unknown as {
      speakReaction(reaction: {
        speaker: PlayerType;
        message: string;
        category: 'battle';
        authored?: boolean;
        expression: 'angry' | 'smug';
      }): void;
    };
    const before = gameState.cardConservationReport();
    expect(controller.opponentExpression()).toBe('calm');

    internal.speakReaction({
      speaker: PlayerType.OPPONENT,
      message: 'A costly exchange.',
      category: 'battle',
      expression: 'angry',
    });
    expect(controller.opponentExpression()).toBe('angry');
    expect(gameState.cardConservationReport()).toEqual(before);

    tick(5499);
    expect(controller.opponentExpression()).toBe('angry');
    tick(1);
    expect(controller.opponentExpression()).toBe('calm');

    internal.speakReaction({
      speaker: PlayerType.PLAYER,
      message: 'A player-side reaction.',
      category: 'battle',
      expression: 'smug',
    });
    expect(controller.opponentExpression()).toBe('calm');
    expect(gameState.cardConservationReport()).toEqual(before);
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
    const battleVictory = spyOn(sound, 'playBattleVictory');
    const compare = spyOn(comparison, 'compareCards').and.returnValues(
      ComparisonResult.TIE,
      ComparisonResult.PLAYER_WINS,
    );
    spyOn(comparison, 'isSpecialAceVsTwoRule').and.returnValue(false);
    spyOn(opponentAI, 'selectBattleTarget').and.returnValue(0);
    const resolveSelection = spyOn(turnResolution, 'resolveBattleSelection').and.callThrough();
    const requestBattleAnimation = spyOn(battleAnimation, 'request').and.callThrough();
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

    expect(battleVictory).toHaveBeenCalledTimes(1);
    expect(requestBattleAnimation).toHaveBeenCalledOnceWith(PlayerType.PLAYER, DeckColor.RED);
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

  it('abandons a Campaign before initializing its replacement War', () => {
    progression.selectCampaignOrders('standard');
    progression.recordResolvedWar({
      warId: 'campaign-abandon-war-1',
      outcome: GameOutcome.PLAYER_WIN,
      playerCardsRemaining: 3,
      opponentCardsRemaining: 0,
      playerDeckColor: DeckColor.RED,
    });
    const oldCampaignId = progression.currentCampaign().campaignId;
    const completedBefore = auth.userStats().campaignsCompleted;
    const historyBefore = progression.progression().recentCampaigns.length;
    const recordWar = spyOn(progression, 'recordResolvedWar').and.callThrough();
    const events: GameEvent[] = [];
    const subscription = eventBus.events$.subscribe((event) => events.push(event));
    gameState.startTurn();

    expect(controller.abandonCampaign()).toBeTrue();

    expect(progression.currentCampaign().campaignId).not.toBe(oldCampaignId);
    expect(progression.currentCampaign().wars).toEqual([]);
    expect(progression.ordersSelected()).toBeFalse();
    expect(progression.progression().recentCampaigns.length).toBe(historyBefore);
    expect(auth.userStats().campaignsCompleted).toBe(completedBefore);
    expect(recordWar).not.toHaveBeenCalled();
    expect(events.filter((event) => event.type === 'game_abandoned').length).toBe(1);
    expect(events.filter((event) => event.type === 'war_started').length).toBe(1);
    subscription.unsubscribe();
  });

  it('reserves the existing full victory and defeat melodies for final War outcomes', () => {
    const victory = spyOn(sound, 'playVictory');
    const defeat = spyOn(sound, 'playDefeat');
    const internal = controller as unknown as { finishAtGameOver(): void };

    gameState.endGame(GameOutcome.PLAYER_WIN);
    internal.finishAtGameOver();
    expect(victory).toHaveBeenCalledTimes(1);
    expect(defeat).not.toHaveBeenCalled();

    controller.startNewGame();
    gameState.endGame(GameOutcome.OPPONENT_WIN);
    internal.finishAtGameOver();
    expect(victory).toHaveBeenCalledTimes(1);
    expect(defeat).toHaveBeenCalledTimes(1);
  });

  it('primes Ace vs 8 as neutral/ready and resolves Ace as winner with remainder 6 and 8 as defeated at zero', () => {
    const aceCard = { id: 'ace-card-p', rank: Rank.ACE, suit: 'spades', value: 14 } as any;
    const eightCard = { id: 'eight-card-o', rank: Rank.EIGHT, suit: 'hearts', value: 8 } as any;

    const internal = controller as unknown as {
      primeComparison(p: any, o: any): void;
      resolveComparison(p: any, o: any, r: ComparisonResult, s: boolean): void;
    };

    // Pre-resolution: both are primed neutral/ready
    internal.primeComparison(aceCard, eightCard);
    let pres = controller.comparisonPresentation();
    expect(pres).not.toBeNull();
    expect(pres?.resolved).toBeFalse();
    expect(pres?.player.cardId).toBe('ace-card-p');
    expect(pres?.player.state).toBe('ready');
    expect(pres?.player.current).toBe(14);
    expect(pres?.opponent.cardId).toBe('eight-card-o');
    expect(pres?.opponent.state).toBe('ready');
    expect(pres?.opponent.current).toBe(8);

    // Post-resolution: Ace wins with remainder 6 (14 - 8), damage -8; 8 defeated at 0, damage -14
    internal.resolveComparison(aceCard, eightCard, ComparisonResult.PLAYER_WINS, false);
    pres = controller.comparisonPresentation();
    expect(pres?.resolved).toBeTrue();
    expect(pres?.player.cardId).toBe('ace-card-p');
    expect(pres?.player.state).toBe('winner');
    expect(pres?.player.current).toBe(6);
    expect(pres?.player.damage).toBe(-8);
    expect(pres?.opponent.cardId).toBe('eight-card-o');
    expect(pres?.opponent.state).toBe('defeated');
    expect(pres?.opponent.current).toBe(0);
    expect(pres?.opponent.damage).toBe(-14);

    expect(controller.comparisonStrengthFor('ace-card-p')?.state).toBe('winner');
    expect(controller.comparisonStrengthFor('eight-card-o')?.state).toBe('defeated');
  });

  it('primes 8 vs Ace as neutral/ready and resolves Ace as opponent winner with remainder 6 and 8 as player defeated', () => {
    const eightCard = { id: 'eight-card-p', rank: Rank.EIGHT, suit: 'diamonds', value: 8 } as any;
    const aceCard = { id: 'ace-card-o', rank: Rank.ACE, suit: 'clubs', value: 14 } as any;

    const internal = controller as unknown as {
      primeComparison(p: any, o: any): void;
      resolveComparison(p: any, o: any, r: ComparisonResult, s: boolean): void;
    };

    // Pre-resolution
    internal.primeComparison(eightCard, aceCard);
    let pres = controller.comparisonPresentation();
    expect(pres?.resolved).toBeFalse();
    expect(pres?.player.state).toBe('ready');
    expect(pres?.player.current).toBe(8);
    expect(pres?.opponent.state).toBe('ready');
    expect(pres?.opponent.current).toBe(14);

    // Post-resolution: Opponent Ace wins with remainder 6, damage -8; Player 8 defeated at 0, damage -14
    internal.resolveComparison(eightCard, aceCard, ComparisonResult.OPPONENT_WINS, false);
    pres = controller.comparisonPresentation();
    expect(pres?.resolved).toBeTrue();
    expect(pres?.player.cardId).toBe('eight-card-p');
    expect(pres?.player.state).toBe('defeated');
    expect(pres?.player.current).toBe(0);
    expect(pres?.player.damage).toBe(-14);
    expect(pres?.opponent.cardId).toBe('ace-card-o');
    expect(pres?.opponent.state).toBe('winner');
    expect(pres?.opponent.current).toBe(6);
    expect(pres?.opponent.damage).toBe(-8);

    expect(controller.comparisonStrengthFor('eight-card-p')?.state).toBe('defeated');
    expect(controller.comparisonStrengthFor('ace-card-o')?.state).toBe('winner');
  });

  it('primes and resolves 2 vs Ace special rule with winner 2 retaining power 2 and specialOverride true', () => {
    const twoCard = { id: 'two-card-p', rank: Rank.TWO, suit: 'spades', value: 2 } as any;
    const aceCard = { id: 'ace-card-o', rank: Rank.ACE, suit: 'hearts', value: 14 } as any;

    const internal = controller as unknown as {
      primeComparison(p: any, o: any): void;
      resolveComparison(p: any, o: any, r: ComparisonResult, s: boolean): void;
    };

    // Pre-resolution
    internal.primeComparison(twoCard, aceCard);
    let pres = controller.comparisonPresentation();
    expect(pres?.resolved).toBeFalse();
    expect(pres?.player.state).toBe('ready');
    expect(pres?.player.current).toBe(2);
    expect(pres?.opponent.state).toBe('ready');
    expect(pres?.opponent.current).toBe(14);

    // Post-resolution: 2 wins with full power 2 (categorical override), damage 0; Ace defeated at 0, damage -14
    internal.resolveComparison(twoCard, aceCard, ComparisonResult.PLAYER_WINS, true);
    pres = controller.comparisonPresentation();
    expect(pres?.resolved).toBeTrue();
    expect(pres?.player.cardId).toBe('two-card-p');
    expect(pres?.player.state).toBe('winner');
    expect(pres?.player.current).toBe(2);
    expect(pres?.player.damage).toBe(0);
    expect(pres?.player.specialOverride).toBeTrue();
    expect(pres?.opponent.cardId).toBe('ace-card-o');
    expect(pres?.opponent.state).toBe('defeated');
    expect(pres?.opponent.current).toBe(0);
    expect(pres?.opponent.damage).toBe(-14);
    expect(pres?.opponent.specialOverride).toBeTrue();
  });

  it('resets comparison presentation when priming next comparison and clears stale winner/loser states', () => {
    const cardP1 = { id: 'card-p1', rank: Rank.ACE, suit: 'hearts', value: 14 } as any;
    const cardO1 = { id: 'card-o1', rank: Rank.EIGHT, suit: 'clubs', value: 8 } as any;
    const cardP2 = { id: 'card-p2', rank: Rank.SEVEN, suit: 'diamonds', value: 7 } as any;
    const cardO2 = { id: 'card-o2', rank: Rank.KING, suit: 'spades', value: 13 } as any;

    const internal = controller as unknown as {
      primeComparison(p: any, o: any): void;
      resolveComparison(p: any, o: any, r: ComparisonResult, s: boolean): void;
      clearPresentedCards(): void;
    };

    // Turn 1: Player Wins
    internal.primeComparison(cardP1, cardO1);
    internal.resolveComparison(cardP1, cardO1, ComparisonResult.PLAYER_WINS, false);
    expect(controller.comparisonStrengthFor('card-p1')?.state).toBe('winner');
    expect(controller.comparisonStrengthFor('card-o1')?.state).toBe('defeated');

    // Turn 2 begins: prime new cards
    internal.primeComparison(cardP2, cardO2);
    expect(controller.comparisonPresentation()?.resolved).toBeFalse();
    expect(controller.comparisonPresentation()?.player.state).toBe('ready');
    expect(controller.comparisonPresentation()?.opponent.state).toBe('ready');

    // Old cards have no strength views; new unrevealed cards have ready state
    expect(controller.comparisonStrengthFor('card-p1')).toBeNull();
    expect(controller.comparisonStrengthFor('card-o1')).toBeNull();
    expect(controller.comparisonStrengthFor('card-p2')?.state).toBe('ready');
    expect(controller.comparisonStrengthFor('card-o2')?.state).toBe('ready');

    // Turn 2 resolves: Opponent Wins
    internal.resolveComparison(cardP2, cardO2, ComparisonResult.OPPONENT_WINS, false);
    expect(controller.comparisonStrengthFor('card-p2')?.state).toBe('defeated');
    expect(controller.comparisonStrengthFor('card-o2')?.state).toBe('winner');

    // Clear presentation
    internal.clearPresentedCards();
    expect(controller.comparisonPresentation()).toBeNull();
    expect(controller.comparisonStrengthFor('card-p2')).toBeNull();
    expect(controller.comparisonStrengthFor('card-o2')).toBeNull();
  });

  it('emits game_resolved with surviving player card IDs upon game over player victory', () => {
    let resolvedEvent: any = null;
    eventBus.events$.subscribe(event => {
      if (event.type === 'game_resolved') {
        resolvedEvent = event;
      }
    });

    const internal = controller as unknown as { finishAtGameOver(): void };
    const gs = gameState as any;
    gs.outcome.set(GameOutcome.PLAYER_WIN);

    internal.finishAtGameOver();

    expect(resolvedEvent).toBeTruthy();
    expect(resolvedEvent.outcome).toBe(GameOutcome.PLAYER_WIN);
    expect(resolvedEvent.survivingPlayerCardIds.length).toBeGreaterThan(0);
  });

  describe('Limited Reserves gameplay integration', () => {
    beforeEach(() => {
      auth.updateActiveProfileProgression(p => ({
        ...p,
        unlockedChapterModes: ['standard', 'limited_reserves', 'fog_of_war', 'total_war']
      }));
    });

    it('consumes a reserve upon human challenge commitment and chronicles exhaustion when reaching 0', fakeAsync(() => {
      settings.setAutoPlayAnimations(false);
      progression.selectCampaignOrders('limited_reserves');
      expect(progression.remainingReserves()).toBe(5);

      spyOn(comparison, 'compareCards').and.returnValues(
        ComparisonResult.OPPONENT_WINS,
        ComparisonResult.PLAYER_WINS,
      );
      spyOn(comparison, 'isSpecialAceVsTwoRule').and.returnValue(false);

      controller.playerDrawCard();
      flushMicrotasks();
      tick(650);
      flushMicrotasks();

      expect(controller.presentationState()).toBe(PresentationState.PLAYER_CHALLENGE_DECISION);

      // Player accepts challenge
      controller.handleChallenge(true);
      flushMicrotasks();
      tick(1000);
      flush();

      expect(progression.remainingReserves()).toBe(4);
    }));

    it('automatically concedes beaten clash without offering challenge when reserves are exhausted', fakeAsync(() => {
      settings.setAutoPlayAnimations(false);
      progression.selectCampaignOrders('limited_reserves');

      // Exhaust all 5 reserves
      for (let i = 0; i < 5; i++) {
        progression.consumeHumanReserve();
      }
      expect(progression.remainingReserves()).toBe(0);

      spyOn(comparison, 'compareCards').and.returnValue(ComparisonResult.OPPONENT_WINS);
      spyOn(comparison, 'isSpecialAceVsTwoRule').and.returnValue(false);
      spyOn(opponentAI, 'shouldChallenge').and.returnValue(false);

      controller.playerDrawCard();
      flushMicrotasks();
      tick(650);
      flushMicrotasks();

      // Because reserves are 0, player is NOT offered challenge decision
      expect(controller.presentationState()).not.toBe(PresentationState.PLAYER_CHALLENGE_DECISION);
      flush();
    }));

    it('preserves campaignId, mode, and spent reserves on Restart War and does not advance resolved wars', () => {
      progression.selectCampaignOrders('limited_reserves');
      progression.consumeHumanReserve();
      progression.consumeHumanReserve();
      expect(progression.remainingReserves()).toBe(3);

      const campaignIdBefore = progression.currentCampaign().campaignId;
      const commanderBefore = progression.currentCommanderId();
      const scheduleBefore = progression.currentCampaign().commanderSchedule;
      const warsBefore = progression.currentCampaign().wars.length;

      // Player restarts the active War
      controller.startNewGame('restart');

      expect(progression.currentCampaign().campaignId).toBe(campaignIdBefore);
      expect(progression.currentCommanderId()).toBe(commanderBefore);
      expect(progression.currentCampaign().commanderSchedule).toEqual(scheduleBefore);
      expect(progression.activeCampaignMode()).toBe('limited_reserves');
      expect(progression.remainingReserves()).toBe(3);
      expect(progression.currentCampaign().wars.length).toBe(warsBefore);
      expect(progression.ordersSelected()).toBeTrue();
    });

    it('preserves campaignId, mode, and spent reserves on Abandon War', () => {
      progression.selectCampaignOrders('limited_reserves');
      progression.consumeHumanReserve();
      expect(progression.remainingReserves()).toBe(4);

      const campaignIdBefore = progression.currentCampaign().campaignId;
      const commanderBefore = progression.currentCommanderId();
      const scheduleBefore = progression.currentCampaign().commanderSchedule;

      // Player abandons the active War
      controller.startNewGame('abandon');

      expect(progression.currentCampaign().campaignId).toBe(campaignIdBefore);
      expect(progression.currentCommanderId()).toBe(commanderBefore);
      expect(progression.currentCampaign().commanderSchedule).toEqual(scheduleBefore);
      expect(progression.activeCampaignMode()).toBe('limited_reserves');
      expect(progression.remainingReserves()).toBe(4);
      expect(progression.currentCampaign().wars.length).toBe(0);
      expect(progression.ordersSelected()).toBeTrue();
    });

    it('exhausted reserves (0/5) remain exhausted after Restart War or Abandon War', () => {
      progression.selectCampaignOrders('limited_reserves');
      for (let i = 0; i < 5; i++) {
        progression.consumeHumanReserve();
      }
      expect(progression.remainingReserves()).toBe(0);

      // Restart War should NOT refund exhausted reserves
      controller.startNewGame('restart');
      expect(progression.remainingReserves()).toBe(0);
      expect(progression.canHumanReinforce(10)).toBeFalse();

      // Abandon War should NOT refund exhausted reserves
      controller.startNewGame('abandon');
      expect(progression.remainingReserves()).toBe(0);
      expect(progression.canHumanReinforce(10)).toBeFalse();
    });

    it('manages isFogOfWarActive and canInspectCasualties signals correctly across phases', () => {
      progression.selectCampaignOrders('fog_of_war');
      expect(controller.isFogOfWarActive()).toBeTrue();
      expect(controller.canInspectCasualties()).toBeFalse();

      // When game transitions to GAME_OVER
      (controller as any).phase.set(PresentationState.GAME_OVER);
      expect(controller.isFogOfWarActive()).toBeFalse();
      expect(controller.canInspectCasualties()).toBeTrue();

      // Starting next War re-engages the active Fog seal
      controller.startNewGame();
      expect(controller.isFogOfWarActive()).toBeTrue();
      expect(controller.canInspectCasualties()).toBeFalse();
    });

    it('presents commander introduction visibly when orders are selected', () => {
      // In War 1 before orders are selected, intro is deferred until orders confirmation
      expect(progression.ordersSelected()).toBeFalse();

      progression.selectCampaignOrders('standard');
      controller.speakIntroduction();

      expect(controller.tableReaction()).not.toBeNull();
      expect(controller.tableReaction()?.category).toBe('introduction');
      expect(controller.tableReaction()?.speaker).toBe(PlayerType.OPPONENT);
      expect(controller.tableReaction()?.message).toContain('Mont-Rouge');
    });

    it('resets authored dialogue eligibility when the current War is restarted', fakeAsync(() => {
      progression.selectCampaignOrders('standard');
      controller.startNewGame();
      const firstIntroduction = controller.tableReaction()?.message;
      expect(firstIntroduction).toContain('Mont-Rouge');

      controller.startNewGame();
      expect(controller.tableReaction()?.message).toBe(firstIntroduction);
      flush();
    }));

    it('delivers each first-play contextual threshold once without replacing authored speech', () => {
      const reactions = TestBed.inject(TableReactionService);
      const contextual = spyOn(reactions, 'forContextual').and.callThrough();
      const playerCards = gameState.currentPlayerDeck.toArray();
      const opponentCards = gameState.currentOpponentDeck.toArray();
      const internal = controller as unknown as {
        speakFirstPlayContextualBeat(): void;
        reaction: { set(value: null): void };
      };

      gameState.loadFixtureState({
        playerDeckCards: playerCards.slice(0, 18),
        opponentDeckCards: opponentCards,
      });
      internal.speakFirstPlayContextualBeat();
      expect(contextual).toHaveBeenCalledTimes(1);
      expect(controller.tableReaction()?.category).toBe('contextual');

      // The still-readable authored line protects the seam, and the same
      // threshold cannot fire twice after its hold expires.
      internal.speakFirstPlayContextualBeat();
      internal.reaction.set(null);
      internal.speakFirstPlayContextualBeat();
      expect(contextual).toHaveBeenCalledTimes(1);

      gameState.loadFixtureState({
        playerDeckCards: playerCards.slice(0, 10),
        opponentDeckCards: opponentCards,
      });
      internal.speakFirstPlayContextualBeat();
      expect(contextual).toHaveBeenCalledTimes(2);
    });

    it('surfaces guaranteed context line after Turn 1 settles', fakeAsync(() => {
      progression.selectCampaignOrders('standard');
      controller.startNewGame();
      expect(controller.tableReaction()).not.toBeNull(); // Intro spoken

      spyOn(comparison, 'compareCards').and.returnValue(ComparisonResult.PLAYER_WINS);
      spyOn(comparison, 'isSpecialAceVsTwoRule').and.returnValue(false);
      spyOn(opponentAI, 'shouldChallenge').and.returnValue(false);

      // Play Turn 1
      controller.playerDrawCard();
      tick(5000);

      // After Turn 1 completes and field is ready, context reaction is spoken
      expect(controller.tableReaction()).not.toBeNull();
      expect(controller.tableReaction()?.speaker).toBe(PlayerType.OPPONENT);
      expect(controller.tableReaction()?.message).toContain('Witness Wheel');

      // Authored dialogue receives a longer, readable hold than procedural quips.
      tick(8000);
      expect(controller.tableReaction()).toBeNull();
    }));
  });
});

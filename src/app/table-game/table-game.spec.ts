import { ComponentFixture, fakeAsync, flushMicrotasks, TestBed, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CardComparisonService, ComparisonResult } from '../core/services/card-comparison.service';
import { GameStateService } from '../core/services/game-state.service';
import { OpponentAIService } from '../core/services/opponent-ai.service';
import { SettingsService } from '../core/services/settings.service';
import { AchievementService } from '../services/achievement.service';
import { AuthService } from '../core/services/auth.service';
import { StoryBookService } from '../services/story-book.service';
import { GameEvent, GameEventBusService } from '../services/game-event-bus.service';
import {
  GameControllerService,
  PresentationState,
  battleAnnouncementFor,
  casualtyEmphasisFor,
} from '../services/game-controller.service';
import { Card, Rank, Suit } from '../core/models/card.model';
import { PlayerType } from '../core/models/game-state.model';
import { MatDialog } from '@angular/material/dialog';
import { TableGame } from './table-game';

describe('TableGame presentation', () => {
  let fixture: ComponentFixture<TableGame>;
  let controller: GameControllerService;
  let comparison: CardComparisonService;
  let settings: SettingsService;
  let achievements: AchievementService;
  let storyBook: StoryBookService;
  let dialog: MatDialog;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [TableGame],
      providers: [provideRouter([])],
    }).compileComponents();
    settings = TestBed.inject(SettingsService);
    settings.setAutoPlayAnimations(false);
    settings.setSoundEnabled(false);
    settings.setTutorialEnabled(false);
    controller = TestBed.inject(GameControllerService);
    comparison = TestBed.inject(CardComparisonService);
    achievements = TestBed.inject(AchievementService);
    storyBook = TestBed.inject(StoryBookService);
    dialog = TestBed.inject(MatDialog);
    fixture = TestBed.createComponent(TableGame);
    fixture.detectChanges();
  });

  afterEach(() => {
    dialog.closeAll();
    settings.resetSettings();
  });

  function continuePastReadableHold(): void {
    flushMicrotasks();
    expect(controller.presentationCanAdvance()).toBeTrue();
    expect(controller.advancePresentation()).toBeTrue();
    tick(16);
    flushMicrotasks();
    fixture.detectChanges();
  }

  it('does not turn one button tap into a second table-level Continue', () => {
    const advance = spyOn(controller, 'advancePresentation').and.returnValue(true);
    const onTableClick = (
      fixture.componentInstance as unknown as { onTableClick(event: MouseEvent): void }
    ).onTableClick.bind(fixture.componentInstance);
    const button = document.createElement('button');
    const felt = document.createElement('div');

    onTableClick({ target: button } as unknown as MouseEvent);
    expect(advance).not.toHaveBeenCalled();

    onTableClick({ target: felt } as unknown as MouseEvent);
    expect(advance).toHaveBeenCalledTimes(1);
  });

  it('preserves the exact unresolved match across a component remount', fakeAsync(() => {
    const gameState = TestBed.inject(GameStateService);
    const opponentAI = TestBed.inject(OpponentAIService);
    spyOn(comparison, 'compareCards').and.returnValue(ComparisonResult.PLAYER_WINS);
    spyOn(comparison, 'isSpecialAceVsTwoRule').and.returnValue(false);
    spyOn(opponentAI, 'shouldChallenge').and.returnValue(false);

    controller.playerDrawCard();
    flushMicrotasks();
    const before = gameState.currentState;
    const playerDeckBefore = gameState.currentPlayerDeck.toArray().map((card) => card.id);
    const opponentDeckBefore = gameState.currentOpponentDeck.toArray().map((card) => card.id);

    fixture.destroy();
    fixture = TestBed.createComponent(TableGame);
    fixture.detectChanges();

    expect(gameState.currentState).toEqual(before);
    expect(gameState.currentPlayerDeck.toArray().map((card) => card.id)).toEqual(playerDeckBefore);
    expect(gameState.currentOpponentDeck.toArray().map((card) => card.id)).toEqual(
      opponentDeckBefore,
    );
  }));

  it('records one abandonment only for an explicit restart after meaningful play', fakeAsync(() => {
    const auth = TestBed.inject(AuthService);
    const opponentAI = TestBed.inject(OpponentAIService);
    spyOn(comparison, 'compareCards').and.returnValue(ComparisonResult.PLAYER_WINS);
    spyOn(comparison, 'isSpecialAceVsTwoRule').and.returnValue(false);
    spyOn(opponentAI, 'shouldChallenge').and.returnValue(false);

    controller.playerDrawCard();
    flushMicrotasks();
    const before = { ...auth.userStats() };

    controller.startNewGame();
    controller.startNewGame();

    expect(auth.userStats().gamesAbandoned).toBe(before.gamesAbandoned + 1);
    expect(auth.userStats().gamesPlayed).toBe(before.gamesPlayed);
    expect(auth.userStats().gamesLost).toBe(before.gamesLost);
    expect(auth.userStats().currentWinStreak).toBe(before.currentWinStreak);
  }));

  it('does not abandon an untouched or resolved match', () => {
    const auth = TestBed.inject(AuthService);
    const gameState = TestBed.inject(GameStateService);
    const before = auth.userStats().gamesAbandoned;

    controller.startNewGame();
    expect(auth.userStats().gamesAbandoned).toBe(before);

    gameState.endGame();
    controller.startNewGame();
    expect(auth.userStats().gamesAbandoned).toBe(before);
  });

  it('applies a preference without replacing the match', () => {
    const gameState = TestBed.inject(GameStateService);
    const before = gameState.currentState;
    settings.setDeckHand('left');
    expect(gameState.currentState).toEqual(before);
    expect(settings.deckHand()).toBe('left');
  });

  it('emits no challenge offer for either initial 2-vs-Ace orientation', fakeAsync(() => {
    const events: GameEvent[] = [];
    const eventBus = TestBed.inject(GameEventBusService);
    const opponentAI = TestBed.inject(OpponentAIService);
    const compareSpy = spyOn(comparison, 'compareCards');
    spyOn(comparison, 'isSpecialAceVsTwoRule').and.returnValue(true);
    const opponentDecision = spyOn(opponentAI, 'shouldChallenge');
    eventBus.events$.subscribe((event) => events.push(event));

    compareSpy.and.returnValue(ComparisonResult.PLAYER_WINS);
    controller.playerDrawCard();
    flushMicrotasks();
    expect(events.some((event) => event.type === 'challenge_offered')).toBeFalse();
    expect(opponentDecision).not.toHaveBeenCalled();

    controller.startNewGame();
    events.length = 0;
    compareSpy.and.returnValue(ComparisonResult.OPPONENT_WINS);
    controller.playerDrawCard();
    flushMicrotasks();
    expect(controller.canChooseChallenge()).toBeFalse();
    expect(events.some((event) => event.type === 'challenge_offered')).toBeFalse();
  }));

  it('uses the player deck as the primary ready-state action', () => {
    const deck = fixture.nativeElement.querySelector(
      'app-player-seat[table-seat-bottom] button.deck',
    );
    expect(controller.presentationState()).toBe(PresentationState.READY);
    expect(deck).toBeTruthy();
    expect(deck.disabled).toBeFalse();
    expect(deck.getAttribute('aria-label')).toBe('Draw from your deck');
  });

  it('binds handedness correctly to the player seat', () => {
    const seatElem = fixture.nativeElement.querySelector(
      'app-player-seat[table-seat-bottom] .seat',
    );
    const table = fixture.nativeElement.querySelector('.table-page');
    expect(seatElem.classList.contains('deck-left')).toBeFalse();
    expect(table.classList.contains('boneyard-right')).toBeTrue();
    expect(table.classList.contains('boneyard-left')).toBeFalse();

    settings.setDeckHand('left');
    fixture.detectChanges();
    expect(seatElem.classList.contains('deck-left')).toBeTrue();
    expect(table.classList.contains('boneyard-left')).toBeTrue();
    expect(table.classList.contains('boneyard-right')).toBeFalse();
  });

  it('anchors the gameplay surface against vertical swipe drift', () => {
    const hostStyle = getComputedStyle(fixture.nativeElement);
    const tableStyle = getComputedStyle(fixture.nativeElement.querySelector('.table-page'));
    expect(hostStyle.overflowY).toBe('hidden');
    expect(tableStyle.overflowY).toBe('hidden');
    expect(tableStyle.overscrollBehaviorY).toBe('none');
  });

  it('formats restrained Battle escalation and classifies casualty emphasis', () => {
    const card = (rank: Rank): Card => ({
      id: rank,
      rank,
      suit: Suit.HEARTS,
      value: 7,
      isRed: true,
    });

    expect(battleAnnouncementFor(1)).toBe('Battle');
    expect(battleAnnouncementFor(2)).toBe('Battle: Depth 2');
    expect(battleAnnouncementFor(7)).toBe('Battle: Depth 7');
    expect(casualtyEmphasisFor(card(Rank.ACE))).toBe('major');
    expect(casualtyEmphasisFor(card(Rank.TWO))).toBe('major');
    expect(casualtyEmphasisFor(card(Rank.KING))).toBe('face');
    expect(casualtyEmphasisFor(card(Rank.QUEEN))).toBe('face');
    expect(casualtyEmphasisFor(card(Rank.JACK))).toBe('face');
    expect(casualtyEmphasisFor(card(Rank.SEVEN))).toBeNull();
  });

  it('opens and closes the Field Manual drawer using semantic selector', () => {
    expect(fixture.nativeElement.querySelector('app-story-book-drawer')).toBeNull();

    const storyBtn = fixture.nativeElement.querySelector(
      'button[aria-label="Open Field Manual"]',
    ) as HTMLButtonElement;
    expect(storyBtn).toBeTruthy();
    storyBtn.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-story-book-drawer')).toBeTruthy();
  });

  it('clears Story Book on new game and does not leak events between games', () => {
    storyBook.addEntry({
      turnNumber: 1,
      type: 'clash',
      text: 'Sample event',
      badge: 'victory',
    });
    expect(storyBook.hasEntries()).toBeTrue();

    // Trigger new game
    controller.startNewGame();
    fixture.detectChanges();

    expect(storyBook.entries().length).toBe(0);
    expect(storyBook.hasEntries()).toBeFalse();
  });

  it('exposes only sanitized hidden views and newest-layer target actions', fakeAsync(() => {
    const compareSpy = spyOn(comparison, 'compareCards').and.returnValue(ComparisonResult.TIE);
    spyOn(comparison, 'isSpecialAceVsTwoRule').and.returnValue(false);

    controller.playerDrawCard();
    continuePastReadableHold();

    expect(controller.presentationState()).toBe(PresentationState.PLAYER_TARGET_SELECTION);
    const firstLayer = controller.battleLayers()[0];
    expect(firstLayer.opponentCards.every((view) => view.eligible)).toBeTrue();
    expect(
      firstLayer.opponentCards.every((view) => view.card === null && view.faceDown),
    ).toBeTrue();
    expect(firstLayer.playerCards.every((view) => !view.eligible && view.card === null)).toBeTrue();
    expect(fixture.nativeElement.querySelector('.announcement .eyebrow').textContent.trim()).toBe(
      'Battle',
    );

    controller.selectBattleCard(firstLayer.opponentCards[0].id);
    continuePastReadableHold();

    expect(controller.presentationState()).toBe(PresentationState.PLAYER_TARGET_SELECTION);
    expect(controller.battleLayers().length).toBe(2);
    const [oldLayer, newestLayer] = controller.battleLayers();
    expect(oldLayer.receded).toBeTrue();
    expect(oldLayer.opponentCards.every((view) => !view.eligible)).toBeTrue();
    expect(newestLayer.opponentCards.every((view) => view.eligible)).toBeTrue();
    expect(
      oldLayer.opponentCards.filter((view) => !view.selected).every((view) => view.card === null),
    ).toBeTrue();
    expect(
      oldLayer.playerCards.filter((view) => !view.selected).every((view) => view.card === null),
    ).toBeTrue();
    const announcement = fixture.nativeElement.querySelector('.announcement');
    expect(announcement.querySelector('.eyebrow').textContent.trim()).toBe('Battle: Depth 2');
    expect(announcement.classList.contains('battle-quake-2')).toBeFalse();
    expect(announcement.textContent).not.toContain('😰');
    compareSpy.and.callThrough();
  }));

  it('publishes casualties without leaking hidden Battle winner identities', fakeAsync(() => {
    const events: GameEvent[] = [];
    const eventBus = TestBed.inject(GameEventBusService);
    const gameState = TestBed.inject(GameStateService);
    const compareSpy = spyOn(comparison, 'compareCards');
    spyOn(comparison, 'isSpecialAceVsTwoRule').and.returnValue(false);
    eventBus.events$.subscribe((event) => events.push(event));
    compareSpy.and.returnValues(ComparisonResult.TIE, ComparisonResult.PLAYER_WINS);

    controller.playerDrawCard();
    tick(650);
    flushMicrotasks();
    const trigger = controller.activeOpponentCard()!;
    const layer = controller.battleLayers()[0];
    const internalPlayerLayerIds = gameState.currentState.activeTurn!.battleLayers[0].playerCards
      .map((card) => card.id);
    const chosenChampion = layer.opponentCards[1];

    controller.selectBattleCard(chosenChampion.id);
    tick(650);
    flushMicrotasks();
    fixture.detectChanges();

    const casualties = events.filter(
      (event): event is Extract<GameEvent, { type: 'casualty_revealed' }> =>
        event.type === 'casualty_revealed',
    );
    expect(casualties.map((event) => event.casualtyIndex)).toEqual([1, 2, 3, 4]);
    expect(casualties.every((event) => event.totalCasualties === 4)).toBeTrue();
    expect(casualties.map((event) => event.card.id)).toContain(trigger.id);
    expect(casualties.map((event) => event.card.id)).toContain(chosenChampion.id);
    expect(new Set(casualties.map((event) => event.card.id)).size).toBe(4);
    expect(controller.visibleBoneyardCount()).toBe(4);

    const battleResolved = events.find(
      (event): event is Extract<GameEvent, { type: 'battle_resolved' }> =>
        event.type === 'battle_resolved',
    );
    expect(battleResolved).toBeDefined();
    const publicOutcome = battleResolved!.outcome;
    const hiddenWinnerIds = internalPlayerLayerIds.filter(
      (id) => id !== publicOutcome.selection?.playerCardId,
    );
    expect(publicOutcome.hiddenWinnerCount).toBe(hiddenWinnerIds.length);
    expect(publicOutcome.casualtyIds).toEqual(casualties.map((event) => event.card.id));
    const serializedPublicEvent = JSON.stringify(battleResolved);
    hiddenWinnerIds.forEach((id) => {
      expect(serializedPublicEvent).not.toContain(`"${id}"`);
    });
    expect((publicOutcome as unknown as { hiddenWinnerCards?: unknown }).hiddenWinnerCards)
      .toBeUndefined();
    expect((publicOutcome as unknown as { layers?: unknown }).layers).toBeUndefined();
    expect((publicOutcome as unknown as { winningCards?: unknown }).winningCards).toBeUndefined();

    const manual = storyBook.entries().find((entry) => entry.type === 'casualty');
    expect(manual?.cards?.length).toBe(4);
    expect(manual?.cards?.map((card) => card.id)).toEqual(casualties.map((event) => event.card.id));
  }));

  it('accepts only one champion selection and ignores obsolete work after a new game', fakeAsync(() => {
    settings.setAutoPlayAnimations(true);
    const events: GameEvent[] = [];
    const eventBus = TestBed.inject(GameEventBusService);
    eventBus.events$.subscribe((event) => events.push(event));
    spyOn(comparison, 'compareCards').and.returnValue(ComparisonResult.TIE);
    spyOn(comparison, 'isSpecialAceVsTwoRule').and.returnValue(false);

    controller.playerDrawCard();
    tick(3000);
    const layer = controller.battleLayers()[0];
    expect(achievements.latestUnlock()).toBeNull();
    controller.selectBattleCard(layer.opponentCards[0].id);
    controller.selectBattleCard(layer.opponentCards[1].id);
    expect(
      events.filter(
        (event) => event.type === 'battle_target_selected' && event.selector === PlayerType.PLAYER,
      ).length,
    ).toBe(1);

    controller.startNewGame();
    expect(achievements.latestUnlock()?.id).toBe('war.first_battle');
    tick(5000);
    flushMicrotasks();

    expect(controller.presentationState()).toBe(PresentationState.READY);
    expect(TestBed.inject(GameStateService).playerCardCount()).toBe(26);
    expect(TestBed.inject(GameStateService).discardedCardCount()).toBe(0);
  }));

  it('keeps a settled ordinary casualty out of the visible Boneyard until it arrives', fakeAsync(() => {
    settings.setAutoPlayAnimations(true);
    settings.setAnimationSpeed('normal');
    const gameState = TestBed.inject(GameStateService);
    const opponentAI = TestBed.inject(OpponentAIService);
    spyOn(comparison, 'compareCards').and.returnValue(ComparisonResult.PLAYER_WINS);
    spyOn(comparison, 'isSpecialAceVsTwoRule').and.returnValue(false);
    spyOn(opponentAI, 'shouldChallenge').and.returnValue(false);

    controller.playerDrawCard();
    tick(800);
    fixture.detectChanges();

    expect(gameState.discardedCardCount()).toBe(1);
    expect(controller.visibleBoneyardCount()).toBe(0);
    expect(fixture.nativeElement.querySelector('.boneyard-empty small').textContent.trim()).toBe(
      'No cards lost',
    );

    tick(3000);
    fixture.detectChanges();
    expect(controller.visibleBoneyardCount()).toBe(1);
    expect(fixture.nativeElement.querySelector('.boneyard small').textContent.trim()).toBe(
      '1 lost',
    );
  }));

  it('opens an exact Boneyard casualty reference without mutating the War', fakeAsync(() => {
    const gameState = TestBed.inject(GameStateService);
    const opponentAI = TestBed.inject(OpponentAIService);
    spyOn(comparison, 'compareCards').and.returnValue(ComparisonResult.PLAYER_WINS);
    spyOn(comparison, 'isSpecialAceVsTwoRule').and.returnValue(false);
    spyOn(opponentAI, 'shouldChallenge').and.returnValue(false);

    controller.playerDrawCard();
    continuePastReadableHold();
    expect(controller.visibleBoneyardCount()).toBe(1);
    const before = {
      player: gameState.currentPlayerDeck.toArray().map((card) => card.id),
      opponent: gameState.currentOpponentDeck.toArray().map((card) => card.id),
      boneyard: controller.visibleBoneyardCards().map((card) => card.id),
      turn: gameState.currentStats.turnNumber,
    };

    (fixture.nativeElement.querySelector('.boneyard') as HTMLButtonElement).click();
    fixture.detectChanges();
    const referenceButton = fixture.nativeElement.querySelector(
      '.boneyard-card-reference',
    ) as HTMLButtonElement;
    referenceButton.focus();
    referenceButton.click();
    fixture.detectChanges();
    tick();

    const reference = fixture.nativeElement.querySelector('.card-reference');
    expect(reference).toBeTruthy();
    expect(reference.textContent).toContain(before.boneyard[0]);
    expect(gameState.currentPlayerDeck.toArray().map((card) => card.id)).toEqual(before.player);
    expect(gameState.currentOpponentDeck.toArray().map((card) => card.id)).toEqual(before.opponent);
    expect(controller.visibleBoneyardCards().map((card) => card.id)).toEqual(before.boneyard);
    expect(gameState.currentStats.turnNumber).toBe(before.turn);

    (fixture.nativeElement.querySelector('button[aria-label="Close Field Manual"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(document.activeElement).toBe(referenceButton);
  }));
});

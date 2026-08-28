import { ComponentFixture, fakeAsync, flush, flushMicrotasks, TestBed, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CardComparisonService, ComparisonResult } from '../core/services/card-comparison.service';
import { GameStateService } from '../core/services/game-state.service';
import { OpponentAIService } from '../core/services/opponent-ai.service';
import { SettingsService } from '../core/services/settings.service';
import { AchievementService } from '../services/achievement.service';
import { AuthService } from '../core/services/auth.service';
import { CampaignProgressionService } from '../core/services/campaign-progression.service';
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

    expect(controller.battleAnimation()).not.toBeNull();
    expect(controller.advancePresentation()).toBeTrue();
    tick(16);
    flushMicrotasks();
    expect(controller.battleAnimation()).toBeNull();
    flush();
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

  it('triggers Campaign Orders dialog on draw when orders are unselected and blocks card draw', () => {
    const progression = TestBed.inject(CampaignProgressionService);
    const component = fixture.componentInstance;
    const dialogSpy = spyOn(dialog, 'open').and.callThrough();
    const drawSpy = spyOn(controller, 'playerDrawCard');

    // Force unselected orders state
    expect(progression.ordersSelected()).toBeFalse();
    expect(progression.campaignWarIndex()).toBe(1);

    (component as any).draw();

    expect(dialogSpy).toHaveBeenCalled();
    expect(drawSpy).not.toHaveBeenCalled();
  });

  it('triggers Campaign Orders dialog on restart when a new Campaign begins before War 1', () => {
    const progression = TestBed.inject(CampaignProgressionService);
    const component = fixture.componentInstance;
    const dialogSpy = spyOn(dialog, 'open').and.callThrough();

    expect(progression.ordersSelected()).toBeFalse();
    expect(progression.campaignWarIndex()).toBe(1);

    (component as any).restart();

    expect(dialogSpy).toHaveBeenCalled();
  });

  describe('comparison glow lifecycle and face-down hidden information invariant', () => {
    it('returns null glow for unrevealed / ready comparisons and applies outcome glow only when resolved', () => {
      const cardP = { id: 'card-p1', rank: Rank.ACE, suit: 'hearts', value: 14 } as any;
      const cardO = { id: 'card-o1', rank: Rank.EIGHT, suit: 'clubs', value: 8 } as any;
      const internal = controller as unknown as {
        primeComparison(p: any, o: any): void;
        resolveComparison(p: any, o: any, r: ComparisonResult, s: boolean): void;
        clearPresentedCards(): void;
      };
      const component = fixture.componentInstance;

      // 1. Newly primed comparison (ready / unrevealed): NO outcome glow
      internal.primeComparison(cardP, cardO);
      expect((component as any).cardGlow(cardP.id)).toBeNull();
      expect((component as any).cardGlow(cardO.id)).toBeNull();

      // 2. Resolved comparison: Player wins
      internal.resolveComparison(cardP, cardO, ComparisonResult.PLAYER_WINS, false);
      expect((component as any).cardGlow(cardP.id)).toBe('green');
      expect((component as any).cardGlow(cardO.id)).toBe('red');

      // 3. Advancing to next comparison: prime new cards -> glow is immediately cleared
      const cardP2 = { id: 'card-p2', rank: Rank.SEVEN, suit: 'diamonds', value: 7 } as any;
      const cardO2 = { id: 'card-o2', rank: Rank.KING, suit: 'spades', value: 13 } as any;
      internal.primeComparison(cardP2, cardO2);
      expect((component as any).cardGlow(cardP.id)).toBeNull();
      expect((component as any).cardGlow(cardO.id)).toBeNull();
      expect((component as any).cardGlow(cardP2.id)).toBeNull();
      expect((component as any).cardGlow(cardO2.id)).toBeNull();

      // 4. Resolve Turn 2 (Opponent wins): only Turn 2 cards receive glow
      internal.resolveComparison(cardP2, cardO2, ComparisonResult.OPPONENT_WINS, false);
      expect((component as any).cardGlow(cardP2.id)).toBe('red');
      expect((component as any).cardGlow(cardO2.id)).toBe('green');

      // 5. Settlement cleanup: clearing presentation removes all glow
      internal.clearPresentedCards();
      expect((component as any).cardGlow(cardP2.id)).toBeNull();
      expect((component as any).cardGlow(cardO2.id)).toBeNull();
    });

    it('correctly transitions between opposite consecutive comparison outcomes without leaking stale glow', fakeAsync(() => {
      const opponentAI = TestBed.inject(OpponentAIService);
      const compareSpy = spyOn(comparison, 'compareCards');
      spyOn(comparison, 'isSpecialAceVsTwoRule').and.returnValue(false);
      spyOn(opponentAI, 'shouldChallenge').and.returnValue(false);
      const component = fixture.componentInstance;

      // Turn 1: Player Wins
      compareSpy.and.returnValue(ComparisonResult.PLAYER_WINS);
      controller.playerDrawCard();
      continuePastReadableHold();

      // Turn 1 settled cleanly into READY with no lingering comparison presentation
      expect(controller.presentationState()).toBe(PresentationState.READY);
      expect(controller.activePlayerCard()).toBeNull();
      expect(controller.activeOpponentCard()).toBeNull();
      expect(controller.comparisonPresentation()).toBeNull();

      // Turn 2: Opponent Wins
      compareSpy.and.returnValue(ComparisonResult.OPPONENT_WINS);
      controller.playerDrawCard();
      continuePastReadableHold();

      // In Turn 2, player is offered challenge
      expect(controller.presentationState()).toBe(PresentationState.PLAYER_CHALLENGE_DECISION);
      const turn2Player = controller.activePlayerCard()!;
      const turn2Opponent = controller.activeOpponentCard()!;
      expect((component as any).cardGlow(turn2Player.id)).toBe('red');
      expect((component as any).cardGlow(turn2Opponent.id)).toBe('green');

      // Decline challenge to settle Turn 2
      controller.handleChallenge(false);
      flushMicrotasks();
      fixture.detectChanges();

      expect(controller.presentationState()).toBe(PresentationState.READY);
      expect(controller.comparisonPresentation()).toBeNull();
    }));

    it('seals Boneyard button and drawer during active Fog of War, then unseals upon game over', fakeAsync(() => {
      const progressionService = TestBed.inject(CampaignProgressionService);
      const authService = TestBed.inject(AuthService);
      authService.updateActiveProfileProgression(p => ({
        ...p,
        unlockedChapterModes: ['standard', 'limited_reserves', 'fog_of_war', 'total_war']
      }));
      progressionService.selectCampaignOrders('fog_of_war');
      fixture.detectChanges();

      expect(progressionService.isFogOfWar()).toBeTrue();
      expect(controller.isFogOfWarActive()).toBeTrue();

      const boneyardBtn = fixture.nativeElement.querySelector('.boneyard') as HTMLButtonElement;
      expect(boneyardBtn).toBeTruthy();
      expect(boneyardBtn.classList).toContain('fog-sealed');
      expect(boneyardBtn.disabled).toBeTrue();
      expect(boneyardBtn.textContent).toContain('Sealed');

      // Attempting to toggle Boneyard is blocked
      boneyardBtn.click();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.boneyard-drawer')).toBeNull();

      // Simulate a card discarded to boneyard
      const dummyCard = { id: 'dummy-card', rank: Rank.KING, suit: Suit.SPADES, value: 13, isRed: false };
      const gameState = TestBed.inject(GameStateService);
      (gameState as any).discardPile.set([dummyCard]);
      fixture.detectChanges();

      // Card is in boneyard, but top card is faceDown and count is hidden behind "Sealed"
      expect(boneyardBtn.classList).toContain('fog-sealed');
      expect(boneyardBtn.textContent).toContain('Sealed');
      expect((fixture.componentInstance as any).isFogOfWarActive()).toBeTrue();

      // War concludes (GAME_OVER)
      (controller as any).phase.set(PresentationState.GAME_OVER);
      fixture.detectChanges();

      expect(controller.isFogOfWarActive()).toBeFalse();
      expect(boneyardBtn.classList).not.toContain('fog-sealed');
      expect(boneyardBtn.disabled).toBeFalse();
      expect(boneyardBtn.textContent).toContain('1 lost');

      // Boneyard can now be toggled open
      boneyardBtn.click();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.boneyard-drawer')).toBeTruthy();
    }));
  });

  describe('Chapter I Narrative Vertical Slice Presentation', () => {
    it('presents named opponent commander on table and deep-links to dossier on click', fakeAsync(() => {
      const progression = TestBed.inject(CampaignProgressionService);
      progression.selectCampaignOrders('standard');
      fixture.detectChanges();

      const opponentIdentity = controller.opponentCommanderIdentity();
      expect(opponentIdentity.name).toBe('Marcel de Brie');
      expect(opponentIdentity.title).toBe('French Master Affineur');
      expect(opponentIdentity.faction).toBe('French Delegation');

      // Check opponent seat presentation
      const opponentSeat = fixture.nativeElement.querySelector('app-player-seat:not(.current-player)');
      expect(opponentSeat).toBeTruthy();
      expect(opponentSeat.textContent).toContain('Marcel de Brie');
      expect(opponentSeat.textContent).toContain('French Master Affineur');
      const calmPortrait = opponentSeat.querySelector('.commander-portrait') as HTMLImageElement;
      expect(calmPortrait.src).toContain('/assets/commanders/quartermaster/calm.jpg');
      expect(calmPortrait.alt).toBe('');
      expect(opponentSeat.querySelector('.commander-portrait-frame')?.getAttribute('data-expression'))
        .toBe('calm');

      // Click opponent identity button
      const identityBtn = opponentSeat.querySelector('.identity-button') as HTMLButtonElement;
      expect(identityBtn).toBeTruthy();
      identityBtn.click();
      fixture.detectChanges();
      tick();

      // Field manual drawer opens focused on Marcel's dossier
      expect((fixture.componentInstance as any).storyBookOpen()).toBeTrue();
      expect((fixture.componentInstance as any).dossierTargetCommander()).toBe('quartermaster');

      const drawer = fixture.nativeElement.querySelector('app-story-book-drawer');
      expect(drawer).toBeTruthy();
    }));

    it('renders an explicit opponent reaction expression without changing accessible copy', () => {
      controller.loadFixtureState({
        phase: PresentationState.READY,
        message: 'Draw when ready.',
        battlefieldMessages: [{ id: 1, text: 'Routine comparison detail.' }],
        commander: 'gambler',
        reaction: {
          speaker: PlayerType.OPPONENT,
          message: 'The rule keeps one excellent surprise in its sleeve.',
          category: 'special_clash',
          authored: true,
          expression: 'surprised',
        },
      });
      fixture.detectChanges();

      const opponentSeat = fixture.nativeElement.querySelector(
        'app-player-seat:not(.current-player)',
      ) as HTMLElement;
      const portrait = opponentSeat.querySelector('.commander-portrait') as HTMLImageElement;
      expect(portrait.src).toContain('/assets/commanders/gambler/surprised.jpg');
      expect(portrait.alt).toBe('');
      expect(opponentSeat.textContent).toContain('Sir Edmund Gloucester');
      expect(opponentSeat.textContent).toContain('The rule keeps one excellent surprise');
      expect(fixture.nativeElement.querySelector('.message-stack')).toBeFalsy();
      expect(fixture.nativeElement.querySelector('.announcement .sr-only').textContent)
        .toContain('Draw when ready.');
    });
  });
});

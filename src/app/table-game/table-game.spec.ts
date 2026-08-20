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
  casualtyEmphasisFor
} from '../services/game-controller.service';
import { Card, Rank, Suit } from '../core/models/card.model';
import { TableGame } from './table-game';

describe('TableGame presentation', () => {
  let fixture: ComponentFixture<TableGame>;
  let controller: GameControllerService;
  let comparison: CardComparisonService;
  let settings: SettingsService;
  let achievements: AchievementService;
  let storyBook: StoryBookService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [TableGame],
      providers: [provideRouter([])]
    }).compileComponents();
    settings = TestBed.inject(SettingsService);
    settings.setAutoPlayAnimations(false);
    settings.setSoundEnabled(false);
    controller = TestBed.inject(GameControllerService);
    comparison = TestBed.inject(CardComparisonService);
    achievements = TestBed.inject(AchievementService);
    storyBook = TestBed.inject(StoryBookService);
    fixture = TestBed.createComponent(TableGame);
    fixture.detectChanges();
  });

  afterEach(() => settings.resetSettings());

  it('preserves the exact unresolved match across a component remount', fakeAsync(() => {
    const gameState = TestBed.inject(GameStateService);
    const opponentAI = TestBed.inject(OpponentAIService);
    spyOn(comparison, 'compareCards').and.returnValue(ComparisonResult.PLAYER_WINS);
    spyOn(comparison, 'isSpecialAceVsTwoRule').and.returnValue(false);
    spyOn(opponentAI, 'shouldChallenge').and.returnValue(false);

    controller.playerDrawCard();
    flushMicrotasks();
    const before = gameState.currentState;
    const playerDeckBefore = gameState.currentPlayerDeck.toArray().map(card => card.id);
    const opponentDeckBefore = gameState.currentOpponentDeck.toArray().map(card => card.id);

    fixture.destroy();
    fixture = TestBed.createComponent(TableGame);
    fixture.detectChanges();

    expect(gameState.currentState).toEqual(before);
    expect(gameState.currentPlayerDeck.toArray().map(card => card.id)).toEqual(playerDeckBefore);
    expect(gameState.currentOpponentDeck.toArray().map(card => card.id)).toEqual(opponentDeckBefore);
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
    eventBus.events$.subscribe(event => events.push(event));

    compareSpy.and.returnValue(ComparisonResult.PLAYER_WINS);
    controller.playerDrawCard();
    flushMicrotasks();
    expect(events.some(event => event.type === 'challenge_offered')).toBeFalse();
    expect(opponentDecision).not.toHaveBeenCalled();

    controller.startNewGame();
    events.length = 0;
    compareSpy.and.returnValue(ComparisonResult.OPPONENT_WINS);
    controller.playerDrawCard();
    flushMicrotasks();
    expect(controller.canChooseChallenge()).toBeFalse();
    expect(events.some(event => event.type === 'challenge_offered')).toBeFalse();
  }));

  it('uses the player deck as the primary ready-state action', () => {
    const deck = fixture.nativeElement.querySelector('app-player-seat[table-seat-bottom] button.deck');
    expect(controller.presentationState()).toBe(PresentationState.READY);
    expect(deck).toBeTruthy();
    expect(deck.disabled).toBeFalse();
    expect(deck.getAttribute('aria-label')).toBe('Draw from your deck');
  });

  it('binds handedness correctly to the player seat', () => {
    const seatElem = fixture.nativeElement.querySelector('app-player-seat[table-seat-bottom] .seat');
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
      isRed: true
    });

    expect(battleAnnouncementFor(1)).toBe('Battle 1!');
    expect(battleAnnouncementFor(2)).toBe('Battle 2!!');
    expect(battleAnnouncementFor(7)).toBe('Battle 7!!!!');
    expect(casualtyEmphasisFor(card(Rank.ACE))).toBe('major');
    expect(casualtyEmphasisFor(card(Rank.TWO))).toBe('major');
    expect(casualtyEmphasisFor(card(Rank.KING))).toBe('face');
    expect(casualtyEmphasisFor(card(Rank.QUEEN))).toBe('face');
    expect(casualtyEmphasisFor(card(Rank.JACK))).toBe('face');
    expect(casualtyEmphasisFor(card(Rank.SEVEN))).toBeNull();
  });

  it('opens and closes the Field Manual drawer using semantic selector', () => {
    expect(fixture.nativeElement.querySelector('app-story-book-drawer')).toBeNull();

    const storyBtn = fixture.nativeElement.querySelector('button[aria-label="Open Field Manual"]') as HTMLButtonElement;
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
      badge: 'victory'
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
    flushMicrotasks();
    fixture.detectChanges();

    expect(controller.presentationState()).toBe(PresentationState.PLAYER_TARGET_SELECTION);
    const firstLayer = controller.battleLayers()[0];
    expect(firstLayer.opponentCards.every(view => view.eligible)).toBeTrue();
    expect(firstLayer.opponentCards.every(view => view.card === null && view.faceDown)).toBeTrue();
    expect(firstLayer.playerCards.every(view => !view.eligible && view.card === null)).toBeTrue();
    expect(fixture.nativeElement.querySelector('.announcement .eyebrow').textContent.trim())
      .toBe('Battle 1!');

    controller.selectBattleCard(firstLayer.opponentCards[0].id);
    flushMicrotasks();
    fixture.detectChanges();

    expect(controller.presentationState()).toBe(PresentationState.PLAYER_TARGET_SELECTION);
    expect(controller.battleLayers().length).toBe(2);
    const [oldLayer, newestLayer] = controller.battleLayers();
    expect(oldLayer.receded).toBeTrue();
    expect(oldLayer.opponentCards.every(view => !view.eligible)).toBeTrue();
    expect(newestLayer.opponentCards.every(view => view.eligible)).toBeTrue();
    expect(oldLayer.opponentCards.filter(view => !view.selected).every(view => view.card === null)).toBeTrue();
    expect(oldLayer.playerCards.filter(view => !view.selected).every(view => view.card === null)).toBeTrue();
    const announcement = fixture.nativeElement.querySelector('.announcement');
    expect(announcement.querySelector('.eyebrow').textContent.trim()).toBe('Battle 2!!');
    expect(announcement.classList.contains('battle-quake-2')).toBeFalse();
    expect(announcement.textContent).not.toContain('😰');
    compareSpy.and.callThrough();
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
    expect(fixture.nativeElement.querySelector('.boneyard small').textContent.trim()).toBe('0 lost');

    tick(3000);
    fixture.detectChanges();
    expect(controller.visibleBoneyardCount()).toBe(1);
    expect(fixture.nativeElement.querySelector('.boneyard small').textContent.trim()).toBe('1 lost');
  }));
});

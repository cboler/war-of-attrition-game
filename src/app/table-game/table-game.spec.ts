import { ComponentFixture, fakeAsync, flushMicrotasks, TestBed, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CardComparisonService, ComparisonResult } from '../core/services/card-comparison.service';
import { GameStateService } from '../core/services/game-state.service';
import { OpponentAIService } from '../core/services/opponent-ai.service';
import { SettingsService } from '../core/services/settings.service';
import { AchievementService } from '../services/achievement.service';
import { GameControllerService, PresentationState } from '../services/game-controller.service';
import { TableGame } from './table-game';

describe('TableGame presentation', () => {
  let fixture: ComponentFixture<TableGame>;
  let controller: GameControllerService;
  let comparison: CardComparisonService;
  let settings: SettingsService;
  let achievements: AchievementService;

  beforeEach(async () => {
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
    fixture = TestBed.createComponent(TableGame);
    fixture.detectChanges();
  });

  afterEach(() => settings.resetSettings());

  it('uses the player deck as the primary ready-state action', () => {
    const deck = fixture.nativeElement.querySelector('app-player-seat[table-seat-bottom] button.deck');
    expect(controller.presentationState()).toBe(PresentationState.READY);
    expect(deck).toBeTruthy();
    expect(deck.disabled).toBeFalse();
    expect(deck.getAttribute('aria-label')).toBe('Draw from your deck');
  });

  it('binds handedness correctly to the player seat', () => {
    const seatElem = fixture.nativeElement.querySelector('app-player-seat[table-seat-bottom] .seat');
    expect(seatElem.classList.contains('deck-left')).toBeFalse();

    settings.setDeckHand('left');
    fixture.detectChanges();
    expect(seatElem.classList.contains('deck-left')).toBeTrue();
  });

  it('opens and closes the Story Book drawer', () => {
    expect(fixture.nativeElement.querySelector('app-story-book-drawer')).toBeNull();

    const storyBtn = fixture.nativeElement.querySelector('.tool-btn');
    storyBtn.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-story-book-drawer')).toBeTruthy();
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
    tick(641);
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

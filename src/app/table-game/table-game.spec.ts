import { ComponentFixture, fakeAsync, flushMicrotasks, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CardComparisonService, ComparisonResult } from '../core/services/card-comparison.service';
import { SettingsService } from '../core/services/settings.service';
import { GameControllerService, PresentationState } from '../services/game-controller.service';
import { TableGame } from './table-game';

describe('TableGame presentation', () => {
  let fixture: ComponentFixture<TableGame>;
  let controller: GameControllerService;
  let comparison: CardComparisonService;
  let settings: SettingsService;

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
});

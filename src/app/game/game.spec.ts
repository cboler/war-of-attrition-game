import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Game } from './game';
import { GameStateService } from '../core/services/game-state.service';
import { GameControllerService } from '../services/game-controller.service';
import { SettingsService } from '../core/services/settings.service';
import { OpponentAIService } from '../core/services/opponent-ai.service';
import { CardComparisonService, ComparisonResult } from '../core/services/card-comparison.service';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('GameComponent', () => {
  let component: Game;
  let fixture: ComponentFixture<Game>;
  let gameController: GameControllerService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Game, NoopAnimationsModule],
      providers: [
        GameStateService,
        GameControllerService,
        SettingsService,
        { provide: MatDialog, useValue: { open: () => ({ afterClosed: () => ({ subscribe: () => {} }) }) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Game);
    component = fixture.componentInstance;
    gameController = TestBed.inject(GameControllerService);
    fixture.detectChanges();
  });

  it('should create Game component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize and show game board', () => {
    expect(component['showGameBoard']()).toBe(true);
  });

  it('should start a new game when startNewGame is called', () => {
    spyOn(gameController, 'startNewGame');
    component.startNewGame();
    expect(gameController.startNewGame).toHaveBeenCalled();
  });

  it('should reactively update canPlayerAct and unfreeze UI after opponent challenge timeout', fakeAsync(() => {
    const opponentAI = TestBed.inject(OpponentAIService);
    const cardComparison = TestBed.inject(CardComparisonService);
    
    spyOn(cardComparison, 'compareCards').and.returnValue(ComparisonResult.PLAYER_WINS);
    spyOn(opponentAI, 'shouldChallenge').and.returnValue(true);

    // Initial state
    expect(component['effectiveCanPlayerAct']()).toBe(true);

    // Player draws card - player wins, so opponent AI chooses to challenge
    const drawn = component['gameController'].playerDrawCard();
    expect(drawn).toBe(true);

    // Check that player can no longer act during opponent challenge animation
    fixture.detectChanges();
    expect(component['effectiveCanPlayerAct']()).toBe(false);
    expect(component['gameMessage']()).toContain('Opponent is challenging');

    // Fast-forward time past the 1500ms challenge resolution timeout + 800ms health damage animation
    tick(2500);
    fixture.detectChanges();

    // UI should now be updated and un-frozen
    expect(component['canPlayerAct']()).toBe(true);
    expect(component['effectiveCanPlayerAct']()).toBe(true);
    expect(component['gameMessage']()).not.toContain('Opponent is challenging');
  }));
});

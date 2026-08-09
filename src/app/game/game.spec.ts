import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Game } from './game';
import { GameStateService } from '../core/services/game-state.service';
import { GameControllerService } from '../services/game-controller.service';
import { SettingsService } from '../core/services/settings.service';
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
});

import { Component, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { GameDemoService } from '../services/game-demo.service';
import { GameControllerService } from '../services/game-controller.service';
import { GameBoardComponent } from '../shared/components/game-board/game-board.component';
import { Card, CardImpl, Suit, Rank } from '../core/models/card.model';
import { ProgressService, ProgressData } from '../services/progress.service';
import { GamePhase } from '../core/models/game-state.model';

@Component({
  selector: 'app-game',
  imports: [
    MatCardModule, 
    MatButtonModule, 
    RouterLink, 
    GameBoardComponent
  ],
  templateUrl: './game.html',
  styleUrl: './game.scss'
})
export class Game implements OnInit {
  protected demoLog = signal<string[]>([]);
  // Demo UI state
  protected showOldDemo = signal<boolean>(false);
  protected showGameBoard = signal<boolean>(true);
  
  // Real game state (will be initialized in constructor)
  protected gameStats = signal<any>(this.getInitialGameStats());
  protected gameState = signal<any>(this.getInitialGameState());
  protected gameMessage = signal<string>('Click your deck to begin!');
  protected challengeAvailable = signal<boolean>(false);
  protected canPlayerAct = signal<boolean>(true);
  protected showChallengePrompt = signal<boolean>(false);
  
  // Computed values for UI
  protected playerCardCount = signal(26);
  protected opponentCardCount = signal(26);
  protected playerActiveCard = signal<Card | null>(null);
  protected opponentActiveCard = signal<Card | null>(null);
  protected playerCardGlow = signal<'green' | 'red' | 'blue' | null>(null);
  protected opponentCardGlow = signal<'green' | 'red' | 'blue' | null>(null);
  
  // Progress data
  protected progressData: ProgressData;
  protected currentMilestone: ProgressData['currentMilestone'];
  protected completedMilestone: ProgressData['milestones'][0] | undefined;

  constructor(
    private gameDemoService: GameDemoService,
    private gameController: GameControllerService,
    private progressService: ProgressService
  ) {
    this.progressData = this.progressService.getProgressData();
    this.currentMilestone = this.progressService.getCurrentMilestone();
    this.completedMilestone = this.progressService.getCompletedMilestone(3);
    
    // Initialize real game
    this.gameController.startNewGame();
    this.updateGameState();
  }

  private getInitialGameStats() {
    return {
      turnNumber: 0,
      playerCardCount: 26,
      opponentCardCount: 26,
      discardedCardCount: 0
    };
  }

  private getInitialGameState() {
    return {
      phase: GamePhase.SETUP,
      stats: this.getInitialGameStats(),
      activeTurn: null,
      winner: null,
      isPlayerTurn: true,
      canChallenge: false,
      lastResult: null
    };
  }

  ngOnInit(): void {
    if (this.showOldDemo()) {
      this.runDemo();
    }
  }

  runDemo(): void {
    const log = this.gameDemoService.runGameDemo();
    this.demoLog.set(log);
  }

  toggleDemo(): void {
    this.showOldDemo.update(v => !v);
    this.showGameBoard.update(v => !v);
  }

  /**
   * Real game mechanics - Player clicks deck to draw cards
   */
  onPlayerDeckClick(): void {
    if (!this.gameController.playerCanAct) {
      return;
    }

    const success = this.gameController.playerDrawCard();
    if (success) {
      this.updateGameState();
    }
  }

  /**
   * Handle challenge decision
   */
  acceptChallenge(): void {
    this.gameController.handleChallenge(true);
    this.updateGameState();
  }

  declineChallenge(): void {
    this.gameController.handleChallenge(false);
    this.updateGameState();
  }

  /**
   * Start a new game
   */
  startNewGame(): void {
    this.gameController.startNewGame();
    this.updateGameState();
  }

  // Keep demo methods for old demo mode
  simulateChallenge(): void {
    this.challengeAvailable.set(true);
    this.gameMessage.set('You lost this round. Challenge available!');
    this.playerCardGlow.set('red');
    this.opponentCardGlow.set('green');
  }

  simulateBattle(): void {
    this.gameMessage.set('Cards tie! Battle initiated.');
    this.playerCardGlow.set('blue');
    this.opponentCardGlow.set('blue');
    this.challengeAvailable.set(false);
  }

  /**
   * Update UI state based on game controller state
   */
  private updateGameState(): void {
    const stats = this.gameController.getGameStats();
    const state = this.gameController.getGameState();
    
    this.gameStats.set(stats);
    this.gameState.set(state);
    this.gameMessage.set(this.gameController.message);
    this.challengeAvailable.set(this.gameController.canChallenge);
    this.canPlayerAct.set(this.gameController.playerCanAct);
    this.showChallengePrompt.set(this.gameController.showChallengePrompt);
    
    // Update card counts
    this.playerCardCount.set(stats.playerCardCount);
    this.opponentCardCount.set(stats.opponentCardCount);
    
    // Update active cards if available
    if (state.activeTurn) {
      this.playerActiveCard.set(state.activeTurn.playerCard);
      this.opponentActiveCard.set(state.activeTurn.opponentCard);
      
      // Set card glow based on last result
      if (state.lastResult?.includes('win')) {
        this.playerCardGlow.set('green');
        this.opponentCardGlow.set('red');
      } else if (state.lastResult?.includes('lose')) {
        this.playerCardGlow.set('red');
        this.opponentCardGlow.set('green');
      } else if (state.lastResult?.includes('tie') || state.lastResult?.includes('battle')) {
        this.playerCardGlow.set('blue');
        this.opponentCardGlow.set('blue');
      } else {
        this.playerCardGlow.set(null);
        this.opponentCardGlow.set(null);
      }
    } else {
      // No active turn, reset cards for demo
      if (!this.showOldDemo()) {
        this.playerActiveCard.set(null);
        this.opponentActiveCard.set(null);
        this.playerCardGlow.set(null);
        this.opponentCardGlow.set(null);
      }
    }
  }
}

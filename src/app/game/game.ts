import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { GameDemoService } from '../services/game-demo.service';
import { GameControllerService } from '../services/game-controller.service';
import { GameBoardComponent } from '../shared/components/game-board/game-board.component';
import { CardComponent } from '../shared/components/card/card.component';
import { DiscardPileViewerComponent } from '../shared/components/discard-pile-viewer/discard-pile-viewer.component';
import { Card, CardImpl, Suit, Rank } from '../core/models/card.model';
import { ProgressService, ProgressData } from '../services/progress.service';
import { GameStateService } from '../core/services/game-state.service';
import { SettingsService } from '../core/services/settings.service';
import { GamePhase, PlayerType } from '../core/models/game-state.model';

@Component({
  selector: 'app-game',
  imports: [
    MatCardModule, 
    MatButtonModule, 
    RouterLink, 
    GameBoardComponent,
    CardComponent
  ],
  templateUrl: './game.html',
  styleUrl: './game.scss'
})
export class Game implements OnInit, OnDestroy {
  protected demoLog = signal<string[]>([]);
  // Demo UI state
  protected showOldDemo = signal<boolean>(false);
  protected showGameBoard = signal<boolean>(true);
  
  // Game timing for statistics
  private gameStartTime: number | null = null;
  
  // Real game state (will be initialized in constructor)
  protected gameStats = signal<any>(this.getInitialGameStats());
  protected gameState = signal<any>(this.getInitialGameState());
  protected gameMessage = signal<string>('Click your deck to begin!');
  protected challengeAvailable = signal<boolean>(false);
  protected canPlayerAct = signal<boolean>(true);
  protected showChallengePrompt = signal<boolean>(false);
  protected challengeCard = signal<Card | null>(null);
  protected showChallengeCardDisplay = signal<boolean>(false);
  
  // Computed values for UI
  protected playerCardCount = computed(() => this.gameStateService.playerCardCount());
  protected opponentCardCount = computed(() => this.gameStateService.opponentCardCount());
  protected playerActiveCard = signal<Card | null>(null);
  protected opponentActiveCard = signal<Card | null>(null);
  protected playerCardGlow = signal<'green' | 'red' | 'blue' | null>(null);
  protected opponentCardGlow = signal<'green' | 'red' | 'blue' | null>(null);
  
  // Enhanced canPlayerAct that considers animations
  protected effectiveCanPlayerAct = computed(() => {
    const gameCanAct = this.canPlayerAct();
    const animationsBlocking = this.animationsPlaying() && this.settingsService.currentSettings().autoPlayAnimations;
    return gameCanAct && !animationsBlocking;
  });
  
  // Animation states
  protected playerCardAnimation = signal<'slide-in' | 'flip' | 'clash-win' | 'clash-lose' | 'fall-away' | null>(null);
  protected opponentCardAnimation = signal<'slide-in' | 'flip' | 'clash-win' | 'clash-lose' | 'fall-away' | null>(null);
  protected playerHealthDamageAnimation = signal<boolean>(false);
  protected opponentHealthDamageAnimation = signal<boolean>(false);
  
  // Animation control
  protected animationsPlaying = signal<boolean>(false);
  protected animationTimers: number[] = [];
  
  // Battle state
  protected battleCards = signal<Card[]>([]);
  protected opponentBattleCards = signal<Card[]>([]);
  protected battlePhase = signal<'setup' | 'selection' | 'resolution'>('setup');
  protected showBattleUI = signal<boolean>(false);
  
  // Progress data
  protected progressData: ProgressData;
  protected currentMilestone: ProgressData['currentMilestone'];
  protected completedMilestone: ProgressData['milestones'][0] | undefined;

  constructor(
    private gameDemoService: GameDemoService,
    private gameController: GameControllerService,
    private progressService: ProgressService,
    public gameStateService: GameStateService, // Made public for template access
    private settingsService: SettingsService,
    private dialog: MatDialog
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

  ngOnDestroy(): void {
    this.clearAnimationTimers();
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

    // Store card counts before action to detect health changes
    const previousPlayerCount = this.gameStateService.playerCardCount();
    const previousOpponentCount = this.gameStateService.opponentCardCount();
    
    const success = this.gameController.playerDrawCard();
    if (success) {
      this.updateGameStateWithPreviousCounts(previousPlayerCount, previousOpponentCount);
    }
  }

  /**
   * Handle challenge decision
   */
  acceptChallenge(): void {
    // Store card counts before action to detect health changes
    const previousPlayerCount = this.gameStateService.playerCardCount();
    const previousOpponentCount = this.gameStateService.opponentCardCount();
    
    this.gameController.handleChallenge(true);
    this.updateGameStateWithPreviousCounts(previousPlayerCount, previousOpponentCount);
  }

  declineChallenge(): void {
    // Store card counts before action to detect health changes
    const previousPlayerCount = this.gameStateService.playerCardCount();
    const previousOpponentCount = this.gameStateService.opponentCardCount();
    
    this.gameController.handleChallenge(false);
    this.updateGameStateWithPreviousCounts(previousPlayerCount, previousOpponentCount);
  }

  /**
   * Confirm challenge with the revealed card
   */
  confirmChallenge(): void {
    // Store card counts before action to detect health changes
    const previousPlayerCount = this.gameStateService.playerCardCount();
    const previousOpponentCount = this.gameStateService.opponentCardCount();
    
    this.gameController.confirmChallenge();
    this.updateGameStateWithPreviousCounts(previousPlayerCount, previousOpponentCount);
  }

  /**
   * Start a new game
   */
  startNewGame(): void {
    this.gameController.startNewGame();
    this.gameStartTime = Date.now();
    this.settingsService.recordGameStart();
    this.updateGameState();
  }

  /**
   * Handle battle card selection
   */
  onBattleCardSelect(selectedCard: Card): void {
    // Store card counts before action to detect health changes
    const previousPlayerCount = this.gameStateService.playerCardCount();
    const previousOpponentCount = this.gameStateService.opponentCardCount();
    
    this.gameController.selectBattleCard(selectedCard);
    this.updateGameStateWithPreviousCounts(previousPlayerCount, previousOpponentCount);
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
    // Use current counts as "previous" when no previous values provided
    const currentPlayerCount = this.gameStateService.playerCardCount();
    const currentOpponentCount = this.gameStateService.opponentCardCount();
    this.updateGameStateWithPreviousCounts(currentPlayerCount, currentOpponentCount);
  }

  /**
   * Update UI state and trigger health animations based on card count changes
   */
  private updateGameStateWithPreviousCounts(previousPlayerCount: number, previousOpponentCount: number): void {
    const stats = this.gameController.getGameStats();
    const state = this.gameController.getGameState();
    
    this.gameStats.set(stats);
    this.gameState.set(state);
    this.gameMessage.set(this.gameController.message);
    this.challengeAvailable.set(this.gameController.canChallenge);
    this.canPlayerAct.set(this.gameController.playerCanAct);
    this.showChallengePrompt.set(this.gameController.showChallengePrompt);
    
    // Update challenge card state
    this.challengeCard.set(this.gameController.currentChallengeCard);
    this.showChallengeCardDisplay.set(this.gameController.showChallengeCardDisplay);
    
    // Update battle state
    this.battleCards.set(this.gameController.currentBattleCards);
    this.opponentBattleCards.set(this.gameController.currentOpponentBattleCards);
    this.battlePhase.set(this.gameController.currentBattlePhase);
    this.showBattleUI.set(this.battlePhase() === 'selection');
    
    // Get current card counts from game state service
    const currentPlayerCount = this.gameStateService.playerCardCount();
    const currentOpponentCount = this.gameStateService.opponentCardCount();
    
    // Trigger health damage animations if counts decreased
    if (currentPlayerCount < previousPlayerCount) {
      this.triggerPlayerHealthDamageAnimation();
    }
    if (currentOpponentCount < previousOpponentCount) {
      this.triggerOpponentHealthDamageAnimation();
    }
    
    // playerCardCount and opponentCardCount are now computed values that automatically 
    // update based on gameStateService.playerCardCount() and gameStateService.opponentCardCount()
    
    // Update active cards if available
    if (state.activeTurn) {
      // Only set active cards if they've changed to trigger slide-in animation
      if (this.playerActiveCard() !== state.activeTurn.playerCard) {
        this.playerActiveCard.set(state.activeTurn.playerCard);
        this.triggerCardSlideAnimation('player');
      }
      if (this.opponentActiveCard() !== state.activeTurn.opponentCard) {
        this.opponentActiveCard.set(state.activeTurn.opponentCard);
        this.triggerCardSlideAnimation('opponent');
      }
      
      // Set card glow and clash animations based on last result
      if (state.lastResult === 'player_wins') {
        this.playerCardGlow.set('green');
        this.opponentCardGlow.set('red');
        this.triggerClashAnimations('player-win');
      } else if (state.lastResult === 'opponent_wins') {
        this.playerCardGlow.set('red');
        this.opponentCardGlow.set('green');
        this.triggerClashAnimations('opponent-win');
      } else if (state.lastResult === 'tie') {
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
        this.resetAnimations();
      }
    }
    
    // Check for game end and record statistics
    if (state.winner && this.gameStartTime) {
      const gameDuration = Date.now() - this.gameStartTime;
      this.settingsService.recordGameEnd(state.winner === 'player', stats.turnNumber, gameDuration);
      this.gameStartTime = null; // Reset for next game
    }
  }

  /**
   * Trigger card slide animation for new cards
   */
  private triggerCardSlideAnimation(player: 'player' | 'opponent'): void {
    if (!this.settingsService.currentSettings().autoPlayAnimations) {
      return; // Skip animations if disabled
    }

    const animationSpeed = this.settingsService.currentSettings().animationSpeed;
    const duration = this.getAnimationDuration('slide-in', animationSpeed);
    
    this.animationsPlaying.set(true);
    
    if (player === 'player') {
      this.playerCardAnimation.set('slide-in');
      const timer = window.setTimeout(() => {
        this.playerCardAnimation.set(null);
        this.checkAnimationsComplete();
      }, duration);
      this.animationTimers.push(timer);
    } else {
      this.opponentCardAnimation.set('slide-in');
      const timer = window.setTimeout(() => {
        this.opponentCardAnimation.set(null);
        this.checkAnimationsComplete();
      }, duration);
      this.animationTimers.push(timer);
    }
  }

  /**
   * Trigger clash animations for battle results
   */
  private triggerClashAnimations(result: 'player-win' | 'opponent-win'): void {
    if (!this.settingsService.currentSettings().autoPlayAnimations) {
      return; // Skip animations if disabled
    }

    const animationSpeed = this.settingsService.currentSettings().animationSpeed;
    const duration = this.getAnimationDuration('clash-win', animationSpeed);
    
    this.animationsPlaying.set(true);
    
    if (result === 'player-win') {
      this.playerCardAnimation.set('clash-win');
      this.opponentCardAnimation.set('clash-lose');
    } else {
      this.playerCardAnimation.set('clash-lose');
      this.opponentCardAnimation.set('clash-win');
    }
    
    // Clear animations after they complete
    const timer = window.setTimeout(() => {
      this.playerCardAnimation.set(null);
      this.opponentCardAnimation.set(null);
      this.checkAnimationsComplete();
    }, duration);
    this.animationTimers.push(timer);
  }

  /**
   * Trigger health damage animation for player
   */
  private triggerPlayerHealthDamageAnimation(): void {
    if (!this.settingsService.currentSettings().autoPlayAnimations) {
      return; // Skip animations if disabled
    }

    const animationSpeed = this.settingsService.currentSettings().animationSpeed;
    const duration = this.getAnimationDuration('health-damage', animationSpeed);
    
    this.animationsPlaying.set(true);
    this.playerHealthDamageAnimation.set(true);
    
    const timer = window.setTimeout(() => {
      this.playerHealthDamageAnimation.set(false);
      this.checkAnimationsComplete();
    }, duration);
    this.animationTimers.push(timer);
  }

  /**
   * Trigger health damage animation for opponent
   */
  private triggerOpponentHealthDamageAnimation(): void {
    if (!this.settingsService.currentSettings().autoPlayAnimations) {
      return; // Skip animations if disabled
    }

    const animationSpeed = this.settingsService.currentSettings().animationSpeed;
    const duration = this.getAnimationDuration('health-damage', animationSpeed);
    
    this.animationsPlaying.set(true);
    this.opponentHealthDamageAnimation.set(true);
    
    const timer = window.setTimeout(() => {
      this.opponentHealthDamageAnimation.set(false);
      this.checkAnimationsComplete();
    }, duration);
    this.animationTimers.push(timer);
  }

  /**
   * Get animation duration based on speed setting
   */
  private getAnimationDuration(animationType: string, speed: 'slow' | 'normal' | 'fast'): number {
    const baseDurations: Record<string, number> = {
      'slide-in': 800,
      'flip': 600,
      'clash-win': 1000,
      'clash-lose': 1000,
      'fall-away': 1200,
      'health-damage': 800
    };
    
    const speedMultipliers = {
      'slow': 1.5,
      'normal': 1.0,
      'fast': 0.5
    };
    
    const baseDuration = baseDurations[animationType] || 800;
    return baseDuration * speedMultipliers[speed];
  }

  /**
   * Check if all animations are complete
   */
  private checkAnimationsComplete(): void {
    const hasActiveAnimations = this.playerCardAnimation() !== null || 
                               this.opponentCardAnimation() !== null ||
                               this.playerHealthDamageAnimation() ||
                               this.opponentHealthDamageAnimation();
    
    if (!hasActiveAnimations) {
      this.animationsPlaying.set(false);
    }
  }

  /**
   * Clear all animation timers
   */
  private clearAnimationTimers(): void {
    this.animationTimers.forEach(timer => window.clearTimeout(timer));
    this.animationTimers = [];
  }
  openDiscardPileViewer(): void {
    const discardedCards = this.gameStateService.discardedCards();
    
    this.dialog.open(DiscardPileViewerComponent, {
      data: { discardedCards },
      width: '90%',
      maxWidth: '800px',
      maxHeight: '90vh',
      panelClass: 'discard-pile-dialog'
    });
  }

  /**
   * Reset all animations
   */
  private resetAnimations(): void {
    this.clearAnimationTimers();
    this.playerCardAnimation.set(null);
    this.opponentCardAnimation.set(null);
    this.playerHealthDamageAnimation.set(false);
    this.opponentHealthDamageAnimation.set(false);
    this.animationsPlaying.set(false);
  }
}

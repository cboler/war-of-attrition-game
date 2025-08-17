import { Injectable, signal } from '@angular/core';
import { GameStateService } from '../core/services/game-state.service';
import { TurnResolutionService, TurnResult } from '../core/services/turn-resolution.service';
import { GamePhase, PlayerType } from '../core/models/game-state.model';
import { Card } from '../core/models/card.model';

@Injectable({
  providedIn: 'root'
})
export class GameControllerService {
  // Game state signals
  private gameMessage = signal<string>('Click your deck to begin!');
  private challengeAvailable = signal<boolean>(false);
  private showChallenge = signal<boolean>(false);
  private battleCards = signal<Card[]>([]);
  private opponentBattleCards = signal<Card[]>([]);
  private battlePhase = signal<'setup' | 'selection' | 'resolution'>('setup');
  private canPlayerAct = signal<boolean>(false);

  // Readonly getters
  get message() { return this.gameMessage(); }
  get canChallenge() { return this.challengeAvailable(); }
  get showChallengePrompt() { return this.showChallenge(); }
  get playerCanAct() { return this.canPlayerAct(); }
  get currentBattleCards() { return this.battleCards(); }
  get currentOpponentBattleCards() { return this.opponentBattleCards(); }
  get currentBattlePhase() { return this.battlePhase(); }

  constructor(
    private gameStateService: GameStateService,
    private turnResolutionService: TurnResolutionService
  ) {}

  /**
   * Initialize a new game
   */
  startNewGame(): void {
    this.gameStateService.initializeGame();
    this.gameMessage.set('Click your deck to begin!');
    this.challengeAvailable.set(false);
    this.showChallenge.set(false);
    this.battleCards.set([]);
    this.opponentBattleCards.set([]);
    this.battlePhase.set('setup');
    this.canPlayerAct.set(true);
  }

  /**
   * Handle player clicking their deck to start a turn
   */
  playerDrawCard(): boolean {
    if (!this.canPlayerAct() || this.gameStateService.currentPhase !== GamePhase.NORMAL) {
      return false;
    }

    try {
      const { playerCard, opponentCard } = this.gameStateService.startTurn();
      
      if (!playerCard || !opponentCard) {
        return false;
      }

      // Process the turn
      const result = this.turnResolutionService.resolveTurn(playerCard, opponentCard);
      this.handleTurnResult(result);
      
      return true;
    } catch (error) {
      console.error('Error during turn:', error);
      return false;
    }
  }

  /**
   * Handle challenge decision
   */
  handleChallenge(acceptChallenge: boolean): void {
    if (!this.challengeAvailable()) {
      return;
    }

    this.showChallenge.set(false);
    this.challengeAvailable.set(false);

    if (!acceptChallenge) {
      // Player declines challenge, accept the loss
      this.gameMessage.set('You declined the challenge. Your card is discarded.');
      this.canPlayerAct.set(true);
      return;
    }

    // Player accepts challenge - draw additional card
    try {
      const playerChallengeCard = this.gameStateService.currentPlayerDeck.draw();
      if (!playerChallengeCard) {
        this.gameMessage.set('Cannot draw card for challenge!');
        return;
      }

      const activeTurn = this.gameStateService.currentState.activeTurn;
      if (!activeTurn || !activeTurn.playerCard || !activeTurn.opponentCard) {
        this.gameMessage.set('No active turn for challenge!');
        return;
      }

      const result = this.turnResolutionService.resolveChallenge(
        activeTurn.playerCard,
        activeTurn.opponentCard,
        playerChallengeCard
      );

      this.handleTurnResult(result);
    } catch (error) {
      console.error('Error during challenge:', error);
      this.gameMessage.set('Error during challenge!');
    }
  }

  /**
   * Handle battle card selection
   */
  selectBattleCard(selectedCard: Card): void {
    if (this.battlePhase() !== 'selection') {
      return;
    }

    try {
      const activeTurn = this.gameStateService.currentState.activeTurn;
      if (!activeTurn || !activeTurn.playerCard || !activeTurn.opponentCard) {
        return;
      }

      // Simulate opponent selection (randomly pick from player's battle cards)
      // Simulate opponent selection (randomly pick from opponent's battle cards)
      const opponentSelection = this.opponentBattleCards()[Math.floor(Math.random() * this.opponentBattleCards().length)];

      const result = this.turnResolutionService.resolveBattle(
        activeTurn.playerCard,
        activeTurn.opponentCard,
        this.battleCards(),
        this.opponentBattleCards(),
        selectedCard,
        opponentSelection
      );

      this.handleTurnResult(result);
    } catch (error) {
      console.error('Error during battle:', error);
      this.gameMessage.set('Error during battle!');
    }
  }

  /**
   * Handle the result of a turn/challenge/battle
   */
  private handleTurnResult(result: TurnResult): void {
    this.gameMessage.set(result.message);

    switch (result.nextPhase) {
      case GamePhase.NORMAL:
        this.canPlayerAct.set(true);
        this.challengeAvailable.set(false);
        this.showChallenge.set(false);
        this.battleCards.set([]);
        this.opponentBattleCards.set([]);
        this.battlePhase.set('setup');
        break;

      case GamePhase.CHALLENGE:
        this.canPlayerAct.set(false);
        this.challengeAvailable.set(result.canChallenge);
        this.showChallenge.set(result.canChallenge);
        break;

      case GamePhase.BATTLE:
        this.setupBattle();
        break;

      case GamePhase.GAME_OVER:
        this.canPlayerAct.set(false);
        this.challengeAvailable.set(false);
        this.showChallenge.set(false);
        break;
    }
  }

  /**
   * Setup battle phase
   */
  private setupBattle(): void {
    this.canPlayerAct.set(false);
    this.battlePhase.set('setup');
    
    // Draw 3 cards for each player for battle
    const playerCards: Card[] = [];
    const opponentCards: Card[] = [];

    for (let i = 0; i < 3; i++) {
      const playerCard = this.gameStateService.currentPlayerDeck.draw();
      const opponentCard = this.gameStateService.currentOpponentDeck.draw();
      
      if (playerCard) playerCards.push(playerCard);
      if (opponentCard) opponentCards.push(opponentCard);
    }

    this.battleCards.set(playerCards);
    this.opponentBattleCards.set(opponentCards);
    this.battlePhase.set('selection');
    this.gameMessage.set('Battle! Select one of the opponent\'s face-down cards.');
  }

  /**
   * Get current game stats for UI
   */
  getGameStats() {
    return this.gameStateService.currentStats;
  }

  /**
   * Get current game state
   */
  getGameState() {
    return this.gameStateService.currentState;
  }
}
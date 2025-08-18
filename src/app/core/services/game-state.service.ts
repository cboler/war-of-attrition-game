import { Injectable, signal, computed } from '@angular/core';
import { Card } from '../models/card.model';
import { Deck } from '../models/deck.model';
import { GameState, GamePhase, PlayerType, GameStats, ActiveTurn } from '../models/game-state.model';

@Injectable({
  providedIn: 'root'
})
export class GameStateService {
  
  private playerDeck = signal<Deck>(Deck.createRedDeck());
  private opponentDeck = signal<Deck>(Deck.createBlackDeck());
  private discardPile = signal<Card[]>([]);
  private gamePhase = signal<GamePhase>(GamePhase.SETUP);
  private turnNumber = signal<number>(0);
  private activeTurn = signal<ActiveTurn | null>(null);
  private winner = signal<PlayerType | null>(null);
  private isPlayerTurn = signal<boolean>(true);
  private canChallenge = signal<boolean>(false);
  private lastResult = signal<string | null>(null);

  // Computed values
  readonly playerCardCount = computed(() => this.playerDeck().count);
  readonly opponentCardCount = computed(() => this.opponentDeck().count);
  readonly discardedCardCount = computed(() => this.discardPile().length);
  readonly discardedCards = computed(() => [...this.discardPile()]); // Public accessor for discard pile
  
  readonly gameStats = computed<GameStats>(() => ({
    turnNumber: this.turnNumber(),
    playerCardCount: this.playerCardCount(),
    opponentCardCount: this.opponentCardCount(),
    discardedCardCount: this.discardedCardCount()
  }));

  readonly gameState = computed<GameState>(() => ({
    phase: this.gamePhase(),
    stats: this.gameStats(),
    activeTurn: this.activeTurn(),
    winner: this.winner(),
    isPlayerTurn: this.isPlayerTurn(),
    canChallenge: this.canChallenge(),
    lastResult: this.lastResult()
  }));

  // Readonly getters for external access
  get currentPhase() { return this.gamePhase(); }
  get currentStats() { return this.gameStats(); }
  get currentState() { return this.gameState(); }
  get currentPlayerDeck() { return this.playerDeck(); }
  get currentOpponentDeck() { return this.opponentDeck(); }
  get currentDiscardPile() { return this.discardPile(); }

  initializeGame(): void {
    // Reset all state
    this.playerDeck.set(Deck.createRedDeck());
    this.opponentDeck.set(Deck.createBlackDeck());
    this.discardPile.set([]);
    this.gamePhase.set(GamePhase.SETUP);
    this.turnNumber.set(0);
    this.activeTurn.set(null);
    this.winner.set(null);
    this.isPlayerTurn.set(true);
    this.canChallenge.set(false);
    this.lastResult.set(null);

    // Shuffle both decks
    this.playerDeck().shuffle();
    this.opponentDeck().shuffle();

    // Move to normal phase
    this.gamePhase.set(GamePhase.NORMAL);
  }

  startTurn(): { playerCard: Card | null; opponentCard: Card | null } {
    if (this.gamePhase() !== GamePhase.NORMAL) {
      throw new Error('Cannot start turn in current phase');
    }

    // Check if both players can draw cards
    if (this.playerDeck().isEmpty || this.opponentDeck().isEmpty) {
      this.endGame();
      return { playerCard: null, opponentCard: null };
    }

    // Draw cards - need to update signals to trigger reactivity
    const playerCard = this.drawPlayerCard();
    const opponentCard = this.drawOpponentCard();

    if (!playerCard || !opponentCard) {
      this.endGame();
      return { playerCard: null, opponentCard: null };
    }

    // Increment turn number
    this.turnNumber.update(turn => turn + 1);

    // Create active turn
    this.activeTurn.set({
      playerCard,
      opponentCard,
      phase: GamePhase.NORMAL
    });

    return { playerCard, opponentCard };
  }

  setPhase(phase: GamePhase): void {
    this.gamePhase.set(phase);
  }

  setChallengeAvailable(available: boolean): void {
    this.canChallenge.set(available);
  }

  setActiveTurn(turn: ActiveTurn | null): void {
    this.activeTurn.set(turn);
  }

  addToDiscardPile(cards: Card[]): void {
    this.discardPile.update(pile => [...pile, ...cards]);
  }

  returnCardsToPlayerDeck(cards: Card[]): void {
    this.playerDeck().addCards(cards);
    // Trigger signal update to reflect deck changes
    this.playerDeck.set(this.playerDeck());
  }

  returnCardsToOpponentDeck(cards: Card[]): void {
    this.opponentDeck().addCards(cards);
    // Trigger signal update to reflect deck changes
    this.opponentDeck.set(this.opponentDeck());
  }

  /**
   * Draw a card from player deck and update signals
   */
  drawPlayerCard(): Card | null {
    const card = this.playerDeck().draw();
    this.playerDeck.set(this.playerDeck()); // Trigger signal update
    return card;
  }

  /**
   * Draw a card from opponent deck and update signals
   */
  drawOpponentCard(): Card | null {
    const card = this.opponentDeck().draw();
    this.opponentDeck.set(this.opponentDeck()); // Trigger signal update
    return card;
  }

  setLastResult(result: string): void {
    this.lastResult.set(result);
  }

  endGame(): void {
    this.gamePhase.set(GamePhase.GAME_OVER);
    
    // Determine winner
    if (this.playerCardCount() === 0) {
      this.winner.set(PlayerType.OPPONENT);
    } else if (this.opponentCardCount() === 0) {
      this.winner.set(PlayerType.PLAYER);
    } else {
      // Determine winner by who has more cards
      this.winner.set(
        this.playerCardCount() > this.opponentCardCount() 
          ? PlayerType.PLAYER 
          : PlayerType.OPPONENT
      );
    }
    
    this.activeTurn.set(null);
    this.canChallenge.set(false);
  }

  checkGameEndConditions(): boolean {
    // Check if either player is out of cards
    if (this.playerCardCount() === 0 || this.opponentCardCount() === 0) {
      this.endGame();
      return true;
    }

    // Check if either player can't complete a battle (needs 4 cards minimum)
    if (this.gamePhase() === GamePhase.BATTLE) {
      if (!this.playerDeck().hasMinimumForBattle || !this.opponentDeck().hasMinimumForBattle) {
        this.endGame();
        return true;
      }
    }

    return false;
  }

  reset(): void {
    this.initializeGame();
  }
}
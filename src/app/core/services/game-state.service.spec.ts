import { TestBed } from '@angular/core/testing';
import { GameStateService } from '../services/game-state.service';
import { GamePhase, PlayerType } from '../models/game-state.model';
import { CardImpl, Suit, Rank } from '../models/card.model';

describe('GameStateService', () => {
  let service: GameStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Game initialization', () => {
    it('should initialize game with correct initial state', () => {
      service.initializeGame();
      
      const state = service.currentState;
      
      expect(state.phase).toBe(GamePhase.NORMAL);
      expect(state.stats.turnNumber).toBe(0);
      expect(state.stats.playerCardCount).toBe(26);
      expect(state.stats.opponentCardCount).toBe(26);
      expect(state.stats.discardedCardCount).toBe(0);
      expect(state.activeTurn).toBeNull();
      expect(state.winner).toBeNull();
      expect(state.isPlayerTurn).toBe(true);
      expect(state.canChallenge).toBe(false);
    });

    it('should create shuffled decks', () => {
      service.initializeGame();
      
      // Verify that both decks have 26 cards
      expect(service.currentPlayerDeck.count).toBe(26);
      expect(service.currentOpponentDeck.count).toBe(26);
      
      // Verify that player deck has only red cards
      const playerCards = service.currentPlayerDeck.toArray();
      playerCards.forEach(card => {
        expect(card.isRed).toBe(true);
      });
      
      // Verify that opponent deck has only black cards
      const opponentCards = service.currentOpponentDeck.toArray();
      opponentCards.forEach(card => {
        expect(card.isRed).toBe(false);
      });
    });
  });

  describe('Turn management', () => {
    beforeEach(() => {
      service.initializeGame();
    });

    it('should start a turn and draw cards', () => {
      const result = service.startTurn();
      
      expect(result.playerCard).toBeTruthy();
      expect(result.opponentCard).toBeTruthy();
      expect(service.currentState.stats.turnNumber).toBe(1);
      expect(service.currentState.activeTurn).toBeTruthy();
      expect(service.currentPlayerDeck.count).toBe(25);
      expect(service.currentOpponentDeck.count).toBe(25);
    });

    it('should not start turn if not in normal phase', () => {
      service.setPhase(GamePhase.BATTLE);
      
      expect(() => service.startTurn()).toThrowError('Cannot start turn in current phase');
    });

    it('should end game when player deck is empty', () => {
      // Empty the player deck
      while (!service.currentPlayerDeck.isEmpty) {
        service.currentPlayerDeck.draw();
      }
      
      const result = service.startTurn();
      
      expect(result.playerCard).toBeNull();
      expect(result.opponentCard).toBeNull();
      expect(service.currentState.phase).toBe(GamePhase.GAME_OVER);
      expect(service.currentState.winner).toBe(PlayerType.OPPONENT);
    });

    it('should end game when opponent deck is empty', () => {
      // Empty the opponent deck
      while (!service.currentOpponentDeck.isEmpty) {
        service.currentOpponentDeck.draw();
      }
      
      const result = service.startTurn();
      
      expect(result.playerCard).toBeNull();
      expect(result.opponentCard).toBeNull();
      expect(service.currentState.phase).toBe(GamePhase.GAME_OVER);
      expect(service.currentState.winner).toBe(PlayerType.PLAYER);
    });
  });

  describe('Card management', () => {
    beforeEach(() => {
      service.initializeGame();
    });

    it('should add cards to discard pile', () => {
      const cards = [
        new CardImpl(Suit.HEARTS, Rank.ACE),
        new CardImpl(Suit.SPADES, Rank.KING)
      ];
      
      service.addToDiscardPile(cards);
      
      expect(service.currentState.stats.discardedCardCount).toBe(2);
    });

    it('should return cards to player deck', () => {
      const initialCount = service.currentPlayerDeck.count;
      const cards = [new CardImpl(Suit.HEARTS, Rank.ACE)];
      
      service.returnCardsToPlayerDeck(cards);
      
      expect(service.currentPlayerDeck.count).toBe(initialCount + 1);
    });

    it('should return cards to opponent deck', () => {
      const initialCount = service.currentOpponentDeck.count;
      const cards = [new CardImpl(Suit.CLUBS, Rank.KING)];
      
      service.returnCardsToOpponentDeck(cards);
      
      expect(service.currentOpponentDeck.count).toBe(initialCount + 1);
    });
  });

  describe('Game end conditions', () => {
    beforeEach(() => {
      service.initializeGame();
    });

    it('should check end conditions and end game when player has no cards', () => {
      // Empty player deck
      while (!service.currentPlayerDeck.isEmpty) {
        service.currentPlayerDeck.draw();
      }
      
      const gameEnded = service.checkGameEndConditions();
      
      expect(gameEnded).toBe(true);
      expect(service.currentState.phase).toBe(GamePhase.GAME_OVER);
      expect(service.currentState.winner).toBe(PlayerType.OPPONENT);
    });

    it('should check end conditions and end game when opponent has no cards', () => {
      // Empty opponent deck
      while (!service.currentOpponentDeck.isEmpty) {
        service.currentOpponentDeck.draw();
      }
      
      const gameEnded = service.checkGameEndConditions();
      
      expect(gameEnded).toBe(true);
      expect(service.currentState.phase).toBe(GamePhase.GAME_OVER);
      expect(service.currentState.winner).toBe(PlayerType.PLAYER);
    });

    it('should end game when insufficient cards for battle', () => {
      // Set phase to battle
      service.setPhase(GamePhase.BATTLE);
      
      // Reduce player deck to less than 4 cards
      while (service.currentPlayerDeck.count >= 4) {
        service.currentPlayerDeck.draw();
      }
      
      const gameEnded = service.checkGameEndConditions();
      
      expect(gameEnded).toBe(true);
      expect(service.currentState.phase).toBe(GamePhase.GAME_OVER);
    });
  });

  describe('Reset functionality', () => {
    it('should reset game to initial state', () => {
      service.initializeGame();
      service.startTurn(); // Make some changes
      
      service.reset();
      
      const state = service.currentState;
      expect(state.phase).toBe(GamePhase.NORMAL);
      expect(state.stats.turnNumber).toBe(0);
      expect(state.stats.playerCardCount).toBe(26);
      expect(state.stats.opponentCardCount).toBe(26);
      expect(state.activeTurn).toBeNull();
      expect(state.winner).toBeNull();
    });
  });
});
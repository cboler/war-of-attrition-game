import { TestBed } from '@angular/core/testing';
import { TurnResolutionService } from '../services/turn-resolution.service';
import { GameStateService } from '../services/game-state.service';
import { CardComparisonService, ComparisonResult } from '../services/card-comparison.service';
import { CardImpl, Suit, Rank } from '../models/card.model';
import { GamePhase, PlayerType } from '../models/game-state.model';

describe('TurnResolutionService', () => {
  let service: TurnResolutionService;
  let gameStateService: GameStateService;
  let cardComparisonService: CardComparisonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TurnResolutionService);
    gameStateService = TestBed.inject(GameStateService);
    cardComparisonService = TestBed.inject(CardComparisonService);
    
    gameStateService.initializeGame();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Normal turn resolution', () => {
    beforeEach(() => {
      gameStateService.initializeGame(); // Reset game state for each test
    });
    
    it('should resolve player win correctly', () => {
      // Use the real game flow: start turn first to draw cards from decks
      const { playerCard, opponentCard } = gameStateService.startTurn();
      
      if (!playerCard || !opponentCard) {
        fail('Failed to draw cards for test');
        return;
      }
      
      // Mock the comparison to ensure player wins
      spyOn(cardComparisonService, 'compareCards').and.returnValue(ComparisonResult.PLAYER_WINS);
      
      const result = service.resolveTurn(playerCard, opponentCard);
      
      expect(result.winner).toBe(PlayerType.PLAYER);
      expect(result.result).toBe(ComparisonResult.PLAYER_WINS);
      expect(result.message).toBe('You win this turn!');
      expect(result.cardsKept).toContain(playerCard);
      expect(result.cardsLost).toContain(opponentCard);
      expect(result.nextPhase).toBe(GamePhase.NORMAL);
      expect(result.canChallenge).toBe(false);
    });

    it('should resolve opponent win correctly and offer challenge', () => {
      // Use the real game flow: start turn first to draw cards from decks
      const { playerCard, opponentCard } = gameStateService.startTurn();
      
      if (!playerCard || !opponentCard) {
        fail('Failed to draw cards for test');
        return;
      }
      
      // Mock the comparison to ensure opponent wins
      spyOn(cardComparisonService, 'compareCards').and.returnValue(ComparisonResult.OPPONENT_WINS);
      
      const result = service.resolveTurn(playerCard, opponentCard);
      
      expect(result.winner).toBe(PlayerType.OPPONENT);
      expect(result.result).toBe(ComparisonResult.OPPONENT_WINS);
      expect(result.message).toBe('Opponent wins this turn!');
      expect(result.cardsKept).toContain(opponentCard);
      expect(result.cardsLost).toContain(playerCard);
      expect(result.nextPhase).toBe(GamePhase.CHALLENGE);
      expect(result.canChallenge).toBe(true);
    });

    it('should resolve tie and initiate battle', () => {
      const playerCard = new CardImpl(Suit.HEARTS, Rank.EIGHT);
      const opponentCard = new CardImpl(Suit.SPADES, Rank.EIGHT);
      
      const result = service.resolveTurn(playerCard, opponentCard);
      
      expect(result.winner).toBeNull();
      expect(result.result).toBe(ComparisonResult.TIE);
      expect(result.message).toBe('Cards tie! Preparing for battle...');
      expect(result.cardsKept).toContain(playerCard);
      expect(result.cardsKept).toContain(opponentCard);
      expect(result.nextPhase).toBe(GamePhase.BATTLE);
      expect(result.canChallenge).toBe(false);
    });
  });

  describe('Challenge resolution', () => {
    it('should resolve successful challenge', () => {
      const originalPlayerCard = new CardImpl(Suit.HEARTS, Rank.SEVEN);
      const originalOpponentCard = new CardImpl(Suit.SPADES, Rank.JACK);
      const challengeCard = new CardImpl(Suit.HEARTS, Rank.KING);
      
      const result = service.resolveChallenge(originalPlayerCard, originalOpponentCard, challengeCard);
      
      expect(result.winner).toBe(PlayerType.PLAYER);
      expect(result.result).toBe(ComparisonResult.PLAYER_WINS);
      expect(result.message).toBe('Challenge successful! You keep your cards.');
      expect(result.cardsKept).toContain(originalPlayerCard);
      expect(result.cardsKept).toContain(challengeCard);
      expect(result.cardsLost).toContain(originalOpponentCard);
      expect(result.nextPhase).toBe(GamePhase.NORMAL);
      expect(result.canChallenge).toBe(false);
    });

    it('should resolve failed challenge', () => {
      const originalPlayerCard = new CardImpl(Suit.HEARTS, Rank.SEVEN);
      const originalOpponentCard = new CardImpl(Suit.SPADES, Rank.JACK);
      const challengeCard = new CardImpl(Suit.HEARTS, Rank.FIVE);
      
      const result = service.resolveChallenge(originalPlayerCard, originalOpponentCard, challengeCard);
      
      expect(result.winner).toBe(PlayerType.OPPONENT);
      expect(result.result).toBe(ComparisonResult.OPPONENT_WINS);
      expect(result.message).toBe('Challenge failed! You lose your cards.');
      expect(result.cardsLost).toContain(originalPlayerCard);
      expect(result.cardsLost).toContain(challengeCard);
      expect(result.cardsKept).toContain(originalOpponentCard);
      expect(result.nextPhase).toBe(GamePhase.NORMAL);
      expect(result.canChallenge).toBe(false);
    });

    it('should resolve challenge tie as battle', () => {
      const originalPlayerCard = new CardImpl(Suit.HEARTS, Rank.SEVEN);
      const originalOpponentCard = new CardImpl(Suit.SPADES, Rank.JACK);
      const challengeCard = new CardImpl(Suit.HEARTS, Rank.JACK);
      
      const result = service.resolveChallenge(originalPlayerCard, originalOpponentCard, challengeCard);
      
      expect(result.winner).toBe(PlayerType.OPPONENT);
      expect(result.result).toBe(ComparisonResult.TIE);
      expect(result.message).toBe('Challenge ties! You lose your cards.');
      expect(result.nextPhase).toBe(GamePhase.BATTLE);
    });
  });

  describe('Battle resolution', () => {
    it('should resolve player battle win', () => {
      const originalPlayerCard = new CardImpl(Suit.HEARTS, Rank.EIGHT);
      const originalOpponentCard = new CardImpl(Suit.SPADES, Rank.EIGHT);
      const playerBattleCards = [
        new CardImpl(Suit.HEARTS, Rank.TWO),
        new CardImpl(Suit.HEARTS, Rank.THREE),
        new CardImpl(Suit.HEARTS, Rank.FOUR)
      ];
      const opponentBattleCards = [
        new CardImpl(Suit.SPADES, Rank.FIVE),
        new CardImpl(Suit.SPADES, Rank.SIX),
        new CardImpl(Suit.SPADES, Rank.SEVEN)
      ];
      const selectedPlayerCard = new CardImpl(Suit.HEARTS, Rank.KING);
      const selectedOpponentCard = new CardImpl(Suit.SPADES, Rank.QUEEN);
      
      const result = service.resolveBattle(
        originalPlayerCard,
        originalOpponentCard,
        playerBattleCards,
        opponentBattleCards,
        selectedPlayerCard,
        selectedOpponentCard
      );
      
      expect(result.winner).toBe(PlayerType.PLAYER);
      expect(result.result).toBe(ComparisonResult.PLAYER_WINS);
      expect(result.message).toBe('You win the battle! All opponent cards discarded.');
      expect(result.cardsKept.length).toBe(4); // original + 3 battle cards
      expect(result.cardsLost.length).toBe(4); // opponent's original + 3 battle cards
      expect(result.nextPhase).toBe(GamePhase.NORMAL);
      expect(result.canChallenge).toBe(false);
    });

    it('should resolve opponent battle win', () => {
      const originalPlayerCard = new CardImpl(Suit.HEARTS, Rank.EIGHT);
      const originalOpponentCard = new CardImpl(Suit.SPADES, Rank.EIGHT);
      const playerBattleCards = [
        new CardImpl(Suit.HEARTS, Rank.TWO),
        new CardImpl(Suit.HEARTS, Rank.THREE),
        new CardImpl(Suit.HEARTS, Rank.FOUR)
      ];
      const opponentBattleCards = [
        new CardImpl(Suit.SPADES, Rank.FIVE),
        new CardImpl(Suit.SPADES, Rank.SIX),
        new CardImpl(Suit.SPADES, Rank.SEVEN)
      ];
      const selectedPlayerCard = new CardImpl(Suit.HEARTS, Rank.QUEEN);
      const selectedOpponentCard = new CardImpl(Suit.SPADES, Rank.KING);
      
      const result = service.resolveBattle(
        originalPlayerCard,
        originalOpponentCard,
        playerBattleCards,
        opponentBattleCards,
        selectedPlayerCard,
        selectedOpponentCard
      );
      
      expect(result.winner).toBe(PlayerType.OPPONENT);
      expect(result.result).toBe(ComparisonResult.OPPONENT_WINS);
      expect(result.message).toBe('Opponent wins the battle! All your cards discarded.');
      expect(result.cardsLost.length).toBe(4); // player's original + 3 battle cards
      expect(result.cardsKept.length).toBe(4); // opponent's original + 3 battle cards
      expect(result.nextPhase).toBe(GamePhase.NORMAL);
      expect(result.canChallenge).toBe(false);
    });

    it('should handle battle tie and continue battle if possible', () => {
      const originalPlayerCard = new CardImpl(Suit.HEARTS, Rank.EIGHT);
      const originalOpponentCard = new CardImpl(Suit.SPADES, Rank.EIGHT);
      const playerBattleCards = [
        new CardImpl(Suit.HEARTS, Rank.TWO),
        new CardImpl(Suit.HEARTS, Rank.THREE),
        new CardImpl(Suit.HEARTS, Rank.FOUR)
      ];
      const opponentBattleCards = [
        new CardImpl(Suit.SPADES, Rank.FIVE),
        new CardImpl(Suit.SPADES, Rank.SIX),
        new CardImpl(Suit.SPADES, Rank.SEVEN)
      ];
      const selectedPlayerCard = new CardImpl(Suit.HEARTS, Rank.QUEEN);
      const selectedOpponentCard = new CardImpl(Suit.SPADES, Rank.QUEEN);
      
      const result = service.resolveBattle(
        originalPlayerCard,
        originalOpponentCard,
        playerBattleCards,
        opponentBattleCards,
        selectedPlayerCard,
        selectedOpponentCard
      );
      
      expect(result.winner).toBeNull();
      expect(result.result).toBe(ComparisonResult.TIE);
      expect(result.message).toBe('Battle ties again! Another battle required.');
      expect(result.cardsKept.length).toBe(8); // All cards stay in play
      expect(result.cardsLost.length).toBe(0);
      expect(result.nextPhase).toBe(GamePhase.BATTLE);
      expect(result.canChallenge).toBe(false);
    });
  });

  describe('Win condition checking', () => {
    it('should check win conditions', () => {
      const result = service.checkWinConditions();
      
      expect(typeof result).toBe('boolean');
    });
  });
});
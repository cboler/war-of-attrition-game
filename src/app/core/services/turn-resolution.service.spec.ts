import { TestBed } from '@angular/core/testing';
import { TurnResolutionService } from '../services/turn-resolution.service';
import { GameStateService } from '../services/game-state.service';
import { CardComparisonService, ComparisonResult } from '../services/card-comparison.service';
import { OpponentAIService } from '../services/opponent-ai.service';
import { CardImpl, Suit, Rank } from '../models/card.model';
import { GamePhase, PlayerType } from '../models/game-state.model';

describe('TurnResolutionService', () => {
  let service: TurnResolutionService;
  let gameStateService: GameStateService;
  let cardComparisonService: CardComparisonService;
  let opponentAIService: OpponentAIService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TurnResolutionService);
    gameStateService = TestBed.inject(GameStateService);
    cardComparisonService = TestBed.inject(CardComparisonService);
    opponentAIService = TestBed.inject(OpponentAIService);
    
    gameStateService.initializeGame();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Normal turn resolution', () => {
    beforeEach(() => {
      gameStateService.initializeGame(); // Reset game state for each test
    });
    
    it('should resolve player win correctly when opponent does not challenge', () => {
      // Use the real game flow: start turn first to draw cards from decks
      const { playerCard, opponentCard } = gameStateService.startTurn();
      
      if (!playerCard || !opponentCard) {
        fail('Failed to draw cards for test');
        return;
      }
      
      // Mock the comparison to ensure player wins
      spyOn(cardComparisonService, 'compareCards').and.returnValue(ComparisonResult.PLAYER_WINS);
      
      // Mock the opponent AI to not challenge
      spyOn(opponentAIService, 'shouldChallenge').and.returnValue(false);
      
      const result = service.resolveTurn(playerCard, opponentCard);
      
      expect(result.winner).toBe(PlayerType.PLAYER);
      expect(result.result).toBe(ComparisonResult.PLAYER_WINS);
      expect(result.message).toBe('You win this turn!');
      expect(result.cardsKept).toContain(playerCard);
      expect(result.cardsLost).toContain(opponentCard);
      expect(result.nextPhase).toBe(GamePhase.NORMAL);
      expect(result.canChallenge).toBe(false);
    });

    it('should trigger opponent challenge when player wins and opponent decides to challenge', () => {
      // Use the real game flow: start turn first to draw cards from decks
      const { playerCard, opponentCard } = gameStateService.startTurn();
      
      if (!playerCard || !opponentCard) {
        fail('Failed to draw cards for test');
        return;
      }
      
      // Mock the comparison to ensure player wins
      spyOn(cardComparisonService, 'compareCards').and.returnValue(ComparisonResult.PLAYER_WINS);
      
      // Mock the opponent AI to challenge
      spyOn(opponentAIService, 'shouldChallenge').and.returnValue(true);
      
      const result = service.resolveTurn(playerCard, opponentCard);
      
      expect(result.winner).toBeNull(); // No winner yet due to challenge
      expect(result.result).toBe(ComparisonResult.PLAYER_WINS);
      expect(result.message).toBe('You win this turn, but opponent challenges!');
      expect(result.cardsKept).toContain(playerCard);
      expect(result.cardsKept).toContain(opponentCard);
      expect(result.cardsLost.length).toBe(0); // No cards lost yet
      expect(result.nextPhase).toBe(GamePhase.CHALLENGE);
      expect(result.canChallenge).toBe(false);
      expect(result.opponentChallenge).toBe(true);
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
    beforeEach(() => {
      gameStateService.initializeGame(); // Reset game state for each test
    });
    
    it('should resolve successful challenge', () => {
      // Setup: Start a turn and simulate the initial loss that leads to challenge
      const { playerCard, opponentCard } = gameStateService.startTurn();
      
      if (!playerCard || !opponentCard) {
        fail('Failed to draw cards for test');
        return;
      }
      
      // Simulate initial turn loss (opponent wins)
      const initialResult = service.resolveTurn(playerCard, opponentCard);
      // Assume opponent won, now player wants to challenge
      
      // Player draws challenge card
      const challengeCard = gameStateService.drawPlayerCard();
      if (!challengeCard) {
        fail('Failed to draw challenge card');
        return;
      }
      
      // Mock the challenge comparison to ensure challenge succeeds
      spyOn(cardComparisonService, 'compareCards').and.returnValue(ComparisonResult.PLAYER_WINS);
      
      const result = service.resolveChallenge(playerCard, opponentCard, challengeCard);
      
      expect(result.winner).toBe(PlayerType.PLAYER);
      expect(result.result).toBe(ComparisonResult.PLAYER_WINS);
      expect(result.message).toBe('Challenge successful! You keep your cards.');
      expect(result.cardsKept).toContain(playerCard);
      expect(result.cardsKept).toContain(challengeCard);
      expect(result.cardsLost).toContain(opponentCard);
      expect(result.nextPhase).toBe(GamePhase.NORMAL);
      expect(result.canChallenge).toBe(false);
    });

    it('should resolve failed challenge', () => {
      // Setup: Start a turn and simulate the initial loss that leads to challenge
      const { playerCard, opponentCard } = gameStateService.startTurn();
      
      if (!playerCard || !opponentCard) {
        fail('Failed to draw cards for test');
        return;
      }
      
      // Simulate initial turn loss (opponent wins)
      const initialResult = service.resolveTurn(playerCard, opponentCard);
      
      // Player draws challenge card
      const challengeCard = gameStateService.drawPlayerCard();
      if (!challengeCard) {
        fail('Failed to draw challenge card');
        return;
      }
      
      // Mock the challenge comparison to ensure challenge fails
      spyOn(cardComparisonService, 'compareCards').and.returnValue(ComparisonResult.OPPONENT_WINS);
      
      const result = service.resolveChallenge(playerCard, opponentCard, challengeCard);
      
      expect(result.winner).toBe(PlayerType.OPPONENT);
      expect(result.result).toBe(ComparisonResult.OPPONENT_WINS);
      expect(result.message).toBe('Challenge failed! You lose your cards.');
      expect(result.cardsLost).toContain(playerCard);
      expect(result.cardsLost).toContain(challengeCard);
      expect(result.cardsKept).toContain(opponentCard);
      expect(result.nextPhase).toBe(GamePhase.NORMAL);
      expect(result.canChallenge).toBe(false);
    });

    it('should resolve challenge tie as battle', () => {
      // Setup: Start a turn and simulate the initial loss that leads to challenge
      const { playerCard, opponentCard } = gameStateService.startTurn();
      
      if (!playerCard || !opponentCard) {
        fail('Failed to draw cards for test');
        return;
      }
      
      // Simulate initial turn loss (opponent wins)
      const initialResult = service.resolveTurn(playerCard, opponentCard);
      
      // Player draws challenge card
      const challengeCard = gameStateService.drawPlayerCard();
      if (!challengeCard) {
        fail('Failed to draw challenge card');
        return;
      }
      
      // Mock the challenge comparison to ensure challenge ties
      spyOn(cardComparisonService, 'compareCards').and.returnValue(ComparisonResult.TIE);
      
      const result = service.resolveChallenge(playerCard, opponentCard, challengeCard);
      
      expect(result.winner).toBe(PlayerType.OPPONENT);
      expect(result.result).toBe(ComparisonResult.TIE);
      expect(result.message).toBe('Challenge ties! You lose your cards.');
      expect(result.nextPhase).toBe(GamePhase.BATTLE);
    });
  });

  describe('Battle resolution', () => {
    beforeEach(() => {
      gameStateService.initializeGame(); // Reset game state for each test
    });
    
    it('should resolve player battle win', () => {
      // Setup: Start a turn and simulate the scenario that leads to battle
      const { playerCard, opponentCard } = gameStateService.startTurn();
      
      if (!playerCard || !opponentCard) {
        fail('Failed to draw cards for test');
        return;
      }
      
      // Draw battle cards from both decks (3 cards each for battle)
      const playerBattleCards = gameStateService.currentPlayerDeck.drawMultiple(3);
      const opponentBattleCards = gameStateService.currentOpponentDeck.drawMultiple(3);
      
      if (playerBattleCards.length !== 3 || opponentBattleCards.length !== 3) {
        fail('Failed to draw battle cards');
        return;
      }
      
      // These would normally be selected from the opponent's battle cards, but for test we'll create them
      const selectedPlayerCard = new CardImpl(Suit.HEARTS, Rank.KING);
      const selectedOpponentCard = new CardImpl(Suit.SPADES, Rank.QUEEN);
      
      // Mock the battle comparison to ensure player wins
      spyOn(cardComparisonService, 'compareCards').and.returnValue(ComparisonResult.PLAYER_WINS);
      
      const result = service.resolveBattle(
        playerCard,
        opponentCard,
        playerBattleCards,
        opponentBattleCards,
        selectedPlayerCard,
        selectedOpponentCard
      );
      
      expect(result.winner).toBe(PlayerType.PLAYER);
      expect(result.result).toBe(ComparisonResult.PLAYER_WINS);
      expect(result.message).toBe('You win the battle! All opponent cards discarded.');
      expect(result.cardsKept.length).toBe(4); // 1 original + 3 battle cards
      expect(result.cardsLost.length).toBe(4); // 1 original + 3 battle cards from opponent
      expect(result.nextPhase).toBe(GamePhase.NORMAL);
      expect(result.canChallenge).toBe(false);
    });

    it('should resolve opponent battle win', () => {
      // Setup: Start a turn and simulate the scenario that leads to battle
      const { playerCard, opponentCard } = gameStateService.startTurn();
      
      if (!playerCard || !opponentCard) {
        fail('Failed to draw cards for test');
        return;
      }
      
      // Draw battle cards from both decks (3 cards each for battle)
      const playerBattleCards = gameStateService.currentPlayerDeck.drawMultiple(3);
      const opponentBattleCards = gameStateService.currentOpponentDeck.drawMultiple(3);
      
      if (playerBattleCards.length !== 3 || opponentBattleCards.length !== 3) {
        fail('Failed to draw battle cards');
        return;
      }
      
      // These would normally be selected from battle cards
      const selectedPlayerCard = new CardImpl(Suit.HEARTS, Rank.QUEEN);
      const selectedOpponentCard = new CardImpl(Suit.SPADES, Rank.KING);
      
      // Mock the battle comparison to ensure opponent wins
      spyOn(cardComparisonService, 'compareCards').and.returnValue(ComparisonResult.OPPONENT_WINS);
      
      const result = service.resolveBattle(
        playerCard,
        opponentCard,
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
      // Setup: Start a turn and simulate the scenario that leads to battle
      const { playerCard, opponentCard } = gameStateService.startTurn();
      
      if (!playerCard || !opponentCard) {
        fail('Failed to draw cards for test');
        return;
      }
      
      // Draw battle cards from both decks (3 cards each for battle)
      const playerBattleCards = gameStateService.currentPlayerDeck.drawMultiple(3);
      const opponentBattleCards = gameStateService.currentOpponentDeck.drawMultiple(3);
      
      if (playerBattleCards.length !== 3 || opponentBattleCards.length !== 3) {
        fail('Failed to draw battle cards');
        return;
      }
      
      // These would normally be selected from battle cards
      const selectedPlayerCard = new CardImpl(Suit.HEARTS, Rank.QUEEN);
      const selectedOpponentCard = new CardImpl(Suit.SPADES, Rank.QUEEN);
      
      // Mock the battle comparison to ensure tie
      spyOn(cardComparisonService, 'compareCards').and.returnValue(ComparisonResult.TIE);
      
      const result = service.resolveBattle(
        playerCard,
        opponentCard,
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

  describe('Opponent Challenge resolution', () => {
    beforeEach(() => {
      gameStateService.initializeGame(); // Reset game state for each test
    });
    
    it('should trigger opponent challenge when opponent loses with low value card', () => {
      // Use specific cards that will trigger opponent challenge
      const playerCard = new CardImpl(Suit.HEARTS, Rank.ACE); // High value
      const opponentCard = new CardImpl(Suit.SPADES, Rank.TWO); // Low value - should trigger challenge
      
      // Mock AI to always challenge 2s
      spyOn(opponentAIService, 'shouldChallenge').and.returnValue(true);
      
      // Mock comparison to ensure player wins initially
      spyOn(cardComparisonService, 'compareCards').and.returnValue(ComparisonResult.PLAYER_WINS);
      
      // Mock the game state service methods to avoid deck count issues
      spyOn(gameStateService, 'returnCardsToPlayerDeck').and.stub();
      spyOn(gameStateService, 'addToDiscardPile').and.stub();
      
      const result = service.resolveTurn(playerCard, opponentCard);
      
      expect(result.winner).toBeNull(); // No winner yet due to challenge
      expect(result.message).toBe('You win this turn, but opponent challenges!');
      expect(result.nextPhase).toBe(GamePhase.CHALLENGE);
      expect(result.opponentChallenge).toBe(true);
      expect(result.canChallenge).toBe(false);
    });

    it('should not trigger opponent challenge when opponent loses with high value card', () => {
      const playerCard = new CardImpl(Suit.HEARTS, Rank.TWO); // Low value
      const opponentCard = new CardImpl(Suit.SPADES, Rank.ACE); // High value - should not challenge
      
      // Mock AI to not challenge Aces
      spyOn(opponentAIService, 'shouldChallenge').and.returnValue(false);
      
      // Mock comparison to ensure player wins
      spyOn(cardComparisonService, 'compareCards').and.returnValue(ComparisonResult.PLAYER_WINS);
      
      // Mock the game state service methods to avoid deck count issues
      spyOn(gameStateService, 'returnCardsToPlayerDeck').and.stub();
      spyOn(gameStateService, 'addToDiscardPile').and.stub();
      
      const result = service.resolveTurn(playerCard, opponentCard);
      
      expect(result.winner).toBe(PlayerType.PLAYER);
      expect(result.message).toBe('You win this turn!');
      expect(result.nextPhase).toBe(GamePhase.NORMAL);
      expect(result.opponentChallenge).toBe(false);
      expect(result.canChallenge).toBe(false);
    });

    it('should resolve successful opponent challenge', () => {
      const playerCard = new CardImpl(Suit.HEARTS, Rank.FIVE);
      const opponentCard = new CardImpl(Suit.SPADES, Rank.TWO);
      const opponentChallengeCard = new CardImpl(Suit.CLUBS, Rank.SEVEN);
      
      // Mock comparison to ensure opponent challenge wins
      spyOn(cardComparisonService, 'compareCards').and.returnValue(ComparisonResult.OPPONENT_WINS);
      
      // Mock the game state service methods to avoid deck count issues
      spyOn(gameStateService, 'returnCardsToOpponentDeck').and.stub();
      spyOn(gameStateService, 'addToDiscardPile').and.stub();
      
      const result = service.resolveOpponentChallenge(playerCard, opponentCard, opponentChallengeCard);
      
      expect(result.winner).toBe(PlayerType.OPPONENT);
      expect(result.result).toBe(ComparisonResult.OPPONENT_WINS);
      expect(result.message).toBe('Opponent challenge successful! Opponent keeps their cards.');
      expect(result.cardsKept).toContain(opponentCard);
      expect(result.cardsKept).toContain(opponentChallengeCard);
      expect(result.cardsLost).toContain(playerCard);
      expect(result.nextPhase).toBe(GamePhase.NORMAL);
      expect(result.canChallenge).toBe(false);
    });

    it('should resolve failed opponent challenge', () => {
      const playerCard = new CardImpl(Suit.HEARTS, Rank.KING);
      const opponentCard = new CardImpl(Suit.SPADES, Rank.TWO);
      const opponentChallengeCard = new CardImpl(Suit.CLUBS, Rank.THREE);
      
      // Mock comparison to ensure opponent challenge fails
      spyOn(cardComparisonService, 'compareCards').and.returnValue(ComparisonResult.PLAYER_WINS);
      
      // Mock the game state service methods to avoid deck count issues
      spyOn(gameStateService, 'returnCardsToPlayerDeck').and.stub();
      spyOn(gameStateService, 'addToDiscardPile').and.stub();
      
      const result = service.resolveOpponentChallenge(playerCard, opponentCard, opponentChallengeCard);
      
      expect(result.winner).toBe(PlayerType.PLAYER);
      expect(result.result).toBe(ComparisonResult.PLAYER_WINS);
      expect(result.message).toBe('Opponent challenge failed! Opponent loses their cards.');
      expect(result.cardsKept).toContain(playerCard);
      expect(result.cardsLost).toContain(opponentCard);
      expect(result.cardsLost).toContain(opponentChallengeCard);
      expect(result.nextPhase).toBe(GamePhase.NORMAL);
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
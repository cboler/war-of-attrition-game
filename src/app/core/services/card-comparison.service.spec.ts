import { TestBed } from '@angular/core/testing';
import { CardComparisonService, ComparisonResult } from '../services/card-comparison.service';
import { Card, CardImpl, Suit, Rank } from '../models/card.model';

describe('CardComparisonService', () => {
  let service: CardComparisonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CardComparisonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Standard card comparison', () => {
    it('should return PLAYER_WINS when player card is higher', () => {
      const playerCard = new CardImpl(Suit.HEARTS, Rank.KING);
      const opponentCard = new CardImpl(Suit.SPADES, Rank.QUEEN);
      
      const result = service.compareCards(playerCard, opponentCard);
      
      expect(result).toBe(ComparisonResult.PLAYER_WINS);
    });

    it('should return OPPONENT_WINS when opponent card is higher', () => {
      const playerCard = new CardImpl(Suit.HEARTS, Rank.SEVEN);
      const opponentCard = new CardImpl(Suit.SPADES, Rank.JACK);
      
      const result = service.compareCards(playerCard, opponentCard);
      
      expect(result).toBe(ComparisonResult.OPPONENT_WINS);
    });

    it('should return TIE when cards have equal value', () => {
      const playerCard = new CardImpl(Suit.HEARTS, Rank.EIGHT);
      const opponentCard = new CardImpl(Suit.SPADES, Rank.EIGHT);
      
      const result = service.compareCards(playerCard, opponentCard);
      
      expect(result).toBe(ComparisonResult.TIE);
    });

    it('should handle Ace vs King correctly (Ace wins)', () => {
      const playerCard = new CardImpl(Suit.HEARTS, Rank.ACE);
      const opponentCard = new CardImpl(Suit.SPADES, Rank.KING);
      
      const result = service.compareCards(playerCard, opponentCard);
      
      expect(result).toBe(ComparisonResult.PLAYER_WINS);
    });
  });

  describe('Special Ace vs 2 rule', () => {
    it('should return PLAYER_WINS when player has 2 and opponent has Ace', () => {
      const playerCard = new CardImpl(Suit.HEARTS, Rank.TWO);
      const opponentCard = new CardImpl(Suit.SPADES, Rank.ACE);
      
      const result = service.compareCards(playerCard, opponentCard);
      
      expect(result).toBe(ComparisonResult.PLAYER_WINS);
    });

    it('should return OPPONENT_WINS when opponent has 2 and player has Ace', () => {
      const playerCard = new CardImpl(Suit.HEARTS, Rank.ACE);
      const opponentCard = new CardImpl(Suit.SPADES, Rank.TWO);
      
      const result = service.compareCards(playerCard, opponentCard);
      
      expect(result).toBe(ComparisonResult.OPPONENT_WINS);
    });

    it('should handle 2 vs 2 as tie', () => {
      const playerCard = new CardImpl(Suit.HEARTS, Rank.TWO);
      const opponentCard = new CardImpl(Suit.SPADES, Rank.TWO);
      
      const result = service.compareCards(playerCard, opponentCard);
      
      expect(result).toBe(ComparisonResult.TIE);
    });

    it('should handle Ace vs Ace as tie', () => {
      const playerCard = new CardImpl(Suit.HEARTS, Rank.ACE);
      const opponentCard = new CardImpl(Suit.SPADES, Rank.ACE);
      
      const result = service.compareCards(playerCard, opponentCard);
      
      expect(result).toBe(ComparisonResult.TIE);
    });
  });

  describe('Utility methods', () => {
    it('should correctly identify equal cards', () => {
      const card1 = new CardImpl(Suit.HEARTS, Rank.FIVE);
      const card2 = new CardImpl(Suit.CLUBS, Rank.FIVE);
      
      expect(service.areCardsEqual(card1, card2)).toBe(true);
    });

    it('should correctly identify unequal cards', () => {
      const card1 = new CardImpl(Suit.HEARTS, Rank.FIVE);
      const card2 = new CardImpl(Suit.CLUBS, Rank.SEVEN);
      
      expect(service.areCardsEqual(card1, card2)).toBe(false);
    });

    it('should return the higher card', () => {
      const lowerCard = new CardImpl(Suit.HEARTS, Rank.FIVE);
      const higherCard = new CardImpl(Suit.CLUBS, Rank.NINE);
      
      const result = service.getHigherCard(lowerCard, higherCard);
      
      expect(result).toBe(higherCard);
    });

    it('should return first card when cards are equal', () => {
      const card1 = new CardImpl(Suit.HEARTS, Rank.FIVE);
      const card2 = new CardImpl(Suit.CLUBS, Rank.FIVE);
      
      const result = service.getHigherCard(card1, card2);
      
      expect(result).toBe(card1);
    });
  });
});
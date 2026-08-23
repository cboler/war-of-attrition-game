import { TestBed } from '@angular/core/testing';
import { CardComparisonService, ComparisonResult } from './card-comparison.service';
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

  describe('explainComparison', () => {
    it('explains a standard winning comparison', () => {
      const playerCard = new CardImpl(Suit.HEARTS, Rank.KING); // 13
      const opponentCard = new CardImpl(Suit.SPADES, Rank.EIGHT); // 8

      const explanation = service.explainComparison(playerCard, opponentCard);

      expect(explanation.state).toBe('winner');
      expect(explanation.base).toBe(13);
      expect(explanation.opposingBase).toBe(8);
      expect(explanation.current).toBe(5);
      expect(explanation.specialOverride).toBe(false);
      expect(explanation.formulaText).toBe('13 − 8 = 5 remaining');
    });

    it('explains a standard defeated comparison', () => {
      const playerCard = new CardImpl(Suit.DIAMONDS, Rank.FOUR); // 4
      const opponentCard = new CardImpl(Suit.CLUBS, Rank.SEVEN); // 7

      const explanation = service.explainComparison(playerCard, opponentCard);

      expect(explanation.state).toBe('defeated');
      expect(explanation.base).toBe(4);
      expect(explanation.opposingBase).toBe(7);
      expect(explanation.current).toBe(0);
      expect(explanation.specialOverride).toBe(false);
      expect(explanation.formulaText).toBe('4 − 7 → Defeated');
    });

    it('explains a tie comparison', () => {
      const card1 = new CardImpl(Suit.HEARTS, Rank.EIGHT);
      const card2 = new CardImpl(Suit.SPADES, Rank.EIGHT);

      const explanation = service.explainComparison(card1, card2);

      expect(explanation.state).toBe('tie');
      expect(explanation.base).toBe(8);
      expect(explanation.opposingBase).toBe(8);
      expect(explanation.formulaText).toContain('8 vs 8');
      expect(explanation.formulaText).toContain('Equal Power → Battle');
    });

    it('explains 2 vs Ace special assassination rule (player 2 wins)', () => {
      const playerCard = new CardImpl(Suit.HEARTS, Rank.TWO);
      const opponentCard = new CardImpl(Suit.SPADES, Rank.ACE);

      const explanation = service.explainComparison(playerCard, opponentCard);

      expect(explanation.state).toBe('winner');
      expect(explanation.base).toBe(2);
      expect(explanation.opposingBase).toBe(14);
      expect(explanation.opposingRank).toBe('Ace');
      expect(explanation.specialOverride).toBe(true);
      expect(explanation.formulaText).toContain('2 defeats Ace');
      expect(explanation.formulaText).toContain('Assassination Rule');
    });

    it('explains Ace vs 2 special assassination rule (player Ace loses)', () => {
      const playerCard = new CardImpl(Suit.HEARTS, Rank.ACE);
      const opponentCard = new CardImpl(Suit.SPADES, Rank.TWO);

      const explanation = service.explainComparison(playerCard, opponentCard);

      expect(explanation.state).toBe('defeated');
      expect(explanation.base).toBe(14);
      expect(explanation.opposingBase).toBe(2);
      expect(explanation.specialOverride).toBe(true);
      expect(explanation.formulaText).toContain('2 defeats Ace');
    });
  });
});
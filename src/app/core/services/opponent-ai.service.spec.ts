import { TestBed } from '@angular/core/testing';
import { OpponentAIService } from './opponent-ai.service';
import { CardImpl, Suit, Rank } from '../models/card.model';

describe('OpponentAIService', () => {
  let service: OpponentAIService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OpponentAIService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('shouldChallenge', () => {
    it('should have high probability for 2s (lowest value cards)', () => {
      const twoCard = new CardImpl(Suit.HEARTS, Rank.TWO);
      
      // Test multiple times to verify probability behavior
      let challengeCount = 0;
      const trials = 100;
      
      for (let i = 0; i < trials; i++) {
        if (service.shouldChallenge(twoCard)) {
          challengeCount++;
        }
      }
      
      // Should challenge 2s at least 80% of the time (accounting for randomness)
      expect(challengeCount).toBeGreaterThan(trials * 0.80);
    });

    it('should have low probability for Aces (highest value cards)', () => {
      const aceCard = new CardImpl(Suit.SPADES, Rank.ACE);
      
      // Test multiple times to verify probability behavior
      let challengeCount = 0;
      const trials = 100;
      
      for (let i = 0; i < trials; i++) {
        if (service.shouldChallenge(aceCard)) {
          challengeCount++;
        }
      }
      
      // Should challenge Aces less than 10% of the time (accounting for randomness)
      expect(challengeCount).toBeLessThan(trials * 0.10);
    });

    it('should have medium probability for middle value cards', () => {
      const sevenCard = new CardImpl(Suit.CLUBS, Rank.SEVEN);
      
      // Test multiple times to verify probability behavior
      let challengeCount = 0;
      const trials = 100;
      
      for (let i = 0; i < trials; i++) {
        if (service.shouldChallenge(sevenCard)) {
          challengeCount++;
        }
      }
      
      // Should challenge 7s around 20-40% of the time (accounting for randomness)
      expect(challengeCount).toBeGreaterThan(trials * 0.15);
      expect(challengeCount).toBeLessThan(trials * 0.50);
    });

    it('should return boolean values', () => {
      const testCard = new CardImpl(Suit.DIAMONDS, Rank.FIVE);
      const result = service.shouldChallenge(testCard);
      
      expect(typeof result).toBe('boolean');
    });

    it('should handle all card ranks', () => {
      const ranks = [
        Rank.TWO, Rank.THREE, Rank.FOUR, Rank.FIVE, Rank.SIX, Rank.SEVEN,
        Rank.EIGHT, Rank.NINE, Rank.TEN, Rank.JACK, Rank.QUEEN, Rank.KING, Rank.ACE
      ];
      
      ranks.forEach(rank => {
        const card = new CardImpl(Suit.HEARTS, rank);
        
        // Should not throw error and should return boolean
        expect(() => service.shouldChallenge(card)).not.toThrow();
        expect(typeof service.shouldChallenge(card)).toBe('boolean');
      });
    });
  });
});
import { Injectable } from '@angular/core';
import { Card } from '../models/card.model';
import { Rank } from '../models/card.model';

/**
 * Service for handling opponent AI decision making
 */
@Injectable({
  providedIn: 'root'
})
export class OpponentAIService {

  /**
   * Determine if the opponent should challenge based on the card value
   * Opponents are more likely to challenge with lower value cards (especially 2s)
   * @param opponentCard The card the opponent would lose
   * @returns true if the opponent should challenge
   */
  shouldChallenge(opponentCard: Card): boolean {
    // Base probabilities for challenging based on card value
    const challengeProbabilities: Record<number, number> = {
      2: 0.95,   // Almost always challenge for 2s (lowest value, worth saving)
      3: 0.80,   // High chance for 3s
      4: 0.65,   // Good chance for 4s
      5: 0.50,   // Medium chance for 5s
      6: 0.40,   // Lower chance for 6s
      7: 0.30,   // Even lower for 7s
      8: 0.25,   // Reduced chance for 8s
      9: 0.20,   // Low chance for 9s
      10: 0.15,  // Very low chance for 10s
      11: 0.10,  // Minimal chance for Jacks
      12: 0.05,  // Very minimal chance for Queens
      13: 0.03,  // Almost never challenge for Kings
      14: 0.01   // Rarely challenge for Aces (highest value)
    };

    const cardValue = this.getCardValue(opponentCard);
    const probability = challengeProbabilities[cardValue] || 0.20; // Default 20% for unknown values
    
    // Generate random number between 0 and 1
    const randomValue = Math.random();
    
    return randomValue < probability;
  }

  /**
   * Get the numerical value of a card for challenge probability calculation
   */
  private getCardValue(card: Card): number {
    switch (card.rank) {
      case Rank.TWO: return 2;
      case Rank.THREE: return 3;
      case Rank.FOUR: return 4;
      case Rank.FIVE: return 5;
      case Rank.SIX: return 6;
      case Rank.SEVEN: return 7;
      case Rank.EIGHT: return 8;
      case Rank.NINE: return 9;
      case Rank.TEN: return 10;
      case Rank.JACK: return 11;
      case Rank.QUEEN: return 12;
      case Rank.KING: return 13;
      case Rank.ACE: return 14;
      default: return 7; // Default to middle value
    }
  }
}
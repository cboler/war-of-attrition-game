import { Injectable } from '@angular/core';
import { Card, Rank } from '../models/card.model';
import { ComparisonResult } from '../models/game-state.model';

export { ComparisonResult } from '../models/game-state.model';

export interface ComparisonExplanation {
  readonly card: Card;
  readonly opposingCard: Card;
  readonly base: number;
  readonly opposingBase: number;
  readonly opposingRank: string;
  readonly state: 'winner' | 'defeated' | 'tie';
  readonly current: number;
  readonly damage: number;
  readonly specialOverride: boolean;
  readonly formulaText: string;
}

@Injectable({
  providedIn: 'root'
})
export class CardComparisonService {

  compareCards(playerCard: Card, opponentCard: Card): ComparisonResult {
    // Special rule: 2 beats Ace
    if (this.isSpecialAceVsTwoRule(playerCard, opponentCard)) {
      return playerCard.rank === Rank.TWO ? ComparisonResult.PLAYER_WINS : ComparisonResult.OPPONENT_WINS;
    }

    // Standard comparison by value
    if (playerCard.value > opponentCard.value) {
      return ComparisonResult.PLAYER_WINS;
    } else if (playerCard.value < opponentCard.value) {
      return ComparisonResult.OPPONENT_WINS;
    } else {
      return ComparisonResult.TIE;
    }
  }

  /**
   * Check if the cards trigger the special Ace vs 2 rule
   */
  isSpecialAceVsTwoRule(playerCard: Card, opponentCard: Card): boolean {
    const hasAce = playerCard.rank === Rank.ACE || opponentCard.rank === Rank.ACE;
    const hasTwo = playerCard.rank === Rank.TWO || opponentCard.rank === Rank.TWO;
    return hasAce && hasTwo;
  }

  /**
   * Canonical combat math / power explanation for a resolved public comparison.
   */
  explainComparison(
    card: Card,
    opposingCard: Card,
    result?: ComparisonResult,
    isSpecialRule?: boolean
  ): ComparisonExplanation {
    const resolvedResult = result ?? this.compareCards(card, opposingCard);
    const specialOverride = isSpecialRule ?? this.isSpecialAceVsTwoRule(card, opposingCard);
    const opposingRank = opposingCard.rank === Rank.ACE ? 'Ace' : opposingCard.rank;

    if (resolvedResult === ComparisonResult.TIE) {
      return {
        card,
        opposingCard,
        base: card.value,
        opposingBase: opposingCard.value,
        opposingRank,
        state: 'tie',
        current: 0,
        damage: -opposingCard.value,
        specialOverride,
        formulaText: `${card.value} vs ${opposingCard.value} · Equal Power → Battle`
      };
    }

    const won = resolvedResult === ComparisonResult.PLAYER_WINS;
    if (specialOverride) {
      return {
        card,
        opposingCard,
        base: card.value,
        opposingBase: opposingCard.value,
        opposingRank,
        state: won ? 'winner' : 'defeated',
        current: won ? card.value : 0,
        damage: won ? 0 : -card.value,
        specialOverride: true,
        formulaText: '2 defeats Ace · Assassination Rule'
      };
    }

    const current = won ? Math.max(1, card.value - opposingCard.value) : 0;
    const damage = won ? -opposingCard.value : -opposingCard.value;
    const formulaText = won
      ? `${card.value} − ${opposingCard.value} = ${current} remaining`
      : `${card.value} − ${opposingCard.value} → Defeated`;

    return {
      card,
      opposingCard,
      base: card.value,
      opposingBase: opposingCard.value,
      opposingRank,
      state: won ? 'winner' : 'defeated',
      current,
      damage,
      specialOverride: false,
      formulaText
    };
  }

  /**
   * Determines the winner of multiple cards (used in battles)
   */
  compareMultipleCards(playerCards: Card[], opponentCards: Card[]): ComparisonResult {
    if (playerCards.length !== opponentCards.length) {
      throw new Error('Card arrays must be the same length for comparison');
    }

    // For battle scenarios, we typically compare the selected cards
    // This method can be extended for more complex battle logic if needed
    if (playerCards.length === 1 && opponentCards.length === 1) {
      return this.compareCards(playerCards[0], opponentCards[0]);
    }

    throw new Error('Multiple card comparison not yet implemented for arrays > 1');
  }

  /**
   * Get the higher value card, accounting for the special Ace vs 2 rule
   */
  getHigherCard(card1: Card, card2: Card): Card {
    const result = this.compareCards(card1, card2);
    switch (result) {
      case ComparisonResult.PLAYER_WINS:
        return card1;
      case ComparisonResult.OPPONENT_WINS:
        return card2;
      case ComparisonResult.TIE:
        return card1; // Return first card in case of tie
    }
  }

  /**
   * Check if two cards have equal values (for battle detection)
   */
  areCardsEqual(card1: Card, card2: Card): boolean {
    return this.compareCards(card1, card2) === ComparisonResult.TIE;
  }
}

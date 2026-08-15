import { InjectionToken, Injectable, inject } from '@angular/core';
import { Card, Rank } from '../models/card.model';
import { CardComparisonService, ComparisonResult } from './card-comparison.service';

export const AI_RANDOM = new InjectionToken<() => number>('AI_RANDOM', {
  providedIn: 'root',
  factory: () => Math.random
});

export interface OpponentChallengeContext {
  /** The public card the reinforcement must defeat. */
  readonly opposingCard: Card;
  /** AI-owned hidden cards. A human is likewise entitled to know their own cards. */
  readonly ownDeck: readonly Card[];
  /** Revealed table cards and boneyard cards only. Never the human's hidden deck. */
  readonly publicCards: readonly Card[];
}

@Injectable({ providedIn: 'root' })
export class OpponentAIService {
  private readonly random = inject(AI_RANDOM);
  private readonly comparison = inject(CardComparisonService);

  shouldChallenge(cardAtRisk: Card, context?: OpponentChallengeContext): boolean {
    const score = this.challengeScore(cardAtRisk, context);
    if (score >= 80) return true;
    if (score < 20) return false;

    const probability = score >= 60
      ? 0.82
      : score >= 40
        ? 0.38 + ((score - 40) / 20) * 0.32
        : 0.12;
    return this.random() < probability;
  }

  challengeScore(cardAtRisk: Card, context?: OpponentChallengeContext): number {
    const deck = context?.ownDeck ?? [];
    const ownDeckCount = deck.length;
    const cardValue = this.strategicValue(cardAtRisk.rank);

    // Valuable cards deserve defense; expendable low cards normally do not.
    let score = cardValue * 0.68;

    if (context && deck.length > 0) {
      const outcomes = deck.map(candidate =>
        this.comparison.compareCards(candidate, context.opposingCard)
      );
      const wins = outcomes.filter(result => result === ComparisonResult.PLAYER_WINS).length;
      const ties = outcomes.filter(result => result === ComparisonResult.TIE).length;
      const usefulDrawRate = (wins + ties * 0.35) / outcomes.length;
      score += usefulDrawRate * 32;

      const averageStrength = deck.reduce(
        (total, card) => total + this.strategicValue(card.rank),
        0
      ) / deck.length;
      score += (averageStrength - 45) * 0.12;
    }

    // The same card becomes more precious as elimination approaches.
    if (context) {
      if (ownDeckCount <= 3) score += 38;
      else if (ownDeckCount <= 6) score += 27;
      else if (ownDeckCount <= 10) score += 14;

      // A tied reinforcement starts Battle. After drawing it, three more cards
      // are required, so a nearly empty deck should avoid unsupported gambles.
      if (ownDeckCount < 4) score -= 28;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /** Face-down Battle cards are indistinguishable, so selection is fair/random. */
  selectBattleTarget(cardCount: number): number {
    if (!Number.isInteger(cardCount) || cardCount <= 0) {
      throw new Error('Battle target selection requires at least one card');
    }
    return Math.min(cardCount - 1, Math.floor(this.random() * cardCount));
  }

  private strategicValue(rank: Rank): number {
    switch (rank) {
      case Rank.TWO: return 100;
      case Rank.ACE: return 95;
      case Rank.KING: return 75;
      case Rank.QUEEN: return 65;
      case Rank.JACK: return 60;
      case Rank.TEN: return 55;
      case Rank.NINE: return 50;
      case Rank.EIGHT: return 45;
      case Rank.SEVEN: return 40;
      case Rank.SIX: return 30;
      case Rank.FIVE: return 24;
      case Rank.FOUR: return 18;
      case Rank.THREE: return 10;
    }
  }
}

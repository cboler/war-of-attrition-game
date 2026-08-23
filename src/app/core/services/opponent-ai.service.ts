import { InjectionToken, Injectable, inject } from '@angular/core';
import { Card, Rank } from '../models/card.model';
import {
  DEFAULT_COMMANDER_ID,
  OpponentCommander,
  OpponentCommanderId,
  getCommander
} from '../models/commander.model';
import { CardComparisonService, ComparisonResult } from './card-comparison.service';

export const AI_RANDOM = new InjectionToken<() => number>('AI_RANDOM', {
  providedIn: 'root',
  factory: () => Math.random
});

export interface OpponentChallengeContext {
  /** The public card the reinforcement must defeat. */
  readonly opposingCard: Card;
  /** Number of face-down cards left. The order and exact contents are never supplied. */
  readonly ownDeckCount: number;
  /** The AI's known original color pool, equivalent to knowing the physical deck list. */
  readonly ownCardPool: readonly Card[];
  /** Revealed table cards and Boneyard cards only. Never either hidden draw order. */
  readonly publicCards: readonly Card[];
  /** The active commander defining this opponent's strategic weights and heuristics. */
  readonly commander?: OpponentCommander | OpponentCommanderId;
}

@Injectable({ providedIn: 'root' })
export class OpponentAIService {
  private readonly random = inject(AI_RANDOM);
  private readonly comparison = inject(CardComparisonService);

  shouldChallenge(
    cardAtRisk: Card,
    context?: OpponentChallengeContext,
    commanderOverride?: OpponentCommander | OpponentCommanderId
  ): boolean {
    const commander = this.resolveCommander(commanderOverride ?? context?.commander);
    const strategy = commander.strategy;
    const score = this.challengeScore(cardAtRisk, context, commander);

    if (score >= strategy.autoAcceptScore) return true;
    if (score < strategy.autoRejectScore) return false;

    const bandSpan = Math.max(1, strategy.autoAcceptScore - strategy.autoRejectScore);
    const progress = (score - strategy.autoRejectScore) / bandSpan;
    const baseProb = 0.15 + progress * 0.70;
    const probability = Math.max(0.05, Math.min(0.95, baseProb * strategy.gambleBandMultiplier));
    return this.random() < probability;
  }

  challengeScore(
    cardAtRisk: Card,
    context?: OpponentChallengeContext,
    commanderOverride?: OpponentCommander | OpponentCommanderId
  ): number {
    const commander = this.resolveCommander(commanderOverride ?? context?.commander);
    const strategy = commander.strategy;
    const ownDeckCount = context?.ownDeckCount ?? 0;
    const cardValue = this.strategicValue(cardAtRisk.rank);

    // Valuable cards deserve defense; expendable low cards normally do not.
    let score = cardValue * strategy.cardValueWeight;

    if (context) {
      // A physical player knows the original cards of their color and can
      // eliminate cards that are visibly on the table or in the Boneyard.
      // They cannot inspect the shuffled pile. Deriving candidates here keeps
      // exact hidden content and order outside the decision boundary.
      const publicIds = new Set(context.publicCards.map(card => card.id));
      const candidates = context.ownCardPool.filter(card => !publicIds.has(card.id));
      const outcomes = candidates.map(candidate =>
        this.comparison.compareCards(candidate, context.opposingCard)
      );
      const wins = outcomes.filter(result => result === ComparisonResult.PLAYER_WINS).length;
      const ties = outcomes.filter(result => result === ComparisonResult.TIE).length;
      if (outcomes.length > 0) {
        const winRate = wins / outcomes.length;
        const tieRate = ties / outcomes.length;
        const canSupportBattle = ownDeckCount >= 4;
        score += winRate * strategy.winRateWeight;
        score += tieRate * (canSupportBattle ? strategy.supportedTieWeight : strategy.unsupportedTiePenalty);

        const averageStrength = candidates.reduce(
          (total, card) => total + this.strategicValue(card.rank),
          0
        ) / candidates.length;
        score += (averageStrength - 45) * strategy.candidatePoolStrengthWeight;

        // Drawing the tying reinforcement leaves three new cards to fund a
        // Battle. Unsupported ties are materially worse than clean wins.
        if (!canSupportBattle && ties > 0) score -= 8;
      }

      // Reserve depth penalty (e.g., for Attritionist preserving Battle capacity)
      if (ownDeckCount > 0 && ownDeckCount < 5 && strategy.reserveDepletionPenalty > 0) {
        score -= strategy.reserveDepletionPenalty;
      }

      // The same card becomes more precious as elimination approaches.
      if (ownDeckCount <= 3) score += strategy.desperationWeights.severe;
      else if (ownDeckCount <= 6) score += strategy.desperationWeights.moderate;
      else if (ownDeckCount <= 10) score += strategy.desperationWeights.mild;
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

  private resolveCommander(commander?: OpponentCommander | OpponentCommanderId): OpponentCommander {
    if (typeof commander === 'string') return getCommander(commander);
    if (commander && typeof commander === 'object' && 'strategy' in commander) return commander;
    return getCommander(DEFAULT_COMMANDER_ID);
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


import { InjectionToken, Injectable, inject } from '@angular/core';
import { Card, Rank } from '../core/models/card.model';
import { TableReactionCategory } from '../core/models/game-events.model';
import { PlayerType } from '../core/models/game-state.model';

export const REACTION_RANDOM = new InjectionToken<() => number>('REACTION_RANDOM', {
  providedIn: 'root',
  factory: () => Math.random
});

export interface TableReaction {
  readonly speaker: PlayerType;
  readonly message: string;
  readonly category: TableReactionCategory;
}

/** Every field is already face-up when a clash reaction may be requested. */
export interface ClashReactionContext {
  readonly playerCard: Card;
  readonly opponentCard: Card;
  readonly winner: PlayerType;
  readonly specialRule: boolean;
}

/** Challenge reactions are valid only after the random reinforcement is revealed. */
export interface ChallengeReactionContext {
  readonly challenger: PlayerType;
  readonly originalBeatenCard: Card;
  readonly reinforcementCard: Card;
  readonly originalWinnerCard: Card;
  readonly challengerWon: boolean;
}

export interface BattleReactionContext {
  readonly decisiveCard?: Card;
  readonly battleDepth?: number;
  readonly winnerBattleStreak?: number;
  readonly loserBattleStreak?: number;
}

@Injectable({ providedIn: 'root' })
export class TableReactionService {
  private readonly random = inject(REACTION_RANDOM);

  forClash(context: ClashReactionContext): TableReaction | null {
    const loser = this.opposite(context.winner);
    if (context.specialRule) {
      return this.pick(
        0.28,
        loser,
        'special_clash',
        ['The little card had one job.', 'A Two changes everything.', 'That Ace found its exception.'],
      );
    }

    const winningCard = context.winner === PlayerType.PLAYER
      ? context.playerCard
      : context.opponentCard;
    const losingCard = context.winner === PlayerType.PLAYER
      ? context.opponentCard
      : context.playerCard;
    if (winningCard.rank !== Rank.JACK || losingCard.rank !== Rank.TEN) return null;
    return this.pick(
      0.14,
      loser,
      'narrow_clash',
      ['Too close.', 'One rank was enough.', 'A narrow edge.'],
    );
  }

  forChallengeResolution(context: ChallengeReactionContext): TableReaction | null {
    const rescuedSpecialCard = this.isValuable(context.originalBeatenCard);
    if (context.challengerWon) {
      const variants =
        context.originalBeatenCard.rank === Rank.TWO &&
        context.reinforcementCard.rank === Rank.ACE
          ? ['The cavalry arrived.', 'An Ace, right on time.', 'That Two lives to fight again.']
          : ['A timely rescue.', 'That card was worth saving.', 'Reinforcement held.'];
      return this.pick(
        rescuedSpecialCard ? 0.24 : 0.12,
        this.opposite(context.challenger),
        'rescue',
        variants,
      );
    }

    const costly = rescuedSpecialCard || this.isValuable(context.reinforcementCard);
    if (!costly) return null;
    return this.pick(
      0.2,
      context.challenger,
      'failed_rescue',
      ['That reinforcement cost dearly.', 'Two cards gone for nothing.', 'A costly gamble.'],
    );
  }

  forBattleLoss(
    loser: PlayerType,
    cards: readonly Card[],
    context: BattleReactionContext = {},
  ): TableReaction | null {
    const lostAce = cards.some(card => card.rank === Rank.ACE);
    const lostTwo = cards.some(card => card.rank === Rank.TWO);
    const largeLoss = cards.length >= 8;
    const highValueLosses = cards.filter((card) => this.isValuable(card)).length;
    const decisiveRampage = !!context.decisiveCard && cards.length >= 3 && highValueLosses >= 2;
    const deepBattle = (context.battleDepth ?? 0) >= 3;
    const longStreak = Math.max(
      context.winnerBattleStreak ?? 0,
      context.loserBattleStreak ?? 0,
    ) >= 3;
    if (!lostAce && !lostTwo && !largeLoss && !decisiveRampage && !deepBattle && !longStreak) {
      return null;
    }
    // Even earned reactions should be exceptional; silence is the default.
    const chance = largeLoss || decisiveRampage || deepBattle ? 0.22 : 0.16;
    if (this.random() >= chance) return null;

    let variants: readonly string[];
    if (decisiveRampage) {
      variants = ['One champion did all of that.', 'That card carved through the line.', 'A devastating champion.'];
    } else if (deepBattle) {
      variants = ['That Battle went deep.', 'Too far down to turn back.', 'A long way to fall.'];
    } else if (lostAce && lostTwo) {
      variants = ['That was catastrophic.', 'The Ace and the assassin. Gone.', 'That table took everything.'];
    } else if (lostTwo) {
      variants = ['There goes the assassin.', 'That two was worth more than it looked.', 'That one hurt.'];
    } else if (lostAce) {
      variants = ['Not the Ace…', 'That Ace never came home.', 'A very expensive Battle.'];
    } else {
      variants = ['That was catastrophic.', 'A very expensive Battle.', 'You had no idea what you just won.'];
    }
    return {
      speaker: loser,
      message: variants[Math.floor(this.random() * variants.length)],
      category: 'battle',
    };
  }

  private pick(
    chance: number,
    speaker: PlayerType,
    category: TableReaction['category'],
    variants: readonly string[],
  ): TableReaction | null {
    if (this.random() >= chance) return null;
    return {
      speaker,
      category,
      message: variants[Math.floor(this.random() * variants.length)],
    };
  }

  private isValuable(card: Card): boolean {
    return [Rank.ACE, Rank.KING, Rank.QUEEN, Rank.JACK, Rank.TWO].includes(card.rank);
  }

  private opposite(player: PlayerType): PlayerType {
    return player === PlayerType.PLAYER ? PlayerType.OPPONENT : PlayerType.PLAYER;
  }
}

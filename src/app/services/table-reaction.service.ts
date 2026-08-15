import { InjectionToken, Injectable, inject } from '@angular/core';
import { Card, Rank } from '../core/models/card.model';
import { PlayerType } from '../core/models/game-state.model';

export const REACTION_RANDOM = new InjectionToken<() => number>('REACTION_RANDOM', {
  providedIn: 'root',
  factory: () => Math.random
});

export interface TableReaction {
  readonly speaker: PlayerType;
  readonly message: string;
}

@Injectable({ providedIn: 'root' })
export class TableReactionService {
  private readonly random = inject(REACTION_RANDOM);

  forBattleLoss(loser: PlayerType, cards: readonly Card[]): TableReaction | null {
    const lostAce = cards.some(card => card.rank === Rank.ACE);
    const lostTwo = cards.some(card => card.rank === Rank.TWO);
    const largeLoss = cards.length >= 8;
    if (!lostAce && !lostTwo && !largeLoss) return null;
    // Even earned reactions should be exceptional; silence is the default.
    if (this.random() >= (largeLoss ? 0.22 : 0.16)) return null;

    let variants: readonly string[];
    if (lostAce && lostTwo) {
      variants = ['That was catastrophic.', 'The Ace and the assassin. Gone.', 'That table took everything.'];
    } else if (lostTwo) {
      variants = ['There goes the assassin.', 'That two was worth more than it looked.', 'That one hurt.'];
    } else if (lostAce) {
      variants = ['Not the Ace…', 'That Ace never came home.', 'A very expensive Battle.'];
    } else {
      variants = ['That was catastrophic.', 'A very expensive Battle.', 'You had no idea what you just won.'];
    }
    return { speaker: loser, message: variants[Math.floor(this.random() * variants.length)] };
  }
}

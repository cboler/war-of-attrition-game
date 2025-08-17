export enum Suit {
  HEARTS = 'hearts',
  DIAMONDS = 'diamonds',
  CLUBS = 'clubs',
  SPADES = 'spades'
}

export enum Rank {
  ACE = 'A',
  KING = 'K',
  QUEEN = 'Q',
  JACK = 'J',
  TEN = '10',
  NINE = '9',
  EIGHT = '8',
  SEVEN = '7',
  SIX = '6',
  FIVE = '5',
  FOUR = '4',
  THREE = '3',
  TWO = '2'
}

export interface Card {
  readonly suit: Suit;
  readonly rank: Rank;
  readonly value: number;
  readonly isRed: boolean;
}

export class CardImpl implements Card {
  readonly suit: Suit;
  readonly rank: Rank;
  readonly value: number;
  readonly isRed: boolean;

  constructor(suit: Suit, rank: Rank) {
    this.suit = suit;
    this.rank = rank;
    this.value = this.calculateValue(rank);
    this.isRed = suit === Suit.HEARTS || suit === Suit.DIAMONDS;
  }

  private calculateValue(rank: Rank): number {
    switch (rank) {
      case Rank.ACE: return 14;
      case Rank.KING: return 13;
      case Rank.QUEEN: return 12;
      case Rank.JACK: return 11;
      case Rank.TEN: return 10;
      case Rank.NINE: return 9;
      case Rank.EIGHT: return 8;
      case Rank.SEVEN: return 7;
      case Rank.SIX: return 6;
      case Rank.FIVE: return 5;
      case Rank.FOUR: return 4;
      case Rank.THREE: return 3;
      case Rank.TWO: return 2;
      default: return 0;
    }
  }

  toString(): string {
    return `${this.rank} of ${this.suit}`;
  }
}
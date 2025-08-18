import { Card, CardImpl, Suit, Rank } from './card.model';

export class Deck {
  private cards: Card[] = [];

  constructor(cards?: Card[]) {
    if (cards) {
      this.cards = [...cards];
    } else {
      this.initializeStandardDeck();
    }
  }

  private initializeStandardDeck(): void {
    const suits = Object.values(Suit);
    const ranks = Object.values(Rank);

    for (const suit of suits) {
      for (const rank of ranks) {
        this.cards.push(new CardImpl(suit, rank));
      }
    }
  }

  static createRedDeck(): Deck {
    const redCards: Card[] = [];
    const redSuits = [Suit.HEARTS, Suit.DIAMONDS];
    const ranks = Object.values(Rank);

    for (const suit of redSuits) {
      for (const rank of ranks) {
        redCards.push(new CardImpl(suit, rank));
      }
    }

    return new Deck(redCards);
  }

  static createBlackDeck(): Deck {
    const blackCards: Card[] = [];
    const blackSuits = [Suit.CLUBS, Suit.SPADES];
    const ranks = Object.values(Rank);

    for (const suit of blackSuits) {
      for (const rank of ranks) {
        blackCards.push(new CardImpl(suit, rank));
      }
    }

    return new Deck(blackCards);
  }

  shuffle(): void {
    // Fisher-Yates shuffle algorithm
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  draw(): Card | null {
    return this.cards.pop() || null;
  }

  drawMultiple(count: number): Card[] {
    const drawnCards: Card[] = [];
    for (let i = 0; i < count && this.cards.length > 0; i++) {
      const card = this.draw();
      if (card) {
        drawnCards.push(card);
      }
    }
    return drawnCards;
  }

  addCard(card: Card): void {
    this.cards.unshift(card); // Add to bottom of deck
  }

  addCards(cards: Card[]): void {
    this.cards.unshift(...cards); // Add to bottom of deck
  }

  get count(): number {
    return this.cards.length;
  }

  get isEmpty(): boolean {
    return this.cards.length === 0;
  }

  get hasMinimumForBattle(): boolean {
    return this.cards.length >= 4; // Need 1 for comparison + 3 for battle
  }

  peek(): Card | null {
    return this.cards[this.cards.length - 1] || null;
  }

  toArray(): readonly Card[] {
    return [...this.cards];
  }

  /**
   * Create a copy of this deck
   */
  copy(): Deck {
    return new Deck([...this.cards]);
  }

  reset(): void {
    this.cards = [];
  }
}
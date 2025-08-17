import { Deck } from './deck.model';
import { CardImpl, Suit, Rank } from './card.model';

describe('Deck Model', () => {
  describe('Standard deck creation', () => {
    it('should create a standard 52-card deck', () => {
      const deck = new Deck();
      
      expect(deck.count).toBe(52);
    });

    it('should create a red deck with 26 cards', () => {
      const redDeck = Deck.createRedDeck();
      
      expect(redDeck.count).toBe(26);
      
      // Check that all cards are red
      const cards = redDeck.toArray();
      cards.forEach(card => {
        expect(card.isRed).toBe(true);
        expect([Suit.HEARTS, Suit.DIAMONDS]).toContain(card.suit);
      });
    });

    it('should create a black deck with 26 cards', () => {
      const blackDeck = Deck.createBlackDeck();
      
      expect(blackDeck.count).toBe(26);
      
      // Check that all cards are black
      const cards = blackDeck.toArray();
      cards.forEach(card => {
        expect(card.isRed).toBe(false);
        expect([Suit.CLUBS, Suit.SPADES]).toContain(card.suit);
      });
    });
  });

  describe('Deck operations', () => {
    let deck: Deck;

    beforeEach(() => {
      deck = new Deck();
    });

    it('should draw cards from the top', () => {
      const initialCount = deck.count;
      const drawnCard = deck.draw();
      
      expect(drawnCard).toBeTruthy();
      expect(deck.count).toBe(initialCount - 1);
    });

    it('should return null when drawing from empty deck', () => {
      // Empty the deck
      while (!deck.isEmpty) {
        deck.draw();
      }
      
      const drawnCard = deck.draw();
      
      expect(drawnCard).toBeNull();
      expect(deck.isEmpty).toBe(true);
    });

    it('should draw multiple cards correctly', () => {
      const initialCount = deck.count;
      const drawnCards = deck.drawMultiple(5);
      
      expect(drawnCards.length).toBe(5);
      expect(deck.count).toBe(initialCount - 5);
    });

    it('should handle drawing more cards than available', () => {
      // Create a small deck
      const smallDeck = new Deck([
        new CardImpl(Suit.HEARTS, Rank.ACE),
        new CardImpl(Suit.HEARTS, Rank.KING)
      ]);
      
      const drawnCards = smallDeck.drawMultiple(5);
      
      expect(drawnCards.length).toBe(2);
      expect(smallDeck.isEmpty).toBe(true);
    });

    it('should add cards to the bottom of the deck', () => {
      const initialCount = deck.count;
      const newCard = new CardImpl(Suit.HEARTS, Rank.ACE);
      
      deck.addCard(newCard);
      
      expect(deck.count).toBe(initialCount + 1);
    });

    it('should add multiple cards to the bottom of the deck', () => {
      const initialCount = deck.count;
      const newCards = [
        new CardImpl(Suit.HEARTS, Rank.ACE),
        new CardImpl(Suit.SPADES, Rank.KING)
      ];
      
      deck.addCards(newCards);
      
      expect(deck.count).toBe(initialCount + 2);
    });

    it('should peek at the top card without removing it', () => {
      const initialCount = deck.count;
      const peekedCard = deck.peek();
      
      expect(peekedCard).toBeTruthy();
      expect(deck.count).toBe(initialCount);
    });

    it('should return null when peeking at empty deck', () => {
      // Empty the deck
      while (!deck.isEmpty) {
        deck.draw();
      }
      
      const peekedCard = deck.peek();
      
      expect(peekedCard).toBeNull();
    });

    it('should correctly identify when deck has minimum cards for battle', () => {
      // Create deck with exactly 4 cards
      const battleDeck = new Deck([
        new CardImpl(Suit.HEARTS, Rank.ACE),
        new CardImpl(Suit.HEARTS, Rank.KING),
        new CardImpl(Suit.HEARTS, Rank.QUEEN),
        new CardImpl(Suit.HEARTS, Rank.JACK)
      ]);
      
      expect(battleDeck.hasMinimumForBattle).toBe(true);
      
      // Remove one card
      battleDeck.draw();
      expect(battleDeck.hasMinimumForBattle).toBe(false);
    });

    it('should reset deck to empty state', () => {
      deck.reset();
      
      expect(deck.count).toBe(0);
      expect(deck.isEmpty).toBe(true);
    });
  });

  describe('Shuffle functionality', () => {
    it('should shuffle the deck (order should change)', () => {
      const deck1 = Deck.createRedDeck();
      const deck2 = Deck.createRedDeck();
      
      const originalOrder = deck1.toArray();
      deck2.shuffle();
      const shuffledOrder = deck2.toArray();
      
      // While it's theoretically possible for shuffle to produce the same order,
      // it's extremely unlikely with 26 cards
      expect(JSON.stringify(originalOrder)).not.toBe(JSON.stringify(shuffledOrder));
    });

    it('should maintain the same number of cards after shuffle', () => {
      const deck = Deck.createRedDeck();
      const originalCount = deck.count;
      
      deck.shuffle();
      
      expect(deck.count).toBe(originalCount);
    });
  });
});
import { CardImpl, Suit, Rank } from './card.model';

describe('Card Model', () => {
  describe('CardImpl', () => {
    it('should create a card with correct properties', () => {
      const card = new CardImpl(Suit.HEARTS, Rank.ACE);
      
      expect(card.suit).toBe(Suit.HEARTS);
      expect(card.rank).toBe(Rank.ACE);
      expect(card.value).toBe(14);
      expect(card.isRed).toBe(true);
    });

    it('should correctly identify red cards', () => {
      const heartCard = new CardImpl(Suit.HEARTS, Rank.KING);
      const diamondCard = new CardImpl(Suit.DIAMONDS, Rank.QUEEN);
      
      expect(heartCard.isRed).toBe(true);
      expect(diamondCard.isRed).toBe(true);
    });

    it('should correctly identify black cards', () => {
      const clubCard = new CardImpl(Suit.CLUBS, Rank.JACK);
      const spadeCard = new CardImpl(Suit.SPADES, Rank.TEN);
      
      expect(clubCard.isRed).toBe(false);
      expect(spadeCard.isRed).toBe(false);
    });

    it('should assign correct values to all ranks', () => {
      expect(new CardImpl(Suit.HEARTS, Rank.ACE).value).toBe(14);
      expect(new CardImpl(Suit.HEARTS, Rank.KING).value).toBe(13);
      expect(new CardImpl(Suit.HEARTS, Rank.QUEEN).value).toBe(12);
      expect(new CardImpl(Suit.HEARTS, Rank.JACK).value).toBe(11);
      expect(new CardImpl(Suit.HEARTS, Rank.TEN).value).toBe(10);
      expect(new CardImpl(Suit.HEARTS, Rank.NINE).value).toBe(9);
      expect(new CardImpl(Suit.HEARTS, Rank.EIGHT).value).toBe(8);
      expect(new CardImpl(Suit.HEARTS, Rank.SEVEN).value).toBe(7);
      expect(new CardImpl(Suit.HEARTS, Rank.SIX).value).toBe(6);
      expect(new CardImpl(Suit.HEARTS, Rank.FIVE).value).toBe(5);
      expect(new CardImpl(Suit.HEARTS, Rank.FOUR).value).toBe(4);
      expect(new CardImpl(Suit.HEARTS, Rank.THREE).value).toBe(3);
      expect(new CardImpl(Suit.HEARTS, Rank.TWO).value).toBe(2);
    });

    it('should provide correct string representation', () => {
      const card = new CardImpl(Suit.HEARTS, Rank.ACE);
      
      expect(card.toString()).toBe('A of hearts');
    });
  });
});
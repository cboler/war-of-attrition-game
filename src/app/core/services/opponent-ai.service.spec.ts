import { TestBed } from '@angular/core/testing';
import { CardImpl, Rank, Suit } from '../models/card.model';
import { AI_RANDOM, OpponentAIService } from './opponent-ai.service';

describe('OpponentAIService strategy', () => {
  let service: OpponentAIService;
  let randomValue = 0.5;

  beforeEach(() => {
    randomValue = 0.5;
    TestBed.configureTestingModule({
      providers: [{ provide: AI_RANDOM, useFactory: () => () => randomValue }]
    });
    service = TestBed.inject(OpponentAIService);
  });

  const card = (rank: Rank, suit = Suit.SPADES) => new CardImpl(suit, rank);

  it('almost always defends a healthy-deck 2 because it is strategically exceptional', () => {
    const ownDeck = [
      card(Rank.ACE), card(Rank.KING), card(Rank.QUEEN), card(Rank.JACK),
      card(Rank.TEN), card(Rank.NINE), card(Rank.EIGHT), card(Rank.SEVEN)
    ];
    const context = { opposingCard: card(Rank.SIX, Suit.HEARTS), ownDeck, publicCards: [] };
    randomValue = 0.99;

    expect(service.challengeScore(card(Rank.TWO), context)).toBeGreaterThanOrEqual(80);
    expect(service.shouldChallenge(card(Rank.TWO), context)).toBeTrue();
  });

  it('does not spend a healthy-deck reinforcement trying to save a 3 from a strong card', () => {
    const ownDeck = [
      card(Rank.THREE), card(Rank.FOUR), card(Rank.FIVE), card(Rank.SIX),
      card(Rank.SEVEN), card(Rank.EIGHT), card(Rank.NINE), card(Rank.TEN)
    ];
    const context = { opposingCard: card(Rank.KING, Suit.HEARTS), ownDeck, publicCards: [] };
    randomValue = 0;

    expect(service.challengeScore(card(Rank.THREE), context)).toBeLessThan(20);
    expect(service.shouldChallenge(card(Rank.THREE), context)).toBeFalse();
  });

  it('becomes more willing to defend a mediocre card near elimination', () => {
    const ownDeck = [card(Rank.ACE), card(Rank.KING), card(Rank.QUEEN)];
    const context = { opposingCard: card(Rank.EIGHT, Suit.HEARTS), ownDeck, publicCards: [] };

    expect(service.challengeScore(card(Rank.SEVEN), context)).toBeGreaterThanOrEqual(60);
    expect(service.shouldChallenge(card(Rank.SEVEN), context)).toBeTrue();
  });

  it('uses controlled randomness only in judgment zones', () => {
    const atRisk = card(Rank.SEVEN);
    randomValue = 0.05;
    expect(service.shouldChallenge(atRisk)).toBeTrue();
    randomValue = 0.9;
    expect(service.shouldChallenge(atRisk)).toBeFalse();
  });

  it('selects among indistinguishable face-down Battle targets without inspecting cards', () => {
    randomValue = 0.52;
    expect(service.selectBattleTarget(3)).toBe(1);
    expect(() => service.selectBattleTarget(0)).toThrowError(
      'Battle target selection requires at least one card'
    );
  });
});

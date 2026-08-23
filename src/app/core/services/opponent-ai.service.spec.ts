import { TestBed } from '@angular/core/testing';
import { Card, CardImpl, Rank, Suit } from '../models/card.model';
import { Deck } from '../models/deck.model';
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
  const ownCardPool = Deck.createBlackDeck().toArray();
  const context = (
    opposingCard: Card,
    ownDeckCount = 8,
    publicCards: readonly Card[] = []
  ) => ({ opposingCard, ownDeckCount, ownCardPool, publicCards });

  it('almost always defends a healthy-deck 2 because it is strategically exceptional', () => {
    const challengeContext = context(card(Rank.SIX, Suit.HEARTS));
    randomValue = 0.99;

    expect(service.challengeScore(card(Rank.TWO), challengeContext)).toBeGreaterThanOrEqual(80);
    expect(service.shouldChallenge(card(Rank.TWO), challengeContext)).toBeTrue();
  });

  it('does not spend a healthy-deck reinforcement trying to save a 3 from a strong card', () => {
    const challengeContext = context(card(Rank.KING, Suit.HEARTS), 18);
    randomValue = 0;

    expect(service.challengeScore(card(Rank.THREE), challengeContext)).toBeLessThan(20);
    expect(service.shouldChallenge(card(Rank.THREE), challengeContext)).toBeFalse();
  });

  it('becomes more willing to defend a mediocre card near elimination', () => {
    const challengeContext = context(card(Rank.EIGHT, Suit.HEARTS), 3);

    expect(service.challengeScore(card(Rank.SEVEN), challengeContext)).toBeGreaterThanOrEqual(60);
    expect(service.shouldChallenge(card(Rank.SEVEN), challengeContext)).toBeTrue();
  });

  it('improves reinforcement odds when public weak cards leave the candidate pool', () => {
    const opposing = card(Rank.NINE, Suit.HEARTS);
    const weakUnavailable = ownCardPool.filter(candidate =>
      [Rank.THREE, Rank.FOUR, Rank.FIVE].includes(candidate.rank)
    );
    const strongUnavailable = ownCardPool.filter(candidate =>
      [Rank.ACE, Rank.KING, Rank.QUEEN].includes(candidate.rank)
    );

    const improved = service.challengeScore(
      card(Rank.EIGHT),
      context(opposing, 12, weakUnavailable)
    );
    const diminished = service.challengeScore(
      card(Rank.EIGHT),
      context(opposing, 12, strongUnavailable)
    );

    expect(improved).toBeGreaterThan(diminished);
  });

  it('ignores exact hidden deck content and order when public knowledge is identical', () => {
    const publicContext = context(card(Rank.TEN, Suit.HEARTS), 9, [
      ownCardPool.find(candidate => candidate.rank === Rank.THREE)!
    ]);
    const firstPhysicalPile = {
      ...publicContext,
      hiddenDeckContent: [card(Rank.ACE), card(Rank.KING), card(Rank.QUEEN)]
    };
    const secondPhysicalPile = {
      ...publicContext,
      ownCardPool: [...publicContext.ownCardPool].reverse(),
      hiddenDeckContent: [card(Rank.THREE), card(Rank.FOUR), card(Rank.FIVE)]
    };

    expect(service.challengeScore(card(Rank.NINE), firstPhysicalPile))
      .toBe(service.challengeScore(card(Rank.NINE), secondPhysicalPile));
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

  describe('Commander Archetype Divergence', () => {
    it('Gambler has a broader gamble band and lower acceptance threshold than Quartermaster', () => {
      const quartermaster = service['resolveCommander']('quartermaster');
      const gambler = service['resolveCommander']('gambler');

      expect(gambler.strategy.autoAcceptScore).toBeLessThan(quartermaster.strategy.autoAcceptScore);
      expect(gambler.strategy.autoRejectScore).toBeLessThan(quartermaster.strategy.autoRejectScore);
      expect(gambler.strategy.gambleBandMultiplier).toBeGreaterThan(quartermaster.strategy.gambleBandMultiplier);
    });

    it('Cornered General gains significant desperation bonus when low on cards', () => {
      const atRisk = card(Rank.SEVEN, Suit.SPADES);
      const opposing = card(Rank.NINE, Suit.HEARTS);

      const healthyGeneralScore = service.challengeScore(atRisk, {
        ...context(opposing, 15),
        commander: 'cornered-general'
      });
      const desperateGeneralScore = service.challengeScore(atRisk, {
        ...context(opposing, 3),
        commander: 'cornered-general'
      });

      expect(desperateGeneralScore).toBeGreaterThan(healthyGeneralScore + 20);
    });

    it('Analyst heavily reacts to shifts in candidate pool probability', () => {
      const opposing = card(Rank.TEN, Suit.HEARTS);
      const weakUnavailable = ownCardPool.filter(c =>
        [Rank.THREE, Rank.FOUR, Rank.FIVE].includes(c.rank)
      );
      const strongUnavailable = ownCardPool.filter(c =>
        [Rank.ACE, Rank.KING, Rank.QUEEN].includes(c.rank)
      );

      const analystHighOdds = service.challengeScore(card(Rank.EIGHT), {
        ...context(opposing, 12, weakUnavailable),
        commander: 'analyst'
      });
      const analystLowOdds = service.challengeScore(card(Rank.EIGHT), {
        ...context(opposing, 12, strongUnavailable),
        commander: 'analyst'
      });

      expect(analystHighOdds - analystLowOdds).toBeGreaterThanOrEqual(15);
    });

    it('Attritionist penalizes challenges when reserves cannot sustain subsequent Battles', () => {
      const atRisk = card(Rank.FOUR, Suit.SPADES);
      const opposing = card(Rank.EIGHT, Suit.HEARTS);

      const scoreWithReserves = service.challengeScore(atRisk, {
        ...context(opposing, 10),
        commander: 'attritionist'
      });
      const scoreDepleted = service.challengeScore(atRisk, {
        ...context(opposing, 4),
        commander: 'attritionist'
      });

      expect(scoreDepleted).toBeLessThan(scoreWithReserves);
    });
  });
});

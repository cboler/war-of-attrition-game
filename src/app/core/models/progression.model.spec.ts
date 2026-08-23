import { GameOutcome } from './game-state.model';
import { OpponentCommanderId } from './commander.model';
import {
  DEFAULT_CAMPAIGN_MODE_ID,
  LIMITED_RESERVES_INITIAL_COUNT,
  canHumanReinforce,
  getHumanReserves,
  isLimitedReservesMode,
  normalizeCampaignProgression,
  summarizeCampaign,
  ActiveCampaign,
  CampaignProgression
} from './progression.model';

describe('ProgressionModel and Rules', () => {
  describe('canHumanReinforce and getHumanReserves', () => {
    it('allows reinforcement in standard campaign as long as deck has at least 1 card', () => {
      const campaign: ActiveCampaign = {
        campaignId: 'camp-1',
        commanderId: 'quartermaster',
        mode: 'standard',
        ordersSelected: true,
        wars: []
      };

      expect(isLimitedReservesMode(campaign)).toBeFalse();
      expect(getHumanReserves(campaign)).toBeNull();
      expect(canHumanReinforce(campaign, 5)).toBeTrue();
      expect(canHumanReinforce(campaign, 1)).toBeTrue();
      expect(canHumanReinforce(campaign, 0)).toBeFalse();
    });

    it('requires both deck cards > 0 and remaining reserves > 0 in Limited Reserves mode', () => {
      const campaign: ActiveCampaign = {
        campaignId: 'camp-2',
        commanderId: 'quartermaster',
        mode: 'limited_reserves',
        ordersSelected: true,
        limitedReserves: {
          initialReserves: 5,
          remainingReserves: 3
        },
        wars: []
      };

      expect(isLimitedReservesMode(campaign)).toBeTrue();
      expect(getHumanReserves(campaign)).toEqual({ remaining: 3, max: 5 });
      expect(canHumanReinforce(campaign, 10)).toBeTrue();
      expect(canHumanReinforce(campaign, 1)).toBeTrue();
      expect(canHumanReinforce(campaign, 0)).toBeFalse();

      const exhaustedCampaign: ActiveCampaign = {
        ...campaign,
        limitedReserves: {
          initialReserves: 5,
          remainingReserves: 0
        }
      };

      expect(getHumanReserves(exhaustedCampaign)).toEqual({ remaining: 0, max: 5 });
      expect(canHumanReinforce(exhaustedCampaign, 10)).toBeFalse();
      expect(canHumanReinforce(exhaustedCampaign, 0)).toBeFalse();
    });
  });

  describe('normalizeCampaignProgression', () => {
    it('safely migrates legacy progression missing mode and ordersSelected to standard mode', () => {
      const legacyRaw = {
        tokenBalance: 4,
        lifetimeTokensEarned: 10,
        unlockedCosmetics: [],
        selectedCosmetics: { cardBackingId: 'standard-black' },
        currentCampaign: {
          campaignId: 'legacy-camp',
          commanderId: 'quartermaster',
          wars: [
            {
              warId: 'war-legacy-1',
              outcome: GameOutcome.PLAYER_WIN,
              margin: 4,
              playerDeckColor: 'red',
              completedAt: '2026-08-01T00:00:00Z'
            }
          ]
        },
        recentCampaigns: [],
        processedWarIds: ['war-legacy-1']
      };

      const normalized = normalizeCampaignProgression(legacyRaw);

      expect(normalized.currentCampaign.mode).toBe('standard');
      expect(normalized.currentCampaign.ordersSelected).toBeTrue(); // In-progress legacy campaign marked as selected
      expect(normalized.currentCampaign.limitedReserves).toBeUndefined();
    });

    it('initializes a fresh campaign with ordersSelected: false', () => {
      const freshRaw = {
        tokenBalance: 0,
        lifetimeTokensEarned: 0,
        unlockedCosmetics: [],
        selectedCosmetics: { cardBackingId: 'standard-black' },
        currentCampaign: {
          campaignId: 'fresh-camp',
          commanderId: 'quartermaster',
          wars: []
        },
        recentCampaigns: [],
        processedWarIds: []
      };

      const normalized = normalizeCampaignProgression(freshRaw);

      expect(normalized.currentCampaign.mode).toBe('standard');
      expect(normalized.currentCampaign.ordersSelected).toBeFalse();
    });

    it('clamps Limited Reserves bounds within [0, 5]', () => {
      const outOfBoundsRaw = {
        tokenBalance: 0,
        lifetimeTokensEarned: 0,
        unlockedCosmetics: [],
        selectedCosmetics: { cardBackingId: 'standard-black' },
        currentCampaign: {
          campaignId: 'lr-camp',
          commanderId: 'quartermaster',
          mode: 'limited_reserves',
          ordersSelected: true,
          limitedReserves: {
            initialReserves: 10,
            remainingReserves: 99
          },
          wars: []
        },
        recentCampaigns: [],
        processedWarIds: []
      };

      const normalized = normalizeCampaignProgression(outOfBoundsRaw);

      expect(normalized.currentCampaign.limitedReserves?.initialReserves).toBe(5);
      expect(normalized.currentCampaign.limitedReserves?.remainingReserves).toBe(5);
    });
  });

  describe('summarizeCampaign', () => {
    it('summarizes a Limited Reserves Campaign preserving mode and remaining reserves', () => {
      const summary = summarizeCampaign(
        'lr-summary-camp',
        [
          { warId: 'w1', outcome: GameOutcome.PLAYER_WIN, margin: 2, playerDeckColor: 'red', completedAt: '2026-08-20' },
          { warId: 'w2', outcome: GameOutcome.OPPONENT_WIN, margin: -4, playerDeckColor: 'red', completedAt: '2026-08-20' },
          { warId: 'w3', outcome: GameOutcome.PLAYER_WIN, margin: 6, playerDeckColor: 'red', completedAt: '2026-08-20' }
        ],
        'quartermaster',
        'limited_reserves',
        2
      );

      expect(summary.mode).toBe('limited_reserves');
      expect(summary.remainingReserves).toBe(2);
      expect(summary.outcome).toBe('victory');
      expect(summary.wins).toBe(2);
      expect(summary.losses).toBe(1);
    });
  });
});

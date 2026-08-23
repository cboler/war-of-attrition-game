import { GameOutcome } from './game-state.model';
import { OpponentCommanderId } from './commander.model';
import {
  DEFAULT_CAMPAIGN_MODE_ID,
  LIMITED_RESERVES_INITIAL_COUNT,
  canHumanReinforce,
  canInspectCasualties,
  getHumanReserves,
  isFogOfWarActive,
  isFogOfWarMode,
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

    it('allows reinforcement in Fog of War mode based on deck count only', () => {
      const campaign: ActiveCampaign = {
        campaignId: 'camp-fog',
        commanderId: 'analyst',
        mode: 'fog_of_war',
        ordersSelected: true,
        wars: []
      };

      expect(isFogOfWarMode(campaign)).toBeTrue();
      expect(getHumanReserves(campaign)).toBeNull();
      expect(canHumanReinforce(campaign, 12)).toBeTrue();
      expect(canHumanReinforce(campaign, 0)).toBeFalse();
    });

    it('determines Fog of War active state and casualty inspection access correctly', () => {
      expect(isFogOfWarActive('fog_of_war', false)).toBeTrue();
      expect(isFogOfWarActive('fog_of_war', true)).toBeFalse();
      expect(isFogOfWarActive('standard', false)).toBeFalse();
      expect(isFogOfWarActive('total_war', false)).toBeFalse();
      expect(isFogOfWarActive('limited_reserves', false)).toBeFalse();

      expect(canInspectCasualties('fog_of_war', false)).toBeFalse();
      expect(canInspectCasualties('fog_of_war', true)).toBeTrue();
      expect(canInspectCasualties('standard', false)).toBeTrue();
      expect(canInspectCasualties('total_war', false)).toBeTrue();
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

    it('summarizes a Total War Campaign where positive differential wins despite losing 2 of 3 wars', () => {
      const summary = summarizeCampaign(
        'tw-victory-camp',
        [
          { warId: 'w1', outcome: GameOutcome.OPPONENT_WIN, margin: -2, playerDeckColor: 'red', completedAt: '2026-08-20' },
          { warId: 'w2', outcome: GameOutcome.OPPONENT_WIN, margin: -2, playerDeckColor: 'red', completedAt: '2026-08-20' },
          { warId: 'w3', outcome: GameOutcome.PLAYER_WIN, margin: 15, playerDeckColor: 'red', completedAt: '2026-08-20' }
        ],
        'quartermaster',
        'total_war'
      );

      expect(summary.mode).toBe('total_war');
      expect(summary.wins).toBe(1);
      expect(summary.losses).toBe(2);
      expect(summary.differential).toBe(11);
      expect(summary.outcome).toBe('victory'); // Total War victory because differential > 0 (+11)
      expect(summary.tokensEarned).toBe(2); // 1 for victory + 1 for positive differential
    });

    it('summarizes a Total War Campaign where negative differential loses despite winning 2 of 3 wars', () => {
      const summary = summarizeCampaign(
        'tw-defeat-camp',
        [
          { warId: 'w1', outcome: GameOutcome.PLAYER_WIN, margin: 1, playerDeckColor: 'red', completedAt: '2026-08-20' },
          { warId: 'w2', outcome: GameOutcome.PLAYER_WIN, margin: 1, playerDeckColor: 'red', completedAt: '2026-08-20' },
          { warId: 'w3', outcome: GameOutcome.OPPONENT_WIN, margin: -10, playerDeckColor: 'red', completedAt: '2026-08-20' }
        ],
        'quartermaster',
        'total_war'
      );

      expect(summary.mode).toBe('total_war');
      expect(summary.wins).toBe(2);
      expect(summary.losses).toBe(1);
      expect(summary.differential).toBe(-8);
      expect(summary.outcome).toBe('defeat'); // Total War defeat because differential < 0 (-8)
      expect(summary.tokensEarned).toBe(0);
    });

    it('summarizes a Total War Campaign as draw when differential equals zero', () => {
      const summary = summarizeCampaign(
        'tw-draw-camp',
        [
          { warId: 'w1', outcome: GameOutcome.PLAYER_WIN, margin: 4, playerDeckColor: 'red', completedAt: '2026-08-20' },
          { warId: 'w2', outcome: GameOutcome.OPPONENT_WIN, margin: -4, playerDeckColor: 'red', completedAt: '2026-08-20' },
          { warId: 'w3', outcome: GameOutcome.TIE, margin: 0, playerDeckColor: 'red', completedAt: '2026-08-20' }
        ],
        'quartermaster',
        'total_war'
      );

      expect(summary.mode).toBe('total_war');
      expect(summary.differential).toBe(0);
      expect(summary.outcome).toBe('draw');
      expect(summary.tokensEarned).toBe(0);
    });
  });
});

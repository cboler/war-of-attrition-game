import { GameOutcome } from './game-state.model';
import {
  CAMPAIGN_PROGRESSION_SCHEMA_VERSION,
  DEFAULT_CARD_BACKING_ID,
  LIMITED_RESERVES_INITIAL_COUNT,
  canHumanReinforce,
  canInspectCasualties,
  createDefaultCampaignProgression,
  getHumanReserves,
  isFogOfWarActive,
  isFogOfWarMode,
  isLimitedReservesMode,
  isTotalWarMode,
  normalizeCampaignProgression,
  summarizeCampaign,
  ActiveCampaign,
  CampaignProgression,
  CampaignWarRecord
} from './progression.model';

describe('ProgressionModel and Rules', () => {
  describe('canHumanReinforce and getHumanReserves', () => {
    it('allows reinforcement in standard campaign as long as deck has at least 1 card', () => {
      const campaign: ActiveCampaign = {
        campaignId: 'camp-1',
        mode: 'standard',
        ordersSelected: true,
        wars: [],
        commanderSchedule: ['quartermaster', 'analyst', 'attritionist']
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
        mode: 'fog_of_war',
        ordersSelected: true,
        wars: [],
        commanderSchedule: ['analyst', 'quartermaster', 'attritionist']
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
        mode: 'limited_reserves',
        ordersSelected: true,
        commanderSchedule: ['gambler', 'cornered-general', 'quartermaster'],
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

  describe('createDefaultCampaignProgression', () => {
    it('creates a fresh v2 profile with Standard only unlocked, Marcel first, and empty completion', () => {
      const fresh = createDefaultCampaignProgression();

      expect(fresh.schemaVersion).toBe(2);
      expect(fresh.unlockedChapterModes).toEqual(['standard']);
      expect(fresh.completedChapterModes).toEqual([]);
      expect(fresh.currentCampaign.mode).toBe('standard');
      expect(fresh.currentCampaign.ordersSelected).toBeFalse();
      expect(fresh.currentCampaign.wars).toEqual([]);
      expect(fresh.currentCampaign.commanderSchedule).toEqual([
        'quartermaster',
        'analyst',
        'attritionist'
      ]);
      expect(fresh.tokenBalance).toBe(0);
      expect(fresh.recentCampaigns).toEqual([]);
      expect(fresh.selectedCosmetics.cardBackingId).toBe(DEFAULT_CARD_BACKING_ID);
      expect(fresh.unlockedCosmetics.length).toBe(1);
    });
  });

  describe('normalizeCampaignProgression & Schema v2 Migration', () => {
    it('safely handles missing, null, undefined, or primitive invalid values', () => {
      const fromNull = normalizeCampaignProgression(null);
      expect(fromNull.schemaVersion).toBe(2);
      expect(fromNull.unlockedChapterModes).toEqual(['standard']);
      expect(fromNull.currentCampaign.commanderSchedule).toEqual([
        'quartermaster',
        'analyst',
        'attritionist'
      ]);

      const fromString = normalizeCampaignProgression('corrupted-data');
      expect(fromString.schemaVersion).toBe(2);
      expect(fromString.unlockedChapterModes).toEqual(['standard']);

      const fromNumber = normalizeCampaignProgression(12345);
      expect(fromNumber.schemaVersion).toBe(2);
    });

    it('migrates a legacy v1 fresh Campaign, grandfathering all 4 modes and preserving tokens and cosmetics', () => {
      const legacyFresh = {
        schemaVersion: 1,
        tokenBalance: 7,
        lifetimeTokensEarned: 15,
        lifetimeTokensSpent: 8,
        unlockedCosmetics: [
          {
            cosmeticId: 'classic-blue',
            cosmeticType: 'card_back',
            reason: 'default',
            unlockedAt: '2026-08-01T00:00:00Z'
          },
          {
            cosmeticId: 'royal-purple',
            cosmeticType: 'card_back',
            reason: 'tokens',
            unlockedAt: '2026-08-01T00:00:00Z',
            tokenCost: 2
          }
        ],
        selectedCosmetics: { cardBackingId: 'royal-purple' },
        currentCampaign: {
          campaignId: 'legacy-camp-fresh',
          commanderId: 'analyst',
          mode: 'standard',
          wars: []
        },
        recentCampaigns: [],
        processedWarIds: []
      };

      const normalized = normalizeCampaignProgression(legacyFresh);

      expect(normalized.schemaVersion).toBe(2);
      // Grandfather legacy profile with all 4 modes
      expect(normalized.unlockedChapterModes).toEqual([
        'standard',
        'limited_reserves',
        'fog_of_war',
        'total_war'
      ]);
      expect(normalized.completedChapterModes).toEqual([]);
      expect(normalized.tokenBalance).toBe(7);
      expect(normalized.lifetimeTokensEarned).toBe(15);
      expect(normalized.lifetimeTokensSpent).toBe(8);
      expect(normalized.selectedCosmetics.cardBackingId).toBe('royal-purple');
      expect(normalized.unlockedCosmetics.length).toBe(2);
      expect(normalized.currentCampaign.ordersSelected).toBeFalse();
      expect(normalized.currentCampaign.wars).toEqual([]);
      // Preserves current opponent continuity for War 1
      expect(normalized.currentCampaign.commanderSchedule[0]).toBe('analyst');
    });

    it('migrates a legacy v1 active Campaign with 1 War completed, preserving War 1 and current War 2 commander', () => {
      const legacyOneWar = {
        schemaVersion: 1,
        tokenBalance: 2,
        lifetimeTokensEarned: 2,
        currentCampaign: {
          campaignId: 'legacy-active-1',
          commanderId: 'gambler',
          mode: 'standard',
          wars: [
            {
              warId: 'legacy-w1',
              outcome: GameOutcome.PLAYER_WIN,
              margin: 4,
              playerDeckColor: 'red',
              completedAt: '2026-08-10T12:00:00Z'
            }
          ]
        },
        recentCampaigns: [],
        processedWarIds: ['legacy-w1']
      };

      const normalized = normalizeCampaignProgression(legacyOneWar);

      expect(normalized.schemaVersion).toBe(2);
      expect(normalized.currentCampaign.wars.length).toBe(1);
      // Resolved war gets the legacy commander attribution
      expect(normalized.currentCampaign.wars[0].commanderId).toBe('gambler');
      expect(normalized.currentCampaign.wars[0].margin).toBe(4);
      expect(normalized.currentCampaign.ordersSelected).toBeTrue();
      // Current war (War 2, index 1) retains the commander the player was fighting
      expect(normalized.currentCampaign.commanderSchedule[1]).toBe('gambler');
      // War 3 (index 2) retains the authored encounter
      expect(normalized.currentCampaign.commanderSchedule[2]).toBe('attritionist');
    });

    it('migrates a legacy v1 active Campaign with 2 Wars completed, preserving both wars and current War 3 commander', () => {
      const legacyTwoWars = {
        schemaVersion: 1,
        currentCampaign: {
          campaignId: 'legacy-active-2',
          commanderId: 'cornered-general',
          mode: 'standard',
          wars: [
            { warId: 'legacy-w1', outcome: GameOutcome.PLAYER_WIN, margin: 2, completedAt: '2026-08-10T12:00:00Z' },
            { warId: 'legacy-w2', outcome: GameOutcome.OPPONENT_WIN, margin: -3, completedAt: '2026-08-10T12:30:00Z' }
          ]
        },
        recentCampaigns: [],
        processedWarIds: ['legacy-w1', 'legacy-w2']
      };

      const normalized = normalizeCampaignProgression(legacyTwoWars);

      expect(normalized.currentCampaign.wars.length).toBe(2);
      expect(normalized.currentCampaign.wars[0].commanderId).toBe('cornered-general');
      expect(normalized.currentCampaign.wars[1].commanderId).toBe('cornered-general');
      // Current war is War 3 -> retains legacy commander
      expect(normalized.currentCampaign.commanderSchedule[2]).toBe('cornered-general');
    });

    it('migrates a legacy Limited Reserves Campaign preserving remaining reserves exactly without reset', () => {
      const legacyLR = {
        schemaVersion: 1,
        currentCampaign: {
          campaignId: 'legacy-lr',
          commanderId: 'quartermaster',
          mode: 'limited_reserves',
          limitedReserves: {
            initialReserves: 5,
            remainingReserves: 2
          },
          wars: [
            { warId: 'lr-w1', outcome: GameOutcome.PLAYER_WIN, margin: 1, completedAt: '2026-08-11T00:00:00Z' }
          ]
        },
        recentCampaigns: [],
        processedWarIds: ['lr-w1']
      };

      const normalized = normalizeCampaignProgression(legacyLR);

      expect(normalized.currentCampaign.mode).toBe('limited_reserves');
      expect(normalized.currentCampaign.limitedReserves?.initialReserves).toBe(5);
      expect(normalized.currentCampaign.limitedReserves?.remainingReserves).toBe(2);
      expect(normalized.currentCampaign.ordersSelected).toBeTrue();
    });

    it('migrates a legacy Fog of War Campaign preserving mode and processed War IDs', () => {
      const legacyFog = {
        schemaVersion: 1,
        currentCampaign: {
          campaignId: 'legacy-fog',
          commanderId: 'analyst',
          mode: 'fog_of_war',
          wars: [
            { warId: 'fog-w1', outcome: GameOutcome.OPPONENT_WIN, margin: -5, completedAt: '2026-08-12T00:00:00Z' }
          ]
        },
        recentCampaigns: [],
        processedWarIds: ['fog-w1']
      };

      const normalized = normalizeCampaignProgression(legacyFog);

      expect(normalized.currentCampaign.mode).toBe('fog_of_war');
      expect(normalized.processedWarIds).toContain('fog-w1');
    });

    it('migrates a legacy Total War Campaign preserving mode and differential records', () => {
      const legacyTotal = {
        schemaVersion: 1,
        currentCampaign: {
          campaignId: 'legacy-total',
          commanderId: 'gambler',
          mode: 'total_war',
          wars: [
            { warId: 'tw-w1', outcome: GameOutcome.PLAYER_WIN, margin: 12, completedAt: '2026-08-13T00:00:00Z' }
          ]
        },
        recentCampaigns: [],
        processedWarIds: ['tw-w1']
      };

      const normalized = normalizeCampaignProgression(legacyTotal);

      expect(normalized.currentCampaign.mode).toBe('total_war');
      expect(normalized.currentCampaign.wars[0].margin).toBe(12);
    });

    it('migrates legacy completed Campaign history, converting campaign commander to per-War attribution without data loss', () => {
      const legacyWithHistory = {
        schemaVersion: 1,
        currentCampaign: {
          campaignId: 'active-camp',
          commanderId: 'quartermaster',
          mode: 'standard',
          wars: []
        },
        recentCampaigns: [
          {
            campaignId: 'hist-camp-1',
            mode: 'limited_reserves',
            commanderId: 'gambler',
            remainingReserves: 3,
            wars: [
              { warId: 'hw-1', outcome: GameOutcome.PLAYER_WIN, margin: 5, completedAt: '2026-08-01T00:00:00Z' },
              { warId: 'hw-2', outcome: GameOutcome.OPPONENT_WIN, margin: -2, completedAt: '2026-08-01T00:30:00Z' },
              { warId: 'hw-3', outcome: GameOutcome.PLAYER_WIN, margin: 4, completedAt: '2026-08-01T01:00:00Z' }
            ]
          }
        ],
        processedWarIds: ['hw-1', 'hw-2', 'hw-3']
      };

      const normalized = normalizeCampaignProgression(legacyWithHistory);

      expect(normalized.recentCampaigns.length).toBe(1);
      const historyEntry = normalized.recentCampaigns[0];
      expect(historyEntry.campaignId).toBe('hist-camp-1');
      expect(historyEntry.mode).toBe('limited_reserves');
      expect(historyEntry.outcome).toBe('victory');
      expect(historyEntry.wins).toBe(2);
      expect(historyEntry.losses).toBe(1);
      expect(historyEntry.differential).toBe(7);
      expect(historyEntry.remainingReserves).toBe(3);
      expect(historyEntry.wars.length).toBe(3);
      expect(historyEntry.wars[0].commanderId).toBe('gambler');
      expect(historyEntry.wars[1].commanderId).toBe('gambler');
      expect(historyEntry.wars[2].commanderId).toBe('gambler');
      expect(normalized.completedChapterModes).toContain('limited_reserves');
    });

    it('is strictly idempotent: normalize(v1) -> v2 and normalize(v2) -> identical semantic v2', () => {
      const legacyRaw = {
        schemaVersion: 1,
        tokenBalance: 5,
        lifetimeTokensEarned: 10,
        unlockedCosmetics: [
          { cosmeticId: 'classic-blue', cosmeticType: 'card_back', reason: 'default', unlockedAt: '2026-08-01T00:00:00Z' }
        ],
        selectedCosmetics: { cardBackingId: 'classic-blue' },
        currentCampaign: {
          campaignId: 'legacy-camp',
          commanderId: 'analyst',
          mode: 'standard',
          wars: [
            { warId: 'w-1', outcome: GameOutcome.PLAYER_WIN, margin: 3, completedAt: '2026-08-01T00:00:00Z' }
          ]
        },
        recentCampaigns: [],
        processedWarIds: ['w-1']
      };

      const v2FirstPass = normalizeCampaignProgression(legacyRaw);
      const v2SecondPass = normalizeCampaignProgression(v2FirstPass);

      expect(v2SecondPass.schemaVersion).toBe(2);
      expect(v2SecondPass.unlockedChapterModes).toEqual(v2FirstPass.unlockedChapterModes);
      expect(v2SecondPass.completedChapterModes).toEqual(v2FirstPass.completedChapterModes);
      expect(v2SecondPass.tokenBalance).toBe(v2FirstPass.tokenBalance);
      expect(v2SecondPass.currentCampaign.commanderSchedule).toEqual(v2FirstPass.currentCampaign.commanderSchedule);
      expect(v2SecondPass.currentCampaign.wars).toEqual(v2FirstPass.currentCampaign.wars);
      expect(v2SecondPass.currentCampaign.mode).toBe(v2FirstPass.currentCampaign.mode);
      expect(v2SecondPass.currentCampaign.ordersSelected).toBe(v2FirstPass.currentCampaign.ordersSelected);
    });

    it('safely repairs malformed partial v2 data without crashing', () => {
      const partialMalformedV2 = {
        schemaVersion: 2,
        currentCampaign: {
          campaignId: 'malformed-v2',
          mode: 'nonexistent_mode',
          commanderSchedule: ['invalid_id', 123, null],
          wars: [
            { warId: '', outcome: 'invalid_outcome' },
            { warId: 'valid-w1', outcome: GameOutcome.PLAYER_WIN, margin: 'not-a-number' }
          ]
        },
        tokenBalance: -99,
        unlockedChapterModes: ['nonexistent', 'total_war'],
        completedChapterModes: ['not_real'],
        processedWarIds: [null, 123, 'valid-w1']
      };

      const normalized = normalizeCampaignProgression(partialMalformedV2);

      expect(normalized.schemaVersion).toBe(2);
      expect(normalized.currentCampaign.mode).toBe('standard');
      expect(normalized.currentCampaign.commanderSchedule).toEqual([
        'quartermaster',
        'analyst',
        'attritionist'
      ]);
      expect(normalized.currentCampaign.wars.length).toBe(1);
      expect(normalized.currentCampaign.wars[0].warId).toBe('valid-w1');
      expect(normalized.currentCampaign.wars[0].margin).toBe(0);
      expect(normalized.tokenBalance).toBe(0);
      expect(normalized.processedWarIds).toContain('valid-w1');
    });

    it('ensures reload determinism: normalizing an active campaign never rerolls the schedule', () => {
      const activeProgression: CampaignProgression = {
        schemaVersion: 2,
        currentCampaign: {
          campaignId: 'stable-camp',
          mode: 'fog_of_war',
          ordersSelected: true,
          commanderSchedule: ['analyst', 'quartermaster', 'attritionist'],
          wars: [
            {
              warId: 'war-fog-1',
              commanderId: 'analyst',
              outcome: GameOutcome.PLAYER_WIN,
              margin: 4,
              playerDeckColor: 'red',
              completedAt: '2026-08-20T00:00:00Z'
            }
          ]
        },
        recentCampaigns: [],
        unlockedChapterModes: ['standard', 'limited_reserves', 'fog_of_war'],
        completedChapterModes: ['standard', 'limited_reserves'],
        tokenBalance: 3,
        lifetimeTokensEarned: 3,
        lifetimeTokensSpent: 0,
        unlockedCosmetics: [{
          cosmeticId: DEFAULT_CARD_BACKING_ID,
          cosmeticType: 'card_back',
          reason: 'default',
          unlockedAt: '2026-08-20T00:00:00Z'
        }],
        selectedCosmetics: { cardBackingId: DEFAULT_CARD_BACKING_ID },
        processedWarIds: ['war-fog-1']
      };

      const reloaded = normalizeCampaignProgression(activeProgression);

      expect(reloaded.currentCampaign.commanderSchedule).toEqual([
        'analyst',
        'quartermaster',
        'attritionist'
      ]);
      expect(reloaded.currentCampaign.campaignId).toBe('stable-camp');
      expect(reloaded.currentCampaign.mode).toBe('fog_of_war');
      expect(reloaded.currentCampaign.wars[0].commanderId).toBe('analyst');
    });
  });

  describe('summarizeCampaign', () => {
    it('summarizes a Limited Reserves Campaign preserving mode, wars attribution, and remaining reserves', () => {
      const wars: readonly CampaignWarRecord[] = [
        { warId: 'w1', commanderId: 'gambler', outcome: GameOutcome.PLAYER_WIN, margin: 2, playerDeckColor: 'red', completedAt: '2026-08-20' },
        { warId: 'w2', commanderId: 'cornered-general', outcome: GameOutcome.OPPONENT_WIN, margin: -4, playerDeckColor: 'red', completedAt: '2026-08-20' },
        { warId: 'w3', commanderId: 'quartermaster', outcome: GameOutcome.PLAYER_WIN, margin: 6, playerDeckColor: 'red', completedAt: '2026-08-20' }
      ];

      const summary = summarizeCampaign('lr-summary-camp', wars, 'limited_reserves', 2);

      expect(summary.mode).toBe('limited_reserves');
      expect(summary.remainingReserves).toBe(2);
      expect(summary.outcome).toBe('victory');
      expect(summary.wins).toBe(2);
      expect(summary.losses).toBe(1);
      expect(summary.wars[0].commanderId).toBe('gambler');
      expect(summary.wars[1].commanderId).toBe('cornered-general');
      expect(summary.wars[2].commanderId).toBe('quartermaster');
    });

    it('summarizes a Total War Campaign where positive differential wins despite losing 2 of 3 wars', () => {
      const wars: readonly CampaignWarRecord[] = [
        { warId: 'w1', commanderId: 'gambler', outcome: GameOutcome.OPPONENT_WIN, margin: -2, playerDeckColor: 'red', completedAt: '2026-08-20' },
        { warId: 'w2', commanderId: 'cornered-general', outcome: GameOutcome.OPPONENT_WIN, margin: -2, playerDeckColor: 'red', completedAt: '2026-08-20' },
        { warId: 'w3', commanderId: 'analyst', outcome: GameOutcome.PLAYER_WIN, margin: 15, playerDeckColor: 'red', completedAt: '2026-08-20' }
      ];

      const summary = summarizeCampaign('tw-victory-camp', wars, 'total_war');

      expect(summary.mode).toBe('total_war');
      expect(summary.wins).toBe(1);
      expect(summary.losses).toBe(2);
      expect(summary.differential).toBe(11);
      expect(summary.outcome).toBe('victory'); // Total War victory because differential > 0 (+11)
      expect(summary.tokensEarned).toBe(2); // 1 for victory + 1 for positive differential
    });

    it('summarizes a Total War Campaign where negative differential loses despite winning 2 of 3 wars', () => {
      const wars: readonly CampaignWarRecord[] = [
        { warId: 'w1', commanderId: 'gambler', outcome: GameOutcome.PLAYER_WIN, margin: 1, playerDeckColor: 'red', completedAt: '2026-08-20' },
        { warId: 'w2', commanderId: 'cornered-general', outcome: GameOutcome.PLAYER_WIN, margin: 1, playerDeckColor: 'red', completedAt: '2026-08-20' },
        { warId: 'w3', commanderId: 'analyst', outcome: GameOutcome.OPPONENT_WIN, margin: -10, playerDeckColor: 'red', completedAt: '2026-08-20' }
      ];

      const summary = summarizeCampaign('tw-defeat-camp', wars, 'total_war');

      expect(summary.mode).toBe('total_war');
      expect(summary.wins).toBe(2);
      expect(summary.losses).toBe(1);
      expect(summary.differential).toBe(-8);
      expect(summary.outcome).toBe('defeat'); // Total War defeat because differential < 0 (-8)
      expect(summary.tokensEarned).toBe(0);
    });

    it('summarizes a Total War Campaign as draw when differential equals zero', () => {
      const wars: readonly CampaignWarRecord[] = [
        { warId: 'w1', commanderId: 'gambler', outcome: GameOutcome.PLAYER_WIN, margin: 4, playerDeckColor: 'red', completedAt: '2026-08-20' },
        { warId: 'w2', commanderId: 'cornered-general', outcome: GameOutcome.OPPONENT_WIN, margin: -4, playerDeckColor: 'red', completedAt: '2026-08-20' },
        { warId: 'w3', commanderId: 'analyst', outcome: GameOutcome.TIE, margin: 0, playerDeckColor: 'red', completedAt: '2026-08-20' }
      ];

      const summary = summarizeCampaign('tw-draw-camp', wars, 'total_war');

      expect(summary.mode).toBe('total_war');
      expect(summary.differential).toBe(0);
      expect(summary.outcome).toBe('draw');
      expect(summary.tokensEarned).toBe(0);
    });

    it('throws when wars count is not exactly 3', () => {
      expect(() => summarizeCampaign('invalid', [], 'standard')).toThrow();
    });
  });
});

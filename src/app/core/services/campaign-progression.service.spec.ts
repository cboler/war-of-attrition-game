import { TestBed } from '@angular/core/testing';
import { GameOutcome } from '../models/game-state.model';
import {
  CAMPAIGN_CHAPTER_ORDER,
  CampaignModeId,
  getAuthoredCommanderSchedule,
} from '../models/campaign-chapter.model';
import {
  MAX_CAMPAIGN_HISTORY,
  WARS_PER_CAMPAIGN
} from '../models/progression.model';
import { AuthService } from './auth.service';
import { CampaignProgressionService } from './campaign-progression.service';

describe('CampaignProgressionService', () => {
  let service: CampaignProgressionService;
  let authService: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [AuthService, CampaignProgressionService]
    });
    authService = TestBed.inject(AuthService);
    service = TestBed.inject(CampaignProgressionService);
  });

  afterEach(() => localStorage.clear());

  describe('Initial Fresh Profile State', () => {
    it('initializes a new profile with Standard chapter only unlocked, unselected orders, and Marcel first', () => {
      expect(service.unlockedChapterModes()).toEqual(['standard']);
      expect(service.completedChapterModes()).toEqual([]);
      expect(service.activeCampaignMode()).toBe('standard');
      expect(service.ordersSelected()).toBeFalse();
      expect(service.campaignWarIndex()).toBe(1);
      expect(service.currentCommanderId()).toBe('quartermaster');
      expect(service.currentCommander().name).toBe('The Quartermaster');
      expect(service.currentCommanderIdentity().name).toBe('Marcel de Brie');
      expect(service.currentCampaign().commanderSchedule).toEqual([
        'quartermaster',
        'analyst',
        'attritionist'
      ]);
      expect(service.chapterState('standard')).toBe('current');
      expect(service.chapterState('limited_reserves')).toBe('locked');
      expect(service.chapterState('fog_of_war')).toBe('locked');
      expect(service.chapterState('total_war')).toBe('locked');
    });

    it('rejects selecting locked chapters on a fresh profile', () => {
      expect(service.selectCampaignOrders('limited_reserves')).toBeFalse();
      expect(service.selectCampaignOrders('fog_of_war')).toBeFalse();
      expect(service.selectCampaignOrders('total_war')).toBeFalse();
      expect(service.activeCampaignMode()).toBe('standard');
    });
  });

  describe('Standard Chapter I Progression & Canonical Encounter Schedule', () => {
    it('advances through Marcel (War 1) -> Matthias (War 2) -> Bastien (War 3) and unlocks Limited Reserves on completion', () => {
      // War 1: Marcel de Brie
      expect(service.campaignWarIndex()).toBe(1);
      expect(service.currentCommanderId()).toBe('quartermaster');
      expect(service.currentCommanderIdentity().name).toBe('Marcel de Brie');

      const war1Result = service.recordResolvedWar(war('c1-w1', GameOutcome.PLAYER_WIN, 4, 0));
      expect(war1Result.status).toBe('recorded');
      expect(war1Result.war?.commanderId).toBe('quartermaster');
      expect(service.currentCampaign().wars.length).toBe(1);

      // War 2: Matthias von Greyerz
      expect(service.campaignWarIndex()).toBe(2);
      expect(service.currentCommanderId()).toBe('analyst');
      expect(service.currentCommanderIdentity().name).toBe('Matthias von Greyerz');

      const war2Result = service.recordResolvedWar(war('c1-w2', GameOutcome.OPPONENT_WIN, 0, 3));
      expect(war2Result.status).toBe('recorded');
      expect(war2Result.war?.commanderId).toBe('analyst');
      expect(service.currentCampaign().wars.length).toBe(2);

      // War 3: Bastien de Herve
      expect(service.campaignWarIndex()).toBe(3);
      expect(service.currentCommanderId()).toBe('attritionist');
      expect(service.currentCommanderIdentity().name).toBe('Bastien de Herve');

      const war3Result = service.recordResolvedWar(war('c1-w3', GameOutcome.PLAYER_WIN, 5, 0));
      expect(war3Result.status).toBe('recorded');
      expect(war3Result.war?.commanderId).toBe('attritionist');

      // Campaign Completion Assertions
      const completed = war3Result.completedCampaign;
      expect(completed).not.toBeNull();
      expect(completed?.mode).toBe('standard');
      expect(completed?.outcome).toBe('victory');
      expect(completed?.wins).toBe(2);
      expect(completed?.losses).toBe(1);
      expect(completed?.differential).toBe(6);
      expect(completed?.wars.length).toBe(3);
      expect(completed?.wars[0].commanderId).toBe('quartermaster');
      expect(completed?.wars[1].commanderId).toBe('analyst');
      expect(completed?.wars[2].commanderId).toBe('attritionist');

      // Unlocks and Next Chapter
      expect(service.completedChapterModes()).toContain('standard');
      expect(service.unlockedChapterModes()).toEqual(['standard', 'limited_reserves']);
      expect(service.activeCampaignMode()).toBe('limited_reserves');
      expect(service.ordersSelected()).toBeFalse();
      expect(service.campaignWarIndex()).toBe(1);
      expect(service.currentCommanderId()).toBe('gambler'); // Sir Edmund Gloucester
      expect(service.currentCommanderIdentity().name).toBe('Sir Edmund Gloucester');
    });
  });

  describe('Chapter Unlocking on Completion Regardless of Outcome', () => {
    it('unlocks the next chapter on Campaign Defeat', () => {
      // 3 losses in Standard -> Campaign Defeat
      service.recordResolvedWar(war('loss-w1', GameOutcome.OPPONENT_WIN, 0, 5));
      service.recordResolvedWar(war('loss-w2', GameOutcome.OPPONENT_WIN, 0, 4));
      const result = service.recordResolvedWar(war('loss-w3', GameOutcome.OPPONENT_WIN, 0, 3));

      expect(result.completedCampaign?.outcome).toBe('defeat');
      expect(service.completedChapterModes()).toContain('standard');
      expect(service.unlockedChapterModes()).toEqual(['standard', 'limited_reserves']);
      expect(service.isChapterUnlocked('limited_reserves')).toBeTrue();
      expect(service.tokenBalance()).toBe(0);
    });

    it('unlocks the next chapter on Campaign Draw', () => {
      // 1 win, 1 loss, 1 tie in Standard -> Campaign Draw
      service.recordResolvedWar(war('draw-w1', GameOutcome.PLAYER_WIN, 5, 0));
      service.recordResolvedWar(war('draw-w2', GameOutcome.OPPONENT_WIN, 0, 5));
      const result = service.recordResolvedWar(war('draw-w3', GameOutcome.TIE, 0, 0));

      expect(result.completedCampaign?.outcome).toBe('draw');
      expect(service.completedChapterModes()).toContain('standard');
      expect(service.unlockedChapterModes()).toEqual(['standard', 'limited_reserves']);
      expect(service.isChapterUnlocked('limited_reserves')).toBeTrue();
    });
  });

  describe('Full 4-Chapter Sequential Unlocking and Replay Availability', () => {
    it('progresses Standard -> Limited Reserves -> Fog of War -> Total War, leaving all chapters replayable', () => {
      // 1. Complete Standard Chapter I
      for (let i = 1; i <= 3; i++) {
        service.recordResolvedWar(war(`std-w${i}`, GameOutcome.PLAYER_WIN, 2, 0));
      }
      expect(service.completedChapterModes()).toEqual(['standard']);
      expect(service.unlockedChapterModes()).toEqual(['standard', 'limited_reserves']);
      expect(service.activeCampaignMode()).toBe('limited_reserves');

      // Confirm Limited Reserves orders and check schedule: Edmund -> Lorenzo -> Marcel
      service.selectCampaignOrders('limited_reserves');
      expect(service.currentCommanderId()).toBe('gambler');
      service.recordResolvedWar(war('lr-w1', GameOutcome.PLAYER_WIN, 1, 0));
      expect(service.currentCommanderId()).toBe('cornered-general');
      service.recordResolvedWar(war('lr-w2', GameOutcome.PLAYER_WIN, 1, 0));
      expect(service.currentCommanderId()).toBe('quartermaster');
      service.recordResolvedWar(war('lr-w3', GameOutcome.PLAYER_WIN, 1, 0));

      // 2. Limited Reserves Complete -> Unlocks Fog of War
      expect(service.completedChapterModes()).toEqual(['standard', 'limited_reserves']);
      expect(service.unlockedChapterModes()).toEqual(['standard', 'limited_reserves', 'fog_of_war']);
      expect(service.activeCampaignMode()).toBe('fog_of_war');

      // Confirm Fog of War orders and check schedule: Matthias -> Marcel -> Bastien
      service.selectCampaignOrders('fog_of_war');
      expect(service.currentCommanderId()).toBe('analyst');
      service.recordResolvedWar(war('fog-w1', GameOutcome.PLAYER_WIN, 1, 0));
      expect(service.currentCommanderId()).toBe('quartermaster');
      service.recordResolvedWar(war('fog-w2', GameOutcome.PLAYER_WIN, 1, 0));
      expect(service.currentCommanderId()).toBe('attritionist');
      service.recordResolvedWar(war('fog-w3', GameOutcome.PLAYER_WIN, 1, 0));

      // 3. Fog of War Complete -> Unlocks Total War
      expect(service.completedChapterModes()).toEqual([
        'standard',
        'limited_reserves',
        'fog_of_war'
      ]);
      expect(service.unlockedChapterModes()).toEqual([
        'standard',
        'limited_reserves',
        'fog_of_war',
        'total_war'
      ]);
      expect(service.activeCampaignMode()).toBe('total_war');

      // Confirm Total War orders and check schedule: Edmund -> Lorenzo -> Matthias
      service.selectCampaignOrders('total_war');
      expect(service.currentCommanderId()).toBe('gambler');
      service.recordResolvedWar(war('tw-w1', GameOutcome.PLAYER_WIN, 1, 0));
      expect(service.currentCommanderId()).toBe('cornered-general');
      service.recordResolvedWar(war('tw-w2', GameOutcome.PLAYER_WIN, 1, 0));
      expect(service.currentCommanderId()).toBe('analyst');
      service.recordResolvedWar(war('tw-w3', GameOutcome.PLAYER_WIN, 1, 0));

      // 4. Total War Complete -> All 4 chapters remain completed and replayable
      expect(service.completedChapterModes()).toEqual([
        'standard',
        'limited_reserves',
        'fog_of_war',
        'total_war'
      ]);
      expect(service.unlockedChapterModes()).toEqual([
        'standard',
        'limited_reserves',
        'fog_of_war',
        'total_war'
      ]);

      // Can select and replay any chapter (generates 3-commander randomized schedule)
      expect(service.selectCampaignOrders('standard')).toBeTrue();
      expect(service.activeCampaignMode()).toBe('standard');
      expect(service.currentCampaign().commanderSchedule.length).toBe(3);
      expect(new Set(service.currentCampaign().commanderSchedule).size).toBe(3);

      expect(service.selectCampaignOrders('limited_reserves')).toBeTrue();
      expect(service.activeCampaignMode()).toBe('limited_reserves');
      expect(service.currentCampaign().commanderSchedule.length).toBe(3);
      expect(new Set(service.currentCampaign().commanderSchedule).size).toBe(3);
    });

  });

  describe('Campaign Orders Immutability & Selection', () => {
    it('prevents changing campaign orders once War 1 play has begun', () => {
      // Grandfather all modes for test
      authService.updateActiveProfileProgression(p => ({
        ...p,
        unlockedChapterModes: [...CAMPAIGN_CHAPTER_ORDER]
      }));

      service.selectCampaignOrders('limited_reserves');
      expect(service.activeCampaignMode()).toBe('limited_reserves');

      // Before war resolution, changing order is allowed
      expect(service.selectCampaignOrders('fog_of_war')).toBeTrue();
      expect(service.activeCampaignMode()).toBe('fog_of_war');

      // Once War 1 is recorded, changing orders is forbidden
      service.recordResolvedWar(war('locked-w1', GameOutcome.PLAYER_WIN, 2, 0));
      expect(service.selectCampaignOrders('standard')).toBeFalse();
      expect(service.activeCampaignMode()).toBe('fog_of_war');
    });
  });

  describe('Limited Reserves Mechanics', () => {
    beforeEach(() => {
      authService.updateActiveProfileProgression(p => ({
        ...p,
        unlockedChapterModes: [...CAMPAIGN_CHAPTER_ORDER]
      }));
    });

    it('initializes exactly 5 reserves and decrements on consumption', () => {
      service.selectCampaignOrders('limited_reserves');
      expect(service.isLimitedReserves()).toBeTrue();
      expect(service.remainingReserves()).toBe(5);
      expect(service.initialReserves()).toBe(5);

      expect(service.canHumanReinforce(10)).toBeTrue();
      expect(service.consumeHumanReserve()).toBeTrue();
      expect(service.remainingReserves()).toBe(4);

      for (let i = 0; i < 4; i++) {
        service.consumeHumanReserve();
      }
      expect(service.remainingReserves()).toBe(0);
      expect(service.consumeHumanReserve()).toBeFalse();
      expect(service.canHumanReinforce(10)).toBeFalse();
    });

    it('persists remaining reserves across Wars in a Campaign', () => {
      service.selectCampaignOrders('limited_reserves');
      service.consumeHumanReserve();
      service.consumeHumanReserve();
      expect(service.remainingReserves()).toBe(3);

      service.recordResolvedWar(war('lr-w1', GameOutcome.PLAYER_WIN, 2, 0));
      expect(service.remainingReserves()).toBe(3);

      service.consumeHumanReserve();
      expect(service.remainingReserves()).toBe(2);

      service.recordResolvedWar(war('lr-w2', GameOutcome.OPPONENT_WIN, 0, 3));
      expect(service.remainingReserves()).toBe(2);

      const result = service.recordResolvedWar(war('lr-w3', GameOutcome.PLAYER_WIN, 4, 0));
      expect(result.completedCampaign?.remainingReserves).toBe(2);
    });
  });

  describe('Campaign abandonment', () => {
    it('discards only active Campaign state and preserves earned profile progression', () => {
      for (let i = 1; i <= 3; i++) {
        service.recordResolvedWar(war(`earned-standard-${i}`, GameOutcome.PLAYER_WIN, 5, 0));
      }
      service.selectCampaignOrders('limited_reserves');
      service.consumeHumanReserve();
      service.recordResolvedWar(war('active-limited-war-1', GameOutcome.PLAYER_WIN, 2, 0));
      service.purchaseCardBacking('burgundy-gold');

      const before = service.progression();
      const oldCampaignId = before.currentCampaign.campaignId;
      const preserved = {
        recentCampaigns: before.recentCampaigns,
        unlockedChapterModes: before.unlockedChapterModes,
        completedChapterModes: before.completedChapterModes,
        tokenBalance: before.tokenBalance,
        lifetimeTokensEarned: before.lifetimeTokensEarned,
        lifetimeTokensSpent: before.lifetimeTokensSpent,
        unlockedCosmetics: before.unlockedCosmetics,
        selectedCosmetics: before.selectedCosmetics,
        processedWarIds: before.processedWarIds,
      };
      const statsBefore = { ...authService.userStats() };

      expect(service.hasActiveCampaign()).toBeTrue();
      expect(service.abandonActiveCampaign()).toBeTrue();

      const after = service.progression();
      expect(after.currentCampaign.campaignId).not.toBe(oldCampaignId);
      expect(after.currentCampaign.mode).toBe('limited_reserves');
      expect(after.currentCampaign.ordersSelected).toBeFalse();
      expect(after.currentCampaign.wars).toEqual([]);
      expect(after.currentCampaign.commanderSchedule).toEqual(
        getAuthoredCommanderSchedule('limited_reserves'),
      );
      expect(after.currentCampaign.limitedReserves).toEqual({
        initialReserves: 5,
        remainingReserves: 5,
      });
      expect(service.hasActiveCampaign()).toBeFalse();
      expect({
        recentCampaigns: after.recentCampaigns,
        unlockedChapterModes: after.unlockedChapterModes,
        completedChapterModes: after.completedChapterModes,
        tokenBalance: after.tokenBalance,
        lifetimeTokensEarned: after.lifetimeTokensEarned,
        lifetimeTokensSpent: after.lifetimeTokensSpent,
        unlockedCosmetics: after.unlockedCosmetics,
        selectedCosmetics: after.selectedCosmetics,
        processedWarIds: after.processedWarIds,
      }).toEqual(preserved);
      expect(authService.userStats()).toEqual(statsBefore);
    });

    it('does nothing when no Campaign Orders or Wars are active', () => {
      const before = service.progression();
      expect(service.hasActiveCampaign()).toBeFalse();
      expect(service.abandonActiveCampaign()).toBeFalse();
      expect(service.progression()).toEqual(before);
    });
  });

  describe('Total War Mechanics & Scoring', () => {
    beforeEach(() => {
      authService.updateActiveProfileProgression(p => ({
        ...p,
        unlockedChapterModes: [...CAMPAIGN_CHAPTER_ORDER]
      }));
    });

    it('tracks running differential and determines victory by cumulative differential', () => {
      service.selectCampaignOrders('total_war');
      expect(service.isTotalWar()).toBeTrue();
      expect(service.runningCampaignDifferential()).toBe(0);

      // War 1: Win +10
      service.recordResolvedWar(war('tw-w1', GameOutcome.PLAYER_WIN, 10, 0));
      expect(service.runningCampaignDifferential()).toBe(10);

      // War 2: Loss -3
      service.recordResolvedWar(war('tw-w2', GameOutcome.OPPONENT_WIN, 0, 3));
      expect(service.runningCampaignDifferential()).toBe(7);

      // War 3: Loss -2 -> Total +5
      const result = service.recordResolvedWar(war('tw-w3', GameOutcome.OPPONENT_WIN, 0, 2));
      expect(result.completedCampaign?.differential).toBe(5);
      expect(result.completedCampaign?.outcome).toBe('victory');
      expect(result.completedCampaign?.tokensEarned).toBe(2);
    });
  });

  describe('Fog of War Mechanics', () => {
    beforeEach(() => {
      authService.updateActiveProfileProgression(p => ({
        ...p,
        unlockedChapterModes: [...CAMPAIGN_CHAPTER_ORDER]
      }));
    });

    it('seals casualties while War is active and unseals upon War resolution', () => {
      service.selectCampaignOrders('fog_of_war');
      expect(service.isFogOfWar()).toBeTrue();

      expect(service.canInspectCurrentWarCasualties(false)).toBeFalse();
      expect(service.canInspectCurrentWarCasualties(true)).toBeTrue();
    });
  });

  describe('Cosmetic Entitlements and Wallet', () => {
    it('purchases, unlocks, and selects card backings with tokens', () => {
      // Award tokens through campaign victory
      service.recordResolvedWar(war('t-w1', GameOutcome.PLAYER_WIN, 5, 0));
      service.recordResolvedWar(war('t-w2', GameOutcome.PLAYER_WIN, 5, 0));
      service.recordResolvedWar(war('t-w3', GameOutcome.PLAYER_WIN, 5, 0));
      expect(service.tokenBalance()).toBe(2);

      const result = service.purchaseCardBacking('classic-red');
      expect(result.status).toBe('unlocked');
      expect(service.tokenBalance()).toBe(1);
      expect(service.selectedCardBackingId()).toBe('classic-red');
      expect(service.isCardBackingUnlocked('classic-red')).toBeTrue();
    });
  });

  describe('Idempotence and History Bounding', () => {
    it('ignores duplicate war resolution calls with same warId', () => {
      const res1 = service.recordResolvedWar(war('dup-1', GameOutcome.PLAYER_WIN, 4, 0));
      const res2 = service.recordResolvedWar(war('dup-1', GameOutcome.OPPONENT_WIN, 0, 10));

      expect(res1.status).toBe('recorded');
      expect(res2.status).toBe('duplicate');
      expect(service.currentCampaign().wars.length).toBe(1);
      expect(service.currentCampaign().wars[0].margin).toBe(4);
    });

    it('bounds recent campaigns to MAX_CAMPAIGN_HISTORY (20)', () => {
      authService.updateActiveProfileProgression(p => ({
        ...p,
        unlockedChapterModes: [...CAMPAIGN_CHAPTER_ORDER]
      }));

      for (let c = 0; c < MAX_CAMPAIGN_HISTORY + 3; c++) {
        for (let w = 1; w <= WARS_PER_CAMPAIGN; w++) {
          service.recordResolvedWar(war(`bound-${c}-${w}`, GameOutcome.PLAYER_WIN, 1, 0));
        }
      }

      expect(service.progression().recentCampaigns.length).toBe(MAX_CAMPAIGN_HISTORY);
    });
  });
});

function war(
  warId: string,
  outcome: GameOutcome,
  playerCardsRemaining: number,
  opponentCardsRemaining: number
) {
  return {
    warId,
    outcome,
    playerCardsRemaining,
    opponentCardsRemaining,
    playerDeckColor: 'red' as const
  };
}

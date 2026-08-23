import { TestBed } from '@angular/core/testing';
import { GameOutcome } from '../models/game-state.model';
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

  it('completes a Campaign after three resolved Wars using record before differential', () => {
    service.recordResolvedWar(war('war-1', GameOutcome.PLAYER_WIN, 5, 0));
    service.recordResolvedWar(war('war-2', GameOutcome.OPPONENT_WIN, 0, 20));
    const result = service.recordResolvedWar(war('war-3', GameOutcome.PLAYER_WIN, 4, 0));

    expect(result.completedCampaign).not.toBeNull();
    expect(result.completedCampaign?.wins).toBe(2);
    expect(result.completedCampaign?.losses).toBe(1);
    expect(result.completedCampaign?.differential).toBe(-11);
    expect(result.completedCampaign?.outcome).toBe('victory');
    expect(result.completedCampaign?.tokensEarned).toBe(1);
    expect(service.tokenBalance()).toBe(1);
    expect(service.currentCampaign().wars).toEqual([]);
    expect(service.campaignWarIndex()).toBe(1);
    expect(authService.userStats().campaignsCompleted).toBe(1);
    expect(authService.userStats().campaignsWon).toBe(1);
    expect(authService.userStats().totalCampaignDifferential).toBe(-11);
    expect(authService.userStats().bestCampaignDifferential).toBe(-11);
    expect(authService.userStats().worstCampaignDifferential).toBe(-11);
    expect(authService.userStats().campaignsCompleted).toBe(1);
    expect(authService.userStats().campaignsWon).toBe(1);
    expect(authService.userStats().bestCampaignDifferential).toBe(-11);
  });

  it('awards a bonus token only for a victorious Campaign with positive differential', () => {
    service.recordResolvedWar(war('positive-1', GameOutcome.PLAYER_WIN, 8, 0));
    service.recordResolvedWar(war('positive-2', GameOutcome.PLAYER_WIN, 3, 0));
    const result = service.recordResolvedWar(war('positive-3', GameOutcome.OPPONENT_WIN, 0, 2));

    expect(result.completedCampaign?.outcome).toBe('victory');
    expect(result.completedCampaign?.differential).toBe(9);
    expect(result.completedCampaign?.tokensEarned).toBe(2);
    expect(service.tokenBalance()).toBe(2);
  });

  it('counts tied Wars but awards no tokens for a drawn Campaign', () => {
    service.recordResolvedWar(war('draw-1', GameOutcome.PLAYER_WIN, 10, 0));
    service.recordResolvedWar(war('draw-2', GameOutcome.OPPONENT_WIN, 0, 1));
    const result = service.recordResolvedWar(war('draw-3', GameOutcome.TIE, 9, 9));

    expect(result.completedCampaign?.ties).toBe(1);
    expect(result.completedCampaign?.outcome).toBe('draw');
    expect(result.completedCampaign?.differential).toBe(9);
    expect(result.completedCampaign?.tokensEarned).toBe(0);
  });

  it('is idempotent by stable War ID', () => {
    const first = service.recordResolvedWar(war('same-war', GameOutcome.PLAYER_WIN, 6, 0));
    const duplicate = service.recordResolvedWar(war('same-war', GameOutcome.OPPONENT_WIN, 0, 26));

    expect(first.status).toBe('recorded');
    expect(duplicate.status).toBe('duplicate');
    expect(service.currentCampaign().wars.length).toBe(1);
    expect(service.currentCampaign().wars[0].margin).toBe(6);
  });

  it('unlocks and selects existing card backs with one token deduction', () => {
    service.recordResolvedWar(war('token-1', GameOutcome.PLAYER_WIN, 3, 0));
    service.recordResolvedWar(war('token-2', GameOutcome.PLAYER_WIN, 3, 0));
    service.recordResolvedWar(war('token-3', GameOutcome.OPPONENT_WIN, 0, 5));
    expect(service.tokenBalance()).toBe(2);

    const purchase = service.purchaseCardBacking('classic-red');
    const repeated = service.purchaseCardBacking('classic-red');

    expect(purchase.status).toBe('unlocked');
    expect(purchase.tokenCost).toBe(1);
    expect(service.tokenBalance()).toBe(1);
    expect(service.selectedCardBackingId()).toBe('classic-red');
    expect(service.isCardBackingUnlocked('classic-red')).toBeTrue();
    expect(repeated.status).toBe('already_unlocked');
    expect(service.tokenBalance()).toBe(1);
  });

  it('keeps progression and cosmetic entitlements when career statistics reset', () => {
    service.recordResolvedWar(war('reset-1', GameOutcome.PLAYER_WIN, 3, 0));
    service.unlockCardBacking('royal-purple', 'achievement');
    authService.recordGameResult({ outcome: 'player_win', turns: 5, durationMs: 1000 });

    const campaignId = service.currentCampaign().campaignId;
    authService.resetActiveUserStats();

    expect(authService.userStats().gamesPlayed).toBe(0);
    expect(service.currentCampaign().campaignId).toBe(campaignId);
    expect(service.currentCampaign().wars.length).toBe(1);
    expect(service.isCardBackingUnlocked('royal-purple')).toBeTrue();
  });

  it('bounds completed Campaign history', () => {
    for (let campaign = 0; campaign < MAX_CAMPAIGN_HISTORY + 2; campaign++) {
      for (let index = 0; index < WARS_PER_CAMPAIGN; index++) {
        service.recordResolvedWar(war(
          `history-${campaign}-${index}`,
          GameOutcome.OPPONENT_WIN,
          0,
          1
        ));
      }
    }

    expect(service.progression().recentCampaigns.length).toBe(MAX_CAMPAIGN_HISTORY);
    expect(service.progression().recentCampaigns[0].wars[0].warId).toBe('history-2-0');
  });

  describe('Commander Campaign Lifecycle', () => {
    it('persists the commander throughout all 3 Wars of a Campaign and rotates on completion', () => {
      const initialCommanderId = service.currentCampaign().commanderId;
      expect(service.currentCommander().id).toBe(initialCommanderId);

      // War 1
      service.recordResolvedWar(war('c-war-1', GameOutcome.PLAYER_WIN, 4, 0));
      expect(service.currentCampaign().commanderId).toBe(initialCommanderId);
      expect(service.currentCommander().id).toBe(initialCommanderId);

      // War 2
      service.recordResolvedWar(war('c-war-2', GameOutcome.PLAYER_WIN, 2, 0));
      expect(service.currentCampaign().commanderId).toBe(initialCommanderId);

      // War 3 (Completes campaign)
      const result = service.recordResolvedWar(war('c-war-3', GameOutcome.PLAYER_WIN, 6, 0));
      expect(result.completedCampaign?.commanderId).toBe(initialCommanderId);

      const nextCommanderId = service.currentCampaign().commanderId;
      expect(nextCommanderId).not.toBe(initialCommanderId);
      expect(service.currentCommander().id).toBe(nextCommanderId);
      expect(service.currentCampaign().wars.length).toBe(0);
    });
  });

  describe('Campaign Orders & Limited Reserves', () => {
    it('initializes a new profile with ordersSelected: false and default standard mode', () => {
      expect(service.activeCampaignMode()).toBe('standard');
      expect(service.ordersSelected()).toBeFalse();
      expect(service.isLimitedReserves()).toBeFalse();
      expect(service.limitedReserves()).toBeNull();
      expect(service.remainingReserves()).toBeNull();
    });

    it('selects Limited Reserves mode and initializes exactly 5 reserves', () => {
      const selected = service.selectCampaignOrders('limited_reserves');
      expect(selected).toBeTrue();
      expect(service.activeCampaignMode()).toBe('limited_reserves');
      expect(service.ordersSelected()).toBeTrue();
      expect(service.isLimitedReserves()).toBeTrue();
      expect(service.remainingReserves()).toBe(5);
      expect(service.initialReserves()).toBe(5);
    });

    it('rejects changing campaign orders once War 1 has begun', () => {
      service.selectCampaignOrders('limited_reserves');
      service.recordResolvedWar(war('locked-war-1', GameOutcome.PLAYER_WIN, 4, 0));

      const attemptedChange = service.selectCampaignOrders('standard');
      expect(attemptedChange).toBeFalse();
      expect(service.activeCampaignMode()).toBe('limited_reserves');
    });

    it('authoritatively decrements reserves and prevents reinforcement when exhausted', () => {
      service.selectCampaignOrders('limited_reserves');

      expect(service.canHumanReinforce(10)).toBeTrue();
      expect(service.consumeHumanReserve()).toBeTrue();
      expect(service.remainingReserves()).toBe(4);

      expect(service.consumeHumanReserve()).toBeTrue(); // 3
      expect(service.consumeHumanReserve()).toBeTrue(); // 2
      expect(service.consumeHumanReserve()).toBeTrue(); // 1
      expect(service.consumeHumanReserve()).toBeTrue(); // 0
      expect(service.remainingReserves()).toBe(0);

      // When exhausted, cannot consume or reinforce even with full deck
      expect(service.consumeHumanReserve()).toBeFalse();
      expect(service.canHumanReinforce(10)).toBeFalse();
      expect(service.remainingReserves()).toBe(0);
    });

    it('persists remaining reserves across War 1, War 2, and War 3', () => {
      service.selectCampaignOrders('limited_reserves');

      // Consume 2 reserves during War 1
      service.consumeHumanReserve();
      service.consumeHumanReserve();
      expect(service.remainingReserves()).toBe(3);

      // Record War 1 resolution
      service.recordResolvedWar(war('lr-w1', GameOutcome.PLAYER_WIN, 3, 0));
      expect(service.remainingReserves()).toBe(3);
      expect(service.activeCampaignMode()).toBe('limited_reserves');

      // Consume 1 reserve during War 2
      service.consumeHumanReserve();
      expect(service.remainingReserves()).toBe(2);

      // Record War 2 resolution
      service.recordResolvedWar(war('lr-w2', GameOutcome.OPPONENT_WIN, 0, 4));
      expect(service.remainingReserves()).toBe(2);

      // Record War 3 resolution (completes campaign)
      const result = service.recordResolvedWar(war('lr-w3', GameOutcome.PLAYER_WIN, 5, 0));
      expect(result.completedCampaign?.mode).toBe('limited_reserves');
      expect(result.completedCampaign?.remainingReserves).toBe(2);

      // Next campaign begins fresh with standard mode and unselected orders
      expect(service.activeCampaignMode()).toBe('standard');
      expect(service.ordersSelected()).toBeFalse();
      expect(service.remainingReserves()).toBeNull();
    });

    it('completing War 3 creates a DIFFERENT campaignId and selecting Limited Reserves on new Campaign restores 5/5', () => {
      service.selectCampaignOrders('limited_reserves');
      const initialCampaignId = service.currentCampaign().campaignId;

      // Exhaust all reserves in War 1
      for (let i = 0; i < 5; i++) {
        service.consumeHumanReserve();
      }
      expect(service.remainingReserves()).toBe(0);

      service.recordResolvedWar(war('c-w1', GameOutcome.PLAYER_WIN, 1, 0));
      service.recordResolvedWar(war('c-w2', GameOutcome.PLAYER_WIN, 2, 0));
      service.recordResolvedWar(war('c-w3', GameOutcome.PLAYER_WIN, 3, 0));

      // After War 3, new campaignId is created
      const nextCampaign = service.currentCampaign();
      expect(nextCampaign.campaignId).not.toBe(initialCampaignId);
      expect(nextCampaign.ordersSelected).toBeFalse();
      expect(nextCampaign.wars.length).toBe(0);
      expect(service.remainingReserves()).toBeNull();

      // Selecting Limited Reserves on the new Campaign allocates fresh 5 / 5
      service.selectCampaignOrders('limited_reserves');
      expect(service.ordersSelected()).toBeTrue();
      expect(service.activeCampaignMode()).toBe('limited_reserves');
      expect(service.remainingReserves()).toBe(5);
      expect(service.initialReserves()).toBe(5);
    });

    it('standard mode remains unaffected and has no reserve limits', () => {
      service.selectCampaignOrders('standard');
      expect(service.ordersSelected()).toBeTrue();
      expect(service.activeCampaignMode()).toBe('standard');
      expect(service.isLimitedReserves()).toBeFalse();
      expect(service.remainingReserves()).toBeNull();
      expect(service.canHumanReinforce(10)).toBeTrue();
      expect(service.consumeHumanReserve()).toBeTrue();
      expect(service.remainingReserves()).toBeNull();
    });

    it('handles Total War mode selection and tracks running campaign differential', () => {
      expect(service.isTotalWar()).toBeFalse();
      expect(service.runningCampaignDifferential()).toBe(0);

      const selected = service.selectCampaignOrders('total_war');
      expect(selected).toBeTrue();
      expect(service.ordersSelected()).toBeTrue();
      expect(service.activeCampaignMode()).toBe('total_war');
      expect(service.isTotalWar()).toBeTrue();
      expect(service.isLimitedReserves()).toBeFalse();

      // Record War 1: Won with 8 cards remaining (margin +8)
      service.recordResolvedWar(war('tw-w1', GameOutcome.PLAYER_WIN, 8, 0));
      expect(service.runningCampaignDifferential()).toBe(8);

      // Record War 2: Lost with opponent having 3 cards remaining (margin -3)
      service.recordResolvedWar(war('tw-w2', GameOutcome.OPPONENT_WIN, 0, 3));
      expect(service.runningCampaignDifferential()).toBe(5);

      // Record War 3: Lost with opponent having 1 card remaining (margin -1) -> Total Diff: +4
      const result = service.recordResolvedWar(war('tw-w3', GameOutcome.OPPONENT_WIN, 0, 1));
      expect(result.completedCampaign?.mode).toBe('total_war');
      expect(result.completedCampaign?.wins).toBe(1);
      expect(result.completedCampaign?.losses).toBe(2);
      expect(result.completedCampaign?.differential).toBe(4);
      expect(result.completedCampaign?.outcome).toBe('victory'); // Victory in Total War because differential > 0 (+4)
      expect(result.completedCampaign?.tokensEarned).toBe(2); // 1 victory + 1 positive differential
      expect(service.tokenBalance()).toBe(2);
    });

    it('handles Fog of War mode selection and casualty inspection permission checks', () => {
      expect(service.isFogOfWar()).toBeFalse();
      expect(service.canInspectCurrentWarCasualties(false)).toBeTrue();

      const selected = service.selectCampaignOrders('fog_of_war');
      expect(selected).toBeTrue();
      expect(service.ordersSelected()).toBeTrue();
      expect(service.activeCampaignMode()).toBe('fog_of_war');
      expect(service.isFogOfWar()).toBeTrue();
      expect(service.isLimitedReserves()).toBeFalse();
      expect(service.isTotalWar()).toBeFalse();

      // Casualties sealed during active War
      expect(service.canInspectCurrentWarCasualties(false)).toBeFalse();
      // Casualties accessible once War concludes
      expect(service.canInspectCurrentWarCasualties(true)).toBeTrue();

      // Standard reinforcement rules apply (deck count only)
      expect(service.canHumanReinforce(10)).toBeTrue();
      expect(service.canHumanReinforce(0)).toBeFalse();

      // Complete Fog of War campaign (2-of-3 match wins)
      service.recordResolvedWar(war('fog-w1', GameOutcome.PLAYER_WIN, 5, 0));
      service.recordResolvedWar(war('fog-w2', GameOutcome.PLAYER_WIN, 3, 0));
      const result = service.recordResolvedWar(war('fog-w3', GameOutcome.OPPONENT_WIN, 0, 4));

      expect(result.completedCampaign?.mode).toBe('fog_of_war');
      expect(result.completedCampaign?.outcome).toBe('victory');
      expect(result.completedCampaign?.wins).toBe(2);
      expect(result.completedCampaign?.losses).toBe(1);
      expect(result.completedCampaign?.tokensEarned).toBe(2);
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

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

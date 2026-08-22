import { computed, inject, Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { AuthService } from './auth.service';
import { CARD_BACKING_OPTIONS } from '../models/settings.model';
import {
  CampaignHistoryEntry,
  CampaignProgression,
  CampaignWarRecord,
  calculateWarMargin,
  CosmeticPurchaseResult,
  CosmeticUnlock,
  CosmeticUnlockReason,
  createProgressionId,
  MAX_CAMPAIGN_HISTORY,
  MAX_PROCESSED_WAR_IDS,
  RecordResolvedWarResult,
  ResolvedWarInput,
  summarizeCampaign,
  WARS_PER_CAMPAIGN
} from '../models/progression.model';

export type ProgressionDomainEvent =
  | {
      readonly type: 'campaign_resolved';
      readonly campaign: CampaignHistoryEntry;
      readonly tokenBalanceAfter: number;
    }
  | {
      readonly type: 'cosmetic_unlocked';
      readonly unlock: CosmeticUnlock;
      readonly tokenBalanceAfter: number;
    };

@Injectable({ providedIn: 'root' })
export class CampaignProgressionService {
  private readonly authService = inject(AuthService);
  private readonly eventSubject = new Subject<ProgressionDomainEvent>();

  readonly events$ = this.eventSubject.asObservable();
  readonly progression = computed(() => this.authService.activeProfile().progression);
  readonly currentCampaign = computed(() => this.progression().currentCampaign);
  readonly campaignWarIndex = computed<1 | 2 | 3>(() =>
    Math.min(WARS_PER_CAMPAIGN, this.currentCampaign().wars.length + 1) as 1 | 2 | 3
  );
  readonly tokenBalance = computed(() => this.progression().tokenBalance);
  readonly selectedCardBackingId = computed(() =>
    this.progression().selectedCosmetics.cardBackingId
  );
  readonly unlockedCardBackingIds = computed(() =>
    this.progression().unlockedCosmetics
      .filter(unlock => unlock.cosmeticType === 'card_back')
      .map(unlock => unlock.cosmeticId)
  );

  recordResolvedWar(input: ResolvedWarInput): RecordResolvedWarResult {
    const warId = input.warId.trim().slice(0, 128);
    if (!warId) {
      throw new Error('A stable warId is required to record Campaign progress.');
    }

    const current = this.progression();
    if (current.processedWarIds.includes(warId)) {
      return {
        status: 'duplicate',
        war: null,
        completedCampaign: null,
        progression: current
      };
    }

    const completedAt = input.completedAt && !Number.isNaN(Date.parse(input.completedAt))
      ? input.completedAt
      : new Date().toISOString();
    const war: CampaignWarRecord = {
      warId,
      outcome: input.outcome,
      margin: calculateWarMargin(input),
      playerDeckColor: input.playerDeckColor ?? 'unknown',
      completedAt
    };

    const candidateWars = [...current.currentCampaign.wars, war];
    const completedCampaign = candidateWars.length === WARS_PER_CAMPAIGN
      ? summarizeCampaign(current.currentCampaign.campaignId, candidateWars)
      : null;
    const progression = this.authService.updateActiveProfileProgression(previous => {
      if (previous.processedWarIds.includes(warId)) return previous;

      const wars = [...previous.currentCampaign.wars, war];
      const processedWarIds = [...previous.processedWarIds, warId]
        .slice(-MAX_PROCESSED_WAR_IDS);

      if (wars.length < WARS_PER_CAMPAIGN) {
        return {
          ...previous,
          currentCampaign: { ...previous.currentCampaign, wars },
          processedWarIds
        };
      }

      const completed = summarizeCampaign(previous.currentCampaign.campaignId, wars);
      return {
        ...previous,
        currentCampaign: {
          campaignId: createProgressionId('campaign'),
          wars: []
        },
        recentCampaigns: [...previous.recentCampaigns, completed]
          .slice(-MAX_CAMPAIGN_HISTORY),
        tokenBalance: previous.tokenBalance + completed.tokensEarned,
        lifetimeTokensEarned:
          previous.lifetimeTokensEarned + completed.tokensEarned,
        processedWarIds
      };
    });

    if (completedCampaign) {
      const stats = this.authService.userStats();
      const firstCampaignSinceReset = stats.campaignsCompleted === 0;
      this.authService.updateStatistics({
        campaignsCompleted: stats.campaignsCompleted + 1,
        campaignsWon: stats.campaignsWon + (completedCampaign.outcome === 'victory' ? 1 : 0),
        campaignsLost: stats.campaignsLost + (completedCampaign.outcome === 'defeat' ? 1 : 0),
        campaignsDrawn: stats.campaignsDrawn + (completedCampaign.outcome === 'draw' ? 1 : 0),
        totalCampaignDifferential:
          stats.totalCampaignDifferential + completedCampaign.differential,
        bestCampaignDifferential: firstCampaignSinceReset
          ? completedCampaign.differential
          : Math.max(stats.bestCampaignDifferential, completedCampaign.differential),
        worstCampaignDifferential: firstCampaignSinceReset
          ? completedCampaign.differential
          : Math.min(stats.worstCampaignDifferential, completedCampaign.differential)
      });
      this.eventSubject.next({
        type: 'campaign_resolved',
        campaign: completedCampaign,
        tokenBalanceAfter: progression.tokenBalance
      });
    }

    return {
      status: 'recorded',
      war,
      completedCampaign,
      progression
    };
  }

  isCardBackingUnlocked(backingId: string): boolean {
    return this.unlockedCardBackingIds().includes(backingId);
  }

  selectCardBacking(backingId: string): boolean {
    if (!this.isKnownCardBacking(backingId) || !this.isCardBackingUnlocked(backingId)) {
      return false;
    }
    if (this.selectedCardBackingId() === backingId) return true;

    this.authService.updateActiveProfileProgression(previous => ({
      ...previous,
      selectedCosmetics: { ...previous.selectedCosmetics, cardBackingId: backingId }
    }));
    return true;
  }

  purchaseCardBacking(backingId: string): CosmeticPurchaseResult {
    const option = CARD_BACKING_OPTIONS.find(candidate => candidate.id === backingId);
    if (!option) {
      return {
        status: 'not_found',
        cosmeticId: backingId,
        tokenCost: 0,
        tokenBalance: this.tokenBalance()
      };
    }
    if (this.isCardBackingUnlocked(backingId)) {
      return {
        status: 'already_unlocked',
        cosmeticId: backingId,
        tokenCost: option.tokenCost,
        tokenBalance: this.tokenBalance()
      };
    }
    if (this.tokenBalance() < option.tokenCost) {
      return {
        status: 'insufficient_tokens',
        cosmeticId: backingId,
        tokenCost: option.tokenCost,
        tokenBalance: this.tokenBalance()
      };
    }

    const unlock: CosmeticUnlock = {
      cosmeticId: backingId,
      cosmeticType: 'card_back',
      reason: 'tokens',
      unlockedAt: new Date().toISOString(),
      tokenCost: option.tokenCost
    };
    const progression = this.authService.updateActiveProfileProgression(previous => ({
      ...previous,
      tokenBalance: previous.tokenBalance - option.tokenCost,
      lifetimeTokensSpent: previous.lifetimeTokensSpent + option.tokenCost,
      unlockedCosmetics: [...previous.unlockedCosmetics, unlock],
      selectedCosmetics: { ...previous.selectedCosmetics, cardBackingId: backingId }
    }));
    this.eventSubject.next({
      type: 'cosmetic_unlocked',
      unlock,
      tokenBalanceAfter: progression.tokenBalance
    });

    return {
      status: 'unlocked',
      cosmeticId: backingId,
      tokenCost: option.tokenCost,
      tokenBalance: progression.tokenBalance
    };
  }

  /** Achievement integration seam for future non-token entitlements. */
  unlockCardBacking(
    backingId: string,
    reason: Exclude<CosmeticUnlockReason, 'tokens'> = 'achievement'
  ): boolean {
    if (!this.isKnownCardBacking(backingId) || this.isCardBackingUnlocked(backingId)) {
      return false;
    }
    const unlock: CosmeticUnlock = {
      cosmeticId: backingId,
      cosmeticType: 'card_back',
      reason,
      unlockedAt: new Date().toISOString()
    };
    const progression = this.authService.updateActiveProfileProgression(previous => ({
      ...previous,
      unlockedCosmetics: [...previous.unlockedCosmetics, unlock]
    }));
    this.eventSubject.next({
      type: 'cosmetic_unlocked',
      unlock,
      tokenBalanceAfter: progression.tokenBalance
    });
    return true;
  }

  private isKnownCardBacking(backingId: string): boolean {
    return CARD_BACKING_OPTIONS.some(option => option.id === backingId);
  }
}

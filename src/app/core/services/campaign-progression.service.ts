import { computed, inject, Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { AuthService } from './auth.service';
import { CARD_BACKING_OPTIONS } from '../models/settings.model';
import { getCommander } from '../models/commander.model';
import { getCommanderIdentity } from '../models/commander-identity.model';
import {
  CAMPAIGN_CHAPTER_ORDER,
  CampaignWarIndex,
  getAuthoredCommanderSchedule,
  nextCampaignChapter
} from '../models/campaign-chapter.model';
import {
  CampaignHistoryEntry,
  CampaignModeId,
  CampaignProgression,
  CampaignWarRecord,
  LIMITED_RESERVES_INITIAL_COUNT,
  LimitedReservesCampaignState,
  calculateWarMargin,
  canHumanReinforce,
  canInspectCasualties,
  getHumanReserves,
  isFogOfWarMode,
  isLimitedReservesMode,
  isTotalWarMode,
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

export type CampaignChapterState = 'locked' | 'available' | 'current' | 'completed';

@Injectable({ providedIn: 'root' })
export class CampaignProgressionService {
  private readonly authService = inject(AuthService);
  private readonly eventSubject = new Subject<ProgressionDomainEvent>();

  readonly events$ = this.eventSubject.asObservable();
  readonly progression = computed(() => this.authService.activeProfile().progression);
  readonly currentCampaign = computed(() => this.progression().currentCampaign);
  readonly campaignWarIndex = computed<CampaignWarIndex>(() =>
    Math.min(WARS_PER_CAMPAIGN, this.currentCampaign().wars.length + 1) as CampaignWarIndex
  );
  readonly currentCommanderId = computed(() =>
    this.currentCampaign().commanderSchedule[this.campaignWarIndex() - 1]
  );
  readonly currentCommander = computed(() =>
    getCommander(this.currentCommanderId())
  );
  readonly currentCommanderIdentity = computed(() =>
    getCommanderIdentity(this.currentCommanderId())
  );
  readonly activeCampaignMode = computed<CampaignModeId>(() => this.currentCampaign().mode);
  readonly ordersSelected = computed<boolean>(() => this.currentCampaign().ordersSelected);
  readonly isLimitedReserves = computed<boolean>(() => isLimitedReservesMode(this.currentCampaign()));
  readonly isTotalWar = computed<boolean>(() => isTotalWarMode(this.currentCampaign()));
  readonly isFogOfWar = computed<boolean>(() => isFogOfWarMode(this.currentCampaign()));
  readonly runningCampaignDifferential = computed<number>(() =>
    this.currentCampaign().wars.reduce((sum, w) => sum + w.margin, 0)
  );
  readonly limitedReserves = computed<LimitedReservesCampaignState | null>(() =>
    this.currentCampaign().limitedReserves ?? null
  );
  readonly remainingReserves = computed<number | null>(() =>
    this.limitedReserves()?.remainingReserves ?? null
  );
  readonly initialReserves = computed<number | null>(() =>
    this.limitedReserves()?.initialReserves ?? null
  );
  readonly unlockedChapterModes = computed(() => this.progression().unlockedChapterModes);
  readonly completedChapterModes = computed(() => this.progression().completedChapterModes);
  readonly tokenBalance = computed(() => this.progression().tokenBalance);
  readonly selectedCardBackingId = computed(() =>
    this.progression().selectedCosmetics.cardBackingId
  );
  readonly unlockedCardBackingIds = computed(() =>
    this.progression().unlockedCosmetics
      .filter(unlock => unlock.cosmeticType === 'card_back')
      .map(unlock => unlock.cosmeticId)
  );

  /**
   * Authoritative check whether the human player is permitted to reinforce.
   */
  canHumanReinforce(deckCount: number): boolean {
    return canHumanReinforce(this.currentCampaign(), deckCount);
  }

  /**
   * Authoritative check whether casualty inspection / historical ledgers are accessible.
   */
  canInspectCurrentWarCasualties(isWarResolved: boolean): boolean {
    return canInspectCasualties(this.activeCampaignMode(), isWarResolved);
  }

  isChapterUnlocked(mode: CampaignModeId): boolean {
    return this.unlockedChapterModes().includes(mode);
  }

  isChapterCompleted(mode: CampaignModeId): boolean {
    return this.completedChapterModes().includes(mode);
  }

  chapterState(mode: CampaignModeId): CampaignChapterState {
    if (!this.isChapterUnlocked(mode)) return 'locked';
    if (this.currentCampaign().mode === mode && !this.currentCampaign().ordersSelected) {
      return 'current';
    }
    return this.isChapterCompleted(mode) ? 'completed' : 'available';
  }

  /**
   * Confirms the Campaign Orders (rules of engagement) for the active Campaign.
   * Only permitted before War 1 begins.
   */
  selectCampaignOrders(mode: CampaignModeId): boolean {
    const current = this.currentCampaign();
    if (current.wars.length > 0 || !this.isChapterUnlocked(mode)) {
      return false; // Mode is immutable once Campaign play has begun.
    }

    const limitedReserves: LimitedReservesCampaignState | undefined =
      mode === 'limited_reserves'
        ? {
            initialReserves: LIMITED_RESERVES_INITIAL_COUNT,
            remainingReserves: LIMITED_RESERVES_INITIAL_COUNT
          }
        : undefined;

    this.authService.updateActiveProfileProgression(previous => ({
      ...previous,
      currentCampaign: {
        ...previous.currentCampaign,
        mode,
        ordersSelected: true,
        commanderSchedule: getAuthoredCommanderSchedule(mode),
        limitedReserves: undefined,
        ...(limitedReserves ? { limitedReserves } : {})
      }
    }));
    return true;
  }

  /**
   * Authoritative point of human reserve consumption.
   * Decrements remaining reserves by exactly 1 when Limited Reserves is active.
   */
  consumeHumanReserve(): boolean {
    const current = this.currentCampaign();
    if (current.mode !== 'limited_reserves') {
      return true; // Standard Campaign has no reserve pool limit.
    }

    const currentReserves = current.limitedReserves?.remainingReserves ?? 0;
    if (currentReserves <= 0) {
      return false;
    }

    this.authService.updateActiveProfileProgression(previous => {
      if (previous.currentCampaign.mode !== 'limited_reserves') return previous;
      const lr = previous.currentCampaign.limitedReserves;
      if (!lr || lr.remainingReserves <= 0) return previous;

      return {
        ...previous,
        currentCampaign: {
          ...previous.currentCampaign,
          limitedReserves: {
            ...lr,
            remainingReserves: lr.remainingReserves - 1
          }
        }
      };
    });
    return true;
  }

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
      commanderId: this.currentCommanderId(),
      outcome: input.outcome,
      margin: calculateWarMargin(input),
      playerDeckColor: input.playerDeckColor ?? 'unknown',
      completedAt
    };

    const candidateWars = [...current.currentCampaign.wars, war];
    const completedCampaign = candidateWars.length === WARS_PER_CAMPAIGN
      ? summarizeCampaign(
          current.currentCampaign.campaignId,
          candidateWars,
          current.currentCampaign.mode,
          current.currentCampaign.limitedReserves?.remainingReserves
        )
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

      const completed = summarizeCampaign(
        previous.currentCampaign.campaignId,
        wars,
        previous.currentCampaign.mode,
        previous.currentCampaign.limitedReserves?.remainingReserves
      );
      const completedChapterModes = CAMPAIGN_CHAPTER_ORDER.filter(mode =>
        previous.completedChapterModes.includes(mode) || mode === completed.mode
      );
      const nextMode = nextCampaignChapter(completed.mode);
      const newlyUnlockedMode = nextMode && !previous.unlockedChapterModes.includes(nextMode)
        ? nextMode
        : null;
      const unlockedChapterModes = CAMPAIGN_CHAPTER_ORDER.filter(mode =>
        previous.unlockedChapterModes.includes(mode) || mode === newlyUnlockedMode
      );
      const defaultNextMode = newlyUnlockedMode ?? completed.mode;

      return {
        ...previous,
        currentCampaign: {
          campaignId: createProgressionId('campaign'),
          mode: defaultNextMode,
          ordersSelected: false,
          wars: [],
          commanderSchedule: getAuthoredCommanderSchedule(defaultNextMode)
        },
        recentCampaigns: [...previous.recentCampaigns, completed]
          .slice(-MAX_CAMPAIGN_HISTORY),
        unlockedChapterModes,
        completedChapterModes,
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

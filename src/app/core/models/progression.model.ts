import { GameOutcome } from './game-state.model';

export const CAMPAIGN_PROGRESSION_SCHEMA_VERSION = 1;
export const WARS_PER_CAMPAIGN = 3;
export const MAX_CAMPAIGN_HISTORY = 20;
export const MAX_PROCESSED_WAR_IDS = 256;
export const DEFAULT_CARD_BACKING_ID = 'classic-blue';

export type DeckColor = 'red' | 'black' | 'unknown';
export type CampaignOutcome = 'victory' | 'defeat' | 'draw';
export type CosmeticType = 'card_back' | 'profile_frame' | 'title' | 'table_treatment';
export type CosmeticUnlockReason = 'default' | 'tokens' | 'achievement' | 'legacy_selected';

export interface CampaignWarRecord {
  readonly warId: string;
  readonly outcome: GameOutcome;
  readonly margin: number;
  readonly playerDeckColor: DeckColor;
  readonly completedAt: string;
}

export interface ActiveCampaign {
  readonly campaignId: string;
  readonly wars: readonly CampaignWarRecord[];
}

export interface CampaignHistoryEntry {
  readonly campaignId: string;
  readonly wars: readonly CampaignWarRecord[];
  readonly wins: number;
  readonly losses: number;
  readonly ties: number;
  readonly differential: number;
  readonly outcome: CampaignOutcome;
  readonly tokensEarned: number;
  readonly completedAt: string;
}

export interface CosmeticUnlock {
  readonly cosmeticId: string;
  readonly cosmeticType: CosmeticType;
  readonly reason: CosmeticUnlockReason;
  readonly unlockedAt: string;
  readonly tokenCost?: number;
}

export interface SelectedCosmetics {
  readonly cardBackingId: string;
}

/**
 * Durable, profile-scoped progression. This deliberately does not live in
 * GameStatistics: resetting career statistics must not destroy currency,
 * purchased cosmetics, or an in-progress Campaign.
 */
export interface CampaignProgression {
  readonly schemaVersion: typeof CAMPAIGN_PROGRESSION_SCHEMA_VERSION;
  readonly currentCampaign: ActiveCampaign;
  readonly recentCampaigns: readonly CampaignHistoryEntry[];
  readonly tokenBalance: number;
  readonly lifetimeTokensEarned: number;
  readonly lifetimeTokensSpent: number;
  readonly unlockedCosmetics: readonly CosmeticUnlock[];
  readonly selectedCosmetics: SelectedCosmetics;
  readonly processedWarIds: readonly string[];
}

export interface ResolvedWarInput {
  readonly warId: string;
  readonly outcome: GameOutcome;
  readonly playerCardsRemaining: number;
  readonly opponentCardsRemaining: number;
  readonly playerDeckColor?: DeckColor;
  readonly completedAt?: string;
}

export interface RecordResolvedWarResult {
  readonly status: 'recorded' | 'duplicate';
  readonly war: CampaignWarRecord | null;
  readonly completedCampaign: CampaignHistoryEntry | null;
  readonly progression: CampaignProgression;
}

export interface CosmeticPurchaseResult {
  readonly status: 'unlocked' | 'already_unlocked' | 'insufficient_tokens' | 'not_found';
  readonly cosmeticId: string;
  readonly tokenCost: number;
  readonly tokenBalance: number;
}

export function createProgressionId(prefix: 'campaign' | 'war' = 'campaign'): string {
  const randomUuid = globalThis.crypto?.randomUUID?.();
  if (randomUuid) {
    return `${prefix}-${randomUuid}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

export function createDefaultCampaignProgression(
  selectedCardBackingId = DEFAULT_CARD_BACKING_ID,
  now = new Date().toISOString()
): CampaignProgression {
  const selected = normalizeCosmeticId(selectedCardBackingId) || DEFAULT_CARD_BACKING_ID;
  const defaultUnlock: CosmeticUnlock = {
    cosmeticId: DEFAULT_CARD_BACKING_ID,
    cosmeticType: 'card_back',
    reason: 'default',
    unlockedAt: now
  };
  const unlocks = selected === DEFAULT_CARD_BACKING_ID
    ? [defaultUnlock]
    : [
        defaultUnlock,
        {
          cosmeticId: selected,
          cosmeticType: 'card_back' as const,
          reason: 'legacy_selected' as const,
          unlockedAt: now
        }
      ];

  return {
    schemaVersion: CAMPAIGN_PROGRESSION_SCHEMA_VERSION,
    currentCampaign: {
      campaignId: createProgressionId('campaign'),
      wars: []
    },
    recentCampaigns: [],
    tokenBalance: 0,
    lifetimeTokensEarned: 0,
    lifetimeTokensSpent: 0,
    unlockedCosmetics: unlocks,
    selectedCosmetics: { cardBackingId: selected },
    processedWarIds: []
  };
}

/** Normalize stored/legacy data without trusting localStorage shape or values. */
export function normalizeCampaignProgression(
  value: unknown,
  legacySelectedCardBackingId = DEFAULT_CARD_BACKING_ID,
  now = new Date().toISOString()
): CampaignProgression {
  const fallback = createDefaultCampaignProgression(legacySelectedCardBackingId, now);
  if (!isRecord(value)) {
    return fallback;
  }

  const rawCurrent = isRecord(value['currentCampaign']) ? value['currentCampaign'] : null;
  const currentWars = normalizeWars(rawCurrent?.['wars']).slice(0, WARS_PER_CAMPAIGN - 1);
  const recentCampaigns = normalizeCampaignHistory(value['recentCampaigns']).slice(-MAX_CAMPAIGN_HISTORY);
  const storedUnlocks = normalizeUnlocks(value['unlockedCosmetics']);
  const legacySelection = normalizeCosmeticId(legacySelectedCardBackingId) || DEFAULT_CARD_BACKING_ID;
  const unlocks = ensureBackingEntitlements(storedUnlocks, legacySelection, now);
  const storedSelected = isRecord(value['selectedCosmetics'])
    ? normalizeCosmeticId(value['selectedCosmetics']['cardBackingId'])
    : '';
  const selected = unlocks.some(unlock =>
    unlock.cosmeticType === 'card_back' && unlock.cosmeticId === storedSelected
  ) ? storedSelected : legacySelection;

  const discoveredWarIds = [
    ...currentWars.map(war => war.warId),
    ...recentCampaigns.flatMap(campaign => campaign.wars.map(war => war.warId))
  ];
  const processedWarIds = uniqueStrings([
    ...normalizeStringArray(value['processedWarIds']),
    ...discoveredWarIds
  ]).slice(-MAX_PROCESSED_WAR_IDS);

  return {
    schemaVersion: CAMPAIGN_PROGRESSION_SCHEMA_VERSION,
    currentCampaign: {
      campaignId: normalizeId(rawCurrent?.['campaignId']) || createProgressionId('campaign'),
      wars: currentWars
    },
    recentCampaigns,
    tokenBalance: nonNegativeInteger(value['tokenBalance']),
    lifetimeTokensEarned: nonNegativeInteger(value['lifetimeTokensEarned']),
    lifetimeTokensSpent: nonNegativeInteger(value['lifetimeTokensSpent']),
    unlockedCosmetics: unlocks,
    selectedCosmetics: { cardBackingId: selected },
    processedWarIds
  };
}

export function calculateWarMargin(input: ResolvedWarInput): number {
  switch (input.outcome) {
    case GameOutcome.PLAYER_WIN:
      return nonNegativeInteger(input.playerCardsRemaining);
    case GameOutcome.OPPONENT_WIN:
      return -nonNegativeInteger(input.opponentCardsRemaining);
    case GameOutcome.TIE:
      return 0;
  }
}

export function summarizeCampaign(
  campaignId: string,
  wars: readonly CampaignWarRecord[]
): CampaignHistoryEntry {
  if (wars.length !== WARS_PER_CAMPAIGN) {
    throw new Error(`A Campaign requires exactly ${WARS_PER_CAMPAIGN} resolved Wars.`);
  }

  const wins = wars.filter(war => war.outcome === GameOutcome.PLAYER_WIN).length;
  const losses = wars.filter(war => war.outcome === GameOutcome.OPPONENT_WIN).length;
  const ties = wars.length - wins - losses;
  const differential = wars.reduce((sum, war) => sum + war.margin, 0);
  const outcome: CampaignOutcome = wins > losses ? 'victory' : losses > wins ? 'defeat' : 'draw';
  const tokensEarned = outcome === 'victory' ? 1 + (differential > 0 ? 1 : 0) : 0;

  return {
    campaignId,
    wars: [...wars],
    wins,
    losses,
    ties,
    differential,
    outcome,
    tokensEarned,
    completedAt: wars[wars.length - 1].completedAt
  };
}

function normalizeCampaignHistory(value: unknown): CampaignHistoryEntry[] {
  if (!Array.isArray(value)) return [];
  const history: CampaignHistoryEntry[] = [];
  for (const candidate of value) {
    if (!isRecord(candidate)) continue;
    const campaignId = normalizeId(candidate['campaignId']);
    const wars = normalizeWars(candidate['wars']);
    if (!campaignId || wars.length !== WARS_PER_CAMPAIGN) continue;
    history.push(summarizeCampaign(campaignId, wars));
  }
  return history;
}

function normalizeWars(value: unknown): CampaignWarRecord[] {
  if (!Array.isArray(value)) return [];
  const wars: CampaignWarRecord[] = [];
  for (const candidate of value) {
    if (!isRecord(candidate)) continue;
    const warId = normalizeId(candidate['warId']);
    const outcome = normalizeGameOutcome(candidate['outcome']);
    if (!warId || !outcome) continue;
    wars.push({
      warId,
      outcome,
      margin: finiteInteger(candidate['margin']),
      playerDeckColor: normalizeDeckColor(candidate['playerDeckColor']),
      completedAt: normalizeIsoDate(candidate['completedAt'])
    });
  }
  return wars;
}

function normalizeUnlocks(value: unknown): CosmeticUnlock[] {
  if (!Array.isArray(value)) return [];
  const unlocks: CosmeticUnlock[] = [];
  for (const candidate of value) {
    if (!isRecord(candidate)) continue;
    const cosmeticId = normalizeCosmeticId(candidate['cosmeticId']);
    const cosmeticType = normalizeCosmeticType(candidate['cosmeticType']);
    const reason = normalizeUnlockReason(candidate['reason']);
    if (!cosmeticId || !cosmeticType || !reason) continue;
    if (unlocks.some(unlock => unlock.cosmeticType === cosmeticType && unlock.cosmeticId === cosmeticId)) {
      continue;
    }
    const tokenCost = candidate['tokenCost'] === undefined
      ? undefined
      : nonNegativeInteger(candidate['tokenCost']);
    unlocks.push({
      cosmeticId,
      cosmeticType,
      reason,
      unlockedAt: normalizeIsoDate(candidate['unlockedAt']),
      ...(tokenCost === undefined ? {} : { tokenCost })
    });
  }
  return unlocks;
}

function ensureBackingEntitlements(
  storedUnlocks: readonly CosmeticUnlock[],
  legacySelection: string,
  now: string
): CosmeticUnlock[] {
  const unlocks = [...storedUnlocks];
  if (!unlocks.some(unlock => unlock.cosmeticType === 'card_back' && unlock.cosmeticId === DEFAULT_CARD_BACKING_ID)) {
    unlocks.unshift({
      cosmeticId: DEFAULT_CARD_BACKING_ID,
      cosmeticType: 'card_back',
      reason: 'default',
      unlockedAt: now
    });
  }
  if (!unlocks.some(unlock => unlock.cosmeticType === 'card_back' && unlock.cosmeticId === legacySelection)) {
    unlocks.push({
      cosmeticId: legacySelection,
      cosmeticType: 'card_back',
      reason: legacySelection === DEFAULT_CARD_BACKING_ID ? 'default' : 'legacy_selected',
      unlockedAt: now
    });
  }
  return unlocks;
}

function normalizeGameOutcome(value: unknown): GameOutcome | null {
  return value === GameOutcome.PLAYER_WIN || value === GameOutcome.OPPONENT_WIN || value === GameOutcome.TIE
    ? value
    : null;
}

function normalizeDeckColor(value: unknown): DeckColor {
  return value === 'red' || value === 'black' ? value : 'unknown';
}

function normalizeCosmeticType(value: unknown): CosmeticType | null {
  return value === 'card_back' || value === 'profile_frame' || value === 'title' || value === 'table_treatment'
    ? value
    : null;
}

function normalizeUnlockReason(value: unknown): CosmeticUnlockReason | null {
  return value === 'default' || value === 'tokens' || value === 'achievement' || value === 'legacy_selected'
    ? value
    : null;
}

function normalizeId(value: unknown): string {
  return typeof value === 'string' ? value.trim().slice(0, 128) : '';
}

function normalizeCosmeticId(value: unknown): string {
  return typeof value === 'string' && /^[a-z0-9][a-z0-9_-]{0,63}$/.test(value) ? value : '';
}

function normalizeIsoDate(value: unknown): string {
  if (typeof value === 'string' && !Number.isNaN(Date.parse(value))) return value;
  return new Date().toISOString();
}

function finiteInteger(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.trunc(value) : 0;
}

function nonNegativeInteger(value: unknown): number {
  return Math.max(0, finiteInteger(value));
}

function normalizeStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(normalizeId).filter(Boolean) : [];
}

function uniqueStrings(values: readonly string[]): string[] {
  return [...new Set(values)];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

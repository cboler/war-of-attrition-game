import { GameOutcome } from './game-state.model';
import { isCommanderId, OpponentCommanderId } from './commander.model';
import {
  CAMPAIGN_CHAPTER_ORDER,
  CAMPAIGN_MODIFIER_ORDER,
  CampaignCommanderSchedule,
  CampaignModifierId,
  CampaignModeId,
  CampaignWarIndex,
  chapterPrerequisitesThrough,
  getAuthoredCommanderId,
  getAuthoredCommanderSchedule,
  getScriptedChapterModifiers,
  isCampaignModeId,
  isCampaignModifierId
} from './campaign-chapter.model';

export type {
  CampaignModifierId,
  CampaignModeId,
  CampaignWarIndex
} from './campaign-chapter.model';

export const CAMPAIGN_PROGRESSION_SCHEMA_VERSION = 3;
export const WARS_PER_CAMPAIGN = 3;
export const MAX_CAMPAIGN_HISTORY = 20;
export const MAX_PROCESSED_WAR_IDS = 256;
export const DEFAULT_CARD_BACKING_ID = 'classic-blue';
export const LIMITED_RESERVES_INITIAL_COUNT = 5;

export type DeckColor = 'red' | 'black' | 'unknown';
export type CampaignOutcome = 'victory' | 'defeat' | 'draw';
export type CosmeticType = 'card_back' | 'profile_frame' | 'title' | 'table_treatment';
export type CosmeticUnlockReason = 'default' | 'tokens' | 'achievement' | 'legacy_selected';
export const DEFAULT_CAMPAIGN_MODE_ID: CampaignModeId = 'standard';

export interface CampaignWarRecord {
  readonly warId: string;
  readonly commanderId: OpponentCommanderId;
  readonly outcome: GameOutcome;
  readonly margin: number;
  readonly playerDeckColor: DeckColor;
  readonly completedAt: string;
}

export interface LimitedReservesCampaignState {
  readonly initialReserves: number;
  readonly remainingReserves: number;
}

export interface ActiveCampaign {
  readonly campaignId: string;
  /** Story Chapter identity. Mechanical rules live in `modifiers`. */
  readonly mode: CampaignModeId;
  readonly modifiers: readonly CampaignModifierId[];
  readonly ordersSelected: boolean;
  readonly wars: readonly CampaignWarRecord[];
  /** Stable encounter snapshot. Reloads never reroll or reinterpret an active Campaign. */
  readonly commanderSchedule: CampaignCommanderSchedule;
  readonly limitedReserves?: LimitedReservesCampaignState;
}

export interface CampaignHistoryEntry {
  readonly campaignId: string;
  /** Story Chapter identity; custom post-story Campaigns use `standard`. */
  readonly mode: CampaignModeId;
  readonly modifiers: readonly CampaignModifierId[];
  readonly wars: readonly CampaignWarRecord[];
  readonly wins: number;
  readonly losses: number;
  readonly ties: number;
  readonly differential: number;
  readonly outcome: CampaignOutcome;
  readonly tokensEarned: number;
  readonly completedAt: string;
  readonly remainingReserves?: number;
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
  readonly unlockedChapterModes: readonly CampaignModeId[];
  readonly completedChapterModes: readonly CampaignModeId[];
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

export function canHumanReinforce(campaign: ActiveCampaign, deckCount: number): boolean {
  if (deckCount <= 0) return false;
  if (campaign.modifiers.includes('limited_reserves')) {
    return (campaign.limitedReserves?.remainingReserves ?? 0) > 0;
  }
  return true;
}

export function getHumanReserves(
  campaign: ActiveCampaign
): { remaining: number; max: number } | null {
  if (!campaign.modifiers.includes('limited_reserves')) return null;
  const initial = campaign.limitedReserves?.initialReserves ?? LIMITED_RESERVES_INITIAL_COUNT;
  const remaining = campaign.limitedReserves?.remainingReserves ?? 0;
  return { remaining, max: initial };
}

export function isLimitedReservesMode(campaign: ActiveCampaign): boolean {
  return campaign.modifiers.includes('limited_reserves');
}

export function isTotalWarMode(campaign: ActiveCampaign): boolean {
  return campaign.modifiers.includes('total_war');
}

export function isFogOfWarMode(campaign: ActiveCampaign): boolean {
  return campaign.modifiers.includes('fog_of_war');
}

/**
 * Authoritative information-access rule:
 * While the War is active in Fog of War mode, casualties and historical combat details are sealed.
 * Once the War resolves, the seal is lifted.
 */
export function isFogOfWarActive(
  modeOrModifiers: CampaignModeId | readonly CampaignModifierId[],
  isWarResolved: boolean
): boolean {
  const hasFog = Array.isArray(modeOrModifiers)
    ? modeOrModifiers.includes('fog_of_war')
    : modeOrModifiers === 'fog_of_war';
  return hasFog && !isWarResolved;
}

export function canInspectCasualties(
  modeOrModifiers: CampaignModeId | readonly CampaignModifierId[],
  isWarResolved: boolean
): boolean {
  return !isFogOfWarActive(modeOrModifiers, isWarResolved);
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
      mode: 'standard',
      modifiers: [],
      ordersSelected: false,
      wars: [],
      commanderSchedule: getAuthoredCommanderSchedule('standard')
    },
    recentCampaigns: [],
    unlockedChapterModes: ['standard'],
    completedChapterModes: [],
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
  now = new Date().toISOString(),
  options: { readonly grandfatherLegacyAccess?: boolean } = {}
): CampaignProgression {
  const fallback = createDefaultCampaignProgression(legacySelectedCardBackingId, now);
  if (!isRecord(value)) {
    return options.grandfatherLegacyAccess
      ? { ...fallback, unlockedChapterModes: [...CAMPAIGN_CHAPTER_ORDER] }
      : fallback;
  }

  const storedSchemaVersion = nonNegativeInteger(value['schemaVersion']);
  const usesLegacyCommanderShape = storedSchemaVersion < 2;
  const grandfatherLegacyChapters =
    options.grandfatherLegacyAccess === true || usesLegacyCommanderShape;
  const rawCurrent = isRecord(value['currentCampaign']) ? value['currentCampaign'] : null;
  const rawCampaignId = normalizeId(rawCurrent?.['campaignId']) || createProgressionId('campaign');
  const mode: CampaignModeId = isCampaignModeId(rawCurrent?.['mode'])
    ? rawCurrent['mode']
    : 'standard';
  const legacyCommanderId = isCommanderId(rawCurrent?.['commanderId'])
    ? rawCurrent['commanderId']
    : undefined;
  const currentWars = normalizeWars(rawCurrent?.['wars'], mode, legacyCommanderId)
    .slice(0, WARS_PER_CAMPAIGN - 1);
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

  // Legacy campaigns with already started wars are treated as orders confirmed.
  // Fresh/unstarted campaigns default to ordersSelected: false to trigger the briefing.
  const ordersSelected: boolean = typeof rawCurrent?.['ordersSelected'] === 'boolean'
    ? rawCurrent['ordersSelected']
    : currentWars.length > 0;

  const completedChapterModes = orderedModes([
    ...normalizeModeArray(value['completedChapterModes']),
    ...recentCampaigns.map(campaign => campaign.mode)
  ]);
  const storyComplete = CAMPAIGN_CHAPTER_ORDER.every(chapter =>
    completedChapterModes.includes(chapter)
  );
  const hasStoredModifiers = Array.isArray(rawCurrent?.['modifiers']);
  const modifiers = hasStoredModifiers
    ? normalizeModifierArray(rawCurrent?.['modifiers'])
    : ordersSelected || currentWars.length > 0
      ? legacyModifiersForMode(mode)
      : storyComplete
        ? []
        : getScriptedChapterModifiers(mode);

  let limitedReserves: LimitedReservesCampaignState | undefined;
  if (modifiers.includes('limited_reserves')) {
    const rawLr = isRecord(rawCurrent?.['limitedReserves']) ? rawCurrent['limitedReserves'] : null;
    const initial = LIMITED_RESERVES_INITIAL_COUNT;
    const remaining = rawLr && rawLr['remainingReserves'] !== undefined
      ? Math.min(initial, nonNegativeInteger(rawLr['remainingReserves']))
      : LIMITED_RESERVES_INITIAL_COUNT;
    limitedReserves = {
      initialReserves: initial,
      remainingReserves: remaining
    };
  }

  const discoveredWarIds = [
    ...currentWars.map(war => war.warId),
    ...recentCampaigns.flatMap(campaign => campaign.wars.map(war => war.warId))
  ];
  const processedWarIds = uniqueStrings([
    ...normalizeStringArray(value['processedWarIds']),
    ...discoveredWarIds
  ]).slice(-MAX_PROCESSED_WAR_IDS);

  const reachedModes = [
    mode,
    ...recentCampaigns.map(campaign => campaign.mode),
    ...completedChapterModes
  ];
  const inferredPrerequisites = reachedModes.flatMap(chapterPrerequisitesThrough);
  const unlockedChapterModes = grandfatherLegacyChapters
    ? [...CAMPAIGN_CHAPTER_ORDER]
    : orderedModes([
        'standard',
        ...normalizeModeArray(value['unlockedChapterModes']),
        ...inferredPrerequisites
      ]);

  const commanderSchedule = normalizeCommanderSchedule(
    rawCurrent?.['commanderSchedule'],
    mode,
    usesLegacyCommanderShape ? legacyCommanderId : undefined,
    Math.min(WARS_PER_CAMPAIGN, currentWars.length + 1) as CampaignWarIndex
  );

  return {
    schemaVersion: CAMPAIGN_PROGRESSION_SCHEMA_VERSION,
    currentCampaign: {
      campaignId: rawCampaignId,
      mode,
      modifiers,
      ordersSelected,
      wars: currentWars,
      commanderSchedule,
      ...(limitedReserves ? { limitedReserves } : {})
    },
    recentCampaigns,
    unlockedChapterModes,
    completedChapterModes,
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
  wars: readonly CampaignWarRecord[],
  mode: CampaignModeId = 'standard',
  remainingReserves?: number,
  modifiers: readonly CampaignModifierId[] = legacyModifiersForMode(mode)
): CampaignHistoryEntry {
  if (wars.length !== WARS_PER_CAMPAIGN) {
    throw new Error(`A Campaign requires exactly ${WARS_PER_CAMPAIGN} resolved Wars.`);
  }

  const wins = wars.filter(war => war.outcome === GameOutcome.PLAYER_WIN).length;
  const losses = wars.filter(war => war.outcome === GameOutcome.OPPONENT_WIN).length;
  const ties = wars.length - wins - losses;
  const differential = wars.reduce((sum, war) => sum + war.margin, 0);
  const outcome: CampaignOutcome =
    modifiers.includes('total_war')
      ? differential > 0
        ? 'victory'
        : differential < 0
          ? 'defeat'
          : 'draw'
      : wins > losses
        ? 'victory'
        : losses > wins
          ? 'defeat'
          : 'draw';
  const tokensEarned = outcome === 'victory' ? 1 + (differential > 0 ? 1 : 0) : 0;

  return {
    campaignId,
    mode,
    modifiers: normalizeModifierArray(modifiers),
    wars: [...wars],
    wins,
    losses,
    ties,
    differential,
    outcome,
    tokensEarned,
    completedAt: wars[wars.length - 1].completedAt,
    ...(remainingReserves !== undefined ? { remainingReserves } : {})
  };
}

function normalizeCampaignHistory(value: unknown): CampaignHistoryEntry[] {
  if (!Array.isArray(value)) return [];
  const history: CampaignHistoryEntry[] = [];
  for (const candidate of value) {
    if (!isRecord(candidate)) continue;
    const campaignId = normalizeId(candidate['campaignId']);
    const mode: CampaignModeId = isCampaignModeId(candidate['mode']) ? candidate['mode'] : 'standard';
    const legacyCommanderId = isCommanderId(candidate['commanderId'])
      ? candidate['commanderId']
      : undefined;
    const wars = normalizeWars(candidate['wars'], mode, legacyCommanderId);
    if (!campaignId || wars.length !== WARS_PER_CAMPAIGN) continue;
    const remainingReserves = candidate['remainingReserves'] !== undefined
      ? nonNegativeInteger(candidate['remainingReserves'])
      : undefined;
    const modifiers = Array.isArray(candidate['modifiers'])
      ? normalizeModifierArray(candidate['modifiers'])
      : legacyModifiersForMode(mode);
    history.push(summarizeCampaign(campaignId, wars, mode, remainingReserves, modifiers));
  }
  return history;
}

function normalizeWars(
  value: unknown,
  mode: CampaignModeId,
  legacyCommanderId?: OpponentCommanderId
): CampaignWarRecord[] {
  if (!Array.isArray(value)) return [];
  const wars: CampaignWarRecord[] = [];
  for (const candidate of value) {
    if (!isRecord(candidate)) continue;
    const warId = normalizeId(candidate['warId']);
    const outcome = normalizeGameOutcome(candidate['outcome']);
    if (!warId || !outcome) continue;
    wars.push({
      warId,
      commanderId: isCommanderId(candidate['commanderId'])
        ? candidate['commanderId']
        : legacyCommanderId ?? getAuthoredCommanderId(mode, Math.min(3, wars.length + 1) as CampaignWarIndex),
      outcome,
      margin: finiteInteger(candidate['margin']),
      playerDeckColor: normalizeDeckColor(candidate['playerDeckColor']),
      completedAt: normalizeIsoDate(candidate['completedAt'])
    });
  }
  return wars;
}

function normalizeCommanderSchedule(
  value: unknown,
  mode: CampaignModeId,
  legacyCommanderId: OpponentCommanderId | undefined,
  currentWarIndex: CampaignWarIndex
): CampaignCommanderSchedule {
  const authored = [...getAuthoredCommanderSchedule(mode)] as [
    OpponentCommanderId,
    OpponentCommanderId,
    OpponentCommanderId
  ];
  if (Array.isArray(value) && value.length === WARS_PER_CAMPAIGN) {
    const stored = value.filter(isCommanderId);
    if (stored.length === WARS_PER_CAMPAIGN) {
      return [stored[0], stored[1], stored[2]];
    }
  }
  if (legacyCommanderId) {
    authored[currentWarIndex - 1] = legacyCommanderId;
  }
  return authored;
}

function normalizeModeArray(value: unknown): CampaignModeId[] {
  return Array.isArray(value) ? value.filter(isCampaignModeId) : [];
}

export function normalizeCampaignModifiers(value: unknown): CampaignModifierId[] {
  return normalizeModifierArray(value);
}

export function serializeCampaignModifiers(
  modifiers: readonly CampaignModifierId[]
): string {
  const normalized = normalizeModifierArray(modifiers);
  return normalized.length > 0 ? normalized.join('+') : 'none';
}

function normalizeModifierArray(value: unknown): CampaignModifierId[] {
  if (!Array.isArray(value)) return [];
  const unique = new Set(value.filter(isCampaignModifierId));
  return CAMPAIGN_MODIFIER_ORDER.filter(modifier => unique.has(modifier));
}

function legacyModifiersForMode(mode: CampaignModeId): CampaignModifierId[] {
  return mode === 'standard' ? [] : [mode];
}

function orderedModes(values: readonly CampaignModeId[]): CampaignModeId[] {
  const unique = new Set(values);
  return CAMPAIGN_CHAPTER_ORDER.filter(mode => unique.has(mode));
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

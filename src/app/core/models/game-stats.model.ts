export const GAME_STATS_SCHEMA_VERSION = 1;

export const VALID_COMMANDER_IDS = [
  'quartermaster',
  'gambler',
  'analyst',
  'attritionist',
  'cornered-general'
] as const;
export type GameStatsCommanderId = typeof VALID_COMMANDER_IDS[number];

export const VALID_CAMPAIGN_KINDS = ['story', 'custom'] as const;
export type GameStatsCampaignKind = typeof VALID_CAMPAIGN_KINDS[number];

export const VALID_CAMPAIGN_MODES = [
  'standard',
  'limited_reserves',
  'fog_of_war',
  'total_war'
] as const;
export type GameStatsCampaignMode = typeof VALID_CAMPAIGN_MODES[number];

export const VALID_CAMPAIGN_MODIFIER_STACKS = [
  'none',
  'limited_reserves',
  'fog_of_war',
  'total_war',
  'limited_reserves+fog_of_war',
  'limited_reserves+total_war',
  'fog_of_war+total_war',
  'limited_reserves+fog_of_war+total_war'
] as const;
export type GameStatsCampaignModifiers = typeof VALID_CAMPAIGN_MODIFIER_STACKS[number];

export const VALID_WAR_OUTCOMES = ['player_win', 'opponent_win', 'tie'] as const;
export type GameStatsOutcome = typeof VALID_WAR_OUTCOMES[number];

/**
 * Authoritative 20 declared properties for the Google Play Games
 * repetitive stats event: war_completed.
 */
export interface WarCompletedStatsPayload {
  readonly stats_schema_version: 1;
  readonly ruleset_version: string;
  readonly app_version: string;
  readonly commander_id: GameStatsCommanderId;
  readonly campaign_kind: GameStatsCampaignKind;
  readonly campaign_mode: GameStatsCampaignMode;
  readonly campaign_modifiers: GameStatsCampaignModifiers;
  readonly campaign_war_index: 1 | 2 | 3;
  readonly reserves_at_war_start?: number;
  readonly outcome: GameStatsOutcome;
  readonly player_win: 0 | 1;
  readonly turns: number;
  readonly comeback_deficit: number;
  readonly battles: number;
  readonly deepest_battle: number;
  readonly reinforcements_sent: number;
  readonly successful_reinforcements: number;
  readonly aces_felled_by_twos: number;
  readonly war_margin: number;
  readonly anomalies_observed: number;
}

export const WAR_COMPLETED_PROPERTY_KEYS = [
  'stats_schema_version',
  'ruleset_version',
  'app_version',
  'commander_id',
  'campaign_kind',
  'campaign_mode',
  'campaign_modifiers',
  'campaign_war_index',
  'reserves_at_war_start',
  'outcome',
  'player_win',
  'turns',
  'comeback_deficit',
  'battles',
  'deepest_battle',
  'reinforcements_sent',
  'successful_reinforcements',
  'aces_felled_by_twos',
  'war_margin',
  'anomalies_observed'
] as const;

export type ValidationResult<T> =
  | { readonly valid: true; readonly data: T }
  | { readonly valid: false; readonly error: string };

function isSafeInt(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value);
}

/**
 * Validates a candidate payload against the authoritative v1 schema.
 * Rejects unknown fields, missing required fields, illegal values,
 * and invariant violations (fail-closed).
 */
export function validateWarCompletedPayload(
  candidate: unknown
): ValidationResult<WarCompletedStatsPayload> {
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
    return { valid: false, error: 'Payload must be a non-null object' };
  }

  const obj = candidate as Record<string, unknown>;
  const keys = Object.keys(obj);

  // 1. Whitelist check: no unknown properties
  for (const key of keys) {
    if (!WAR_COMPLETED_PROPERTY_KEYS.includes(key as any)) {
      return { valid: false, error: `Unknown property in payload: ${key}` };
    }
  }

  // 2. stats_schema_version
  if (obj['stats_schema_version'] !== GAME_STATS_SCHEMA_VERSION) {
    return { valid: false, error: `stats_schema_version must be 1, got ${obj['stats_schema_version']}` };
  }

  // 3. ruleset_version
  const rulesetVersion = obj['ruleset_version'];
  if (typeof rulesetVersion !== 'string' || rulesetVersion.trim().length === 0 || rulesetVersion.length > 100) {
    return { valid: false, error: 'ruleset_version must be a non-empty string <= 100 chars' };
  }

  // 4. app_version
  const appVersion = obj['app_version'];
  if (typeof appVersion !== 'string' || appVersion.trim().length === 0 || appVersion.length > 100) {
    return { valid: false, error: 'app_version must be a non-empty string <= 100 chars' };
  }

  // 5. commander_id
  const commanderId = obj['commander_id'];
  if (!VALID_COMMANDER_IDS.includes(commanderId as any)) {
    return { valid: false, error: `Invalid commander_id: ${commanderId}` };
  }

  // 6. campaign_kind
  const campaignKind = obj['campaign_kind'];
  if (!VALID_CAMPAIGN_KINDS.includes(campaignKind as any)) {
    return { valid: false, error: `Invalid campaign_kind: ${campaignKind}` };
  }

  // 7. campaign_mode
  const campaignMode = obj['campaign_mode'];
  if (!VALID_CAMPAIGN_MODES.includes(campaignMode as any)) {
    return { valid: false, error: `Invalid campaign_mode: ${campaignMode}` };
  }

  // 8. campaign_modifiers
  const campaignModifiers = obj['campaign_modifiers'];
  if (!VALID_CAMPAIGN_MODIFIER_STACKS.includes(campaignModifiers as any)) {
    return { valid: false, error: `Invalid campaign_modifiers: ${campaignModifiers}` };
  }

  // 9. campaign_war_index: 1 | 2 | 3
  const warIndex = obj['campaign_war_index'];
  if (!isSafeInt(warIndex) || warIndex < 1 || warIndex > 3) {
    return { valid: false, error: `campaign_war_index must be 1, 2, or 3, got ${warIndex}` };
  }

  // 10. reserves_at_war_start: conditional property
  const hasLimitedReserves = (campaignModifiers as string).includes('limited_reserves');
  const reservesAtStart = obj['reserves_at_war_start'];
  if (hasLimitedReserves) {
    if (!isSafeInt(reservesAtStart) || reservesAtStart < 0 || reservesAtStart > 5) {
      return {
        valid: false,
        error: `reserves_at_war_start must be integer 0..5 when limited_reserves is active, got ${reservesAtStart}`
      };
    }
  } else {
    if (reservesAtStart !== undefined) {
      return {
        valid: false,
        error: 'reserves_at_war_start must be omitted when limited_reserves is not active'
      };
    }
  }

  // 11. outcome
  const outcome = obj['outcome'];
  if (!VALID_WAR_OUTCOMES.includes(outcome as any)) {
    return { valid: false, error: `Invalid outcome: ${outcome}` };
  }

  // 12. player_win
  const playerWin = obj['player_win'];
  if (playerWin !== 0 && playerWin !== 1) {
    return { valid: false, error: `player_win must be 0 or 1, got ${playerWin}` };
  }
  if (outcome === 'player_win' && playerWin !== 1) {
    return { valid: false, error: 'player_win must be 1 when outcome is player_win' };
  }
  if (outcome !== 'player_win' && playerWin !== 0) {
    return { valid: false, error: 'player_win must be 0 when outcome is not player_win' };
  }

  // 13. turns: 1..51
  const turns = obj['turns'];
  if (!isSafeInt(turns) || turns < 1 || turns > 51) {
    return { valid: false, error: `turns must be integer 1..51, got ${turns}` };
  }

  // 14. comeback_deficit: 0 or 3..25 (1 and 2 invalid)
  const comebackDeficit = obj['comeback_deficit'];
  if (!isSafeInt(comebackDeficit)) {
    return { valid: false, error: `comeback_deficit must be a safe integer, got ${comebackDeficit}` };
  }
  if (outcome !== 'player_win' && comebackDeficit !== 0) {
    return { valid: false, error: `comeback_deficit must be 0 for non-wins, got ${comebackDeficit}` };
  }
  if (comebackDeficit !== 0 && (comebackDeficit < 3 || comebackDeficit > 25)) {
    return {
      valid: false,
      error: `comeback_deficit must be 0 or 3..25 (1 and 2 are invalid), got ${comebackDeficit}`
    };
  }

  // 15. battles: 0..turns
  const battles = obj['battles'];
  if (!isSafeInt(battles) || battles < 0 || battles > turns) {
    return { valid: false, error: `battles must be integer 0..turns (${turns}), got ${battles}` };
  }

  // 16. deepest_battle: 0..8
  const deepestBattle = obj['deepest_battle'];
  if (!isSafeInt(deepestBattle) || deepestBattle < 0 || deepestBattle > 8) {
    return { valid: false, error: `deepest_battle must be integer 0..8, got ${deepestBattle}` };
  }

  // 17. reinforcements_sent: 0..turns (and if limited reserves, <= reserves_at_war_start)
  const reinforcementsSent = obj['reinforcements_sent'];
  if (!isSafeInt(reinforcementsSent) || reinforcementsSent < 0 || reinforcementsSent > turns) {
    return {
      valid: false,
      error: `reinforcements_sent must be integer 0..turns (${turns}), got ${reinforcementsSent}`
    };
  }
  if (hasLimitedReserves && typeof reservesAtStart === 'number' && reinforcementsSent > reservesAtStart) {
    return {
      valid: false,
      error: `reinforcements_sent (${reinforcementsSent}) cannot exceed reserves_at_war_start (${reservesAtStart})`
    };
  }

  // 18. successful_reinforcements: 0..reinforcements_sent
  const successfulReinforcements = obj['successful_reinforcements'];
  if (!isSafeInt(successfulReinforcements) || successfulReinforcements < 0 || successfulReinforcements > reinforcementsSent) {
    return {
      valid: false,
      error: `successful_reinforcements must be integer 0..reinforcements_sent (${reinforcementsSent}), got ${successfulReinforcements}`
    };
  }

  // 19. aces_felled_by_twos: 0..2
  const acesFelled = obj['aces_felled_by_twos'];
  if (!isSafeInt(acesFelled) || acesFelled < 0 || acesFelled > 2) {
    return { valid: false, error: `aces_felled_by_twos must be integer 0..2, got ${acesFelled}` };
  }

  // 20. war_margin: -26..26 with sign agreement
  const warMargin = obj['war_margin'];
  if (!isSafeInt(warMargin) || warMargin < -26 || warMargin > 26) {
    return { valid: false, error: `war_margin must be integer -26..26, got ${warMargin}` };
  }
  if (outcome === 'player_win' && warMargin <= 0) {
    return { valid: false, error: `war_margin must be positive for player_win, got ${warMargin}` };
  }
  if (outcome === 'opponent_win' && warMargin >= 0) {
    return { valid: false, error: `war_margin must be negative for opponent_win, got ${warMargin}` };
  }
  if (outcome === 'tie' && warMargin !== 0) {
    return { valid: false, error: `war_margin must be 0 for tie, got ${warMargin}` };
  }

  // 21. anomalies_observed: 0..5
  const anomaliesObserved = obj['anomalies_observed'];
  if (!isSafeInt(anomaliesObserved) || anomaliesObserved < 0 || anomaliesObserved > 5) {
    return { valid: false, error: `anomalies_observed must be integer 0..5, got ${anomaliesObserved}` };
  }

  return {
    valid: true,
    data: {
      stats_schema_version: 1,
      ruleset_version: rulesetVersion,
      app_version: appVersion,
      commander_id: commanderId as GameStatsCommanderId,
      campaign_kind: campaignKind as GameStatsCampaignKind,
      campaign_mode: campaignMode as GameStatsCampaignMode,
      campaign_modifiers: campaignModifiers as GameStatsCampaignModifiers,
      campaign_war_index: warIndex as 1 | 2 | 3,
      ...(hasLimitedReserves ? { reserves_at_war_start: reservesAtStart as number } : {}),
      outcome: outcome as GameStatsOutcome,
      player_win: playerWin as 0 | 1,
      turns,
      comeback_deficit: comebackDeficit,
      battles,
      deepest_battle: deepestBattle,
      reinforcements_sent: reinforcementsSent,
      successful_reinforcements: successfulReinforcements,
      aces_felled_by_twos: acesFelled,
      war_margin: warMargin,
      anomalies_observed: anomaliesObserved
    }
  };
}

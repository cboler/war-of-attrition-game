import { WarCompletedStatsPayload } from './game-stats.model';

export type TwaMessageType =
  // Web -> Android (Achievements)
  | 'PLAY_GAMES_INIT'
  | 'PLAY_GAMES_SIGN_IN'
  | 'UNLOCK_ACHIEVEMENT'
  | 'SET_ACHIEVEMENT_STEPS'
  | 'SHOW_ACHIEVEMENTS'
  // Android -> Web (Achievements)
  | 'PLAY_GAMES_READY'
  | 'PLAY_GAMES_SIGNED_IN'
  | 'PLAY_GAMES_UNAVAILABLE'
  | 'ACHIEVEMENT_SYNCED'
  | 'ACHIEVEMENT_SYNC_FAILED'
  | 'PLAY_GAMES_PLAYER'
  // Web -> Android (Game Stats)
  | 'GAME_STATS_INIT'
  | 'RECORD_GAME_STATS'
  // Android -> Web (Game Stats)
  | 'GAME_STATS_READY'
  | 'GAME_STATS_BUFFERED'
  | 'GAME_STATS_REJECTED';

export type GameStatsRejectReason = 'invalid_payload' | 'unavailable' | 'signed_out';

export interface TwaMessagePayload {
  readonly version: 'v1';
  readonly type: TwaMessageType;
  // Achievements fields
  readonly internalAchievementId?: string;
  readonly playGamesAchievementId?: string;
  readonly currentSteps?: number;
  readonly totalSteps?: number;
  readonly error?: string;
  // Play Games player identity (Android app only; shown on the local profile, never sent anywhere)
  readonly displayName?: string;
  readonly avatarDataUrl?: string;
  // Game Stats fields
  readonly warId?: string;
  readonly payload?: WarCompletedStatsPayload;
  readonly available?: boolean;
  readonly signedIn?: boolean;
  readonly reason?: GameStatsRejectReason;
}

export const TWA_PROTOCOL_VERSION = 'v1';

/** Signed-in Play Games player as reported by the Android app. */
export interface PlayGamesPlayer {
  readonly displayName: string;
  readonly avatarDataUrl?: string;
}

/**
 * True inside the Android app, whose WebView injects `window.AttritionNative` before any page
 * script runs. (The message names above keep their TWA-era spelling; they are the wire protocol.)
 */
export function isNativeAppHost(): boolean {
  return typeof window !== 'undefined' && !!(window as { AttritionNative?: unknown }).AttritionNative;
}


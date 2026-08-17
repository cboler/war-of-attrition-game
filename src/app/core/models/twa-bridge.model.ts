export type TwaMessageType =
  // Web -> Android
  | 'PLAY_GAMES_INIT'
  | 'PLAY_GAMES_SIGN_IN'
  | 'UNLOCK_ACHIEVEMENT'
  | 'INCREMENT_ACHIEVEMENT'
  | 'SHOW_ACHIEVEMENTS'
  // Android -> Web
  | 'PLAY_GAMES_READY'
  | 'PLAY_GAMES_SIGNED_IN'
  | 'PLAY_GAMES_UNAVAILABLE'
  | 'ACHIEVEMENT_SYNCED'
  | 'ACHIEVEMENT_SYNC_FAILED';

export interface TwaMessagePayload {
  readonly version: 'v1';
  readonly type: TwaMessageType;
  readonly internalAchievementId?: string;
  readonly playGamesAchievementId?: string;
  readonly currentSteps?: number;
  readonly totalSteps?: number;
  readonly error?: string;
}

export const TWA_PROTOCOL_VERSION = 'v1';

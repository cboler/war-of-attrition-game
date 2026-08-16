import { DEFAULT_STATISTICS, GameStatistics } from './settings.model';

export type AuthProvider = 'guest' | 'google';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  provider: AuthProvider;
  isGoogleAuth: boolean;
  statistics: GameStatistics;
  createdAt: string;
  lastLoginAt: string;
}

export const DEFAULT_GUEST_PROFILE: UserProfile = {
  id: 'guest-player',
  name: 'Card Commander',
  email: 'commander@attrition.local',
  avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Commander',
  provider: 'guest',
  isGoogleAuth: false,
  statistics: { ...DEFAULT_STATISTICS },
  createdAt: new Date().toISOString(),
  lastLoginAt: new Date().toISOString()
};

import { GameStatistics } from './settings.model';

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
  statistics: {
    gamesPlayed: 0,
    gamesWon: 0,
    gamesLost: 0,
    totalTurns: 0,
    averageTurnsPerGame: 0,
    totalPlayTime: 0,
    averageGameDuration: 0,
    totalChallenges: 0,
    totalBattles: 0,
    recursiveBattles: 0,
    cardsDiscarded: 0,
    winRatePercentage: 0
  },
  createdAt: new Date().toISOString(),
  lastLoginAt: new Date().toISOString()
};

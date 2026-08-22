import { DEFAULT_STATISTICS, GameStatistics } from './settings.model';
import {
  CampaignProgression,
  createDefaultCampaignProgression
} from './progression.model';

export type AuthProvider = 'guest' | 'google';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  provider: AuthProvider;
  isGoogleAuth: boolean;
  statistics: GameStatistics;
  progression: CampaignProgression;
  createdAt: string;
  lastLoginAt: string;
}

export function createDefaultGuestProfile(selectedCardBackingId?: string): UserProfile {
  const now = new Date().toISOString();
  return {
    id: 'guest-player',
    name: 'Card Commander',
    email: 'commander@attrition.local',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Commander',
    provider: 'guest',
    isGoogleAuth: false,
    statistics: { ...DEFAULT_STATISTICS },
    progression: createDefaultCampaignProgression(selectedCardBackingId, now),
    createdAt: now,
    lastLoginAt: now
  };
}

export const DEFAULT_GUEST_PROFILE: UserProfile = createDefaultGuestProfile();

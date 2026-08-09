import { Injectable, signal, computed } from '@angular/core';
import { UserProfile, DEFAULT_GUEST_PROFILE } from '../models/user-profile.model';
import { GameStatistics } from '../models/settings.model';

const STORAGE_KEY_ACTIVE_PROFILE = 'war-of-attrition-active-profile-id';
const STORAGE_KEY_PROFILES = 'war-of-attrition-profiles';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly profilesSignal = signal<UserProfile[]>([]);
  private readonly activeProfileIdSignal = signal<string>('guest-player');

  // Computed signals
  readonly activeProfile = computed<UserProfile>(() => {
    const profiles = this.profilesSignal();
    const activeId = this.activeProfileIdSignal();
    const found = profiles.find(p => p.id === activeId);
    return found || profiles[0] || DEFAULT_GUEST_PROFILE;
  });

  readonly allProfiles = computed<UserProfile[]>(() => this.profilesSignal());
  readonly isAuthenticated = computed<boolean>(() => this.activeProfile().isGoogleAuth);
  readonly isGoogleUser = computed<boolean>(() => this.activeProfile().provider === 'google');
  readonly userStats = computed<GameStatistics>(() => this.activeProfile().statistics);

  private gisInitialized = false;
  private readonly DEFAULT_CLIENT_ID = '1058298273641-war-of-attrition-game.apps.googleusercontent.com';

  constructor() {
    this.initializeProfiles();
    this.loadGisScript();
  }

  /**
   * Dynamically load Google Identity Services SDK script
   */
  private loadGisScript(): void {
    if (typeof window === 'undefined' || document.getElementById('google-gsi-script')) {
      return;
    }
    const script = document.createElement('script');
    script.id = 'google-gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }

  /**
   * Initialize Google Identity Services (GIS) with Client ID and callback
   */
  initializeGoogleAuth(clientId?: string, callback?: (response: any) => void): void {
    const targetClientId = clientId || this.DEFAULT_CLIENT_ID;
    if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
      (window as any).google.accounts.id.initialize({
        client_id: targetClientId,
        callback: (resp: any) => {
          this.handleGoogleCredentialResponse(resp);
          if (callback) callback(resp);
        }
      });
      this.gisInitialized = true;
    }
  }

  /**
   * Handle real Google Identity Services JWT credential response
   */
  handleGoogleCredentialResponse(response: { credential: string }): UserProfile | null {
    if (!response || !response.credential) {
      return null;
    }
    try {
      // Decode JWT token payload (base64url)
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);

      return this.signInWithGoogle({
        name: payload.name || payload.given_name || 'Google User',
        email: payload.email || 'user@gmail.com',
        avatarUrl: payload.picture || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(payload.name || 'User')}`,
        googleId: payload.sub || `google-${Date.now()}`
      });
    } catch (e) {
      console.error('Failed to parse Google credential token:', e);
      return null;
    }
  }

  /**
   * Render real Google Sign-In button into container element
   */
  renderGoogleButton(element: HTMLElement, clientId?: string): void {
    if (typeof window === 'undefined') return;
    
    const checkAndRender = () => {
      if ((window as any).google?.accounts?.id) {
        this.initializeGoogleAuth(clientId);
        (window as any).google.accounts.id.renderButton(element, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          shape: 'rectangular',
          text: 'signin_with',
          logo_alignment: 'left'
        });
      } else {
        setTimeout(checkAndRender, 200);
      }
    };
    checkAndRender();
  }

  /**
   * Trigger real Google One-Tap / OAuth prompt
   */
  promptGoogleSignIn(clientId?: string): void {
    if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
      this.initializeGoogleAuth(clientId);
      (window as any).google.accounts.id.prompt();
    }
  }

  private initializeProfiles(): void {
    try {
      const savedProfilesJson = localStorage.getItem(STORAGE_KEY_PROFILES);
      let profiles: UserProfile[] = [];

      if (savedProfilesJson) {
        profiles = JSON.parse(savedProfilesJson);
      }

      if (!profiles || profiles.length === 0) {
        profiles = [{ ...DEFAULT_GUEST_PROFILE }];
      }

      this.profilesSignal.set(profiles);

      const savedActiveId = localStorage.getItem(STORAGE_KEY_ACTIVE_PROFILE);
      if (savedActiveId && profiles.some(p => p.id === savedActiveId)) {
        this.activeProfileIdSignal.set(savedActiveId);
      } else {
        this.activeProfileIdSignal.set(profiles[0].id);
      }
    } catch (e) {
      console.warn('Failed to load user profiles from localStorage:', e);
      this.profilesSignal.set([{ ...DEFAULT_GUEST_PROFILE }]);
      this.activeProfileIdSignal.set('guest-player');
    }
  }

  private persistProfiles(): void {
    try {
      localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(this.profilesSignal()));
      localStorage.setItem(STORAGE_KEY_ACTIVE_PROFILE, this.activeProfileIdSignal());
    } catch (e) {
      console.error('Failed to save user profiles to localStorage:', e);
    }
  }

  /**
   * Switch the active user profile by profile ID
   */
  switchProfile(profileId: string): void {
    if (this.profilesSignal().some(p => p.id === profileId)) {
      this.activeProfileIdSignal.set(profileId);
      this.persistProfiles();
    }
  }

  /**
   * Sign in or create Google User profile
   */
  signInWithGoogle(googleData: { name: string; email: string; avatarUrl?: string; googleId?: string }): UserProfile {
    const profiles = [...this.profilesSignal()];
    const googleId = googleData.googleId || `google-${Date.now()}`;
    let existingIndex = profiles.findIndex(p => p.email === googleData.email || p.id === googleId);

    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      // Update existing profile
      profiles[existingIndex] = {
        ...profiles[existingIndex],
        name: googleData.name,
        email: googleData.email,
        avatarUrl: googleData.avatarUrl || profiles[existingIndex].avatarUrl,
        provider: 'google',
        isGoogleAuth: true,
        lastLoginAt: now
      };
    } else {
      // Create new Google profile
      const newGoogleProfile: UserProfile = {
        id: googleId,
        name: googleData.name,
        email: googleData.email,
        avatarUrl: googleData.avatarUrl || 'https://lh3.googleusercontent.com/a/default-user',
        provider: 'google',
        isGoogleAuth: true,
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
        createdAt: now,
        lastLoginAt: now
      };
      profiles.push(newGoogleProfile);
      existingIndex = profiles.length - 1;
    }

    this.profilesSignal.set(profiles);
    this.activeProfileIdSignal.set(profiles[existingIndex].id);
    this.persistProfiles();

    return profiles[existingIndex];
  }

  /**
   * Sign out back to guest profile
   */
  signOut(): void {
    const profiles = this.profilesSignal();
    const guest = profiles.find(p => p.provider === 'guest');
    if (guest) {
      this.activeProfileIdSignal.set(guest.id);
    } else {
      const newGuest = { ...DEFAULT_GUEST_PROFILE };
      this.profilesSignal.set([newGuest, ...profiles]);
      this.activeProfileIdSignal.set(newGuest.id);
    }
    this.persistProfiles();
  }

  /**
   * Record game results into active user profile statistics
   */
  recordGameResult(params: {
    won: boolean;
    turns: number;
    durationMs: number;
    challengesCount?: number;
    battlesCount?: number;
    recursiveBattlesCount?: number;
    discardedCardsCount?: number;
  }): GameStatistics {
    const currentProfile = this.activeProfile();
    const oldStats = currentProfile.statistics || {
      gamesPlayed: 0, gamesWon: 0, gamesLost: 0, totalTurns: 0,
      averageTurnsPerGame: 0, totalPlayTime: 0, averageGameDuration: 0,
      totalChallenges: 0, totalBattles: 0, recursiveBattles: 0,
      cardsDiscarded: 0, winRatePercentage: 0
    };

    const newGamesPlayed = oldStats.gamesPlayed + 1;
    const newGamesWon = oldStats.gamesWon + (params.won ? 1 : 0);
    const newGamesLost = oldStats.gamesLost + (params.won ? 0 : 1);
    const newTotalTurns = oldStats.totalTurns + params.turns;
    const newTotalPlayTime = oldStats.totalPlayTime + params.durationMs;
    const newTotalChallenges = (oldStats.totalChallenges || 0) + (params.challengesCount || 0);
    const newTotalBattles = (oldStats.totalBattles || 0) + (params.battlesCount || 0);
    const newRecursiveBattles = (oldStats.recursiveBattles || 0) + (params.recursiveBattlesCount || 0);
    const newCardsDiscarded = (oldStats.cardsDiscarded || 0) + (params.discardedCardsCount || 0);

    const newAvgTurns = Math.round((newTotalTurns / newGamesPlayed) * 10) / 10;
    const newAvgDuration = Math.round(newTotalPlayTime / newGamesPlayed);
    const newWinRate = Math.round((newGamesWon / newGamesPlayed) * 100);

    const updatedStats: GameStatistics = {
      gamesPlayed: newGamesPlayed,
      gamesWon: newGamesWon,
      gamesLost: newGamesLost,
      totalTurns: newTotalTurns,
      averageTurnsPerGame: newAvgTurns,
      totalPlayTime: newTotalPlayTime,
      averageGameDuration: newAvgDuration,
      totalChallenges: newTotalChallenges,
      totalBattles: newTotalBattles,
      recursiveBattles: newRecursiveBattles,
      cardsDiscarded: newCardsDiscarded,
      winRatePercentage: newWinRate,
      lastPlayed: new Date().toISOString()
    };

    const updatedProfile: UserProfile = {
      ...currentProfile,
      statistics: updatedStats
    };

    const profiles = this.profilesSignal().map(p => p.id === updatedProfile.id ? updatedProfile : p);
    this.profilesSignal.set(profiles);
    this.persistProfiles();

    return updatedStats;
  }

  /**
   * Reset active user statistics
   */
  resetActiveUserStats(): void {
    const currentProfile = this.activeProfile();
    const resetStats: GameStatistics = {
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
    };

    const updatedProfile: UserProfile = {
      ...currentProfile,
      statistics: resetStats
    };

    const profiles = this.profilesSignal().map(p => p.id === updatedProfile.id ? updatedProfile : p);
    this.profilesSignal.set(profiles);
    this.persistProfiles();
  }

  /**
   * Update active user profile name
   */
  updateProfileName(name: string): void {
    if (!name || !name.trim()) return;
    const currentProfile = this.activeProfile();
    const updatedProfile = { ...currentProfile, name: name.trim() };

    const profiles = this.profilesSignal().map(p => p.id === updatedProfile.id ? updatedProfile : p);
    this.profilesSignal.set(profiles);
    this.persistProfiles();
  }
}

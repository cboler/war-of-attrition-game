import { Injectable, signal, computed } from '@angular/core';
import {
  UserProfile,
  DEFAULT_GUEST_PROFILE,
  createDefaultGuestProfile
} from '../models/user-profile.model';
import { GameStatistics, DEFAULT_STATISTICS } from '../models/settings.model';
import { environment } from '../../../environments/environment';
import {
  CampaignProgression,
  DEFAULT_CARD_BACKING_ID,
  normalizeCampaignProgression
} from '../models/progression.model';
import {
  HallOfValorState,
  createDefaultHallOfValor,
  normalizeHallOfValor
} from '../models/hall-of-valor.model';
import { APP_LOCAL_STORAGE_KEYS } from '../models/app-storage.model';

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
  readonly hallOfValor = computed<HallOfValorState>(() =>
    normalizeHallOfValor(this.activeProfile().hallOfValor)
  );

  private gisInitialized = false;
  private readonly DEFAULT_CLIENT_ID = environment.googleClientId || '';
  readonly isGoogleAuthConfigured = computed<boolean>(() => !!this.DEFAULT_CLIENT_ID);

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
    if (!targetClientId) return;
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
    const targetClientId = clientId || this.DEFAULT_CLIENT_ID;
    if (!targetClientId || typeof window === 'undefined') return;
    
    const checkAndRender = () => {
      if ((window as any).google?.accounts?.id) {
        this.initializeGoogleAuth(targetClientId);
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
    const targetClientId = clientId || this.DEFAULT_CLIENT_ID;
    if (!targetClientId) return;
    if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
      this.initializeGoogleAuth(targetClientId);
      (window as any).google.accounts.id.prompt();
    }
  }

  private initializeProfiles(): void {
    try {
      const legacySelectedCardBacking = this.readLegacySelectedCardBacking();
      const savedProfilesJson = localStorage.getItem(APP_LOCAL_STORAGE_KEYS.profiles);
      let profiles: UserProfile[] = [];

      if (savedProfilesJson) {
        const parsed = JSON.parse(savedProfilesJson);
        if (Array.isArray(parsed)) {
          profiles = parsed
            .filter(p => p && typeof p === 'object' && typeof p.id === 'string')
            .map(p => ({
              ...p,
              statistics: { ...DEFAULT_STATISTICS, ...(p.statistics || {}) },
              progression: normalizeCampaignProgression(
                p.progression,
                p.progression ? DEFAULT_CARD_BACKING_ID : legacySelectedCardBacking,
                undefined,
                { grandfatherLegacyAccess: !p.progression }
              ),
              hallOfValor: normalizeHallOfValor(p.hallOfValor)
            }));
        }
      }

      if (!profiles || profiles.length === 0) {
        profiles = [createDefaultGuestProfile(legacySelectedCardBacking)];
      }

      this.profilesSignal.set(profiles);

      const savedActiveId = localStorage.getItem(APP_LOCAL_STORAGE_KEYS.activeProfileId);
      if (savedActiveId && profiles.some(p => p.id === savedActiveId)) {
        this.activeProfileIdSignal.set(savedActiveId);
      } else {
        this.activeProfileIdSignal.set(profiles[0].id);
      }
    } catch (e) {
      console.warn('Failed to load user profiles from localStorage:', e);
      this.profilesSignal.set([createDefaultGuestProfile()]);
      this.activeProfileIdSignal.set('guest-player');
    }
  }

  private persistProfiles(): void {
    try {
      localStorage.setItem(APP_LOCAL_STORAGE_KEYS.profiles, JSON.stringify(this.profilesSignal()));
      localStorage.setItem(APP_LOCAL_STORAGE_KEYS.activeProfileId, this.activeProfileIdSignal());
    } catch (e) {
      console.error('Failed to save user profiles to localStorage:', e);
    }
  }

  private readLegacySelectedCardBacking(): string {
    try {
      const stored = localStorage.getItem(APP_LOCAL_STORAGE_KEYS.settings);
      if (!stored) return DEFAULT_CARD_BACKING_ID;
      const parsed = JSON.parse(stored) as { selectedCardBacking?: unknown };
      return typeof parsed.selectedCardBacking === 'string'
        ? parsed.selectedCardBacking
        : DEFAULT_CARD_BACKING_ID;
    } catch {
      return DEFAULT_CARD_BACKING_ID;
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
        statistics: { ...DEFAULT_STATISTICS },
        progression: normalizeCampaignProgression(undefined, this.readLegacySelectedCardBacking()),
        hallOfValor: createDefaultHallOfValor(),
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
      const newGuest = createDefaultGuestProfile(this.readLegacySelectedCardBacking());
      this.profilesSignal.set([newGuest, ...profiles]);
      this.activeProfileIdSignal.set(newGuest.id);
    }
    this.persistProfiles();
  }

  /**
   * Replace all local identities with one pristine guest. Unlike signOut(),
   * this clears the in-memory profile collection before it is persisted, so a
   * deleted Google-linked profile cannot be written back after storage cleanup.
   */
  deleteAllLocalProfilesAndCreateFreshGuest(): UserProfile {
    const freshGuest = createDefaultGuestProfile();
    this.profilesSignal.set([freshGuest]);
    this.activeProfileIdSignal.set(freshGuest.id);
    this.persistProfiles();
    return freshGuest;
  }

  /** Controlled persistence seam for profile-scoped Campaign/cosmetic state. */
  updateActiveProfileProgression(
    updater: (current: CampaignProgression) => CampaignProgression
  ): CampaignProgression {
    const currentProfile = this.activeProfile();
    const current = normalizeCampaignProgression(currentProfile.progression);
    const progression = normalizeCampaignProgression(updater(current));
    const updatedProfile: UserProfile = { ...currentProfile, progression };
    this.profilesSignal.update(profiles =>
      profiles.map(profile => profile.id === updatedProfile.id ? updatedProfile : profile)
    );
    this.persistProfiles();
    return progression;
  }

  /** Controlled persistence seam for profile-scoped Hall of Valor card service records. */
  updateActiveProfileHallOfValor(
    updater: (current: HallOfValorState) => HallOfValorState
  ): HallOfValorState {
    const currentProfile = this.activeProfile();
    const current = normalizeHallOfValor(currentProfile.hallOfValor);
    const hallOfValor = normalizeHallOfValor(updater(current));
    const updatedProfile: UserProfile = { ...currentProfile, hallOfValor };
    this.profilesSignal.update(profiles =>
      profiles.map(profile => profile.id === updatedProfile.id ? updatedProfile : profile)
    );
    this.persistProfiles();
    return hallOfValor;
  }

  /**
   * Record game results into active user profile statistics
   */
  recordGameResult(params: {
    outcome: 'player_win' | 'opponent_win' | 'tie';
    turns: number;
    durationMs: number;
    playerCardsRemaining?: number;
    opponentCardsRemaining?: number;
    battlesCount?: number;
    deepestBattleLayer?: number;
    maxCardsAtStake?: number;
    largestBattleLoss?: number;
    largestBattleVictory?: number;
    playerChallengesCount?: number;
    playerChallengesWon?: number;
    acesDefeatedByTwo?: number;
    twosSavedByChallenge?: number;
    acesRescuedByChallenge?: number;
    acesRescuingTwos?: number;
    acesLostInBattles?: number;
    aceAndTwoLostInSameBattle?: number;
    maxDeficitExperienced?: number;
    isComeback?: boolean;
  }): GameStatistics {
    const currentProfile = this.activeProfile();
    const oldStats: GameStatistics = { ...DEFAULT_STATISTICS, ...(currentProfile.statistics || {}) };

    const isWin = params.outcome === 'player_win';
    const isLoss = params.outcome === 'opponent_win';
    const isTie = params.outcome === 'tie';

    const newGamesPlayed = oldStats.gamesPlayed + 1;
    const newGamesWon = oldStats.gamesWon + (isWin ? 1 : 0);
    const newGamesLost = oldStats.gamesLost + (isLoss ? 1 : 0);
    const newGamesTied = oldStats.gamesTied + (isTie ? 1 : 0);
    const newTotalTurns = oldStats.totalTurns + params.turns;
    const newTotalPlayTime = oldStats.totalPlayTime + params.durationMs;

    const newWinStreak = isWin ? (oldStats.currentWinStreak || 0) + 1 : (isLoss ? 0 : oldStats.currentWinStreak);
    const newBestWinStreak = Math.max(oldStats.bestWinStreak || 0, newWinStreak);

    const newAvgTurns = Math.round((newTotalTurns / newGamesPlayed) * 10) / 10;
    const newAvgDuration = Math.round(newTotalPlayTime / newGamesPlayed);
    const newWinRate = Math.round((newGamesWon / newGamesPlayed) * 100);

    const newLongestGame = oldStats.longestGameTurns === 0
      ? params.turns
      : Math.max(oldStats.longestGameTurns, params.turns);
    const newShortestGame = oldStats.shortestGameTurns === 0
      ? params.turns
      : Math.min(oldStats.shortestGameTurns, params.turns);

    // Battles
    const newTotalBattles = (oldStats.totalBattles || 0) + (params.battlesCount || 0);
    const newMostBattlesInGame = Math.max(oldStats.mostBattlesInGame || 0, params.battlesCount || 0);
    const newDeepestBattle = Math.max(oldStats.deepestRecursiveBattle || 0, params.deepestBattleLayer || 0);
    const newMostCardsAtStake = Math.max(oldStats.mostCardsAtStake || 0, params.maxCardsAtStake || 0);
    const newMostCardsLost = Math.max(oldStats.mostCardsLostInBattle || 0, params.largestBattleLoss || 0);
    const newMostCardsDefeated = Math.max(oldStats.mostOpponentCardsDefeatedInBattle || 0, params.largestBattleVictory || 0);

    // Challenges
    const newTotalChallenges = (oldStats.totalChallenges || 0) + (params.playerChallengesCount || 0);
    const newSuccessfulChallenges = (oldStats.successfulChallenges || 0) + (params.playerChallengesWon || 0);
    const newChallengeRate = newTotalChallenges > 0 ? Math.round((newSuccessfulChallenges / newTotalChallenges) * 100) : 0;
    const newMostChallengesInGame = Math.max(oldStats.mostChallengesInGame || 0, params.playerChallengesCount || 0);
    const newMostSuccessfulChallengesInGame = Math.max(oldStats.mostSuccessfulChallengesInGame || 0, params.playerChallengesWon || 0);

    // Memorable events
    const newAcesDefeatedByTwo = (oldStats.acesDefeatedByTwo || 0) + (params.acesDefeatedByTwo || 0);
    const newTwosSaved = (oldStats.twosSavedByChallenge || 0) + (params.twosSavedByChallenge || 0);
    const newAcesRescued = (oldStats.acesRescuedByChallenge || 0) +
      (params.acesRescuedByChallenge || 0);
    const newAcesRescuingTwos = (oldStats.acesRescuingTwos || 0) +
      (params.acesRescuingTwos || 0);
    const newAcesLost = (oldStats.acesLostInBattles || 0) + (params.acesLostInBattles || 0);
    const newAceAndTwoLost = (oldStats.aceAndTwoLostInSameBattle || 0) + (params.aceAndTwoLostInSameBattle || 0);

    // Victory quality
    const cardsRemaining = params.playerCardsRemaining ?? 0;
    let newHighestRemaining = oldStats.highestCardsRemainingAtVictory || 0;
    let newLowestRemaining = oldStats.lowestCardsRemainingAtVictory || 0;
    let newOneCardWins = oldStats.winsWithOneCardRemaining || 0;
    let newComebackWins = oldStats.comebackWins || 0;
    let newLargestComeback = oldStats.largestComebackDeficit || 0;

    if (isWin) {
      newHighestRemaining = Math.max(newHighestRemaining, cardsRemaining);
      newLowestRemaining = newLowestRemaining === 0 ? cardsRemaining : Math.min(newLowestRemaining, cardsRemaining);
      if (cardsRemaining === 1) newOneCardWins++;
      if (params.isComeback) {
        newComebackWins++;
        newLargestComeback = Math.max(newLargestComeback, params.maxDeficitExperienced || 0);
      }
    }

    const updatedStats: GameStatistics = {
      ...oldStats,
      gamesPlayed: newGamesPlayed,
      gamesWon: newGamesWon,
      gamesLost: newGamesLost,
      gamesTied: newGamesTied,
      winRatePercentage: newWinRate,
      currentWinStreak: newWinStreak,
      bestWinStreak: newBestWinStreak,
      totalTurns: newTotalTurns,
      averageTurnsPerGame: newAvgTurns,
      longestGameTurns: newLongestGame,
      shortestGameTurns: newShortestGame,
      totalPlayTime: newTotalPlayTime,
      averageGameDuration: newAvgDuration,
      totalBattles: newTotalBattles,
      mostBattlesInGame: newMostBattlesInGame,
      deepestRecursiveBattle: newDeepestBattle,
      mostCardsAtStake: newMostCardsAtStake,
      mostCardsLostInBattle: newMostCardsLost,
      mostOpponentCardsDefeatedInBattle: newMostCardsDefeated,
      totalChallenges: newTotalChallenges,
      successfulChallenges: newSuccessfulChallenges,
      challengeSuccessRate: newChallengeRate,
      mostChallengesInGame: newMostChallengesInGame,
      mostSuccessfulChallengesInGame: newMostSuccessfulChallengesInGame,
      acesDefeatedByTwo: newAcesDefeatedByTwo,
      twosSavedByChallenge: newTwosSaved,
      acesRescuedByChallenge: newAcesRescued,
      acesRescuingTwos: newAcesRescuingTwos,
      acesLostInBattles: newAcesLost,
      aceAndTwoLostInSameBattle: newAceAndTwoLost,
      highestCardsRemainingAtVictory: newHighestRemaining,
      lowestCardsRemainingAtVictory: newLowestRemaining,
      winsWithOneCardRemaining: newOneCardWins,
      comebackWins: newComebackWins,
      largestComebackDeficit: newLargestComeback,
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

  /** Persist a bounded, typed patch to resettable player-facing career data. */
  updateStatistics(updates: Partial<GameStatistics>): GameStatistics {
    const currentProfile = this.activeProfile();
    const oldStats = { ...DEFAULT_STATISTICS, ...(currentProfile.statistics || {}) };
    const updatedStats: GameStatistics = {
      ...oldStats,
      ...updates,
      juggernautCardIds: updates.juggernautCardIds
        ? [...new Set(updates.juggernautCardIds.filter(id => typeof id === 'string'))].slice(-52)
        : oldStats.juggernautCardIds
    };
    const updatedProfile: UserProfile = { ...currentProfile, statistics: updatedStats };
    this.profilesSignal.update(profiles =>
      profiles.map(profile => profile.id === updatedProfile.id ? updatedProfile : profile)
    );
    this.persistProfiles();
    return updatedStats;
  }

  /** Purpose-built adapter consumed by AchievementService across War boundaries. */
  recordAchievementProgress(progress: Pick<
    GameStatistics,
    | 'currentBattleWinStreak'
    | 'bestBattleWinStreak'
    | 'currentBattleLossStreak'
    | 'bestBattleLossStreak'
    | 'juggernautOccurrences'
    | 'juggernautCardIds'
  >): GameStatistics {
    return this.updateStatistics(progress);
  }

  /**
   * Record an abandoned game without resetting win streak or adding to losses.
   */
  recordGameAbandoned(): GameStatistics {
    const currentProfile = this.activeProfile();
    const oldStats: GameStatistics = { ...DEFAULT_STATISTICS, ...(currentProfile.statistics || {}) };

    const updatedStats: GameStatistics = {
      ...oldStats,
      gamesAbandoned: (oldStats.gamesAbandoned || 0) + 1,
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
   * Unlock an achievement for the active profile
   */
  unlockAchievement(achievementId: string): void {
    const currentProfile = this.activeProfile();
    const stats = currentProfile.statistics || { ...DEFAULT_STATISTICS };
    const currentUnlocked = stats.unlockedAchievements || [];

    if (currentUnlocked.includes(achievementId)) return;

    const newUnlocked = [...currentUnlocked, achievementId];
    const newDetails = [
      ...(stats.unlockedAchievementDetails || []),
      { id: achievementId, unlockedAt: new Date().toISOString() }
    ];

    const updatedStats: GameStatistics = {
      ...stats,
      unlockedAchievements: newUnlocked,
      unlockedAchievementDetails: newDetails
    };

    const updatedProfile: UserProfile = {
      ...currentProfile,
      statistics: updatedStats
    };

    const profiles = this.profilesSignal().map(p => p.id === updatedProfile.id ? updatedProfile : p);
    this.profilesSignal.set(profiles);
    this.persistProfiles();
  }

  /**
   * Reset active user statistics and Hall of Valor career records
   */
  resetActiveUserStats(): void {
    const currentProfile = this.activeProfile();
    const updatedProfile: UserProfile = {
      ...currentProfile,
      statistics: { ...DEFAULT_STATISTICS },
      hallOfValor: createDefaultHallOfValor()
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

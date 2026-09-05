import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { DEFAULT_STATISTICS } from '../models/settings.model';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created with default guest profile and full DEFAULT_STATISTICS', () => {
    expect(service).toBeTruthy();
    expect(service.activeProfile().name).toBe('Card Commander');
    expect(service.isAuthenticated()).toBe(false);
    expect(service.userStats().gamesPlayed).toBe(0);
    expect(service.userStats().gamesAbandoned).toBe(0);
    expect(service.userStats().unlockedAchievements).toEqual([]);
    expect(service.userStats().currentWinStreak).toBe(0);
  });

  it('should correctly normalize and deep-merge legacy stored profile statistics', () => {
    // Simulate legacy profile stored before the new stats/achievements schema
    const legacyProfile = [{
      id: 'legacy-user-1',
      name: 'Old Veteran',
      avatarUrl: 'https://example.com/avatar.jpg',
      provider: 'guest',
      statistics: {
        gamesPlayed: 10,
        gamesWon: 7,
        gamesLost: 3,
        totalTurns: 150
      }
    }];
    localStorage.setItem('war-of-attrition-profiles', JSON.stringify(legacyProfile));
    localStorage.setItem('war-of-attrition-active-profile-id', 'legacy-user-1');

    // Create a new instance to test constructor initialization
    const freshService = new AuthService();

    const stats = freshService.userStats();
    // Preserves old values
    expect(stats.gamesPlayed).toBe(10);
    expect(stats.gamesWon).toBe(7);
    expect(stats.gamesLost).toBe(3);
    expect(stats.totalTurns).toBe(150);

    // Normalizes newly introduced fields with default values without undefined errors
    expect(stats.gamesAbandoned).toBe(0);
    expect(stats.gamesTied).toBe(0);
    expect(stats.currentWinStreak).toBe(0);
    expect(stats.bestWinStreak).toBe(0);
    expect(stats.unlockedAchievements).toEqual([]);
    expect(stats.acesDefeatedByTwo).toBe(0);
    expect(stats.twosSavedByChallenge).toBe(0);
    expect(stats.acesRescuedByChallenge).toBe(0);
    expect(stats.acesRescuingTwos).toBe(0);
    expect(stats.currentBattleWinStreak).toBe(0);
    expect(stats.currentBattleLossStreak).toBe(0);
    expect(stats.juggernautOccurrences).toBe(0);
    expect(stats.juggernautCardIds).toEqual([]);
    expect(stats.campaignsCompleted).toBe(0);
    expect(stats.comebackWins).toBe(0);
  });

  it('should migrate the legacy selected backing into each legacy profile entitlement', () => {
    localStorage.setItem('war-of-attrition-settings', JSON.stringify({
      selectedCardBacking: 'royal-purple'
    }));
    localStorage.setItem('war-of-attrition-profiles', JSON.stringify([{
      id: 'legacy-cosmetic-user',
      name: 'Veteran',
      email: '',
      avatarUrl: '',
      provider: 'guest',
      isGoogleAuth: false,
      statistics: {},
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    }]));

    const freshService = new AuthService();
    const progression = freshService.activeProfile().progression;

    expect(progression.schemaVersion).toBe(3);
    expect(progression.selectedCosmetics.cardBackingId).toBe('royal-purple');
    expect(progression.unlockedCosmetics).toContain(jasmine.objectContaining({
      cosmeticId: 'royal-purple',
      reason: 'legacy_selected'
    }));
  });

  it('should sign in with Google data and update signals', () => {
    const profile = service.signInWithGoogle({
      name: 'Ace Strategist',
      email: 'ace@example.com',
      avatarUrl: 'https://example.com/avatar.jpg'
    });

    expect(profile.name).toBe('Ace Strategist');
    expect(service.isAuthenticated()).toBe(true);
    expect(service.isGoogleUser()).toBe(true);
    expect(service.activeProfile().email).toBe('ace@example.com');
  });

  it('should record game results accurately and calculate win rate % and streaks', () => {
    service.recordGameResult({
      outcome: 'player_win',
      turns: 25,
      durationMs: 45000,
      playerChallengesCount: 3,
      playerChallengesWon: 2,
      battlesCount: 1,
      deepestBattleLayer: 2,
      playerCardsRemaining: 14,
      largestBattleVictory: 8,
      acesRescuedByChallenge: 2,
      acesRescuingTwos: 1
    });

    let stats = service.userStats();
    expect(stats.gamesPlayed).toBe(1);
    expect(stats.gamesWon).toBe(1);
    expect(stats.currentWinStreak).toBe(1);
    expect(stats.bestWinStreak).toBe(1);
    expect(stats.winRatePercentage).toBe(100);
    expect(stats.totalTurns).toBe(25);
    expect(stats.totalChallenges).toBe(3);
    expect(stats.successfulChallenges).toBe(2);
    expect(stats.challengeSuccessRate).toBe(67);
    expect(stats.totalBattles).toBe(1);
    expect(stats.highestCardsRemainingAtVictory).toBe(14);
    expect(stats.acesRescuedByChallenge).toBe(2);
    expect(stats.acesRescuingTwos).toBe(1);

    // Record second game (win) -> streak should be 2
    service.recordGameResult({
      outcome: 'player_win',
      turns: 15,
      durationMs: 25000,
      playerCardsRemaining: 1
    });

    stats = service.userStats();
    expect(stats.gamesPlayed).toBe(2);
    expect(stats.gamesWon).toBe(2);
    expect(stats.currentWinStreak).toBe(2);
    expect(stats.bestWinStreak).toBe(2);
    expect(stats.winsWithOneCardRemaining).toBe(1);

    // Record third game (loss) -> win streak resets to 0, bestWinStreak stays 2
    service.recordGameResult({
      outcome: 'opponent_win',
      turns: 35,
      durationMs: 55000,
      playerChallengesCount: 4,
      battlesCount: 2,
      largestBattleLoss: 6
    });

    stats = service.userStats();
    expect(stats.gamesPlayed).toBe(3);
    expect(stats.gamesWon).toBe(2);
    expect(stats.gamesLost).toBe(1);
    expect(stats.currentWinStreak).toBe(0);
    expect(stats.bestWinStreak).toBe(2);
    expect(stats.winRatePercentage).toBe(67);
  });

  it('should handle game abandonment without resetting win streak or incrementing losses', () => {
    // Win a game first
    service.recordGameResult({
      outcome: 'player_win',
      turns: 20,
      durationMs: 30000
    });

    expect(service.userStats().currentWinStreak).toBe(1);
    expect(service.userStats().gamesLost).toBe(0);

    // Abandon next game
    service.recordGameAbandoned();

    const stats = service.userStats();
    expect(stats.gamesAbandoned).toBe(1);
    expect(stats.gamesPlayed).toBe(1); // not incremented
    expect(stats.gamesLost).toBe(0); // not a loss
    expect(stats.currentWinStreak).toBe(1); // NOT reset!
  });

  it('should handle tied games correctly preserving streaks and updating total ties', () => {
    service.recordGameResult({
      outcome: 'player_win',
      turns: 20,
      durationMs: 30000
    });

    expect(service.userStats().currentWinStreak).toBe(1);

    // Record tie game
    service.recordGameResult({
      outcome: 'tie',
      turns: 40,
      durationMs: 50000
    });

    const stats = service.userStats();
    expect(stats.gamesPlayed).toBe(2);
    expect(stats.gamesTied).toBe(1);
    expect(stats.gamesWon).toBe(1);
    expect(stats.gamesLost).toBe(0);
    expect(stats.currentWinStreak).toBe(1); // preserved on tie
  });

  it('should unlock achievements without duplicates', () => {
    service.unlockAchievement('war.assassin');
    expect(service.userStats().unlockedAchievements).toContain('war.assassin');

    // Duplicate call
    service.unlockAchievement('war.assassin');
    expect(service.userStats().unlockedAchievements.length).toBe(1);
  });

  it('should sign out back to guest profile', () => {
    service.signInWithGoogle({ name: 'User 1', email: 'user1@example.com' });
    expect(service.isAuthenticated()).toBe(true);

    service.signOut();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.activeProfile().provider).toBe('guest');
  });

  it('should reset active user stats', () => {
    service.recordGameResult({ outcome: 'player_win', turns: 20, durationMs: 30000 });
    expect(service.userStats().gamesPlayed).toBe(1);

    service.resetActiveUserStats();
    expect(service.userStats().gamesPlayed).toBe(0);
    expect(service.userStats().winRatePercentage).toBe(0);
    expect(service.activeProfile().progression).toBeTruthy();
  });

  it('should atomically replace all profiles with a fresh guest for local deletion', () => {
    service.signInWithGoogle({
      name: 'Delete Me',
      email: 'delete-me@example.com',
      googleId: 'google-delete-me'
    });

    const guest = service.deleteAllLocalProfilesAndCreateFreshGuest();
    const persisted = JSON.parse(localStorage.getItem('war-of-attrition-profiles') || '[]');

    expect(guest.provider).toBe('guest');
    expect(service.allProfiles().length).toBe(1);
    expect(persisted.length).toBe(1);
    expect(JSON.stringify(persisted)).not.toContain('delete-me@example.com');
  });

  it('persists Battle streak and physical Juggernaut history through the typed adapter', () => {
    service.recordAchievementProgress({
      currentBattleWinStreak: 5,
      bestBattleWinStreak: 7,
      currentBattleLossStreak: 0,
      bestBattleLossStreak: 3,
      juggernautOccurrences: 2,
      juggernautCardIds: ['hearts-A', 'hearts-A', 'spades-K']
    });

    const freshService = new AuthService();
    expect(freshService.userStats().currentBattleWinStreak).toBe(5);
    expect(freshService.userStats().bestBattleLossStreak).toBe(3);
    expect(freshService.userStats().juggernautOccurrences).toBe(2);
    expect(freshService.userStats().juggernautCardIds).toEqual(['hearts-A', 'spades-K']);
  });

  it('should initialize with empty Hall of Valor state and normalize legacy stored profiles', () => {
    expect(service.hallOfValor()).toEqual({ records: {} });

    // Stored legacy profile without hallOfValor field
    localStorage.setItem('war-of-attrition-profiles', JSON.stringify([{
      id: 'legacy-user-hov',
      name: 'Old Commander',
      provider: 'guest',
      statistics: {}
    }]));

    const freshService = new AuthService();
    expect(freshService.hallOfValor()).toEqual({ records: {} });
  });

  it('should update and persist Hall of Valor data for the active profile', () => {
    service.updateActiveProfileHallOfValor(current => ({
      records: {
        ...current.records,
        'diamonds-2': {
          cardId: 'diamonds-2',
          confirmedCasualties: 5,
          aceAssassinations: 2,
          reinforcementRescues: 1,
          timesRescued: 0,
          battleLayersSurvived: 1,
          victoriousWarsSurvived: 3,
          juggernautCitations: 1,
          notableLosses: { 'spades-A': 1 }
        }
      }
    }));

    expect(service.hallOfValor().records['diamonds-2'].confirmedCasualties).toBe(5);
    expect(service.hallOfValor().records['diamonds-2'].aceAssassinations).toBe(2);

    // Verify persistence across new instance
    const freshService = new AuthService();
    expect(freshService.hallOfValor().records['diamonds-2'].confirmedCasualties).toBe(5);
  });

  it('should isolate Hall of Valor records between guest and Google profiles', () => {
    // Add record to guest
    service.updateActiveProfileHallOfValor(() => ({
      records: {
        'hearts-A': {
          cardId: 'hearts-A',
          confirmedCasualties: 10,
          aceAssassinations: 0,
          reinforcementRescues: 0,
          timesRescued: 0,
          battleLayersSurvived: 0,
          victoriousWarsSurvived: 1,
          juggernautCitations: 0,
          notableLosses: {}
        }
      }
    }));

    // Switch to Google user
    service.signInWithGoogle({ name: 'Google Player', email: 'gplayer@example.com' });
    expect(service.hallOfValor().records['hearts-A']).toBeUndefined();

    // Add record to Google user
    service.updateActiveProfileHallOfValor(() => ({
      records: {
        'spades-K': {
          cardId: 'spades-K',
          confirmedCasualties: 8,
          aceAssassinations: 0,
          reinforcementRescues: 2,
          timesRescued: 0,
          battleLayersSurvived: 0,
          victoriousWarsSurvived: 2,
          juggernautCitations: 1,
          notableLosses: {}
        }
      }
    }));
    expect(service.hallOfValor().records['spades-K'].confirmedCasualties).toBe(8);

    // Switch back to guest
    service.signOut();
    expect(service.hallOfValor().records['hearts-A'].confirmedCasualties).toBe(10);
    expect(service.hallOfValor().records['spades-K']).toBeUndefined();
  });

  it('should clear Hall of Valor records when resetting active user stats', () => {
    service.updateActiveProfileHallOfValor(() => ({
      records: {
        'clubs-Q': {
          cardId: 'clubs-Q',
          confirmedCasualties: 4,
          aceAssassinations: 0,
          reinforcementRescues: 1,
          timesRescued: 0,
          battleLayersSurvived: 0,
          victoriousWarsSurvived: 1,
          juggernautCitations: 0,
          notableLosses: {}
        }
      }
    }));

    expect(service.hallOfValor().records['clubs-Q']).toBeDefined();

    service.resetActiveUserStats();
    expect(service.hallOfValor().records).toEqual({});
  });
});

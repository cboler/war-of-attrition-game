import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

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

  it('should be created with default guest profile', () => {
    expect(service).toBeTruthy();
    expect(service.activeProfile().name).toBe('Card Commander');
    expect(service.isAuthenticated()).toBe(false);
    expect(service.userStats().gamesPlayed).toBe(0);
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
      largestBattleVictory: 8
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
  });
});

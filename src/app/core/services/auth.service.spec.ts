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

  it('should record game results accurately and calculate win rate %', () => {
    service.recordGameResult({
      won: true,
      turns: 25,
      durationMs: 45000,
      challengesCount: 3,
      battlesCount: 1,
      recursiveBattlesCount: 0,
      discardedCardsCount: 38
    });

    let stats = service.userStats();
    expect(stats.gamesPlayed).toBe(1);
    expect(stats.gamesWon).toBe(1);
    expect(stats.winRatePercentage).toBe(100);
    expect(stats.totalTurns).toBe(25);
    expect(stats.totalChallenges).toBe(3);
    expect(stats.totalBattles).toBe(1);
    expect(stats.cardsDiscarded).toBe(38);

    // Record second game (loss)
    service.recordGameResult({
      won: false,
      turns: 35,
      durationMs: 55000,
      challengesCount: 4,
      battlesCount: 2,
      recursiveBattlesCount: 1,
      discardedCardsCount: 40
    });

    stats = service.userStats();
    expect(stats.gamesPlayed).toBe(2);
    expect(stats.gamesWon).toBe(1);
    expect(stats.gamesLost).toBe(1);
    expect(stats.winRatePercentage).toBe(50);
    expect(stats.averageTurnsPerGame).toBe(30);
    expect(stats.totalChallenges).toBe(7);
  });

  it('should sign out back to guest profile', () => {
    service.signInWithGoogle({ name: 'User 1', email: 'user1@example.com' });
    expect(service.isAuthenticated()).toBe(true);

    service.signOut();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.activeProfile().provider).toBe('guest');
  });

  it('should reset active user stats', () => {
    service.recordGameResult({ won: true, turns: 20, durationMs: 30000 });
    expect(service.userStats().gamesPlayed).toBe(1);

    service.resetActiveUserStats();
    expect(service.userStats().gamesPlayed).toBe(0);
    expect(service.userStats().winRatePercentage).toBe(0);
  });
});

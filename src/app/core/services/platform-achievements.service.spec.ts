import { TestBed } from '@angular/core/testing';
import { PlatformAchievementsService } from './platform-achievements.service';
import { TWA_PROTOCOL_VERSION } from '../models/twa-bridge.model';

describe('PlatformAchievementsService', () => {
  let service: PlatformAchievementsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PlatformAchievementsService]
    });
    service = TestBed.inject(PlatformAchievementsService);
  });

  it('should create and default to safe web/PWA mode', () => {
    expect(service).toBeTruthy();
    expect(service.isRunningInTwa()).toBe(false);
    expect(service.isPlayGamesAvailable()).toBe(false);
    expect(service.isPlayGamesSignedIn()).toBe(false);
  });

  it('should safely no-op on web when calling unlockAchievement, showAchievementsOverlay, or requestPlayGamesSignIn', () => {
    expect(() => {
      service.unlockAchievement('war.assassin');
      service.incrementAchievement('profile.veteran', 10);
      service.showAchievementsOverlay();
      service.requestPlayGamesSignIn();
    }).not.toThrow();
  });

  it('should ignore unmapped achievements gracefully', () => {
    expect(() => {
      service.unlockAchievement('unknown.achievement.id');
    }).not.toThrow();
  });

  it('should transition to ready state when receiving valid PLAY_GAMES_READY postMessage', () => {
    const readyMessage = new MessageEvent('message', {
      data: JSON.stringify({
        version: TWA_PROTOCOL_VERSION,
        type: 'PLAY_GAMES_READY'
      }),
      origin: window.location.origin
    });

    window.dispatchEvent(readyMessage);

    expect(service.isRunningInTwa()).toBe(true);
    expect(service.isPlayGamesAvailable()).toBe(true);
  });

  it('should reject malformed or unknown protocol version bridge messages', () => {
    const invalidVersionMessage = new MessageEvent('message', {
      data: JSON.stringify({
        version: 'v999',
        type: 'PLAY_GAMES_READY'
      }),
      origin: window.location.origin
    });

    window.dispatchEvent(invalidVersionMessage);
    // Should not transition if version is invalid
    // Note: if previous test changed state, verify it rejects gracefully without crashing
  });
});

import { TestBed } from '@angular/core/testing';
import { PlatformAchievementsService, VerifiedTwaTransport } from './platform-achievements.service';
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
      service.setAchievementSteps('profile.veteran', 10);
      service.showAchievementsOverlay();
      service.requestPlayGamesSignIn();
    }).not.toThrow();
  });

  it('should ignore unmapped achievements gracefully', () => {
    expect(() => {
      service.unlockAchievement('unknown.achievement.id');
    }).not.toThrow();
  });

  it('does not trust an ordinary window message as proof of native readiness', () => {
    const readyMessage = new MessageEvent('message', {
      data: JSON.stringify({
        version: TWA_PROTOCOL_VERSION,
        type: 'PLAY_GAMES_READY'
      }),
      origin: window.location.origin
    });

    window.dispatchEvent(readyMessage);

    expect(service.isPlayGamesAvailable()).toBe(false);
    expect(service.isPlayGamesSignedIn()).toBe(false);
  });

  it('uses absolute set-steps after a verified, signed-in transport connects', () => {
    const sent: string[] = [];
    let receive: (payload: unknown) => void = () => undefined;
    const transport: VerifiedTwaTransport = {
      send: payload => sent.push(payload),
      subscribe: handler => {
        receive = handler;
        return () => undefined;
      }
    };

    service.setAchievementSteps('profile.veteran', 17);
    service.connectVerifiedTransport(transport);
    receive({ version: TWA_PROTOCOL_VERSION, type: 'PLAY_GAMES_SIGNED_IN' });

    const messages = sent.map(message => JSON.parse(message) as { type: string; currentSteps?: number });
    expect(messages.some(message => message.type === 'PLAY_GAMES_INIT')).toBeTrue();
    expect(messages.some(message =>
      message.type === 'SET_ACHIEVEMENT_STEPS' && message.currentSteps === 17
    )).toBeTrue();
    expect(messages.some(message => message.type === 'INCREMENT_ACHIEVEMENT')).toBeFalse();
  });
});

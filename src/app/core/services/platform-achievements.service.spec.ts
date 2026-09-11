import { TestBed } from '@angular/core/testing';
import { PlatformAchievementsService, VerifiedTwaTransport } from './platform-achievements.service';
import { TWA_PROTOCOL_VERSION } from '../models/twa-bridge.model';
import { PLAY_ACHIEVEMENT_MAPPINGS } from '../models/play-achievements-map';

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
    expect(service.getPendingUnlocks().length).toBe(0);
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

  it('queues standard achievement unlock before transport connects', () => {
    service.unlockAchievement('war.first_casualty');

    expect(service.getPendingUnlocks()).toEqual(['war.first_casualty']);
    expect(service.isPlayGamesAvailable()).toBe(false);
    expect(service.isPlayGamesSignedIn()).toBe(false);
  });

  it('connects verified transport and emits PLAY_GAMES_INIT', () => {
    const sent: string[] = [];
    const transport: VerifiedTwaTransport = {
      send: payload => sent.push(payload),
      subscribe: () => () => undefined
    };

    service.connectVerifiedTransport(transport);

    expect(service.isRunningInTwa()).toBe(true);
    expect(sent.length).toBe(1);
    const parsed = JSON.parse(sent[0]) as { type: string; version: string };
    expect(parsed.type).toBe('PLAY_GAMES_INIT');
    expect(parsed.version).toBe(TWA_PROTOCOL_VERSION);
  });

  it('handles PLAY_GAMES_READY without clearing queued unlocks', () => {
    const sent: string[] = [];
    let receive: (payload: unknown) => void = () => undefined;
    const transport: VerifiedTwaTransport = {
      send: payload => sent.push(payload),
      subscribe: handler => {
        receive = handler;
        return () => undefined;
      }
    };

    service.unlockAchievement('war.first_casualty');
    service.connectVerifiedTransport(transport);
    sent.length = 0; // Clear PLAY_GAMES_INIT

    receive({ version: TWA_PROTOCOL_VERSION, type: 'PLAY_GAMES_READY' });

    expect(service.isPlayGamesAvailable()).toBe(true);
    expect(service.isPlayGamesSignedIn()).toBe(false);
    expect(service.getPendingUnlocks()).toEqual(['war.first_casualty']);
    expect(sent.length).toBe(0); // No unlock sent while not signed in
  });

  it('canary: war.first_casualty queues, flushes on PLAY_GAMES_SIGNED_IN with mapped ID, and clears on ACHIEVEMENT_SYNCED', () => {
    const sent: string[] = [];
    let receive: (payload: unknown) => void = () => undefined;
    const transport: VerifiedTwaTransport = {
      send: payload => sent.push(payload),
      subscribe: handler => {
        receive = handler;
        return () => undefined;
      }
    };

    // 1. Unlock war.first_casualty locally before transport exists
    service.unlockAchievement('war.first_casualty');
    expect(service.getPendingUnlocks()).toContain('war.first_casualty');

    // 2. Transport connects
    service.connectVerifiedTransport(transport);

    // 3. Native signals user is authenticated
    receive({ version: TWA_PROTOCOL_VERSION, type: 'PLAY_GAMES_SIGNED_IN' });
    expect(service.isPlayGamesSignedIn()).toBe(true);

    // 4. Pending unlock flushed with correct mapped Play Games ID
    const expectedPlayGamesId = PLAY_ACHIEVEMENT_MAPPINGS['war.first_casualty'].playGamesId;
    expect(expectedPlayGamesId).toBe('CgkIz5juh94JEAIQDA');

    const unlockMsg = sent
      .map(s => JSON.parse(s) as { type: string; internalAchievementId?: string; playGamesAchievementId?: string })
      .find(m => m.type === 'UNLOCK_ACHIEVEMENT');

    expect(unlockMsg).toBeDefined();
    expect(unlockMsg?.internalAchievementId).toBe('war.first_casualty');
    expect(unlockMsg?.playGamesAchievementId).toBe('CgkIz5juh94JEAIQDA');

    // Unlock remains tracked in pendingUnlocks while in flight
    expect(service.getPendingUnlocks()).toContain('war.first_casualty');

    // 5. Native acknowledges success via ACHIEVEMENT_SYNCED
    receive({
      version: TWA_PROTOCOL_VERSION,
      type: 'ACHIEVEMENT_SYNCED',
      internalAchievementId: 'war.first_casualty',
      playGamesAchievementId: 'CgkIz5juh94JEAIQDA'
    });

    // 6. Acknowledgement clears pending state
    expect(service.getPendingUnlocks()).not.toContain('war.first_casualty');
    expect(service.getPendingUnlocks().length).toBe(0);
  });

  it('retains pending unlock when ACHIEVEMENT_SYNC_FAILED occurs and recovers on next sign-in', () => {
    const sent: string[] = [];
    let receive: (payload: unknown) => void = () => undefined;
    const transport: VerifiedTwaTransport = {
      send: payload => sent.push(payload),
      subscribe: handler => {
        receive = handler;
        return () => undefined;
      }
    };

    service.connectVerifiedTransport(transport);
    receive({ version: TWA_PROTOCOL_VERSION, type: 'PLAY_GAMES_SIGNED_IN' });
    sent.length = 0;

    service.unlockAchievement('war.first_casualty');
    expect(sent.length).toBe(1);

    // Native reports transient network or sign-in failure
    receive({
      version: TWA_PROTOCOL_VERSION,
      type: 'ACHIEVEMENT_SYNC_FAILED',
      internalAchievementId: 'war.first_casualty',
      error: 'Network/transient failure'
    });

    // Pending unlock is NOT discarded
    expect(service.getPendingUnlocks()).toContain('war.first_casualty');

    // Subsequent re-authentication flushes the pending work again
    sent.length = 0;
    receive({ version: TWA_PROTOCOL_VERSION, type: 'PLAY_GAMES_SIGNED_IN' });

    expect(sent.some(s => {
      const parsed = JSON.parse(s) as { type: string; internalAchievementId?: string };
      return parsed.type === 'UNLOCK_ACHIEVEMENT' && parsed.internalAchievementId === 'war.first_casualty';
    })).toBeTrue();
  });

  it('updates sign-in state to false when ACHIEVEMENT_SYNC_FAILED reports sign-in required', () => {
    let receive: (payload: unknown) => void = () => undefined;
    const transport: VerifiedTwaTransport = {
      send: () => undefined,
      subscribe: handler => {
        receive = handler;
        return () => undefined;
      }
    };

    service.connectVerifiedTransport(transport);
    receive({ version: TWA_PROTOCOL_VERSION, type: 'PLAY_GAMES_SIGNED_IN' });
    expect(service.isPlayGamesSignedIn()).toBe(true);

    receive({
      version: TWA_PROTOCOL_VERSION,
      type: 'ACHIEVEMENT_SYNC_FAILED',
      internalAchievementId: 'war.first_casualty',
      error: 'Play Games sign-in required'
    });

    expect(service.isPlayGamesSignedIn()).toBe(false);
    expect(service.isPlayGamesAvailable()).toBe(true);
  });

  it('reconciles existing local unlocked achievements after late native connection', () => {
    const existingUnlocks = ['war.first_casualty', 'war.first_battle', 'war.first_win'];
    service.reconcileUnlockedAchievements(existingUnlocks);

    expect(service.getPendingUnlocks().length).toBe(3);
    expect(service.getPendingUnlocks()).toEqual(existingUnlocks);

    const sent: string[] = [];
    let receive: (payload: unknown) => void = () => undefined;
    const transport: VerifiedTwaTransport = {
      send: payload => sent.push(payload),
      subscribe: handler => {
        receive = handler;
        return () => undefined;
      }
    };

    service.connectVerifiedTransport(transport);
    receive({ version: TWA_PROTOCOL_VERSION, type: 'PLAY_GAMES_SIGNED_IN' });

    const unlockedInternalIds = sent
      .map(s => JSON.parse(s) as { type: string; internalAchievementId?: string })
      .filter(m => m.type === 'UNLOCK_ACHIEVEMENT')
      .map(m => m.internalAchievementId);

    expect(unlockedInternalIds).toEqual(existingUnlocks);

    // Sync each one
    for (const id of existingUnlocks) {
      receive({
        version: TWA_PROTOCOL_VERSION,
        type: 'ACHIEVEMENT_SYNCED',
        internalAchievementId: id
      });
    }

    expect(service.getPendingUnlocks().length).toBe(0);
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
    expect(service.getPendingProgress()['profile.veteran']).toBe(17);

    service.connectVerifiedTransport(transport);
    receive({ version: TWA_PROTOCOL_VERSION, type: 'PLAY_GAMES_SIGNED_IN' });

    const messages = sent.map(message => JSON.parse(message) as { type: string; currentSteps?: number });
    expect(messages.some(message => message.type === 'PLAY_GAMES_INIT')).toBeTrue();
    expect(messages.some(message =>
      message.type === 'SET_ACHIEVEMENT_STEPS' && message.currentSteps === 17
    )).toBeTrue();
    expect(messages.some(message => message.type === 'INCREMENT_ACHIEVEMENT')).toBeFalse();

    // Clears on ACHIEVEMENT_SYNCED
    receive({
      version: TWA_PROTOCOL_VERSION,
      type: 'ACHIEVEMENT_SYNCED',
      internalAchievementId: 'profile.veteran'
    });
    expect(service.getPendingProgress()['profile.veteran']).toBeUndefined();
  });
});

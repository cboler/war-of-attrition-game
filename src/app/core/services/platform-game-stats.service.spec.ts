import { TestBed } from '@angular/core/testing';
import { PlatformGameStatsService } from './platform-game-stats.service';
import { VerifiedTwaTransport } from './platform-achievements.service';
import { WarCompletedStatsPayload } from '../models/game-stats.model';

describe('PlatformGameStatsService', () => {
  let service: PlatformGameStatsService;
  let mockTransport: jasmine.SpyObj<VerifiedTwaTransport>;
  let transportHandler: ((payload: unknown) => void) | null;

  const samplePayload: WarCompletedStatsPayload = {
    stats_schema_version: 1,
    ruleset_version: '2026.09.1',
    app_version: '4.2.1',
    commander_id: 'quartermaster',
    campaign_kind: 'story',
    campaign_mode: 'standard',
    campaign_modifiers: 'none',
    campaign_war_index: 1,
    outcome: 'player_win',
    player_win: 1,
    turns: 10,
    comeback_deficit: 0,
    battles: 1,
    deepest_battle: 1,
    reinforcements_sent: 2,
    successful_reinforcements: 1,
    aces_felled_by_twos: 0,
    war_margin: 8
  };

  beforeEach(() => {
    transportHandler = null;
    mockTransport = {
      send: jasmine.createSpy('send'),
      subscribe: jasmine.createSpy('subscribe').and.callFake((handler) => {
        transportHandler = handler;
        return () => { transportHandler = null; };
      })
    };

    TestBed.configureTestingModule({
      providers: [PlatformGameStatsService]
    });
    service = TestBed.inject(PlatformGameStatsService);
  });

  it('starts in disconnected, unavailable, signed-out state in default browser mode', () => {
    expect(service.isGameStatsAvailable()).toBeFalse();
    expect(service.isGameStatsSignedIn()).toBeFalse();
    expect(service.canRecordGameStats()).toBeFalse();
    expect(service.recordWarCompleted('war-1', samplePayload)).toBeFalse();
    expect(mockTransport.send).not.toHaveBeenCalled();
  });

  it('sends GAME_STATS_INIT upon connecting verified transport', () => {
    service.connectVerifiedTransport(mockTransport);

    expect(mockTransport.subscribe).toHaveBeenCalled();
    expect(mockTransport.send).toHaveBeenCalledWith(JSON.stringify({
      version: 'v1',
      type: 'GAME_STATS_INIT'
    }));
  });

  it('updates availability and sign-in status on GAME_STATS_READY message', () => {
    service.connectVerifiedTransport(mockTransport);

    // Host reports ready and signed in
    transportHandler?.(JSON.stringify({
      version: 'v1',
      type: 'GAME_STATS_READY',
      available: true,
      signedIn: true
    }));

    expect(service.isGameStatsAvailable()).toBeTrue();
    expect(service.isGameStatsSignedIn()).toBeTrue();
    expect(service.canRecordGameStats()).toBeTrue();

    // Host reports ready but signed out
    transportHandler?.(JSON.stringify({
      version: 'v1',
      type: 'GAME_STATS_READY',
      available: true,
      signedIn: false
    }));

    expect(service.isGameStatsAvailable()).toBeTrue();
    expect(service.isGameStatsSignedIn()).toBeFalse();
    expect(service.canRecordGameStats()).toBeFalse();
  });

  it('sends RECORD_GAME_STATS when eligible and signed in', () => {
    service.connectVerifiedTransport(mockTransport);
    transportHandler?.(JSON.stringify({
      version: 'v1',
      type: 'GAME_STATS_READY',
      available: true,
      signedIn: true
    }));

    const result = service.recordWarCompleted('test-war-123', samplePayload);
    expect(result).toBeTrue();
    expect(mockTransport.send).toHaveBeenCalledWith(JSON.stringify({
      version: 'v1',
      type: 'RECORD_GAME_STATS',
      warId: 'test-war-123',
      payload: samplePayload
    }));
  });

  it('tracks GAME_STATS_BUFFERED receipts', () => {
    service.connectVerifiedTransport(mockTransport);
    expect(service.lastBufferedWarId()).toBeNull();

    transportHandler?.(JSON.stringify({
      version: 'v1',
      type: 'GAME_STATS_BUFFERED',
      warId: 'war-456'
    }));

    expect(service.lastBufferedWarId()).toBe('war-456');
  });

  it('tracks GAME_STATS_REJECTED receipts', () => {
    service.connectVerifiedTransport(mockTransport);
    expect(service.lastRejectedWar()).toBeNull();

    transportHandler?.(JSON.stringify({
      version: 'v1',
      type: 'GAME_STATS_REJECTED',
      warId: 'war-789',
      reason: 'invalid_payload'
    }));

    expect(service.lastRejectedWar()).toEqual({
      warId: 'war-789',
      reason: 'invalid_payload'
    });
  });

  it('safely handles transport errors and drops readiness', () => {
    service.connectVerifiedTransport(mockTransport);
    transportHandler?.(JSON.stringify({
      version: 'v1',
      type: 'GAME_STATS_READY',
      available: true,
      signedIn: true
    }));

    mockTransport.send.and.throwError('IPC transport failed');
    const result = service.recordWarCompleted('war-err', samplePayload);

    expect(result).toBeFalse();
    expect(service.isGameStatsAvailable()).toBeFalse();
    expect(service.isGameStatsSignedIn()).toBeFalse();
  });
});

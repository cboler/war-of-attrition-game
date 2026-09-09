import { TestBed } from '@angular/core/testing';
import { TwaPostMessageService } from './twa-post-message.service';
import { PlatformAchievementsService } from './platform-achievements.service';
import { PlatformGameStatsService } from './platform-game-stats.service';
import { TWA_PROTOCOL_VERSION } from '../models/twa-bridge.model';

describe('TwaPostMessageService', () => {
  let service: TwaPostMessageService;
  let achievementsService: PlatformAchievementsService;
  let gameStatsService: PlatformGameStatsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TwaPostMessageService,
        PlatformAchievementsService,
        PlatformGameStatsService,
      ],
    });
    service = TestBed.inject(TwaPostMessageService);
    achievementsService = TestBed.inject(PlatformAchievementsService);
    gameStatsService = TestBed.inject(PlatformGameStatsService);
  });

  afterEach(() => {
    service.destroy();
  });

  it('initially has no connected port and services are not connected', () => {
    expect(service.isPortConnected()).toBe(false);
    expect(achievementsService.isPlayGamesAvailable()).toBe(false);
    expect(gameStatsService.isGameStatsAvailable()).toBe(false);
  });

  it('ignores regular window messages without ports', () => {
    window.dispatchEvent(
      new MessageEvent('message', {
        data: '{"type":"PLAY_GAMES_READY","version":1}',
        origin: window.location.origin,
      })
    );

    expect(service.isPortConnected()).toBe(false);
    expect(achievementsService.isPlayGamesAvailable()).toBe(false);
    expect(gameStatsService.isGameStatsAvailable()).toBe(false);
  });

  it('rejects window messages with untrusted cross-origin origins', () => {
    const channel = new MessageChannel();
    window.dispatchEvent(
      new MessageEvent('message', {
        data: '{"type":"TWA_PORT_READY","version":1}',
        origin: 'https://malicious-domain.com',
        ports: [channel.port1],
      })
    );

    expect(service.isPortConnected()).toBe(false);
    channel.port1.close();
    channel.port2.close();
  });

  it('connects both platform services when a valid port is transferred and sends INIT messages', (done) => {
    const channel = new MessageChannel();
    const receivedMessages: any[] = [];

    channel.port2.onmessage = (e) => {
      receivedMessages.push(JSON.parse(e.data));
      if (receivedMessages.length >= 2) {
        expect(receivedMessages).toContain(
          jasmine.objectContaining({ type: 'PLAY_GAMES_INIT', version: TWA_PROTOCOL_VERSION })
        );
        expect(receivedMessages).toContain(
          jasmine.objectContaining({ type: 'GAME_STATS_INIT', version: TWA_PROTOCOL_VERSION })
        );
        channel.port1.close();
        channel.port2.close();
        done();
      }
    };

    window.dispatchEvent(
      new MessageEvent('message', {
        data: '{"type":"TWA_PORT_READY","version":1}',
        origin: window.location.origin,
        ports: [channel.port1],
      })
    );

    expect(service.isPortConnected()).toBe(true);
  });

  it('allows empty origin on window message (as native Custom Tabs dispatches)', () => {
    const channel = new MessageChannel();
    window.dispatchEvent(
      new MessageEvent('message', {
        data: '{"type":"TWA_PORT_READY","version":1}',
        origin: '',
        ports: [channel.port1],
      })
    );

    expect(service.isPortConnected()).toBe(true);
    channel.port1.close();
    channel.port2.close();
  });

  it('delivers incoming port messages to subscribers and updates service state', (done) => {
    const channel = new MessageChannel();

    window.dispatchEvent(
      new MessageEvent('message', {
        data: '{"type":"TWA_PORT_READY","version":1}',
        origin: '',
        ports: [channel.port1],
      })
    );

    channel.port2.postMessage(
      JSON.stringify({
        version: TWA_PROTOCOL_VERSION,
        type: 'PLAY_GAMES_SIGNED_IN',
      })
    );

    channel.port2.postMessage(
      JSON.stringify({
        version: TWA_PROTOCOL_VERSION,
        type: 'GAME_STATS_READY',
        available: true,
        signedIn: true,
      })
    );

    setTimeout(() => {
      expect(achievementsService.isPlayGamesAvailable()).toBe(true);
      expect(achievementsService.isPlayGamesSignedIn()).toBe(true);
      expect(gameStatsService.isGameStatsAvailable()).toBe(true);
      expect(gameStatsService.isGameStatsSignedIn()).toBe(true);
      channel.port1.close();
      channel.port2.close();
      done();
    }, 50);
  });

  it('consumes handshake message without forwarding to domain subscribers', (done) => {
    const channel = new MessageChannel();

    window.dispatchEvent(
      new MessageEvent('message', {
        data: '{"type":"TWA_PORT_READY","version":1}',
        origin: '',
        ports: [channel.port1],
      })
    );

    expect(achievementsService.isPlayGamesAvailable()).toBe(false);

    channel.port2.postMessage('{"type":"TWA_PORT_READY","version":1}');

    setTimeout(() => {
      expect(achievementsService.isPlayGamesAvailable()).toBe(false);
      channel.port1.close();
      channel.port2.close();
      done();
    }, 50);
  });

  it('handles clean port replacement/reconnection without duplicating handlers', (done) => {
    const channel1 = new MessageChannel();
    window.dispatchEvent(
      new MessageEvent('message', {
        origin: '',
        ports: [channel1.port1],
      })
    );

    const channel2 = new MessageChannel();
    const channel2Messages: any[] = [];

    channel2.port2.onmessage = (e) => {
      channel2Messages.push(JSON.parse(e.data));
    };

    window.dispatchEvent(
      new MessageEvent('message', {
        origin: '',
        ports: [channel2.port1],
      })
    );

    expect(service.isPortConnected()).toBe(true);

    channel2.port2.postMessage(
      JSON.stringify({
        version: TWA_PROTOCOL_VERSION,
        type: 'PLAY_GAMES_SIGNED_IN',
      })
    );

    setTimeout(() => {
      expect(achievementsService.isPlayGamesAvailable()).toBe(true);
      expect(channel2Messages).toContain(
        jasmine.objectContaining({ type: 'PLAY_GAMES_INIT', version: TWA_PROTOCOL_VERSION })
      );
      expect(channel2Messages).toContain(
        jasmine.objectContaining({ type: 'GAME_STATS_INIT', version: TWA_PROTOCOL_VERSION })
      );
      channel1.port1.close();
      channel1.port2.close();
      channel2.port1.close();
      channel2.port2.close();
      done();
    }, 50);
  });
});

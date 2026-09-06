import { Injectable, computed, signal } from '@angular/core';
import {
  TwaMessagePayload,
  TWA_PROTOCOL_VERSION
} from '../models/twa-bridge.model';
import { WarCompletedStatsPayload } from '../models/game-stats.model';
import { VerifiedTwaTransport } from './platform-achievements.service';

@Injectable({ providedIn: 'root' })
export class PlatformGameStatsService {
  private readonly channelEstablishedSignal = signal(false);
  private readonly isReadySignal = signal(false);
  private readonly isSignedInSignal = signal(false);
  private readonly lastBufferedWarIdSignal = signal<string | null>(null);
  private readonly lastRejectedWarIdSignal = signal<{ warId: string; reason: string } | null>(null);

  private transport: VerifiedTwaTransport | null = null;
  private unsubscribeTransport: (() => void) | null = null;

  readonly isGameStatsAvailable = computed(() =>
    this.channelEstablishedSignal() && this.isReadySignal()
  );

  readonly isGameStatsSignedIn = computed(() =>
    this.isGameStatsAvailable() && this.isSignedInSignal()
  );

  readonly lastBufferedWarId = computed(() => this.lastBufferedWarIdSignal());
  readonly lastRejectedWar = computed(() => this.lastRejectedWarIdSignal());

  connectVerifiedTransport(transport: VerifiedTwaTransport): void {
    this.unsubscribeTransport?.();
    this.transport = transport;
    this.channelEstablishedSignal.set(true);
    this.unsubscribeTransport = transport.subscribe(payload => this.handleIncomingPayload(payload));
    this.send({ version: TWA_PROTOCOL_VERSION, type: 'GAME_STATS_INIT' });
  }

  canRecordGameStats(): boolean {
    return this.isGameStatsAvailable() && this.isGameStatsSignedIn();
  }

  recordWarCompleted(warId: string, payload: WarCompletedStatsPayload): boolean {
    if (!this.canRecordGameStats() || !this.transport) {
      return false;
    }

    return this.send({
      version: TWA_PROTOCOL_VERSION,
      type: 'RECORD_GAME_STATS',
      warId,
      payload
    });
  }

  private handleIncomingPayload(data: unknown): void {
    let payload: TwaMessagePayload;
    try {
      payload = typeof data === 'string'
        ? JSON.parse(data) as TwaMessagePayload
        : data as TwaMessagePayload;
    } catch {
      return;
    }
    if (!payload || payload.version !== TWA_PROTOCOL_VERSION) return;

    switch (payload.type) {
      case 'GAME_STATS_READY':
        this.isReadySignal.set(payload.available ?? false);
        this.isSignedInSignal.set(payload.signedIn ?? false);
        break;

      case 'GAME_STATS_BUFFERED':
        if (payload.warId) {
          this.lastBufferedWarIdSignal.set(payload.warId);
        }
        break;

      case 'GAME_STATS_REJECTED':
        if (payload.warId && payload.reason) {
          this.lastRejectedWarIdSignal.set({ warId: payload.warId, reason: payload.reason });
          console.warn(`Game Stats for war ${payload.warId} rejected: ${payload.reason}`);
        }
        break;
    }
  }

  private send(payload: TwaMessagePayload): boolean {
    if (!this.transport || !this.channelEstablishedSignal()) return false;
    try {
      this.transport.send(JSON.stringify(payload));
      return true;
    } catch (error) {
      console.warn('Verified TWA transport failed for Game Stats:', error);
      this.channelEstablishedSignal.set(false);
      this.isReadySignal.set(false);
      this.isSignedInSignal.set(false);
      return false;
    }
  }
}

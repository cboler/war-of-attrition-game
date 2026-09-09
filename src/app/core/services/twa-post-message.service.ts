import { Injectable, inject, signal } from '@angular/core';
import { PlatformAchievementsService, VerifiedTwaTransport } from './platform-achievements.service';
import { PlatformGameStatsService } from './platform-game-stats.service';

/**
 * Service that listens for the native Android Browser Helper postMessage channel,
 * extracts the transferred MessagePort, and registers a VerifiedTwaTransport
 * with PlatformAchievementsService and PlatformGameStatsService.
 */
@Injectable({ providedIn: 'root' })
export class TwaPostMessageService {
  private readonly platformAchievements = inject(PlatformAchievementsService);
  private readonly platformGameStats = inject(PlatformGameStatsService);

  private readonly isPortConnectedSignal = signal(false);
  readonly isPortConnected = this.isPortConnectedSignal.asReadonly();

  private activePort: MessagePort | null = null;
  private readonly subscribers = new Set<(payload: unknown) => void>();
  private readonly windowMessageHandler = (event: MessageEvent) => this.handleWindowMessage(event);

  private readonly transport: VerifiedTwaTransport = {
    send: (payload: string) => {
      if (this.activePort) {
        this.activePort.postMessage(payload);
      }
    },
    subscribe: (handler: (payload: unknown) => void) => {
      this.subscribers.add(handler);
      return () => {
        this.subscribers.delete(handler);
      };
    },
  };

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('message', this.windowMessageHandler);
    }
  }

  /**
   * Cleans up listeners and active port.
   */
  destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('message', this.windowMessageHandler);
    }
    this.cleanupActivePort();
    this.subscribers.clear();
  }

  private handleWindowMessage(event: MessageEvent): void {
    // Validate origin: accept empty origin (dispatched by native Custom Tabs) or same origin.
    if (event.origin && typeof window !== 'undefined' && event.origin !== window.location.origin) {
      return;
    }

    // Must have transferred MessagePort(s)
    if (!event.ports || event.ports.length === 0) {
      return;
    }

    const port = event.ports[0];
    if (!port) {
      return;
    }

    this.attachPort(port);
  }

  private attachPort(port: MessagePort): void {
    this.cleanupActivePort();
    this.activePort = port;

    port.onmessage = (event: MessageEvent) => {
      this.handlePortMessage(event.data);
    };

    port.start?.();
    this.isPortConnectedSignal.set(true);

    // Register verified transport with both platform services.
    // This triggers their *_INIT messages over the verified port.
    this.platformAchievements.connectVerifiedTransport(this.transport);
    this.platformGameStats.connectVerifiedTransport(this.transport);
  }

  private handlePortMessage(data: unknown): void {
    // Consume transport-level handshake marker without forwarding to domain subscribers
    if (this.isHandshakePayload(data)) {
      return;
    }

    for (const handler of this.subscribers) {
      try {
        handler(data);
      } catch (e) {
        console.error('Error in TWA transport subscriber:', e);
      }
    }
  }

  private isHandshakePayload(data: unknown): boolean {
    if (data === '{"type":"TWA_PORT_READY","version":1}') {
      return true;
    }
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        return parsed && parsed.type === 'TWA_PORT_READY';
      } catch {
        return false;
      }
    }
    if (data && typeof data === 'object') {
      return (data as { type?: string }).type === 'TWA_PORT_READY';
    }
    return false;
  }

  private cleanupActivePort(): void {
    if (this.activePort) {
      this.activePort.onmessage = null;
      try {
        this.activePort.close();
      } catch {
        // Ignored
      }
      this.activePort = null;
    }
    this.isPortConnectedSignal.set(false);
  }
}

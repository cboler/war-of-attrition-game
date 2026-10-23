import { Injectable, inject, signal } from '@angular/core';
import { PlatformAchievementsService, VerifiedTwaTransport } from './platform-achievements.service';
import { PlatformGameStatsService } from './platform-game-stats.service';
import { TWA_PROTOCOL_VERSION } from '../models/twa-bridge.model';

/** Object injected by an Android WebView host via `addWebMessageListener` (spike). */
export interface AttritionNativeBridge {
  postMessage(message: string): void;
  onmessage: ((event: { data: unknown }) => void) | null;
}

declare global {
  interface Window {
    __warOfAttritionTwaPort?: MessagePort | null;
    AttritionNative?: AttritionNativeBridge;
  }
}

/**
 * Connects the web app to the Android app's native Play Games and Game Stats bridges.
 *
 * The Android app (a WebView) injects `window.AttritionNative` before page scripts run; this
 * service says hello over it and registers a VerifiedTwaTransport with both platform services.
 * The MessagePort path below is kept for Trusted Web Activity hosts (Android builds before
 * 4.4.1); it is inert in browsers. Names keep their TWA-era spelling as the shared protocol.
 */
@Injectable({ providedIn: 'root' })
export class TwaPostMessageService {
  private readonly platformAchievements = inject(PlatformAchievementsService);
  private readonly platformGameStats = inject(PlatformGameStatsService);

  private readonly isPortConnectedSignal = signal(false);
  readonly isPortConnected = this.isPortConnectedSignal.asReadonly();

  private activePort: MessagePort | null = null;
  private nativeBridge: AttritionNativeBridge | null = null;
  private nativeReady = false;
  private helloTimer: ReturnType<typeof setTimeout> | null = null;
  private static readonly HELLO_RETRY_MS = 1500;
  private static readonly HELLO_RETRIES = 3;
  private readonly subscribers = new Set<(payload: unknown) => void>();
  private readonly windowMessageHandler = (event: MessageEvent) => this.handleWindowMessage(event);

  private readonly transport: VerifiedTwaTransport = {
    send: (payload: string) => {
      if (this.activePort) {
        this.activePort.postMessage(payload);
      } else if (this.nativeBridge) {
        this.nativeBridge.postMessage(payload);
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
      // A WebView host injects its bridge before any page script runs.
      if (window.AttritionNative) {
        this.attachNativeBridge(window.AttritionNative);
        return;
      }
      window.addEventListener('message', this.windowMessageHandler);
      const bootstrapPort = window.__warOfAttritionTwaPort;
      if (bootstrapPort) {
        window.__warOfAttritionTwaPort = null;
        this.attachPort(bootstrapPort);
      }
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
    if (this.helloTimer) {
      clearTimeout(this.helloTimer);
      this.helloTimer = null;
    }
    if (this.nativeBridge) {
      this.nativeBridge.onmessage = null;
      this.nativeBridge = null;
    }
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

    window.__warOfAttritionTwaPort = null;
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

  private attachNativeBridge(bridge: AttritionNativeBridge): void {
    this.cleanupActivePort();
    this.nativeBridge = bridge;
    this.nativeReady = false;
    bridge.onmessage = (event) => this.handlePortMessage(event.data);
    // The hello tells the host this document is listening; it replies TWA_PORT_READY. If that
    // reply never comes (the host was still attaching), say hello again a few times.
    this.sayHello(TwaPostMessageService.HELLO_RETRIES);
    this.isPortConnectedSignal.set(true);
    this.platformAchievements.connectVerifiedTransport(this.transport);
    this.platformGameStats.connectVerifiedTransport(this.transport);
  }

  private sayHello(retriesLeft: number): void {
    if (!this.nativeBridge || this.nativeReady) return;
    this.nativeBridge.postMessage(JSON.stringify({ version: TWA_PROTOCOL_VERSION, type: 'TWA_PORT_HANDSHAKE' }));
    if (retriesLeft > 0) {
      this.helloTimer = setTimeout(() => this.sayHello(retriesLeft - 1), TwaPostMessageService.HELLO_RETRY_MS);
    }
  }

  private handlePortMessage(data: unknown): void {
    // Consume transport-level handshake marker without forwarding to domain subscribers
    if (this.isHandshakePayload(data)) {
      this.nativeReady = true;
      if (this.helloTimer) {
        clearTimeout(this.helloTimer);
        this.helloTimer = null;
      }
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

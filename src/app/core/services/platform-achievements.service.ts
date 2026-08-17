import { Injectable, signal, computed } from '@angular/core';
import { TwaMessagePayload, TWA_PROTOCOL_VERSION } from '../models/twa-bridge.model';
import { PLAY_ACHIEVEMENT_MAPPINGS, PlayAchievementMapping } from '../models/play-achievements-map';

@Injectable({
  providedIn: 'root'
})
export class PlatformAchievementsService {
  private readonly isAndroidTwaSignal = signal<boolean>(false);
  private readonly isPlayGamesReadySignal = signal<boolean>(false);
  private readonly isPlayGamesSignedInSignal = signal<boolean>(false);
  private readonly pendingSyncQueue = signal<string[]>([]);
  private readonly allowedOrigins = new Set<string>([
    'https://cboler.github.io',
    'http://localhost:4200',
    'http://127.0.0.1:4200'
  ]);

  readonly isPlayGamesAvailable = computed(() => this.isPlayGamesReadySignal());
  readonly isPlayGamesSignedIn = computed(() => this.isPlayGamesSignedInSignal());
  readonly isRunningInTwa = computed(() => this.isAndroidTwaSignal());

  constructor() {
    this.detectEnvironmentAndSetupBridge();
  }

  private detectEnvironmentAndSetupBridge(): void {
    if (typeof window === 'undefined') return;

    // Check TWA indication via URL parameter or standalone context
    const urlParams = new URLSearchParams(window.location.search);
    const twaFlag = urlParams.get('twa') === '1';
    const hasAndroidBridge = typeof (window as any).AndroidPlayGamesBridge !== 'undefined';

    if (twaFlag || hasAndroidBridge) {
      this.isAndroidTwaSignal.set(true);
    }

    // Listen for postMessage from Android Custom Tabs host
    window.addEventListener('message', (event: MessageEvent) => {
      this.handleIncomingMessage(event);
    });

    // Request Play Games initialization from host if in TWA
    if (this.isAndroidTwaSignal()) {
      this.sendTwaMessage({
        version: TWA_PROTOCOL_VERSION,
        type: 'PLAY_GAMES_INIT'
      });
    }
  }

  private handleIncomingMessage(event: MessageEvent): void {
    // Validate origin if origin is provided (allow local/same origin or github.io)
    if (event.origin && !this.allowedOrigins.has(event.origin) && event.origin !== window.location.origin) {
      // In TWA Custom Tabs postMessage channel, origin can be empty string or target origin
      if (event.origin !== '') {
        console.warn('Rejected postMessage from unauthorized origin:', event.origin);
        return;
      }
    }

    let payload: TwaMessagePayload;
    if (typeof event.data === 'string') {
      try {
        payload = JSON.parse(event.data);
      } catch {
        return; // Malformed JSON - fail closed
      }
    } else if (typeof event.data === 'object' && event.data !== null) {
      payload = event.data;
    } else {
      return;
    }

    // Validate protocol version
    if (payload.version !== TWA_PROTOCOL_VERSION) {
      console.warn('Rejected bridge message with invalid protocol version:', payload.version);
      return;
    }

    switch (payload.type) {
      case 'PLAY_GAMES_READY':
        this.isAndroidTwaSignal.set(true);
        this.isPlayGamesReadySignal.set(true);
        this.flushPendingSyncQueue();
        break;

      case 'PLAY_GAMES_SIGNED_IN':
        this.isAndroidTwaSignal.set(true);
        this.isPlayGamesReadySignal.set(true);
        this.isPlayGamesSignedInSignal.set(true);
        this.flushPendingSyncQueue();
        break;

      case 'PLAY_GAMES_UNAVAILABLE':
        this.isPlayGamesReadySignal.set(false);
        this.isPlayGamesSignedInSignal.set(false);
        break;

      case 'ACHIEVEMENT_SYNCED':
        if (payload.internalAchievementId) {
          this.removeFromPendingQueue(payload.internalAchievementId);
        }
        break;

      case 'ACHIEVEMENT_SYNC_FAILED':
        console.warn('Achievement sync failed on Android host:', payload.error);
        break;
    }
  }

  /**
   * Unlock an achievement via Google Play Games if mapped and running in TWA
   */
  unlockAchievement(internalId: string): void {
    const mapping = PLAY_ACHIEVEMENT_MAPPINGS[internalId];
    if (!mapping) {
      // Unmapped achievement is safely ignored on native platform
      return;
    }

    if (!this.isPlayGamesReadySignal()) {
      this.addToPendingQueue(internalId);
      return;
    }

    this.sendTwaMessage({
      version: TWA_PROTOCOL_VERSION,
      type: 'UNLOCK_ACHIEVEMENT',
      internalAchievementId: internalId,
      playGamesAchievementId: mapping.playGamesId
    });
  }

  /**
   * Update progress for an incremental achievement
   */
  incrementAchievement(internalId: string, currentSteps: number): void {
    const mapping = PLAY_ACHIEVEMENT_MAPPINGS[internalId];
    if (!mapping || !mapping.isIncremental) return;

    if (!this.isPlayGamesReadySignal()) {
      return;
    }

    this.sendTwaMessage({
      version: TWA_PROTOCOL_VERSION,
      type: 'INCREMENT_ACHIEVEMENT',
      internalAchievementId: internalId,
      playGamesAchievementId: mapping.playGamesId,
      currentSteps,
      totalSteps: mapping.totalSteps
    });
  }

  /**
   * Request native Google Play Games Achievements UI overlay
   */
  showAchievementsOverlay(): void {
    if (!this.isPlayGamesReadySignal()) return;

    this.sendTwaMessage({
      version: TWA_PROTOCOL_VERSION,
      type: 'SHOW_ACHIEVEMENTS'
    });
  }

  /**
   * Trigger Play Games sign-in flow
   */
  requestPlayGamesSignIn(): void {
    if (!this.isAndroidTwaSignal()) return;

    this.sendTwaMessage({
      version: TWA_PROTOCOL_VERSION,
      type: 'PLAY_GAMES_SIGN_IN'
    });
  }

  /**
   * Reconcile any previously unlocked internal achievements with Play Games
   */
  reconcileUnlockedAchievements(unlockedIds: readonly string[]): void {
    if (!this.isPlayGamesReadySignal()) {
      unlockedIds.forEach(id => this.addToPendingQueue(id));
      return;
    }

    unlockedIds.forEach(id => this.unlockAchievement(id));
  }

  private sendTwaMessage(payload: TwaMessagePayload): void {
    try {
      // 1. If native JavaScript Interface exists on Android WebView
      if (typeof (window as any).AndroidPlayGamesBridge?.postMessage === 'function') {
        (window as any).AndroidPlayGamesBridge.postMessage(JSON.stringify(payload));
        return;
      }

      // 2. Standard TWA / Custom Tabs postMessage channel
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(JSON.stringify(payload), '*');
      }
    } catch (e) {
      console.warn('Failed to dispatch bridge message to Android host:', e);
    }
  }

  private addToPendingQueue(id: string): void {
    if (!this.pendingSyncQueue().includes(id)) {
      this.pendingSyncQueue.update(queue => [...queue, id]);
    }
  }

  private removeFromPendingQueue(id: string): void {
    this.pendingSyncQueue.update(queue => queue.filter(item => item !== id));
  }

  private flushPendingSyncQueue(): void {
    const queue = [...this.pendingSyncQueue()];
    this.pendingSyncQueue.set([]);
    queue.forEach(id => this.unlockAchievement(id));
  }
}

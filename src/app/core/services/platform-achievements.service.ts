import { Injectable, computed, signal } from '@angular/core';
import { PLAY_ACHIEVEMENT_MAPPINGS } from '../models/play-achievements-map';
import { TwaMessagePayload, TWA_PROTOCOL_VERSION } from '../models/twa-bridge.model';

/** A transport may only be registered after a real, origin-verified native channel exists. */
export interface VerifiedTwaTransport {
  send(payload: string): void;
  subscribe(handler: (payload: unknown) => void): () => void;
}

@Injectable({ providedIn: 'root' })
export class PlatformAchievementsService {
  private readonly isAndroidTwaSignal = signal(false);
  private readonly channelEstablishedSignal = signal(false);
  private readonly isPlayGamesReadySignal = signal(false);
  private readonly isPlayGamesSignedInSignal = signal(false);
  private readonly pendingUnlocks = signal<readonly string[]>([]);
  private readonly pendingProgress = signal<Readonly<Record<string, number>>>({});

  private transport: VerifiedTwaTransport | null = null;
  private unsubscribeTransport: (() => void) | null = null;

  readonly isRunningInTwa = computed(() => this.isAndroidTwaSignal());
  readonly isPlayGamesAvailable = computed(() =>
    this.channelEstablishedSignal() && this.isPlayGamesReadySignal()
  );
  readonly isPlayGamesSignedIn = computed(() =>
    this.isPlayGamesAvailable() && this.isPlayGamesSignedInSignal()
  );

  constructor() {
    if (typeof window !== 'undefined') {
      // Informational only. A query parameter is never treated as native readiness.
      this.isAndroidTwaSignal.set(new URLSearchParams(window.location.search).get('twa') === '1');
    }
  }

  /**
   * Hook for a future Android Browser Helper postMessage integration. The current
   * TWA host does not register one, so native controls and sync remain safely off.
   */
  connectVerifiedTransport(transport: VerifiedTwaTransport): void {
    this.unsubscribeTransport?.();
    this.transport = transport;
    this.channelEstablishedSignal.set(true);
    this.isAndroidTwaSignal.set(true);
    this.unsubscribeTransport = transport.subscribe(payload => this.handleIncomingPayload(payload));
    this.send({ version: TWA_PROTOCOL_VERSION, type: 'PLAY_GAMES_INIT' });
  }

  unlockAchievement(internalId: string): void {
    const mapping = PLAY_ACHIEVEMENT_MAPPINGS[internalId];
    if (!mapping) return;
    if (mapping.isIncremental) {
      this.setAchievementSteps(internalId, mapping.totalSteps ?? 0);
      return;
    }
    if (!this.canUsePlayGames()) {
      this.queueUnlock(internalId);
      return;
    }
    this.send({
      version: TWA_PROTOCOL_VERSION,
      type: 'UNLOCK_ACHIEVEMENT',
      internalAchievementId: internalId,
      playGamesAchievementId: mapping.playGamesId
    });
  }

  /** Sets absolute progress; it never sends a cumulative value as an increment/delta. */
  setAchievementSteps(internalId: string, completedSteps: number): void {
    const mapping = PLAY_ACHIEVEMENT_MAPPINGS[internalId];
    if (!mapping?.isIncremental || !mapping.totalSteps) return;
    const currentSteps = Math.max(0, Math.min(Math.floor(completedSteps), mapping.totalSteps));
    if (!this.canUsePlayGames()) {
      this.pendingProgress.update(progress => ({
        ...progress,
        [internalId]: Math.max(progress[internalId] ?? 0, currentSteps)
      }));
      return;
    }
    this.send({
      version: TWA_PROTOCOL_VERSION,
      type: 'SET_ACHIEVEMENT_STEPS',
      internalAchievementId: internalId,
      playGamesAchievementId: mapping.playGamesId,
      currentSteps,
      totalSteps: mapping.totalSteps
    });
  }

  showAchievementsOverlay(): void {
    if (!this.canUsePlayGames()) return;
    this.send({ version: TWA_PROTOCOL_VERSION, type: 'SHOW_ACHIEVEMENTS' });
  }

  requestPlayGamesSignIn(): void {
    if (!this.channelEstablishedSignal() || !this.isPlayGamesReadySignal()) return;
    this.send({ version: TWA_PROTOCOL_VERSION, type: 'PLAY_GAMES_SIGN_IN' });
  }

  reconcileUnlockedAchievements(unlockedIds: readonly string[]): void {
    unlockedIds.forEach(id => this.unlockAchievement(id));
  }

  private canUsePlayGames(): boolean {
    return this.isPlayGamesAvailable() && this.isPlayGamesSignedIn();
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
      case 'PLAY_GAMES_READY':
        this.isPlayGamesReadySignal.set(true);
        this.isPlayGamesSignedInSignal.set(false);
        break;
      case 'PLAY_GAMES_SIGNED_IN':
        this.isPlayGamesReadySignal.set(true);
        this.isPlayGamesSignedInSignal.set(true);
        this.flushPendingSync();
        break;
      case 'PLAY_GAMES_UNAVAILABLE':
        this.isPlayGamesReadySignal.set(false);
        this.isPlayGamesSignedInSignal.set(false);
        break;
      case 'ACHIEVEMENT_SYNCED':
        if (payload.internalAchievementId) {
          this.pendingUnlocks.update(ids => ids.filter(id => id !== payload.internalAchievementId));
        }
        break;
      case 'ACHIEVEMENT_SYNC_FAILED':
        console.warn('Achievement sync failed on Android host:', payload.error);
        break;
    }
  }

  private queueUnlock(id: string): void {
    if (!this.pendingUnlocks().includes(id)) {
      this.pendingUnlocks.update(ids => [...ids, id]);
    }
  }

  private flushPendingSync(): void {
    const unlocks = [...this.pendingUnlocks()];
    const progress = { ...this.pendingProgress() };
    this.pendingUnlocks.set([]);
    this.pendingProgress.set({});
    unlocks.forEach(id => this.unlockAchievement(id));
    Object.entries(progress).forEach(([id, steps]) => this.setAchievementSteps(id, steps));
  }

  private send(payload: TwaMessagePayload): void {
    if (!this.transport || !this.channelEstablishedSignal()) return;
    try {
      this.transport.send(JSON.stringify(payload));
    } catch (error) {
      console.warn('Verified TWA transport failed:', error);
      this.channelEstablishedSignal.set(false);
      this.isPlayGamesReadySignal.set(false);
      this.isPlayGamesSignedInSignal.set(false);
    }
  }
}

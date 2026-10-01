import { DestroyRef, Injectable, effect, inject, isDevMode } from '@angular/core';
import type { TableAmbience } from '../audio/table-ambience';
import type { SoundCue, TableAudioEngine } from '../audio/table-audio-engine';
import { SettingsService } from './settings.service';

type AudioRuntime = typeof import('../audio/table-audio');

const NO_SOUND = (): void => {};

/** Battle depth to ambience tension; mirrors the table's visual heat. */
function tensionFor(depth: number): number {
  return depth <= 0 ? 0 : Math.min(1, 0.38 + (depth - 1) * 0.24);
}

/**
 * The table's sound: one-shot cues for play, the skirmish soundtrack, and the
 * ambience bed. All of it is synthesised by TableAudioEngine, which is loaded
 * on demand; this service owns the audio context, the player's volume
 * settings and the browser rules about when audio may start.
 */
@Injectable({
  providedIn: 'root'
})
export class SoundService {
  private settingsService = inject(SettingsService);
  private audioCtx: AudioContext | null = null;
  private runtime: AudioRuntime | null = null;
  private loading: Promise<void> | null = null;
  private engine: TableAudioEngine | null = null;
  private ambience: TableAmbience | null = null;
  private destroyed = false;
  /** Browsers only let audio start from a tap or key press. */
  private unlocked = false;
  private atTable = false;
  private battleDepth = 0;

  private readonly unlock = (): void => {
    // Every gesture is a chance to create or revive the context while the
    // browser still counts the page as user-activated.
    if (this.atTable && this.canPlay()) {
      this.getAudioContext();
      // Building the engine here keeps that cost off the first card draw.
      if (this.runtime) this.getEngine();
    }
    if (this.unlocked) return;
    this.unlocked = true;
    this.syncAmbience();
  };

  private readonly onVisibility = (): void => {
    // A backgrounded tab or app must go quiet, ambience included.
    if (document.visibilityState === 'hidden') {
      void this.audioCtx?.suspend();
      return;
    }
    if (this.audioCtx && this.canPlay()) void this.audioCtx.resume();
    this.syncAmbience();
  };

  constructor() {
    effect(() => {
      const enabled = this.settingsService.soundEnabled();
      const effects = this.settingsService.soundVolume();
      const ambience = this.settingsService.ambienceVolume();
      this.applyVolumes(enabled, effects, ambience);
      this.syncAmbience();
    });

    if (typeof window !== 'undefined') {
      window.addEventListener('pointerdown', this.unlock, { capture: true, passive: true });
      window.addEventListener('keydown', this.unlock, { capture: true, passive: true });
      document.addEventListener('visibilitychange', this.onVisibility);
      if (isDevMode()) {
        // Development-only handle for auditioning and measuring voices from the console.
        (globalThis as { __attritionSound?: unknown }).__attritionSound = {
          service: this,
          load: () => import('../audio/table-audio'),
        };
      }
    }

    inject(DestroyRef).onDestroy(() => {
      this.destroyed = true;
      if (typeof window !== 'undefined') {
        window.removeEventListener('pointerdown', this.unlock, { capture: true });
        window.removeEventListener('keydown', this.unlock, { capture: true });
        document.removeEventListener('visibilitychange', this.onVisibility);
      }
      this.ambience?.stop();
      void this.audioCtx?.close();
      this.audioCtx = null;
      this.engine = null;
      this.ambience = null;
    });
  }

  /**
   * Loads the synthesis code, which is kept out of the initial bundle.
   * Sound requested before it arrives is skipped rather than played late.
   */
  whenReady(): Promise<void> {
    this.loading ??= import('../audio/table-audio')
      .then((runtime) => {
        if (this.destroyed) return;
        this.runtime = runtime;
        if (this.audioCtx) this.getEngine();
        this.syncAmbience();
      })
      .catch((e) => console.warn('Audio could not be loaded:', e));
    return this.loading;
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended' && document.visibilityState !== 'hidden') {
      void this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  private getEngine(): TableAudioEngine | null {
    if (!this.runtime) {
      void this.whenReady();
      return null;
    }
    const ctx = this.getAudioContext();
    if (!ctx) return null;
    if (!this.engine) {
      this.engine = new this.runtime.TableAudioEngine(ctx);
      this.applyVolumes(
        this.settingsService.soundEnabled(),
        this.settingsService.soundVolume(),
        this.settingsService.ambienceVolume(),
      );
    }
    return this.engine;
  }

  private canPlay(): boolean {
    // While the page is hidden the audio clock is frozen: anything scheduled
    // now would pile up and fire in one burst when the player comes back.
    return (
      this.settingsService.soundEnabled() &&
      (typeof document === 'undefined' || document.visibilityState !== 'hidden')
    );
  }

  private applyVolumes(enabled: boolean, effects: number, ambience: number): void {
    if (!this.engine) return;
    this.engine.setMuted(!enabled);
    if (!enabled) void this.audioCtx?.suspend();
    this.engine.setBusVolume('sfx', effects / 100);
    this.engine.setBusVolume('ambience', ambience / 100);
  }

  /** Runs one cue a few milliseconds ahead of the audio clock. */
  private cue(play: (engine: TableAudioEngine, when: number) => void): void {
    if (!this.canPlay()) return;
    const engine = this.getEngine();
    if (!engine) return;
    try {
      play(engine, engine.now + 0.005);
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }

  /**
   * Sound effect for drawing a card from deck
   */
  playCardDraw(): void {
    this.cue((engine, when) => engine.cardDraw(when));
  }

  /**
   * Sound effect for card flip
   */
  playCardFlip(): void {
    this.cue((engine, when) => engine.cardFlip(when));
  }

  /** Short, muted contact as a card lands on felt. */
  playCardLand(): void {
    this.cue((engine, when) => engine.cardLand(when));
  }

  /** Lower slide used when revealed casualties enter the Boneyard. */
  playBoneyard(): void {
    this.cue((engine, when) => engine.boneyard(when));
  }

  /**
   * Sound effect for battle clash
   */
  playClash(): void {
    this.cue((engine, when) => engine.clash(when, 1));
  }

  /** Horn and drum that open a Battle; each deeper layer calls louder. */
  playBattleCall(depth: number): void {
    this.cue((engine, when) => engine.battleCall(when, depth));
  }

  /** Brief upward confirmation for a result that benefits the human player. */
  playPositiveResolution(): void {
    this.cue((engine, when) => engine.resolvePositive(when));
  }

  /** Brief downward confirmation for a result that harms the human player. */
  playNegativeResolution(): void {
    this.cue((engine, when) => engine.resolveNegative(when));
  }

  /** A stronger, still compact upward cue for a resolved Battle. */
  playBattleVictory(): void {
    this.cue((engine, when) => engine.battleVictory(when));
  }

  /** A stronger, still compact downward cue for a lost Battle. */
  playBattleDefeat(): void {
    this.cue((engine, when) => engine.battleDefeat(when));
  }

  /**
   * Sound effect for victory
   */
  playVictory(): void {
    this.cue((engine, when) => engine.victory(when));
  }

  /**
   * Sound effect for defeat
   */
  playDefeat(): void {
    this.cue((engine, when) => engine.defeat(when));
  }

  /**
   * Plays the soundtrack of a skirmish from its choreography cues.
   * Returns a function that silences whatever has not sounded yet, for a
   * scene the player skips; called after the scene has run, it does nothing.
   */
  playSkirmish(cues: readonly SoundCue[], durationMs: number): () => void {
    if (!this.canPlay()) return NO_SOUND;
    const engine = this.getEngine();
    if (!engine) return NO_SOUND;
    try {
      const group = engine.createGroup();
      const start = engine.now + 0.02;
      const seconds = durationMs / 1000;
      engine.skirmish(cues, start, seconds, group);
      return () => group.release(start + seconds);
    } catch (e) {
      console.warn('Audio playback error:', e);
      return NO_SOUND;
    }
  }

  /** The table is on screen: fetch the synthesis code and let the ambience bed play. */
  enterTable(): void {
    this.atTable = true;
    if (this.settingsService.soundEnabled()) void this.whenReady();
    this.syncAmbience();
  }

  leaveTable(): void {
    this.atTable = false;
    this.battleDepth = 0;
    this.syncAmbience();
  }

  /** Battle layers on the table; the din outside rises with each one. */
  setBattleDepth(depth: number): void {
    this.battleDepth = Math.max(0, depth);
    this.ambience?.setTension(tensionFor(this.battleDepth), this.battleDepth);
  }

  private syncAmbience(): void {
    const wanted =
      this.atTable &&
      this.unlocked &&
      this.canPlay() &&
      this.settingsService.ambienceVolume() > 0;
    if (!wanted) {
      this.ambience?.stop();
      return;
    }
    const engine = this.getEngine();
    if (!engine || !this.runtime) return;
    try {
      this.ambience ??= new this.runtime.TableAmbience(engine);
      this.ambience.setTension(tensionFor(this.battleDepth), this.battleDepth);
      this.ambience.start();
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }
}

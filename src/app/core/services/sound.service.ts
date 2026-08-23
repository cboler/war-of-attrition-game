import { Injectable, inject } from '@angular/core';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root'
})
export class SoundService {
  private settingsService = inject(SettingsService);
  private audioCtx: AudioContext | null = null;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  private canPlay(): boolean {
    return this.settingsService.soundEnabled();
  }

  /**
   * Sound effect for drawing a card from deck
   */
  playCardDraw(): void {
    if (!this.canPlay()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }

  /**
   * Sound effect for card flip
   */
  playCardFlip(): void {
    if (!this.canPlay()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(350, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }

  /** Short, muted contact as a card lands on felt. */
  playCardLand(): void {
    this.playPercussiveTone(105, 0.045, 0.11);
  }

  /** Lower slide used when revealed casualties enter the Boneyard. */
  playBoneyard(): void {
    this.playPercussiveTone(72, 0.12, 0.14);
  }

  /**
   * Sound effect for battle clash
   */
  playClash(): void {
    if (!this.canPlay()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'square';

      osc1.frequency.setValueAtTime(440, ctx.currentTime);
      osc2.frequency.setValueAtTime(554.37, ctx.currentTime);

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(ctx.currentTime);
      osc2.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.3);
      osc2.stop(ctx.currentTime + 0.3);
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }

  /** Brief upward confirmation for a result that benefits the human player. */
  playPositiveResolution(): void {
    this.playResolutionSweep(440, 660, 0.15, 0.14, 'triangle');
  }

  /** Brief downward confirmation for a result that harms the human player. */
  playNegativeResolution(): void {
    this.playResolutionSweep(240, 160, 0.17, 0.11, 'sawtooth');
  }

  /** A stronger, still compact upward cue for a resolved Battle. */
  playBattleVictory(): void {
    this.playResolutionSweep(360, 880, 0.24, 0.2, 'triangle');
  }

  /** A stronger, still compact downward cue for a lost Battle. */
  playBattleDefeat(): void {
    this.playResolutionSweep(320, 110, 0.26, 0.17, 'sawtooth');
  }

  /**
   * Sound effect for victory
   */
  playVictory(): void {
    if (!this.canPlay()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.value = freq;

        const startTime = ctx.currentTime + idx * 0.12;
        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.3);
      });
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }

  /**
   * Sound effect for defeat
   */
  playDefeat(): void {
    if (!this.canPlay()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const notes = [440, 349.23, 293.66]; // A4, F4, D4
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.value = freq;

        const startTime = ctx.currentTime + idx * 0.18;
        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.4);
      });
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }

  private playPercussiveTone(frequency: number, duration: number, volume: number): void {
    if (!this.canPlay()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch (error) {
      console.warn('Audio playback error:', error);
    }
  }

  private playResolutionSweep(
    startFrequency: number,
    endFrequency: number,
    duration: number,
    volume: number,
    waveform: OscillatorType,
  ): void {
    if (!this.canPlay()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = waveform;
      osc.frequency.setValueAtTime(startFrequency, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(endFrequency, ctx.currentTime + duration);
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch (error) {
      console.warn('Audio playback error:', error);
    }
  }
}

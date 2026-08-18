import { Injectable, inject, signal } from '@angular/core';
import { SettingsService } from '../core/services/settings.service';

@Injectable({ providedIn: 'root' })
export class PresentationSequencerService {
  private readonly settings = inject(SettingsService);
  private timer: ReturnType<typeof setTimeout> | null = null;
  private resume: (() => void) | null = null;
  private sequenceVersion = 0;
  private lastAdvanceAt = 0;
  private fastForward = false;

  readonly waiting = signal(false);

  begin(): number {
    this.cancel();
    this.fastForward = false;
    this.lastAdvanceAt = 0;
    return this.sequenceVersion;
  }

  async pause(milliseconds: number, version = this.sequenceVersion): Promise<void> {
    if (version !== this.sequenceVersion || this.shouldCollapseTiming() || this.fastForward) return;
    const duration = Math.max(0, milliseconds * this.speedMultiplier());
    if (duration === 0) return;

    await new Promise<void>(resolve => {
      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        if (this.timer) clearTimeout(this.timer);
        this.timer = null;
        this.resume = null;
        this.waiting.set(false);
        resolve();
      };
      this.waiting.set(true);
      this.resume = finish;
      this.timer = setTimeout(finish, duration);
    });
  }

  advance(): boolean {
    const now = Date.now();
    if (this.lastAdvanceAt > 0 && now - this.lastAdvanceAt < 360) this.fastForward = true;
    this.lastAdvanceAt = now;
    if (!this.resume) return false;
    this.resume();
    return true;
  }

  cancel(): void {
    this.sequenceVersion += 1;
    this.resume?.();
    this.resume = null;
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.waiting.set(false);
  }

  end(version: number): void {
    if (version !== this.sequenceVersion) return;
    this.fastForward = false;
    this.lastAdvanceAt = 0;
  }

  private shouldCollapseTiming(): boolean {
    if (!this.settings.autoPlayAnimations()) return true;
    return typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  private speedMultiplier(): number {
    switch (this.settings.animationSpeed()) {
      case 'slow': return 1.5;
      case 'fast': return 0.7;
      default: return 1.15;
    }
  }
}

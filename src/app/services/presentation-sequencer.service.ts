import { Injectable, inject, signal } from '@angular/core';
import { SettingsService } from '../core/services/settings.service';

/** A cancelled presentation is expected when a new game replaces an old one. */
export class PresentationSequenceCancelled extends Error {
  constructor() {
    super('Presentation sequence cancelled');
    this.name = 'PresentationSequenceCancelled';
  }
}

@Injectable({ providedIn: 'root' })
export class PresentationSequencerService {
  private readonly settings = inject(SettingsService);
  private timer: ReturnType<typeof setTimeout> | null = null;
  private resume: (() => void) | null = null;
  private abort: (() => void) | null = null;
  private sequenceVersion = 0;

  readonly waiting = signal(false);

  begin(): number {
    this.cancel();
    return this.sequenceVersion;
  }

  async pause(
    milliseconds: number,
    version = this.sequenceVersion,
    staticHoldMilliseconds = 0,
  ): Promise<void> {
    if (version !== this.sequenceVersion) throw new PresentationSequenceCancelled();
    const duration = this.shouldCollapseTiming()
      ? Math.max(0, staticHoldMilliseconds)
      : Math.max(0, milliseconds * this.speedMultiplier());
    if (duration === 0) return;

    await new Promise<void>((resolve, reject) => {
      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        if (this.timer) clearTimeout(this.timer);
        this.timer = null;
        this.resume = null;
        this.abort = null;
        this.waiting.set(false);
        resolve();
      };
      const cancel = () => {
        if (finished) return;
        finished = true;
        if (this.timer) clearTimeout(this.timer);
        this.timer = null;
        this.resume = null;
        this.abort = null;
        this.waiting.set(false);
        reject(new PresentationSequenceCancelled());
      };
      this.waiting.set(true);
      this.resume = finish;
      this.abort = cancel;
      this.timer = setTimeout(finish, duration);
    });
  }

  advance(): boolean {
    if (!this.resume) return false;
    const resume = this.resume;
    // Claim this input immediately so a double tap cannot advance twice. Give
    // the view one frame to apply its "finish this beat" CSS before the async
    // sequence is allowed to enter the next presentation phase.
    this.resume = null;
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => resume(), 16);
    return true;
  }

  cancel(): void {
    this.sequenceVersion += 1;
    this.abort?.();
    this.abort = null;
    this.resume = null;
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.waiting.set(false);
  }

  end(version: number): void {
    if (version !== this.sequenceVersion) return;
  }

  private shouldCollapseTiming(): boolean {
    if (!this.settings.autoPlayAnimations()) return true;
    return (
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  private speedMultiplier(): number {
    switch (this.settings.animationSpeed()) {
      case 'slow':
        return 1.5;
      case 'fast':
        return 0.7;
      default:
        return 1.15;
    }
  }
}

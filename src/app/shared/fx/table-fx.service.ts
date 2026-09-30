import { DestroyRef, Injectable, NgZone, computed, effect, inject, signal } from '@angular/core';
import { SettingsService } from '../../core/services/settings.service';
import type { FxMotion, FxTier, TableFxEngine } from './table-fx-engine';

/**
 * Owns the lazily loaded WebGL table effects engine.
 *
 * The engine is optional polish: when WebGL is unavailable, the page is being
 * driven by automation (store screenshots, unit tests), or the context is lost,
 * every surface silently falls back to the existing CSS table.
 */
@Injectable({ providedIn: 'root' })
export class TableFxService {
  private readonly zone = inject(NgZone);
  private readonly settings = inject(SettingsService);

  private readonly prefersReducedMotion = signal(readReducedMotion());
  private readonly failed = signal(false);
  private readonly backdropReady = signal(false);
  private readonly overlayReady = signal(false);

  /** Effects render only as decoration; reduced motion keeps a still, lit table. */
  readonly motion = computed<FxMotion>(() =>
    this.settings.autoPlayAnimations() && !this.prefersReducedMotion() ? 'full' : 'static',
  );
  readonly backdropLive = computed(() => this.backdropReady() && !this.failed());
  readonly overlayLive = computed(() => this.overlayReady() && !this.failed());

  private engine: TableFxEngine | null = null;
  private loading: Promise<TableFxEngine | null> | null = null;
  private surfaces = 0;

  constructor() {
    if (typeof globalThis.matchMedia === 'function') {
      const query = globalThis.matchMedia('(prefers-reduced-motion: reduce)');
      const listener = (event: MediaQueryListEvent) => this.prefersReducedMotion.set(event.matches);
      query.addEventListener?.('change', listener);
      inject(DestroyRef).onDestroy(() => query.removeEventListener?.('change', listener));
    }
    effect(() => {
      const motion = this.motion();
      this.zone.runOutsideAngular(() => this.engine?.setMotion(motion));
    });
  }

  /** True when this environment should attempt the WebGL layer at all. */
  isSupported(): boolean {
    if (this.failed() || typeof window === 'undefined' || typeof document === 'undefined') return false;
    const globalWindow = window as Window & { __karma__?: unknown };
    if (globalWindow.__karma__ || navigator.webdriver) return false;
    const params = new URLSearchParams(window.location.search);
    if (params.has('scene') || params.has('screenshot_scene') || params.get('fx') === 'off') return false;
    return hasWebGl();
  }

  async attachBackdrop(canvas: HTMLCanvasElement): Promise<TableFxEngine | null> {
    const engine = await this.acquire();
    if (!engine) return null;
    const attached = this.zone.runOutsideAngular(() => engine.attachBackdrop(canvas));
    if (!attached) {
      this.release();
      return null;
    }
    this.backdropReady.set(true);
    return engine;
  }

  detachBackdrop(): void {
    if (!this.engine || !this.backdropReady()) return;
    this.engine.detachBackdrop();
    this.backdropReady.set(false);
    this.release();
  }

  async attachOverlay(canvas: HTMLCanvasElement): Promise<TableFxEngine | null> {
    const engine = await this.acquire();
    if (!engine) return null;
    const attached = this.zone.runOutsideAngular(() => engine.attachOverlay(canvas));
    if (!attached) {
      this.release();
      return null;
    }
    this.overlayReady.set(true);
    return engine;
  }

  detachOverlay(): void {
    if (!this.engine || !this.overlayReady()) return;
    this.engine.detachOverlay();
    this.overlayReady.set(false);
    this.release();
  }

  private async acquire(): Promise<TableFxEngine | null> {
    if (!this.isSupported()) return null;
    this.surfaces++;
    if (this.engine) return this.engine;
    this.loading ??= this.load();
    const engine = await this.loading;
    if (!engine) this.surfaces = 0;
    return engine;
  }

  private release(): void {
    this.surfaces = Math.max(0, this.surfaces - 1);
    if (this.surfaces === 0 && this.engine) {
      this.engine.dispose();
      this.engine = null;
      this.loading = null;
    }
  }

  private async load(): Promise<TableFxEngine | null> {
    try {
      const module = await import('./table-fx-engine');
      this.engine = this.zone.runOutsideAngular(
        () =>
          new module.TableFxEngine({
            tier: detectTier(),
            motion: this.motion(),
            onContextLost: () => this.zone.run(() => this.failed.set(true)),
          }),
      );
      return this.engine;
    } catch (error) {
      console.warn('Table effects unavailable; using the CSS table.', error);
      this.failed.set(true);
      return null;
    }
  }
}

function readReducedMotion(): boolean {
  return (
    typeof globalThis.matchMedia === 'function' &&
    globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function hasWebGl(): boolean {
  try {
    const probe = document.createElement('canvas');
    const context = probe.getContext('webgl2') ?? probe.getContext('webgl');
    (context as WebGLRenderingContext | null)?.getExtension('WEBGL_lose_context')?.loseContext();
    return !!context;
  } catch {
    return false;
  }
}

function detectTier(): FxTier {
  const nav = navigator as Navigator & { deviceMemory?: number };
  const coarse = typeof globalThis.matchMedia === 'function' && globalThis.matchMedia('(pointer: coarse)').matches;
  const weakCpu = (nav.hardwareConcurrency ?? 8) <= 4;
  const lowMemory = (nav.deviceMemory ?? 8) <= 4;
  return (coarse && (weakCpu || lowMemory)) || (weakCpu && lowMemory) ? 'low' : 'high';
}

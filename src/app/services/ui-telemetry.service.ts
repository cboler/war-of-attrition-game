import { DestroyRef, Injectable, InjectionToken, effect, inject } from '@angular/core';
import {
  UI_TELEMETRY_SCHEMA_VERSION,
  UiSurfaceTelemetryContext,
  UiTelemetryDurationBucket,
} from '../core/models/telemetry.model';
import { TelemetryConsentService } from './telemetry-consent.service';
import {
  GAME_TELEMETRY_CONFIG,
  GAME_TELEMETRY_TRANSPORT,
  TelemetryTransport,
} from './telemetry-transport.service';

export const UI_TELEMETRY_NOW = new InjectionToken<() => number>('UI_TELEMETRY_NOW', {
  providedIn: 'root',
  factory: () => () => (typeof performance === 'undefined' ? Date.now() : performance.now()),
});

interface ActiveSurface {
  readonly context: UiSurfaceTelemetryContext;
  readonly openedAt: number;
}

@Injectable({ providedIn: 'root' })
export class UiTelemetryService {
  private readonly consent = inject(TelemetryConsentService);
  private readonly transport: TelemetryTransport = inject(GAME_TELEMETRY_TRANSPORT);
  private readonly config = inject(GAME_TELEMETRY_CONFIG);
  private readonly now = inject(UI_TELEMETRY_NOW);
  private readonly destroyRef = inject(DestroyRef);
  private readonly activeSurfaces = new Map<string, ActiveSurface>();
  private uiSessionId: string | null = null;
  private eventSequence = 0;

  private readonly handleVisibilityChange = (): void => {
    if (document.visibilityState === 'hidden') this.finalizeAllSurfaces();
  };

  constructor() {
    effect(() => {
      if (!this.consent.canCollectAnalytics()) {
        // Withdrawal is immediate. Incomplete engagements are discarded rather
        // than transmitting a terminal event after consent has gone away.
        this.activeSurfaces.clear();
      }
    });

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange, {
        passive: true,
      });
      this.destroyRef.onDestroy(() =>
        document.removeEventListener('visibilitychange', this.handleVisibilityChange),
      );
    }
  }

  openSurface(context: UiSurfaceTelemetryContext, trackingKey = 'primary'): void {
    if (!this.consent.canCollectAnalytics() || this.isDocumentHidden()) return;

    const current = this.activeSurfaces.get(trackingKey);
    if (current && contextsMatch(current.context, context)) return;
    if (current) this.closeSurface(trackingKey);

    this.activeSurfaces.set(trackingKey, { context, openedAt: this.now() });
    this.send('surface_opened', context);
  }

  closeSurface(trackingKey = 'primary'): void {
    const active = this.activeSurfaces.get(trackingKey);
    if (!active) return;
    this.activeSurfaces.delete(trackingKey);
    if (!this.consent.canCollectAnalytics()) return;

    const elapsedMs = Math.max(0, this.now() - active.openedAt);
    this.send('surface_engaged', active.context, durationBucketFor(elapsedMs));
  }

  private finalizeAllSurfaces(): void {
    for (const trackingKey of [...this.activeSurfaces.keys()]) {
      this.closeSurface(trackingKey);
    }
  }

  private send(
    name: 'surface_opened' | 'surface_engaged',
    context: UiSurfaceTelemetryContext,
    durationBucket?: UiTelemetryDurationBucket,
  ): void {
    if (!this.consent.canCollectAnalytics()) return;

    const parameters: Record<string, string | number> = {
      ui_schema_version: UI_TELEMETRY_SCHEMA_VERSION,
      app_version: this.config.appVersion,
      ui_session_id: this.getUiSessionId(),
      ui_event_seq: ++this.eventSequence,
      surface: context.surface,
    };
    if (context.subsurface) parameters['subsurface'] = context.subsurface;
    if (context.sourceSurface) parameters['source_surface'] = context.sourceSurface;
    if (context.commanderId) parameters['commander_id'] = context.commanderId;
    if (context.ruleId) parameters['rule_id'] = context.ruleId;
    if (context.chronicleEntry) parameters['chronicle_entry'] = context.chronicleEntry;
    if (context.manualEntryType) parameters['manual_entry_type'] = context.manualEntryType;
    if (durationBucket) parameters['duration_bucket'] = durationBucket;

    this.transport.send({ name, parameters });
  }

  private getUiSessionId(): string {
    this.uiSessionId ??= createEphemeralSessionId();
    return this.uiSessionId;
  }

  private isDocumentHidden(): boolean {
    return typeof document !== 'undefined' && document.visibilityState === 'hidden';
  }
}

export function durationBucketFor(durationMs: number): UiTelemetryDurationBucket {
  if (durationMs < 10_000) return 'lt_10s';
  if (durationMs < 30_000) return '10_30s';
  if (durationMs < 60_000) return '30_60s';
  if (durationMs < 180_000) return '1_3m';
  return '3m_plus';
}

function contextsMatch(
  left: UiSurfaceTelemetryContext,
  right: UiSurfaceTelemetryContext,
): boolean {
  return (
    left.surface === right.surface &&
    left.subsurface === right.subsurface &&
    left.sourceSurface === right.sourceSurface &&
    left.commanderId === right.commanderId &&
    left.ruleId === right.ruleId &&
    left.chronicleEntry === right.chronicleEntry &&
    left.manualEntryType === right.manualEntryType
  );
}

function createEphemeralSessionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  const bytes = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index++) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

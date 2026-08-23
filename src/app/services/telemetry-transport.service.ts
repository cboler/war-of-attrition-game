import { effect, inject, Injectable, InjectionToken } from '@angular/core';
import { environment } from '../../environments/environment';
import { TelemetryConfig, TelemetryRecord } from '../core/models/telemetry.model';
import { TelemetryConsentService } from './telemetry-consent.service';

export interface TelemetryTransport {
  send(record: TelemetryRecord): void;
}

export const GAME_TELEMETRY_CONFIG = new InjectionToken<TelemetryConfig>(
  'GAME_TELEMETRY_CONFIG',
  {
    providedIn: 'root',
    factory: () => ({
      measurementId: environment.ga4MeasurementId,
      appVersion: environment.appVersion,
      rulesetVersion: environment.rulesetVersion
    })
  }
);

@Injectable({ providedIn: 'root' })
export class NoopTelemetryTransport implements TelemetryTransport {
  send(_record: TelemetryRecord): void {}
}

type GtagFunction = (...args: unknown[]) => void;
type TelemetryWindow = Window & typeof globalThis & {
  dataLayer?: unknown[];
  gtag?: GtagFunction;
};

@Injectable({ providedIn: 'root' })
export class GtagTelemetryTransport implements TelemetryTransport {
  private readonly config = inject(GAME_TELEMETRY_CONFIG);
  private readonly consent = inject(TelemetryConsentService);
  private initialized = false;

  readonly isConfigured = /^G-[A-Z0-9]+$/i.test(this.config.measurementId.trim());

  constructor() {
    effect(() => {
      const consent = this.consent.analyticsConsent();
      if (this.initialized) {
        this.updateExistingGtagConsent(consent === 'granted');
      }
    });
  }

  send(record: TelemetryRecord): void {
    if (!this.isConfigured || !this.consent.canCollectAnalytics()) return;
    const gtag = this.ensureGtag();
    if (!gtag) return;
    const normalized = normalizeTelemetryRecordForGa4(record);
    if (!normalized) return;
    gtag('event', normalized.name, normalized.parameters);
  }

  private ensureGtag(): GtagFunction | null {
    if (typeof window === 'undefined' || typeof document === 'undefined') return null;
    const telemetryWindow = window as TelemetryWindow;
    telemetryWindow.dataLayer = telemetryWindow.dataLayer || [];
    if (!telemetryWindow.gtag) {
      telemetryWindow.gtag = function gtag(): void {
        // Supported gtag.js bootstrap: dataLayer.push(arguments) pushes the Arguments object,
        // which gtag.js requires to identify and process gtag command queue entries.
        // eslint-disable-next-line prefer-rest-params
        telemetryWindow.dataLayer?.push(arguments);
      };
    }

    if (!this.initialized) {
      this.initialized = true;
      telemetryWindow.gtag('consent', 'default', {
        analytics_storage: 'granted',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied'
      });
      telemetryWindow.gtag('js', new Date());
      telemetryWindow.gtag('config', this.config.measurementId.trim(), {
        send_page_view: false,
        allow_google_signals: false,
        allow_ad_personalization_signals: false
      });

      if (!document.getElementById('war-of-attrition-ga4')) {
        const script = document.createElement('script');
        script.id = 'war-of-attrition-ga4';
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(this.config.measurementId.trim())}`;
        script.onerror = (err) => {
          console.warn('[Telemetry] Google Analytics gtag.js failed to load:', err);
        };
        document.head.appendChild(script);
      }
    }
    return telemetryWindow.gtag;
  }

  private updateExistingGtagConsent(analyticsGranted: boolean): void {
    if (typeof window === 'undefined') return;
    const gtag = (window as TelemetryWindow).gtag;
    if (!gtag) return;
    gtag('consent', 'update', {
      analytics_storage: analyticsGranted ? 'granted' : 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
  }
}

export function normalizeTelemetryRecordForGa4(record: TelemetryRecord): TelemetryRecord | null {
  if (!/^[a-z][a-z0-9_]{0,39}$/.test(record.name)) return null;
  const entries = Object.entries(record.parameters).filter(([key, value]) =>
    /^[a-z][a-z0-9_]{0,39}$/.test(key) &&
    (typeof value === 'string' || (typeof value === 'number' && Number.isFinite(value)))
  );
  // Never silently truncate a canonical record and lose causal join keys.
  if (entries.length > 25) return null;
  const parameters = Object.fromEntries(entries.map(([key, value]) => [
    key,
    typeof value === 'string' ? value.slice(0, 100) : value
  ]));
  return { name: record.name, parameters };
}

export const GAME_TELEMETRY_TRANSPORT = new InjectionToken<TelemetryTransport>(
  'GAME_TELEMETRY_TRANSPORT',
  {
    providedIn: 'root',
    factory: () => inject(GtagTelemetryTransport)
  }
);

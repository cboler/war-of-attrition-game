import { computed, Injectable, signal } from '@angular/core';
import { APP_LOCAL_STORAGE_KEYS } from '../core/models/app-storage.model';

export type AnalyticsConsent = 'unknown' | 'granted' | 'denied';

@Injectable({ providedIn: 'root' })
export class TelemetryConsentService {
  private readonly consentSignal = signal<AnalyticsConsent>(this.loadConsent());

  readonly analyticsConsent = this.consentSignal.asReadonly();
  readonly canCollectAnalytics = computed(() => this.consentSignal() === 'granted');

  setAnalyticsConsent(consent: Exclude<AnalyticsConsent, 'unknown'>): void {
    this.consentSignal.set(consent);
    try {
      localStorage.setItem(APP_LOCAL_STORAGE_KEYS.telemetryConsent, consent);
    } catch (error) {
      console.warn('Failed to save analytics consent:', error);
    }
  }

  clearAnalyticsConsent(): void {
    this.consentSignal.set('unknown');
    try {
      localStorage.removeItem(APP_LOCAL_STORAGE_KEYS.telemetryConsent);
    } catch (error) {
      console.warn('Failed to clear analytics consent:', error);
    }
  }

  private loadConsent(): AnalyticsConsent {
    try {
      const stored = localStorage.getItem(APP_LOCAL_STORAGE_KEYS.telemetryConsent);
      return stored === 'granted' || stored === 'denied' ? stored : 'unknown';
    } catch {
      return 'unknown';
    }
  }
}

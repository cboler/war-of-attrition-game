import { TestBed } from '@angular/core/testing';
import { APP_LOCAL_STORAGE_KEYS } from '../core/models/app-storage.model';
import { TelemetryConsentService } from './telemetry-consent.service';

describe('TelemetryConsentService', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('starts unknown and off on a new or cleared installation', () => {
    const service = TestBed.inject(TelemetryConsentService);
    expect(service.analyticsConsent()).toBe('unknown');
    expect(service.canCollectAnalytics()).toBeFalse();

    service.setAnalyticsConsent('granted');
    service.clearAnalyticsConsent();
    expect(service.analyticsConsent()).toBe('unknown');
    expect(service.canCollectAnalytics()).toBeFalse();
    expect(localStorage.getItem(APP_LOCAL_STORAGE_KEYS.telemetryConsent)).toBeNull();
  });

  it('persists explicit grant and denial through the one authoritative key', () => {
    const service = TestBed.inject(TelemetryConsentService);
    service.setAnalyticsConsent('granted');
    expect(localStorage.getItem(APP_LOCAL_STORAGE_KEYS.telemetryConsent)).toBe('granted');

    service.setAnalyticsConsent('denied');
    expect(service.analyticsConsent()).toBe('denied');
    expect(service.canCollectAnalytics()).toBeFalse();
    expect(localStorage.getItem(APP_LOCAL_STORAGE_KEYS.telemetryConsent)).toBe('denied');
  });
});

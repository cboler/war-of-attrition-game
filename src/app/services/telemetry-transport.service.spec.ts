import { TestBed } from '@angular/core/testing';
import { TelemetryConsentService } from './telemetry-consent.service';
import {
  GAME_TELEMETRY_CONFIG,
  GtagTelemetryTransport,
  normalizeTelemetryRecordForGa4
} from './telemetry-transport.service';

describe('GtagTelemetryTransport', () => {
  afterEach(() => {
    localStorage.clear();
    document.getElementById('war-of-attrition-ga4')?.remove();
    delete (window as any).gtag;
    delete (window as any).dataLayer;
  });

  it('does not load GA or retain records before explicit consent', () => {
    TestBed.configureTestingModule({
      providers: [
        GtagTelemetryTransport,
        TelemetryConsentService,
        {
          provide: GAME_TELEMETRY_CONFIG,
          useValue: {
            measurementId: 'G-TEST123',
            appVersion: 'test',
            rulesetVersion: 'test'
          }
        }
      ]
    });
    const consent = TestBed.inject(TelemetryConsentService);
    const transport = TestBed.inject(GtagTelemetryTransport);
    const record = { name: 'war_started', parameters: { schema_version: 1 } };

    transport.send(record);
    expect(document.getElementById('war-of-attrition-ga4')).toBeNull();
    expect((window as any).dataLayer).toBeUndefined();

    consent.setAnalyticsConsent('granted');
    transport.send(record);

    expect(document.getElementById('war-of-attrition-ga4')).not.toBeNull();
    const eventCalls = ((window as any).dataLayer as unknown[][])
      .filter(args => args[0] === 'event');
    expect(eventCalls.length).toBe(1);
    expect(eventCalls[0][1]).toBe('war_started');

    consent.setAnalyticsConsent('denied');
    TestBed.flushEffects();
    let consentCalls = ((window as any).dataLayer as unknown[][])
      .filter(args => args[0] === 'consent');
    expect((consentCalls[consentCalls.length - 1][2] as any).analytics_storage).toBe('denied');
    expect((consentCalls[consentCalls.length - 1][2] as any).ad_storage).toBe('denied');

    consent.setAnalyticsConsent('granted');
    TestBed.flushEffects();
    consentCalls = ((window as any).dataLayer as unknown[][])
      .filter(args => args[0] === 'consent');
    expect((consentCalls[consentCalls.length - 1][2] as any).analytics_storage).toBe('granted');
    expect((consentCalls[consentCalls.length - 1][2] as any).ad_personalization).toBe('denied');
  });

  it('rejects over-budget records instead of silently dropping causal parameters', () => {
    const parameters = Object.fromEntries(
      Array.from({ length: 30 }, (_, index) => [`parameter_${index}`, 'x'.repeat(150)])
    );
    const normalized = normalizeTelemetryRecordForGa4({
      name: 'comparison_resolved',
      parameters
    });

    expect(normalized).toBeNull();
    const withinBudget = normalizeTelemetryRecordForGa4({
      name: 'comparison_resolved',
      parameters: Object.fromEntries(Object.entries(parameters).slice(0, 25))
    });
    expect(withinBudget).not.toBeNull();
    expect(String(withinBudget?.parameters['parameter_0']).length).toBe(100);
    expect(normalizeTelemetryRecordForGa4({
      name: 'Invalid Event Name',
      parameters: {}
    })).toBeNull();
  });
});

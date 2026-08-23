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
    const dataLayer = (window as any).dataLayer as unknown[];
    expect(dataLayer.length).toBeGreaterThan(0);

    // Verify commands pushed are Arguments objects, not plain JS arrays
    const firstCommand = dataLayer[0];
    expect(Object.prototype.toString.call(firstCommand)).toBe('[object Arguments]');

    // Verify ordering: consent default -> js -> config -> event
    const commands = dataLayer.map((entry: any) => Array.from(entry));
    expect(commands[0][0]).toBe('consent');
    expect(commands[0][1]).toBe('default');
    expect(commands[1][0]).toBe('js');
    expect(commands[2][0]).toBe('config');
    expect(commands[2][1]).toBe('G-TEST123');
    expect(commands[3][0]).toBe('event');
    expect(commands[3][1]).toBe('war_started');

    consent.setAnalyticsConsent('denied');
    TestBed.flushEffects();
    let consentCalls = ((window as any).dataLayer as unknown[])
      .map((entry: any) => Array.from(entry))
      .filter(args => args[0] === 'consent');
    expect(consentCalls[consentCalls.length - 1][1]).toBe('update');
    expect((consentCalls[consentCalls.length - 1][2] as any).analytics_storage).toBe('denied');
    expect((consentCalls[consentCalls.length - 1][2] as any).ad_storage).toBe('denied');

    consent.setAnalyticsConsent('granted');
    TestBed.flushEffects();
    consentCalls = ((window as any).dataLayer as unknown[])
      .map((entry: any) => Array.from(entry))
      .filter(args => args[0] === 'consent');
    expect(consentCalls[consentCalls.length - 1][1]).toBe('update');
    expect((consentCalls[consentCalls.length - 1][2] as any).analytics_storage).toBe('granted');
    expect((consentCalls[consentCalls.length - 1][2] as any).ad_personalization).toBe('denied');
  });

  it('does not initialize or send when measurement ID is missing or invalid', () => {
    TestBed.configureTestingModule({
      providers: [
        GtagTelemetryTransport,
        TelemetryConsentService,
        {
          provide: GAME_TELEMETRY_CONFIG,
          useValue: {
            measurementId: '',
            appVersion: 'test',
            rulesetVersion: 'test'
          }
        }
      ]
    });
    const consent = TestBed.inject(TelemetryConsentService);
    const transport = TestBed.inject(GtagTelemetryTransport);
    consent.setAnalyticsConsent('granted');

    transport.send({ name: 'war_started', parameters: {} });
    expect(document.getElementById('war-of-attrition-ga4')).toBeNull();
    expect((window as any).dataLayer).toBeUndefined();
    expect(transport.isConfigured).toBeFalse();
  });

  it('initializes only once across multiple events and handles script onerror safely', () => {
    TestBed.configureTestingModule({
      providers: [
        GtagTelemetryTransport,
        TelemetryConsentService,
        {
          provide: GAME_TELEMETRY_CONFIG,
          useValue: {
            measurementId: 'G-ONCE123',
            appVersion: 'test',
            rulesetVersion: 'test'
          }
        }
      ]
    });
    const consent = TestBed.inject(TelemetryConsentService);
    const transport = TestBed.inject(GtagTelemetryTransport);
    consent.setAnalyticsConsent('granted');

    transport.send({ name: 'war_started', parameters: {} });
    const script = document.getElementById('war-of-attrition-ga4') as HTMLScriptElement;
    expect(script).not.toBeNull();

    // Trigger error handler to ensure safe logging without crashing gameplay
    const warnSpy = spyOn(console, 'warn');
    script.onerror?.(new Event('error'));
    expect(warnSpy).toHaveBeenCalled();

    // Sending a second event should not re-inject script or re-run config
    transport.send({ name: 'turn_started', parameters: {} });
    const scripts = document.querySelectorAll('#war-of-attrition-ga4');
    expect(scripts.length).toBe(1);
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

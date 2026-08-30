import { TestBed } from '@angular/core/testing';
import { TelemetryRecord } from '../core/models/telemetry.model';
import { TelemetryConsentService } from './telemetry-consent.service';
import {
  GAME_TELEMETRY_CONFIG,
  GAME_TELEMETRY_TRANSPORT,
  TelemetryTransport,
} from './telemetry-transport.service';
import { UI_TELEMETRY_NOW, UiTelemetryService, durationBucketFor } from './ui-telemetry.service';

class CapturingTransport implements TelemetryTransport {
  readonly records: TelemetryRecord[] = [];

  send(record: TelemetryRecord): void {
    this.records.push(record);
  }
}

describe('UiTelemetryService', () => {
  let consent: TelemetryConsentService;
  let service: UiTelemetryService;
  let transport: CapturingTransport;
  let now: number;

  beforeEach(() => {
    localStorage.clear();
    now = 0;
    transport = new CapturingTransport();
    TestBed.configureTestingModule({
      providers: [
        TelemetryConsentService,
        UiTelemetryService,
        { provide: UI_TELEMETRY_NOW, useValue: () => now },
        { provide: GAME_TELEMETRY_TRANSPORT, useValue: transport },
        {
          provide: GAME_TELEMETRY_CONFIG,
          useValue: {
            measurementId: 'G-TEST123',
            appVersion: 'ui-test',
            rulesetVersion: 'unchanged-gameplay-schema',
          },
        },
      ],
    });
    consent = TestBed.inject(TelemetryConsentService);
    service = TestBed.inject(UiTelemetryService);
  });

  afterEach(() => localStorage.clear());

  it('emits, queues, and persists nothing while consent is unknown or denied', () => {
    service.openSurface({ surface: 'table' });
    now = 20_000;
    service.closeSurface();
    consent.setAnalyticsConsent('denied');
    service.openSurface({ surface: 'profile' });

    expect(transport.records).toEqual([]);
  });

  it('emits one open and one coarsely bucketed engagement event', () => {
    consent.setAnalyticsConsent('granted');
    service.openSurface({ surface: 'chronicle', sourceSurface: 'field_manual' });
    service.openSurface({ surface: 'chronicle', sourceSurface: 'field_manual' });
    now = 35_000;
    service.closeSurface();

    expect(transport.records.map(record => record.name)).toEqual([
      'surface_opened',
      'surface_engaged',
    ]);
    expect(transport.records[1].parameters['duration_bucket']).toBe('30_60s');
    expect(transport.records[0].parameters['ui_schema_version']).toBe(1);
    expect(transport.records[0].parameters['app_version']).toBe('ui-test');
  });

  it('orders surface switches with one ephemeral session ID and an incrementing sequence', () => {
    consent.setAnalyticsConsent('granted');
    service.openSurface({ surface: 'table' });
    now = 2_000;
    service.openSurface(
      { surface: 'profile', subsurface: 'career_records', sourceSurface: 'table' },
    );
    now = 12_000;
    service.openSurface({ surface: 'achievements', sourceSurface: 'profile' });
    now = 15_000;
    service.closeSurface();

    expect(transport.records.map(record => `${record.name}:${record.parameters['surface']}`)).toEqual([
      'surface_opened:table',
      'surface_engaged:table',
      'surface_opened:profile',
      'surface_engaged:profile',
      'surface_opened:achievements',
      'surface_engaged:achievements',
    ]);
    expect(transport.records.map(record => record.parameters['ui_event_seq'])).toEqual([
      1, 2, 3, 4, 5, 6,
    ]);
    expect(new Set(transport.records.map(record => record.parameters['ui_session_id'])).size).toBe(1);
    expect(localStorage.getItem('ui_session_id')).toBeNull();
  });

  it('finalizes visible engagement when the document becomes hidden and does not resume it', () => {
    consent.setAnalyticsConsent('granted');
    service.openSurface({ surface: 'rules' }, 'rules');
    now = 12_000;
    const visibility = spyOnProperty(document, 'visibilityState', 'get').and.returnValue('hidden');
    document.dispatchEvent(new Event('visibilitychange'));
    now = 200_000;
    service.closeSurface('rules');

    expect(transport.records.map(record => record.name)).toEqual([
      'surface_opened',
      'surface_engaged',
    ]);
    expect(transport.records[1].parameters['duration_bucket']).toBe('10_30s');
    visibility.and.callThrough();
  });

  it('whitelists stable semantic context without accepting content or hidden-card fields', () => {
    consent.setAnalyticsConsent('granted');
    service.openSurface(
      {
        surface: 'chronicle',
        subsurface: 'entry_detail',
        chronicleEntry: 'battle_reveal',
        sourceSurface: 'chronicle',
      },
      'chronicle-entry',
    );
    service.openSurface(
      {
        surface: 'field_manual',
        subsurface: 'card_reference',
        manualEntryType: 'card_reference',
        sourceSurface: 'table',
      },
      'manual-reference',
    );
    service.openSurface(
      {
        surface: 'rules',
        subsurface: 'rule_demo',
        ruleId: 'reinforcement',
        sourceSurface: 'field_manual',
      },
      'rule-demo',
    );
    service.openSurface(
      {
        surface: 'field_manual',
        subsurface: 'commander_dossier',
        manualEntryType: 'commander_dossier',
        commanderId: 'analyst',
        sourceSurface: 'field_manual',
      },
      'dossier',
    );

    const serialized = JSON.stringify(transport.records);
    expect(serialized).toContain('battle_reveal');
    expect(serialized).toContain('reinforcement');
    expect(serialized).toContain('analyst');
    expect(serialized).not.toContain('story text');
    expect(serialized).not.toContain('card_id');
    expect(serialized).not.toContain('rank');
    expect(serialized).not.toContain('suit');
  });

  it('stops immediately on withdrawal and never sends a post-consent terminal event', () => {
    consent.setAnalyticsConsent('granted');
    service.openSurface({ surface: 'settings' });
    consent.setAnalyticsConsent('denied');
    TestBed.flushEffects();
    now = 90_000;
    service.closeSurface();

    expect(transport.records.map(record => record.name)).toEqual(['surface_opened']);
  });

  it('uses the documented duration boundaries', () => {
    expect(durationBucketFor(0)).toBe('lt_10s');
    expect(durationBucketFor(9_999)).toBe('lt_10s');
    expect(durationBucketFor(10_000)).toBe('10_30s');
    expect(durationBucketFor(30_000)).toBe('30_60s');
    expect(durationBucketFor(60_000)).toBe('1_3m');
    expect(durationBucketFor(180_000)).toBe('3m_plus');
  });
});

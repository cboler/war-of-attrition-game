import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import {
  AnalyticsConsentDecision,
  AnalyticsConsentDialogComponent,
} from '../shared/components/analytics-consent-dialog/analytics-consent-dialog.component';
import { AnalyticsConsentPromptService } from './analytics-consent-prompt.service';
import { TelemetryConsentService } from './telemetry-consent.service';

describe('AnalyticsConsentPromptService', () => {
  let consent: TelemetryConsentService;
  let dialog: jasmine.SpyObj<MatDialog>;
  let decision: Subject<AnalyticsConsentDecision | undefined>;

  beforeEach(() => {
    localStorage.clear();
    document.getElementById('war-of-attrition-ga4')?.remove();
    delete (window as unknown as { dataLayer?: unknown[] }).dataLayer;
    delete (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
    decision = new Subject<AnalyticsConsentDecision | undefined>();
    dialog = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);
    dialog.open.and.returnValue({
      afterClosed: () => decision.asObservable(),
    } as MatDialogRef<AnalyticsConsentDialogComponent, AnalyticsConsentDecision>);

    TestBed.configureTestingModule({
      providers: [
        AnalyticsConsentPromptService,
        TelemetryConsentService,
        { provide: MatDialog, useValue: dialog },
      ],
    });
    consent = TestBed.inject(TelemetryConsentService);
  });

  afterEach(() => localStorage.clear());

  it('asks for an explicit decision on first launch before any analytics is initialized', fakeAsync(() => {
    TestBed.inject(AnalyticsConsentPromptService);
    tick();

    expect(dialog.open).toHaveBeenCalledOnceWith(
      AnalyticsConsentDialogComponent,
      jasmine.objectContaining({
        disableClose: true,
        closeOnNavigation: false,
        autoFocus: 'dialog',
        ariaModal: true,
        ariaLabelledBy: 'analytics-consent-title',
        ariaDescribedBy: 'analytics-consent-description',
      }),
    );
    expect(consent.analyticsConsent()).toBe('unknown');
    expect((window as unknown as { dataLayer?: unknown[] }).dataLayer).toBeUndefined();
    expect(document.getElementById('war-of-attrition-ga4')).toBeNull();
  }));

  it('stores only an explicit affirmative choice as granted', fakeAsync(() => {
    TestBed.inject(AnalyticsConsentPromptService);
    tick();

    decision.next('granted');
    decision.complete();

    expect(consent.analyticsConsent()).toBe('granted');
    expect(localStorage.getItem('war-of-attrition-telemetry-consent')).toBe('granted');
  }));

  it('stores an explicit denial', fakeAsync(() => {
    TestBed.inject(AnalyticsConsentPromptService);
    tick();

    decision.next('denied');
    decision.complete();

    expect(consent.analyticsConsent()).toBe('denied');
    expect(localStorage.getItem('war-of-attrition-telemetry-consent')).toBe('denied');
  }));

  it('does not prompt again after a stored decision', fakeAsync(() => {
    consent.setAnalyticsConsent('denied');
    TestBed.inject(AnalyticsConsentPromptService);
    tick();

    expect(dialog.open).not.toHaveBeenCalled();
  }));

  it('does not grant from rendering or a non-decision', fakeAsync(() => {
    TestBed.inject(AnalyticsConsentPromptService);
    tick();
    decision.next(undefined);
    decision.complete();

    expect(consent.analyticsConsent()).toBe('unknown');
    expect(localStorage.getItem('war-of-attrition-telemetry-consent')).toBeNull();
  }));

  it('ensureConsentResolved returns existing decision immediately when known', fakeAsync(() => {
    consent.setAnalyticsConsent('granted');
    const service = TestBed.inject(AnalyticsConsentPromptService);
    let resolved: string | null = 'not_called';
    service.ensureConsentResolved().subscribe(res => {
      resolved = res;
    });
    tick();

    expect(resolved).toBe('granted');
    expect(dialog.open).not.toHaveBeenCalled();
  }));

  it('ensureConsentResolved opens dialog immediately when unknown and completes on close', fakeAsync(() => {
    const service = TestBed.inject(AnalyticsConsentPromptService);
    let resolved: string | null = 'not_called';
    service.ensureConsentResolved().subscribe(res => {
      resolved = res;
    });
    // Dialog opened immediately without waiting for background tick
    expect(dialog.open).toHaveBeenCalledOnceWith(
      AnalyticsConsentDialogComponent,
      jasmine.any(Object)
    );
    expect(resolved).toBe('not_called');

    decision.next('granted');
    decision.complete();
    tick();

    expect(resolved).toBe('granted');
    expect(consent.analyticsConsent()).toBe('granted');
  }));
});

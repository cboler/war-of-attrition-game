import { signal } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { GameOutcome } from '../core/models/game-state.model';
import {
  AnalyticsConsentDecision,
  AnalyticsConsentDialogComponent,
} from '../shared/components/analytics-consent-dialog/analytics-consent-dialog.component';
import { AnalyticsConsentPromptService } from './analytics-consent-prompt.service';
import { GameControllerService, PresentationState } from './game-controller.service';
import { GameEventBusService } from './game-event-bus.service';
import { TelemetryConsentService } from './telemetry-consent.service';
import { TutorialService } from './tutorial.service';

describe('AnalyticsConsentPromptService', () => {
  const presentationState = signal(PresentationState.READY);
  const tutorialActive = signal(false);
  let consent: TelemetryConsentService;
  let eventBus: GameEventBusService;
  let dialog: jasmine.SpyObj<MatDialog>;
  let decision: Subject<AnalyticsConsentDecision | undefined>;

  beforeEach(() => {
    localStorage.clear();
    document.getElementById('war-of-attrition-ga4')?.remove();
    delete (window as unknown as { dataLayer?: unknown[] }).dataLayer;
    delete (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
    presentationState.set(PresentationState.READY);
    tutorialActive.set(false);
    decision = new Subject<AnalyticsConsentDecision | undefined>();
    dialog = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);
    dialog.open.and.returnValue({
      afterClosed: () => decision.asObservable(),
    } as MatDialogRef<AnalyticsConsentDialogComponent, AnalyticsConsentDecision>);

    TestBed.configureTestingModule({
      providers: [
        AnalyticsConsentPromptService,
        GameEventBusService,
        TelemetryConsentService,
        { provide: MatDialog, useValue: dialog },
        {
          provide: GameControllerService,
          useValue: { presentationState: presentationState.asReadonly() },
        },
        {
          provide: TutorialService,
          useValue: { isTutorialActive: tutorialActive.asReadonly() },
        },
      ],
    });
    consent = TestBed.inject(TelemetryConsentService);
    eventBus = TestBed.inject(GameEventBusService);
    TestBed.inject(AnalyticsConsentPromptService);
    // Establish the initial READY/unknown observation before each test drives
    // the same GAME_OVER transition that production emits synchronously.
    TestBed.flushEffects();
  });

  afterEach(() => localStorage.clear());

  function emitCompletedWar(): void {
    eventBus.emit({
      type: 'game_resolved',
      turnNumber: 12,
      outcome: GameOutcome.PLAYER_WIN,
      turns: 12,
      playerCardsRemaining: 4,
      opponentCardsRemaining: 0,
      maxDeficitExperienced: 0,
      isComeback: false,
      battlesCount: 1,
      playerReinforcementsSent: 1,
    });
  }

  it('becomes eligible only after a completed War reaches the settled game-over state', fakeAsync(() => {
    emitCompletedWar();
    TestBed.flushEffects();
    tick();
    expect(dialog.open).not.toHaveBeenCalled();

    presentationState.set(PresentationState.GAME_OVER);
    TestBed.flushEffects();
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

  it('waits until tutorial UI is no longer active', fakeAsync(() => {
    presentationState.set(PresentationState.GAME_OVER);
    tutorialActive.set(true);
    emitCompletedWar();
    TestBed.flushEffects();
    tick();
    expect(dialog.open).not.toHaveBeenCalled();

    tutorialActive.set(false);
    TestBed.flushEffects();
    tick();
    expect(dialog.open).toHaveBeenCalledTimes(1);
  }));

  it('stores only an explicit affirmative choice as granted', fakeAsync(() => {
    presentationState.set(PresentationState.GAME_OVER);
    emitCompletedWar();
    TestBed.flushEffects();
    tick();

    expect(consent.analyticsConsent()).toBe('unknown');
    decision.next('granted');
    decision.complete();

    expect(consent.analyticsConsent()).toBe('granted');
    expect(localStorage.getItem('war-of-attrition-telemetry-consent')).toBe('granted');
  }));

  it('stores an explicit denial and never prompts automatically after either decision', fakeAsync(() => {
    presentationState.set(PresentationState.GAME_OVER);
    emitCompletedWar();
    TestBed.flushEffects();
    tick();

    decision.next('denied');
    decision.complete();
    expect(consent.analyticsConsent()).toBe('denied');
    expect(localStorage.getItem('war-of-attrition-telemetry-consent')).toBe('denied');

    dialog.open.calls.reset();
    emitCompletedWar();
    TestBed.flushEffects();
    tick();
    expect(dialog.open).not.toHaveBeenCalled();

    consent.setAnalyticsConsent('granted');
    emitCompletedWar();
    TestBed.flushEffects();
    tick();
    expect(dialog.open).not.toHaveBeenCalled();
  }));

  it('does not grant from rendering or dismissal without a decision', fakeAsync(() => {
    presentationState.set(PresentationState.GAME_OVER);
    emitCompletedWar();
    TestBed.flushEffects();
    tick();
    expect(dialog.open).toHaveBeenCalledTimes(1);
    expect(consent.analyticsConsent()).toBe('unknown');

    decision.next(undefined);
    decision.complete();
    expect(consent.analyticsConsent()).toBe('unknown');
    expect(localStorage.getItem('war-of-attrition-telemetry-consent')).toBeNull();
  }));
});

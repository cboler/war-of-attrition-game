import { DestroyRef, Injectable, effect, inject, signal } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { filter, take } from 'rxjs';
import {
  AnalyticsConsentDecision,
  AnalyticsConsentDialogComponent,
} from '../shared/components/analytics-consent-dialog/analytics-consent-dialog.component';
import { GameControllerService, PresentationState } from './game-controller.service';
import { GameEventBusService } from './game-event-bus.service';
import { TelemetryConsentService } from './telemetry-consent.service';
import { TutorialService } from './tutorial.service';

/** Coordinates the single post-War invitation; it emits no telemetry itself. */
@Injectable({ providedIn: 'root' })
export class AnalyticsConsentPromptService {
  private readonly dialog = inject(MatDialog);
  private readonly consent = inject(TelemetryConsentService);
  private readonly controller = inject(GameControllerService);
  private readonly tutorial = inject(TutorialService);
  private readonly eventBus = inject(GameEventBusService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly completedWarPending = signal(false);
  private dialogRef: MatDialogRef<AnalyticsConsentDialogComponent, AnalyticsConsentDecision> | null =
    null;
  private promptTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    const eventsSubscription = this.eventBus.events$
      .pipe(filter(event => event.type === 'game_resolved'))
      .subscribe(() => this.completedWarPending.set(true));

    effect(() => {
      const decision = this.consent.analyticsConsent();
      const completedWarPending = this.completedWarPending();
      const fullyResolved = this.controller.presentationState() === PresentationState.GAME_OVER;
      const tutorialActive = this.tutorial.isTutorialActive();

      if (decision !== 'unknown') {
        this.completedWarPending.set(false);
        return;
      }
      if (!completedWarPending || !fullyResolved || tutorialActive || this.dialogRef) return;

      this.completedWarPending.set(false);
      this.schedulePromptAfterRender();
    });

    this.destroyRef.onDestroy(() => {
      eventsSubscription.unsubscribe();
      if (this.promptTimer !== null) clearTimeout(this.promptTimer);
    });
  }

  private schedulePromptAfterRender(): void {
    if (this.promptTimer !== null) return;
    this.promptTimer = setTimeout(() => {
      this.promptTimer = null;
      if (
        this.consent.analyticsConsent() !== 'unknown' ||
        this.controller.presentationState() !== PresentationState.GAME_OVER ||
        this.tutorial.isTutorialActive() ||
        this.dialogRef
      ) {
        return;
      }
      this.openDecisionDialog();
    }, 0);
  }

  private openDecisionDialog(): void {
    this.dialogRef = this.dialog.open(AnalyticsConsentDialogComponent, {
      width: 'min(520px, calc(100vw - 20px))',
      maxHeight: 'calc(100dvh - 20px)',
      panelClass: ['themed-dialog-panel', 'analytics-consent-dialog-panel'],
      disableClose: true,
      closeOnNavigation: false,
      autoFocus: 'dialog',
      restoreFocus: true,
      ariaModal: true,
      ariaLabelledBy: 'analytics-consent-title',
      ariaDescribedBy: 'analytics-consent-description',
    });

    this.dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe(decision => {
        this.dialogRef = null;
        if (decision === 'granted' || decision === 'denied') {
          this.consent.setAnalyticsConsent(decision);
        }
      });
  }
}

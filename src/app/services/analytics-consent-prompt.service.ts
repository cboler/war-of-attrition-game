import { DestroyRef, Injectable, inject } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable, map, of, take } from 'rxjs';
import {
  AnalyticsConsentDecision,
  AnalyticsConsentDialogComponent,
} from '../shared/components/analytics-consent-dialog/analytics-consent-dialog.component';
import { TelemetryConsentService } from './telemetry-consent.service';

/** Coordinates the first-launch consent decision; it emits no telemetry itself. */
@Injectable({ providedIn: 'root' })
export class AnalyticsConsentPromptService {
  private readonly dialog = inject(MatDialog);
  private readonly consent = inject(TelemetryConsentService);
  private readonly destroyRef = inject(DestroyRef);
  private dialogRef: MatDialogRef<AnalyticsConsentDialogComponent, AnalyticsConsentDecision> | null =
    null;
  private promptTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.schedulePromptAfterRender();

    this.destroyRef.onDestroy(() => {
      if (this.promptTimer !== null) clearTimeout(this.promptTimer);
    });
  }

  /**
   * Ensures the analytics consent decision has been resolved.
   * If consent is already determined ('granted' or 'denied'), emits immediately.
   * If consent is 'unknown', ensures the dialog is open and emits when closed.
   */
  ensureConsentResolved(): Observable<AnalyticsConsentDecision | null> {
    if (this.consent.analyticsConsent() !== 'unknown') {
      return of(this.consent.analyticsConsent() as AnalyticsConsentDecision);
    }
    if (this.dialogRef) {
      return this.dialogRef.afterClosed().pipe(
        take(1),
        map(decision => decision ?? null),
      );
    }
    if (this.promptTimer !== null) {
      clearTimeout(this.promptTimer);
      this.promptTimer = null;
    }
    return this.openDecisionDialog();
  }

  private schedulePromptAfterRender(): void {
    if (this.promptTimer !== null) return;
    this.promptTimer = setTimeout(() => {
      this.promptTimer = null;
      if (
        this.consent.analyticsConsent() !== 'unknown' ||
        this.dialogRef
      ) {
        return;
      }
      this.openDecisionDialog();
    }, 0);
  }

  private openDecisionDialog(): Observable<AnalyticsConsentDecision | null> {
    if (this.dialogRef) {
      return this.dialogRef.afterClosed().pipe(
        take(1),
        map(decision => decision ?? null),
      );
    }

    const ref = this.dialog.open<AnalyticsConsentDialogComponent, unknown, AnalyticsConsentDecision>(
      AnalyticsConsentDialogComponent,
      {
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
      },
    );
    this.dialogRef = ref;

    ref
      .afterClosed()
      .pipe(take(1))
      .subscribe(decision => {
        this.dialogRef = null;
        if (decision === 'granted' || decision === 'denied') {
          this.consent.setAnalyticsConsent(decision);
        }
      });

    return ref.afterClosed().pipe(
      take(1),
      map(decision => decision ?? null),
    );
  }
}

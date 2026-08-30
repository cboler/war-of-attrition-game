import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AnalyticsConsent } from '../../../services/telemetry-consent.service';

export type AnalyticsConsentDecision = Exclude<AnalyticsConsent, 'unknown'>;

@Component({
  selector: 'app-analytics-consent-dialog',
  imports: [MatButtonModule, MatDialogModule, MatIconModule, RouterLink],
  templateUrl: './analytics-consent-dialog.component.html',
  styleUrl: './analytics-consent-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsConsentDialogComponent {
  private readonly dialogRef = inject(
    MatDialogRef<AnalyticsConsentDialogComponent, AnalyticsConsentDecision>,
  );

  protected choose(decision: AnalyticsConsentDecision): void {
    this.dialogRef.close(decision);
  }
}

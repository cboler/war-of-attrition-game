import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../core/services/auth.service';
import { SettingsService } from '../../core/services/settings.service';
import { TutorialService } from '../../services/tutorial.service';
import { TelemetryConsentService } from '../../services/telemetry-consent.service';
import {
  APP_LOCAL_STORAGE_KEYS,
  APP_SESSION_STORAGE_KEYS
} from '../../core/models/app-storage.model';

@Component({
  selector: 'app-data-deletion',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  template: `
    <div class="legal-page-container">
      <mat-card class="legal-card">
        <mat-card-header>
          <div class="header-icon warn">
            <mat-icon>delete_forever</mat-icon>
          </div>
          <div class="header-titles">
            <mat-card-title>Account & Data Deletion</mat-card-title>
            <mat-card-subtitle>User Data Lifecycle & Deletion Request</mat-card-subtitle>
          </div>
        </mat-card-header>

        <mat-card-content class="legal-content">
          <section>
            <h3>1. What Data Exists for Your Account</h3>
            <p>
              In War of Attrition, your gameplay profile, career statistics, Campaign progress, token balance, cosmetic unlocks,
              preferences, tutorial progress, and local achievements are stored <strong>locally in application-owned browser/device storage</strong>.
            </p>
            <p>
              If you signed in using Google Identity Services, your Google profile name and avatar were cached locally to personalize 
              your display. <strong>We do not maintain a custom remote server database of user passwords or personal identifiers.</strong>
            </p>
          </section>

          <section>
            <h3>2. What Gets Deleted</h3>
            <ul>
              <li>All local player profiles (Guest and Google-linked profiles).</li>
              <li>Lifetime match statistics, win rates, and streak counters.</li>
              <li>Battle and challenge milestone history.</li>
              <li>Campaign history, cosmetic tokens, and unlocked card backings.</li>
              <li>Custom appearance settings and preferences.</li>
              <li>Saved analytics-consent choice and tutorial progress.</li>
            </ul>
            <p>
              <em>Note:</em> Deleting your War of Attrition local data <strong>does NOT delete or affect your Google Account</strong>. 
              Achievements already synchronized to Google Play Games Services remain linked to your Google Play Games account in accordance with Google's terms.
              It also cannot retract pseudonymous analytics events that were previously transmitted to Google Analytics; those are governed by Google's retention and deletion controls.
            </p>
          </section>

          <section class="deletion-action-box">
            <h3>Immediate In-App Data Reset & Deletion</h3>
            <p>
              You can remove War of Attrition's application-owned local data and reset the game to a new guest profile right now.
              The operation is scoped and does not clear unrelated data stored by other applications on the same web origin.
            </p>

            @if (deletionSuccess()) {
              <div class="success-banner">
                <mat-icon>check_circle</mat-icon>
                <span>War of Attrition's local profiles, progression, settings, and consent choice have been reset.</span>
              </div>
            } @else {
              <button mat-raised-button color="warn" class="delete-now-btn" (click)="performLocalDataDeletion()">
                <mat-icon>delete_forever</mat-icon> Delete All My App Data Now
              </button>
            }
          </section>

          <section>
            <h3>3. Manual Deletion Requests</h3>
            <p>
              The button above removes application-owned local state from this browser/device. It does not delete Google Account data,
              Google Play achievement records, browser cookies controlled by third parties, or previously transmitted analytics records.
              If you have additional questions regarding data privacy or Google Play data safety, please reach out via our
              <a routerLink="/support">Support Page</a>.
            </p>
          </section>
        </mat-card-content>

        <mat-divider></mat-divider>

        <mat-card-actions class="legal-actions">
          <button mat-raised-button color="primary" routerLink="/">
            <mat-icon>arrow_back</mat-icon> Return to Game
          </button>
          <button mat-button routerLink="/privacy">
            <mat-icon>privacy_tip</mat-icon> Privacy Policy
          </button>
          <button mat-button routerLink="/support">
            <mat-icon>help_outline</mat-icon> Support
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styleUrls: ['./legal-pages.scss']
})
export class DataDeletionComponent {
  private authService = inject(AuthService);
  private settingsService = inject(SettingsService);
  private tutorialService = inject(TutorialService);
  private telemetryConsent = inject(TelemetryConsentService);

  readonly deletionSuccess = signal(false);

  performLocalDataDeletion(): void {
    if (typeof window !== 'undefined') {
      try {
        Object.values(APP_LOCAL_STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
        APP_SESSION_STORAGE_KEYS.forEach(key => sessionStorage.removeItem(key));
      } catch (e) {
        console.warn('Could not clear all application-owned web storage:', e);
      }
    }

    this.authService.deleteAllLocalProfilesAndCreateFreshGuest();
    this.settingsService.resetSettings();
    this.tutorialService.resetTutorialProgress();
    this.telemetryConsent.clearAnalyticsConsent();
    this.deletionSuccess.set(true);
  }
}

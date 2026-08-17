import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../core/services/auth.service';
import { SettingsService } from '../../core/services/settings.service';

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
              In War of Attrition, your gameplay profile, match counts, win streaks, challenge metrics, custom card backings, 
              and in-game achievements are stored <strong>locally in your browser/device storage</strong>.
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
              <li>Custom appearance settings and preferences.</li>
            </ul>
            <p>
              <em>Note:</em> Deleting your War of Attrition local data <strong>does NOT delete or affect your Google Account</strong>. 
              Achievements already synchronized to Google Play Games Services remain linked to your Google Play Games account in accordance with Google's terms.
            </p>
          </section>

          <section class="deletion-action-box">
            <h3>Immediate In-App Data Reset & Deletion</h3>
            <p>
              You can instantly purge all local application storage and reset the game to its initial pristine state right now:
            </p>

            @if (deletionSuccess()) {
              <div class="success-banner">
                <mat-icon>check_circle</mat-icon>
                <span>All local game data, profiles, and statistics have been permanently cleared.</span>
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
              Because our architecture uses on-device local storage, executing the button above immediately purges 100% of the game data on your device. 
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

  readonly deletionSuccess = signal(false);

  performLocalDataDeletion(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {
        console.warn('Could not clear web storage:', e);
      }
    }

    this.authService.signOut();
    this.authService.resetActiveUserStats();
    this.settingsService.resetSettings();
    this.deletionSuccess.set(true);
  }
}

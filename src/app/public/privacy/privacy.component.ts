import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-privacy',
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
          <div class="header-icon">
            <mat-icon>privacy_tip</mat-icon>
          </div>
          <div class="header-titles">
            <mat-card-title>Privacy Policy</mat-card-title>
            <mat-card-subtitle>War of Attrition — Physical Card Game (Digital Edition)</mat-card-subtitle>
          </div>
        </mat-card-header>

        <mat-card-content class="legal-content">
          <div class="last-updated">Last Updated: August 16, 2026</div>

          <section>
            <h3>1. Overview & Developer Identity</h3>
            <p>
              This Privacy Policy explains how <strong>War of Attrition</strong> ("we", "us", or "our") processes user information. 
              War of Attrition is a strategic two-player card game developed by <strong>cboler</strong> and distributed on the web 
              and Google Play.
            </p>
          </section>

          <section>
            <h3>2. Data We Collect & How It Is Used</h3>
            <p>We believe in data minimization. The application operates primarily on your device with no hidden tracking or data mining:</p>
            <ul>
              <li>
                <strong>Local Game Profile & Career Statistics:</strong> We store player display names, match history, win/loss records, 
                challenges, battle layers reached, and unlocked achievements locally in your browser/device local storage. This data never 
                leaves your device unless synced with connected Google services.
              </li>
              <li>
                <strong>Optional Google Sign-In:</strong> If you choose to sign in with Google, we receive basic public profile information 
                (name, email address, and avatar image) provided by Google Identity Services. This is used solely to display your commander identity 
                and associate your gameplay statistics with your profile.
              </li>
              <li>
                <strong>Google Play Games Services:</strong> On Android devices, if you connect Google Play Games, achievement unlocks and progress 
                are submitted to Google Play Games Services to update your Google Play Games account and XP.
              </li>
              <li>
                <strong>Gameplay State & Preferences:</strong> User settings (theme selection, sound effects, animation speed, and card backings) 
                are saved exclusively in local storage.
              </li>
            </ul>
          </section>

          <section>
            <h3>3. Third-Party Services</h3>
            <p>The application integrates with the following third-party services:</p>
            <ul>
              <li><strong>Google Identity Services:</strong> Authentication and profile display (<a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Google Privacy Policy</a>).</li>
              <li><strong>Google Play Games Services:</strong> Leaderboards and achievement synchronization on Android (<a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Google Play Terms</a>).</li>
              <li><strong>Google Tag Manager / Google Analytics:</strong> Basic anonymous web telemetry for web version error diagnostics and usage metrics (<a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener">Partner Privacy Policy</a>).</li>
            </ul>
          </section>

          <section>
            <h3>4. Advertising & Monetization</h3>
            <p>
              War of Attrition contains <strong>NO third-party advertising</strong>, NO in-app purchases, NO monetization trackers, and NO sale or rental of personal data to data brokers.
            </p>
          </section>

          <section>
            <h3>5. Data Retention & Deletion</h3>
            <p>
              Your gameplay data is retained in local storage until you clear it. You can erase all local statistics, profiles, and achievement progress 
              at any time using the in-app "Reset Active Profile Stats" button or through our public <a routerLink="/delete-account">Data Deletion Page</a>. 
              Deleting app data does not delete your Google Account.
            </p>
          </section>

          <section>
            <h3>6. Security Practices</h3>
            <p>
              All network communications (including authentication and achievement synchronization) occur over secure encrypted HTTPS channels.
            </p>
          </section>

          <section>
            <h3>7. Contact & Inquiries</h3>
            <p>
              For privacy-related questions or data deletion requests, visit our <a routerLink="/support">Support Page</a> or contact us directly via email.
            </p>
          </section>
        </mat-card-content>

        <mat-divider></mat-divider>

        <mat-card-actions class="legal-actions">
          <button mat-raised-button color="primary" routerLink="/">
            <mat-icon>arrow_back</mat-icon> Return to Game
          </button>
          <button mat-button routerLink="/support">
            <mat-icon>help_outline</mat-icon> Support
          </button>
          <button mat-button routerLink="/delete-account">
            <mat-icon>delete_forever</mat-icon> Data Deletion
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styleUrls: ['./legal-pages.scss']
})
export class PrivacyComponent {}

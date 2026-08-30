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
          <div class="last-updated">Last Updated: August 29, 2026</div>

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
            <p>We use data minimization. The application operates primarily on your device:</p>
            <ul>
              <li>
                <strong>Local Game Profile & Career Statistics:</strong> We store player display names, match history, win/loss records, 
                challenges, battle layers reached, Campaign progress, cosmetic tokens, and unlocked achievements locally in your browser/device storage.
                Profile names, email addresses, Google account IDs, and avatar URLs are not included in analytics records.
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
                <strong>Gameplay State & Preferences:</strong> User settings (deck handedness, sound effects, animation speed, and card backings)
                are saved exclusively in local storage.
              </li>
              <li>
                <strong>Optional Anonymized Gameplay & App-Usage Statistics:</strong> When a release has Google Analytics configured and you explicitly grant analytics consent,
                the game sends anonymized gameplay statistics, including War outcomes and abandonment, turn and deck totals, Battle depth and casualties,
                reinforcement decisions, public card ranks, suits, and comparisons, Campaign summaries, and cosmetic unlocks. It also sends semantic visits
                to major areas such as the Chronicle, Field Manual, Rules, Profile, Achievements, and Settings, with coarse visible-duration ranges and ephemeral
                in-memory ordering values. These records use random game- or app-session-scoped identifiers, event sequence numbers, and version fields; they do
                not include your name, email address, profile ID, Google account ID, avatar URL, story or dossier text, hidden card identities, or user-entered values.
              </li>
            </ul>
          </section>

          <section>
            <h3>3. Third-Party Services</h3>
            <p>The application integrates with the following third-party services:</p>
            <ul>
              <li><strong>Google Identity Services:</strong> Authentication and profile display (<a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Google Privacy Policy</a>).</li>
              <li><strong>Google Play Games Services:</strong> Leaderboards and achievement synchronization on Android (<a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Google Play Terms</a>).</li>
              <li><strong>Google Analytics:</strong> Consent-gated anonymized gameplay and app-usage statistics when configured. Google may process online identifiers and technical information under its terms (<a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener">How Google uses partner data</a>).</li>
            </ul>
          </section>

          <section>
            <h3>4. Advertising & Purchases</h3>
            <p>
              War of Attrition contains no advertising SDK, displays no ads, and makes no ad requests. It also has no in-app purchases:
              tokens and cosmetics are earned only through play and cannot be purchased with real money. We do not sell or rent personal data.
            </p>
          </section>

          <section>
            <h3>5. Data Retention & Deletion</h3>
            <p>
              Local gameplay data is retained until you reset or delete it. "Reset Stats" clears resettable career statistics only and preserves
              Campaign progression, tokens, and cosmetic entitlements. The <a routerLink="/delete-account">Data Deletion Page</a> resets all
              War of Attrition application-owned local data. Local deletion does not delete your Google Account, synchronized Google Play records,
              or analytics records already transmitted to Google. Analytics consent can be withdrawn for future collection.
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

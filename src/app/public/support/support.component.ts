import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatExpansionModule
  ],
  template: `
    <div class="legal-page-container">
      <mat-card class="legal-card">
        <mat-card-header>
          <div class="header-icon">
            <mat-icon>support_agent</mat-icon>
          </div>
          <div class="header-titles">
            <mat-card-title>Player Support & Help Center</mat-card-title>
            <mat-card-subtitle>War of Attrition — Card Game Assistance</mat-card-subtitle>
          </div>
        </mat-card-header>

        <mat-card-content class="legal-content">
          <section class="support-contact-box">
            <h3>Direct Developer Support</h3>
            <p>Need help or encountering an issue? Reach out directly to the project team:</p>
            <div class="contact-methods">
              <a mat-stroked-button color="primary" href="mailto:lacyvan1@gmail.com?subject=War%20of%20Attrition%20Support">
                <mat-icon>email</mat-icon> lacyvan1&#64;gmail.com
              </a>
              <a mat-stroked-button href="https://github.com/cboler/war-of-attrition-game/issues" target="_blank" rel="noopener">
                <mat-icon>bug_report</mat-icon> GitHub Issue Tracker
              </a>
            </div>
          </section>

          <section>
            <h3>Frequently Asked Questions & Troubleshooting</h3>
            <mat-accordion multi>
              <mat-expansion-panel>
                <mat-expansion-panel-header>
                  <mat-panel-title>Google Sign-In Issues</mat-panel-title>
                </mat-expansion-panel-header>
                <p>
                  Ensure your browser allows third-party popups from Google accounts (accounts.google.com). 
                  If you are using an ad blocker or strict tracking prevention, whitelist the domain or continue playing using the default local Guest Commander profile.
                </p>
              </mat-expansion-panel>

              <mat-expansion-panel>
                <mat-expansion-panel-header>
                  <mat-panel-title>Google Play Games Achievements</mat-panel-title>
                </mat-expansion-panel-header>
                <p>
                  Achievements always unlock and persist in your local commander profile. Native Google Play achievement controls only appear
                  after the Android host establishes a verified connection and Play Games is signed in. If those controls are absent, native
                  synchronization is not available in the current host, but your local achievement progress remains safe.
                </p>
              </mat-expansion-panel>

              <mat-expansion-panel>
                <mat-expansion-panel-header>
                  <mat-panel-title>Offline Play & Updates</mat-panel-title>
                </mat-expansion-panel-header>
                <p>
                  War of Attrition is a Progressive Web App (PWA). Once loaded, the game works entirely offline. 
                  When an update is published, the app downloads it in the background and applies it on your next match or refresh.
                </p>
              </mat-expansion-panel>

              <mat-expansion-panel>
                <mat-expansion-panel-header>
                  <mat-panel-title>Sound & Audio Settings</mat-panel-title>
                </mat-expansion-panel-header>
                <p>
                  Sound effects utilize the Web Audio API synthesized directly in your browser without requiring external audio file downloads. 
                  Ensure your device volume is up and that Sound Effects is toggled on in the in-app Settings menu.
                </p>
              </mat-expansion-panel>

              <mat-expansion-panel>
                <mat-expansion-panel-header>
                  <mat-panel-title>Game Rules: Why did my 2 beat an Ace?</mat-panel-title>
                </mat-expansion-panel-header>
                <p>
                  This is the signature rule of War of Attrition! While standard card ranks follow Ace > King > Queen ... > 2, 
                  <strong>a 2 always defeats an Ace</strong> in head-to-head clashes.
                </p>
              </mat-expansion-panel>
            </mat-accordion>
          </section>

          <section>
            <h3>App Version & Details</h3>
            <p class="app-version-info">
              Application: <strong>War of Attrition</strong><br />
              Target Platform: Progressive Web App / Android Trusted Web Activity<br />
              Repository: <a href="https://github.com/cboler/war-of-attrition-game" target="_blank" rel="noopener">cboler/war-of-attrition-game</a>
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
          <button mat-button routerLink="/delete-account">
            <mat-icon>delete_forever</mat-icon> Data Deletion
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styleUrls: ['./legal-pages.scss']
})
export class SupportComponent {}

import { Component, inject, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profile-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatTooltipModule
  ],
  template: `
    <div class="profile-dialog-container">
      <div class="dialog-header">
        <div class="user-header-info">
          <div class="avatar-wrapper">
            <img [src]="profile().avatarUrl" [alt]="profile().name" (error)="onAvatarError($event)" />
            <span class="auth-badge" [class.google]="profile().isGoogleAuth">
              <mat-icon>{{ profile().isGoogleAuth ? 'verified_user' : 'person' }}</mat-icon>
            </span>
          </div>
          <div class="user-titles">
            <div class="name-edit-row">
              <h2 *ngIf="!isEditingName">{{ profile().name }}</h2>
              <input *ngIf="isEditingName" [(ngModel)]="editingName" (keyup.enter)="saveName()" class="name-input" />
              <button mat-icon-button class="edit-btn" (click)="toggleEditName()">
                <mat-icon>{{ isEditingName ? 'check' : 'edit' }}</mat-icon>
              </button>
            </div>
            <p class="email-sub">{{ profile().email }}</p>
            <span class="provider-pill" [class.google]="profile().isGoogleAuth">
              {{ profile().isGoogleAuth ? 'Google Account Connected' : 'Guest Commander Profile' }}
            </span>
          </div>
        </div>

        <button mat-icon-button mat-dialog-close class="close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-divider></mat-divider>

      <div class="dialog-body">
        <h3 class="section-title">
          <mat-icon>insights</mat-icon> Lifetime Game Performance & Statistics
        </h3>

        <div class="stats-grid">
          <div class="stat-card win-rate" [class.high]="stats().winRatePercentage! >= 60">
            <div class="stat-icon">
              <mat-icon>emoji_events</mat-icon>
            </div>
            <div class="stat-data">
              <span class="stat-value">{{ stats().winRatePercentage || 0 }}%</span>
              <span class="stat-label">Win Rate</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon games">
              <mat-icon>sports_esports</mat-icon>
            </div>
            <div class="stat-data">
              <span class="stat-value">{{ stats().gamesPlayed }}</span>
              <span class="stat-label">Games Played</span>
            </div>
          </div>

          <div class="stat-card won">
            <div class="stat-icon">
              <mat-icon>thumb_up</mat-icon>
            </div>
            <div class="stat-data">
              <span class="stat-value">{{ stats().gamesWon }}</span>
              <span class="stat-label">Victories</span>
            </div>
          </div>

          <div class="stat-card lost">
            <div class="stat-icon">
              <mat-icon>thumb_down</mat-icon>
            </div>
            <div class="stat-data">
              <span class="stat-value">{{ stats().gamesLost }}</span>
              <span class="stat-label">Defeats</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon turns">
              <mat-icon>hourglass_top</mat-icon>
            </div>
            <div class="stat-data">
              <span class="stat-value">{{ stats().totalTurns }}</span>
              <span class="stat-label">Total Turns</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon avg">
              <mat-icon>speed</mat-icon>
            </div>
            <div class="stat-data">
              <span class="stat-value">{{ stats().averageTurnsPerGame || 0 }}</span>
              <span class="stat-label">Avg Turns / Game</span>
            </div>
          </div>

          <div class="stat-card challenges">
            <div class="stat-icon">
              <mat-icon>local_fire_department</mat-icon>
            </div>
            <div class="stat-data">
              <span class="stat-value">{{ stats().totalChallenges || 0 }}</span>
              <span class="stat-label">Challenges</span>
            </div>
          </div>

          <div class="stat-card battles">
            <div class="stat-icon">
              <mat-icon>swords</mat-icon>
            </div>
            <div class="stat-data">
              <span class="stat-value">{{ stats().totalBattles || 0 }}</span>
              <span class="stat-label">Battles</span>
            </div>
          </div>
        </div>

        <mat-divider class="body-divider"></mat-divider>

        <div class="auth-actions-row">
          <div *ngIf="!profile().isGoogleAuth" #googleBtnContainer class="google-btn-wrapper"></div>
          <button *ngIf="!profile().isGoogleAuth" mat-raised-button class="google-signin-btn" (click)="signInGoogle()">
            <svg class="google-svg" viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            Sign in with Google Account
          </button>

          <button *ngIf="profile().isGoogleAuth" mat-stroked-button color="warn" class="signout-btn" (click)="signOut()">
            <mat-icon>logout</mat-icon> Sign Out Google Profile
          </button>

          <button mat-button class="reset-stats-btn" (click)="resetStats()" matTooltip="Reset active user stats back to 0">
            <mat-icon>restart_alt</mat-icon> Reset Statistics
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./profile-dialog.component.scss']
})
export class ProfileDialogComponent implements AfterViewInit {
  private authService = inject(AuthService);
  private dialogRef = inject(MatDialogRef<ProfileDialogComponent>);

  @ViewChild('googleBtnContainer') googleBtnContainer?: ElementRef<HTMLDivElement>;

  readonly profile = this.authService.activeProfile;
  readonly stats = this.authService.userStats;

  isEditingName = false;
  editingName = '';

  ngAfterViewInit(): void {
    if (this.googleBtnContainer?.nativeElement && !this.profile().isGoogleAuth) {
      this.authService.renderGoogleButton(this.googleBtnContainer.nativeElement);
    }
  }

  toggleEditName(): void {
    if (this.isEditingName) {
      this.saveName();
    } else {
      this.editingName = this.profile().name;
      this.isEditingName = true;
    }
  }

  saveName(): void {
    if (this.editingName.trim()) {
      this.authService.updateProfileName(this.editingName);
    }
    this.isEditingName = false;
  }

  signInGoogle(): void {
    // Attempt real GIS One-Tap / OAuth prompt
    try {
      this.authService.promptGoogleSignIn();
    } catch (e) {
      console.warn('Google Sign-In could not be initialized:', e);
    }
  }

  signOut(): void {
    this.authService.signOut();
  }

  resetStats(): void {
    if (confirm('Are you sure you want to reset your statistics to 0?')) {
      this.authService.resetActiveUserStats();
    }
  }

  onAvatarError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = 'https://api.dicebear.com/7.x/bottts/svg?seed=Commander';
  }
}

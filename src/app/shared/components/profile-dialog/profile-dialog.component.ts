import { ChangeDetectionStrategy, Component, inject, ElementRef, ViewChild, AfterViewInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { PlatformAchievementsService } from '../../../core/services/platform-achievements.service';
import { SettingsService } from '../../../core/services/settings.service';
import { ACHIEVEMENTS } from '../../../core/models/achievement.model';

@Component({
  selector: 'app-profile-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSlideToggleModule,
    RouterLink
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
              <button mat-icon-button class="edit-btn" (click)="toggleEditName()" aria-label="Edit commander name">
                <mat-icon>{{ isEditingName ? 'check' : 'edit' }}</mat-icon>
              </button>
            </div>
            <p class="email-sub">{{ profile().email }}</p>
            <span class="provider-pill" [class.google]="profile().isGoogleAuth">
              {{ profile().isGoogleAuth ? 'Google Account Connected' : 'Guest Commander Profile' }}
            </span>
          </div>
        </div>

        <button mat-icon-button mat-dialog-close class="close-btn" aria-label="Close dialog">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="dialog-tabs">
        <button
          type="button"
          class="tab-btn"
          [class.active]="activeTab() === 'stats'"
          (click)="activeTab.set('stats')">
          <mat-icon>insights</mat-icon>
          <span>Career Records</span>
        </button>
        <button
          type="button"
          class="tab-btn"
          [class.active]="activeTab() === 'achievements'"
          (click)="activeTab.set('achievements')">
          <mat-icon>emoji_events</mat-icon>
          <span>Achievements ({{ unlockedCount() }}/{{ totalAchievements() }})</span>
        </button>
        <button
          type="button"
          class="tab-btn"
          [class.active]="activeTab() === 'settings'"
          (click)="activeTab.set('settings')">
          <mat-icon>settings</mat-icon>
          <span>Settings</span>
        </button>
      </div>

      <mat-divider></mat-divider>

      <div class="dialog-body">
        @if (activeTab() === 'stats') {
          <div class="stats-tab">
            <!-- Basic Records -->
            <div class="records-section">
              <h4 class="section-subtitle">Basic Records</h4>
              <div class="stats-grid">
                <div class="stat-card win-rate" [class.high]="(stats().winRatePercentage || 0) >= 60">
                  <div class="stat-icon"><mat-icon>emoji_events</mat-icon></div>
                  <div class="stat-data">
                    <span class="stat-value">{{ stats().winRatePercentage || 0 }}%</span>
                    <span class="stat-label">Win Rate</span>
                  </div>
                </div>

                <div class="stat-card">
                  <div class="stat-icon games"><mat-icon>sports_esports</mat-icon></div>
                  <div class="stat-data">
                    <span class="stat-value">{{ stats().gamesPlayed }}</span>
                    <span class="stat-label">Games Played</span>
                  </div>
                </div>

                <div class="stat-card won">
                  <div class="stat-icon"><mat-icon>thumb_up</mat-icon></div>
                  <div class="stat-data">
                    <span class="stat-value">{{ stats().gamesWon }}</span>
                    <span class="stat-label">Victories</span>
                  </div>
                </div>

                <div class="stat-card lost">
                  <div class="stat-icon"><mat-icon>thumb_down</mat-icon></div>
                  <div class="stat-data">
                    <span class="stat-value">{{ stats().gamesLost }}</span>
                    <span class="stat-label">Defeats</span>
                  </div>
                </div>

                <div class="stat-card">
                  <div class="stat-icon"><mat-icon>local_fire_department</mat-icon></div>
                  <div class="stat-data">
                    <span class="stat-value">{{ stats().currentWinStreak || 0 }} / {{ stats().bestWinStreak || 0 }}</span>
                    <span class="stat-label">Streak (Cur / Best)</span>
                  </div>
                </div>

                <div class="stat-card">
                  <div class="stat-icon"><mat-icon>flag</mat-icon></div>
                  <div class="stat-data">
                    <span class="stat-value">{{ stats().gamesAbandoned || 0 }}</span>
                    <span class="stat-label">Games Abandoned</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Battles & Challenges -->
            <div class="records-section">
              <h4 class="section-subtitle">Battles & Challenges</h4>
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-icon battles"><mat-icon>swords</mat-icon></div>
                  <div class="stat-data">
                    <span class="stat-value">{{ stats().totalBattles || 0 }}</span>
                    <span class="stat-label">Total Battles</span>
                  </div>
                </div>

                <div class="stat-card">
                  <div class="stat-icon"><mat-icon>layers</mat-icon></div>
                  <div class="stat-data">
                    <span class="stat-value">Battle {{ stats().deepestRecursiveBattle || 1 }}</span>
                    <span class="stat-label">Deepest Battle</span>
                  </div>
                </div>

                <div class="stat-card">
                  <div class="stat-icon"><mat-icon>bolt</mat-icon></div>
                  <div class="stat-data">
                    <span class="stat-value">{{ stats().mostOpponentCardsDefeatedInBattle || 0 }}</span>
                    <span class="stat-label">Most Defeated in Battle</span>
                  </div>
                </div>

                <div class="stat-card">
                  <div class="stat-icon"><mat-icon>shield</mat-icon></div>
                  <div class="stat-data">
                    <span class="stat-value">{{ stats().successfulChallenges || 0 }} / {{ stats().totalChallenges || 0 }}</span>
                    <span class="stat-label">Challenges Won ({{ stats().challengeSuccessRate || 0 }}%)</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Memorable Card Moments -->
            <div class="records-section">
              <h4 class="section-subtitle">Memorable Feats</h4>
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-icon"><mat-icon>flare</mat-icon></div>
                  <div class="stat-data">
                    <span class="stat-value">{{ stats().acesDefeatedByTwo || 0 }}</span>
                    <span class="stat-label">Aces Defeated by 2</span>
                  </div>
                </div>

                <div class="stat-card">
                  <div class="stat-icon"><mat-icon>shield</mat-icon></div>
                  <div class="stat-data">
                    <span class="stat-value">{{ stats().twosSavedByChallenge || 0 }}</span>
                    <span class="stat-label">2s Saved by Reinforcement</span>
                  </div>
                </div>

                <div class="stat-card">
                  <div class="stat-icon"><mat-icon>trending_up</mat-icon></div>
                  <div class="stat-data">
                    <span class="stat-value">{{ stats().comebackWins || 0 }} (Max -{{ stats().largestComebackDeficit || 0 }})</span>
                    <span class="stat-label">Comeback Wins</span>
                  </div>
                </div>

                <div class="stat-card">
                  <div class="stat-icon"><mat-icon>workspace_premium</mat-icon></div>
                  <div class="stat-data">
                    <span class="stat-value">{{ stats().winsWithOneCardRemaining || 0 }}</span>
                    <span class="stat-label">1-Card Victories</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        } @else if (activeTab() === 'achievements') {
          <!-- Achievements Tab -->
          <div class="achievements-tab">
            @if (showPlayGamesButton()) {
              <div class="play-games-banner">
                <button mat-flat-button class="play-games-btn" (click)="openPlayGamesAchievements()">
                  <mat-icon>sports_esports</mat-icon>
                  View Google Play Achievements
                </button>
              </div>
            }
            <div class="achievements-grid">
              @for (ach of allAchievements; track ach.id) {
                <div class="achievement-item" [class.unlocked]="isAchievementUnlocked(ach.id)">
                  <div class="ach-icon-wrapper">
                    <mat-icon>{{ isAchievementUnlocked(ach.id) ? ach.icon : 'lock' }}</mat-icon>
                  </div>
                  <div class="ach-info">
                    <div class="ach-header">
                      <strong>{{ ach.name }}</strong>
                      <span class="ach-status">{{ isAchievementUnlocked(ach.id) ? 'UNLOCKED' : 'LOCKED' }}</span>
                    </div>
                    <p>{{ ach.description }}</p>
                  </div>
                </div>
              }
            </div>
          </div>
        } @else {
          <div class="settings-tab">
            <section class="settings-section" aria-labelledby="appearance-settings-title">
              <h4 id="appearance-settings-title" class="section-subtitle">Appearance & Controls</h4>
              <div class="settings-fields">
                <mat-form-field appearance="outline">
                  <mat-label>Theme</mat-label>
                  <mat-select [value]="settings.theme()" (selectionChange)="settings.setTheme($event.value)">
                    <mat-option value="dark">Dark</mat-option>
                    <mat-option value="light">Light</mat-option>
                    <mat-option value="auto">System</mat-option>
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Deck Hand</mat-label>
                  <mat-select [value]="settings.deckHand()" (selectionChange)="settings.setDeckHand($event.value)">
                    <mat-option value="right">Right-handed</mat-option>
                    <mat-option value="left">Left-handed</mat-option>
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Animation Speed</mat-label>
                  <mat-select [value]="settings.animationSpeed()" (selectionChange)="settings.setAnimationSpeed($event.value)">
                    <mat-option value="slow">Slow</mat-option>
                    <mat-option value="normal">Normal</mat-option>
                    <mat-option value="fast">Fast</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <div class="settings-toggles">
                <mat-slide-toggle [checked]="settings.soundEnabled()" (change)="settings.setSoundEnabled($event.checked)">Sound</mat-slide-toggle>
                <mat-slide-toggle [checked]="settings.autoPlayAnimations()" (change)="settings.setAutoPlayAnimations($event.checked)">Animations</mat-slide-toggle>
                <mat-slide-toggle [checked]="settings.showTurnCounter()" (change)="settings.setShowTurnCounter($event.checked)">Turn counter</mat-slide-toggle>
                <mat-slide-toggle [checked]="settings.showCardDetails()" (change)="settings.setShowCardDetails($event.checked)">Card details</mat-slide-toggle>
              </div>
            </section>

            <section class="settings-section" aria-labelledby="card-backing-title">
              <h4 id="card-backing-title" class="section-subtitle">Card Backing</h4>
              <div class="backing-options">
                @for (option of settings.cardBackingOptions(); track option.id) {
                  <button
                    type="button"
                    class="backing-option"
                    [class.selected]="settings.selectedCardBacking() === option.id"
                    [attr.aria-pressed]="settings.selectedCardBacking() === option.id"
                    (click)="settings.setCardBacking(option.id)">
                    <span class="backing-preview" [style]="option.preview" aria-hidden="true"></span>
                    <span>{{ option.name }}</span>
                    @if (settings.selectedCardBacking() === option.id) {
                      <mat-icon>check_circle</mat-icon>
                    }
                  </button>
                }
              </div>
            </section>

            <section class="settings-section settings-footer" aria-labelledby="about-title">
              <div>
                <h4 id="about-title" class="section-subtitle">About & Data</h4>
                <p>War of Attrition · Version 1.0.2</p>
              </div>
              <nav class="profile-links" aria-label="Support and legal links">
                <a mat-button mat-dialog-close routerLink="/privacy"><mat-icon>privacy_tip</mat-icon>Privacy</a>
                <a mat-button mat-dialog-close routerLink="/support"><mat-icon>help_outline</mat-icon>Support</a>
                <a mat-button mat-dialog-close routerLink="/delete-account"><mat-icon>delete_forever</mat-icon>Delete data</a>
              </nav>
              <button mat-stroked-button class="reset-settings-btn" (click)="resetSettings()">
                <mat-icon>restore</mat-icon>Reset preferences
              </button>
            </section>
          </div>
        }

        <mat-divider class="body-divider"></mat-divider>

        <div class="auth-actions-row">
          <div *ngIf="!profile().isGoogleAuth" #googleBtnContainer class="google-btn-wrapper"></div>
          <button *ngIf="!profile().isGoogleAuth" mat-raised-button class="google-signin-btn" (click)="signInGoogle()">
            <svg class="google-svg" viewBox="0 0 24 24" width="18" height="18">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            Sign in with Google
          </button>

          <button *ngIf="profile().isGoogleAuth" mat-stroked-button color="warn" class="signout-btn" (click)="signOut()">
            <mat-icon>logout</mat-icon> Sign Out
          </button>

          <button mat-button class="reset-stats-btn" (click)="resetStats()" matTooltip="Reset active user stats and career records">
            <mat-icon>restart_alt</mat-icon> Reset Stats
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./profile-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileDialogComponent implements AfterViewInit {
  private authService = inject(AuthService);
  private platformAchievements = inject(PlatformAchievementsService);
  readonly settings = inject(SettingsService);

  @ViewChild('googleBtnContainer') googleBtnContainer?: ElementRef<HTMLDivElement>;

  readonly profile = this.authService.activeProfile;
  readonly stats = this.authService.userStats;
  readonly allAchievements = ACHIEVEMENTS;
  readonly activeTab = signal<'stats' | 'achievements' | 'settings'>('stats');

  readonly unlockedCount = computed(() =>
    this.stats().unlockedAchievements?.length || 0
  );
  readonly totalAchievements = computed(() => ACHIEVEMENTS.length);
  readonly showPlayGamesButton = computed(() =>
    this.platformAchievements.isPlayGamesAvailable() &&
    this.platformAchievements.isPlayGamesSignedIn()
  );

  isEditingName = false;
  editingName = '';

  ngAfterViewInit(): void {
    if (this.googleBtnContainer?.nativeElement && !this.profile().isGoogleAuth) {
      this.authService.renderGoogleButton(this.googleBtnContainer.nativeElement);
    }
  }

  isAchievementUnlocked(id: string): boolean {
    return (this.stats().unlockedAchievements || []).includes(id);
  }

  openPlayGamesAchievements(): void {
    this.platformAchievements.showAchievementsOverlay();
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
    if (confirm('Are you sure you want to reset your statistics and career records?')) {
      this.authService.resetActiveUserStats();
    }
  }

  resetSettings(): void {
    if (confirm('Reset all preferences to their defaults?')) {
      this.settings.resetSettings();
    }
  }

  onAvatarError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = 'https://api.dicebear.com/7.x/bottts/svg?seed=Commander';
  }
}

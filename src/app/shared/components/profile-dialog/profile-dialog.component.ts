import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CampaignProgressionService } from '../../../core/services/campaign-progression.service';
import { PlatformAchievementsService } from '../../../core/services/platform-achievements.service';
import { SettingsService } from '../../../core/services/settings.service';
import { ACHIEVEMENTS } from '../../../core/models/achievement.model';
import { CardBackingOption } from '../../../core/models/settings.model';
import { GameOutcome } from '../../../core/models/game-state.model';
import { GameControllerService } from '../../../services/game-controller.service';
import { TelemetryConsentService } from '../../../services/telemetry-consent.service';
import { TutorialService } from '../../../services/tutorial.service';

type ProfileTab = 'stats' | 'achievements' | 'settings';

interface ProfileConfirmationData {
  readonly title: string;
  readonly message: string;
  readonly confirmLabel: string;
  readonly destructive?: boolean;
}

@Component({
  selector: 'app-profile-confirmation-dialog',
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" (click)="dialogRef.close(false)">Cancel</button>
      <button
        mat-flat-button
        type="button"
        class="profile-confirm-action"
        [class.destructive]="data.destructive"
        (click)="dialogRef.close(true)">
        {{ data.confirmLabel }}
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    :host { display: block; max-width: 430px; }
    p { line-height: 1.5; }
    .profile-confirm-action { background: #e5c175; color: #102a23; }
    .profile-confirm-action.destructive { background: #b3261e; color: #fff; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileConfirmationDialogComponent {
  readonly dialogRef = inject(MatDialogRef<ProfileConfirmationDialogComponent>);
  readonly data = inject<ProfileConfirmationData>(MAT_DIALOG_DATA);
}

@Component({
  selector: 'app-profile-dialog',
  imports: [
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule,
    MatSlideToggleModule,
    RouterLink
  ],
  templateUrl: './profile-dialog.component.html',
  styleUrl: './profile-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileDialogComponent {
  private readonly authService = inject(AuthService);
  private readonly platformAchievements = inject(PlatformAchievementsService);
  private readonly gameController = inject(GameControllerService);
  private readonly tutorial = inject(TutorialService);
  private readonly dialogRef = inject(MatDialogRef<ProfileDialogComponent>);
  private readonly dialog = inject(MatDialog);

  readonly settings = inject(SettingsService);
  readonly progression = inject(CampaignProgressionService);
  readonly telemetryConsent = inject(TelemetryConsentService);
  readonly analyticsConsent = this.telemetryConsent.analyticsConsent;
  readonly profile = this.authService.activeProfile;
  readonly stats = this.authService.userStats;
  readonly allAchievements = ACHIEVEMENTS;
  readonly activeTab = signal<ProfileTab>('stats');
  readonly settingsStatus = signal('');

  readonly unlockedCount = computed(() => this.stats().unlockedAchievements?.length || 0);
  readonly totalAchievements = computed(() => ACHIEVEMENTS.length);
  readonly unlockedPercentage = computed(() =>
    Math.round((this.unlockedCount() / Math.max(1, this.totalAchievements())) * 100)
  );
  readonly hasActiveMatch = computed(() => this.gameController.hasMeaningfulUnresolvedGame());
  readonly showPlayGamesButton = computed(
    () =>
      this.platformAchievements.isPlayGamesAvailable() &&
      this.platformAchievements.isPlayGamesSignedIn()
  );

  readonly currentCampaignRecord = computed(() => {
    const wars = this.progression.currentCampaign().wars;
    return {
      completed: wars.length,
      wins: wars.filter(war => war.outcome === GameOutcome.PLAYER_WIN).length,
      losses: wars.filter(war => war.outcome === GameOutcome.OPPONENT_WIN).length,
      ties: wars.filter(war => war.outcome === GameOutcome.TIE).length,
      differential: wars.reduce((total, war) => total + war.margin, 0)
    };
  });

  readonly campaignCareer = computed(() => {
    const statistics = this.stats();
    return {
      completed: statistics.campaignsCompleted,
      won: statistics.campaignsWon,
      lost: statistics.campaignsLost,
      drawn: statistics.campaignsDrawn,
      bestDifferential: statistics.bestCampaignDifferential,
    };
  });

  readonly campaignPips = [0, 1, 2] as const;

  isEditingName = false;
  editingName = '';

  selectTab(tab: ProfileTab): void {
    this.activeTab.set(tab);
  }

  handleTabKeyDown(event: KeyboardEvent, current: ProfileTab): void {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;

    event.preventDefault();
    const tabs: readonly ProfileTab[] = ['stats', 'achievements', 'settings'];
    const currentIndex = tabs.indexOf(current);
    let nextIndex = currentIndex;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = tabs.length - 1;
    if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabs.length;

    const nextTab = tabs[nextIndex];
    this.selectTab(nextTab);
    queueMicrotask(() => document.getElementById(`profile-tab-${nextTab}`)?.focus());
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
    if (this.hasActiveMatch()) {
      this.settingsStatus.set(
        'Finish the current War or deliberately abandon it before changing profiles.'
      );
      return;
    }

    try {
      this.authService.promptGoogleSignIn();
    } catch (error) {
      console.warn('Google Sign-In could not be initialized:', error);
      this.settingsStatus.set('Google Sign-In is not available right now.');
    }
  }

  signOut(): void {
    if (this.hasActiveMatch()) {
      this.settingsStatus.set(
        'Finish the current War or deliberately abandon it before changing profiles.'
      );
      return;
    }

    this.confirm(
      {
        title: 'Sign out?',
        message: 'Your local guest profile remains available on this device after signing out.',
        confirmLabel: 'Sign out'
      },
      () => this.authService.signOut()
    );
  }

  onRestartMatch(): void {
    this.confirm(
      {
        title: 'Restart current War?',
        message: 'This clears the current table, records the unresolved War as abandoned, and deals a fresh War.',
        confirmLabel: 'Restart War',
        destructive: true
      },
      () => {
        this.gameController.startNewGame('restart');
        this.dialogRef.close();
      }
    );
  }

  onAbandonMatch(): void {
    this.confirm(
      {
        title: 'Abandon current War?',
        message: 'The unresolved War will be recorded as abandoned and will not advance Campaign progress.',
        confirmLabel: 'Abandon War',
        destructive: true
      },
      () => {
        this.gameController.startNewGame('abandon');
        this.dialogRef.close();
      }
    );
  }

  onResetTutorial(): void {
    this.confirm(
      {
        title: 'Reset tutorial guidance?',
        message: 'Contextual gameplay tips will begin again during your next War.',
        confirmLabel: 'Reset tutorial'
      },
      () => {
        this.tutorial.resetTutorialProgress();
        this.settingsStatus.set('Tutorial guidance has been reset.');
      }
    );
  }

  resetStats(): void {
    this.confirm(
      {
        title: 'Reset Career Records?',
        message: 'This permanently clears player-facing statistics and records. Campaign tokens and unlocked cosmetics are not removed.',
        confirmLabel: 'Reset records',
        destructive: true
      },
      () => {
        this.authService.resetActiveUserStats();
        this.settingsStatus.set('Career Records have been reset.');
      }
    );
  }

  resetSettings(): void {
    this.confirm(
      {
        title: 'Reset preferences?',
        message: 'Theme, controls, sound, and animation preferences will return to their defaults. Unlocked cosmetics remain yours.',
        confirmLabel: 'Reset preferences',
        destructive: true
      },
      () => {
        this.settings.resetSettings();
        this.settingsStatus.set('Preferences have been reset.');
      }
    );
  }

  setAnalyticsConsent(consent: 'granted' | 'denied'): void {
    this.telemetryConsent.setAnalyticsConsent(consent);
    this.settingsStatus.set(
      consent === 'granted'
        ? 'Anonymous gameplay analytics will begin with the next War.'
        : 'Anonymous gameplay analytics are off.',
    );
  }

  backingAction(option: CardBackingOption): void {
    this.settingsStatus.set('');
    if (this.progression.isCardBackingUnlocked(option.id)) {
      this.settings.setCardBacking(option.id);
      this.settingsStatus.set(`${option.name} is now equipped.`);
      return;
    }

    if (this.progression.tokenBalance() < option.tokenCost) {
      const needed = option.tokenCost - this.progression.tokenBalance();
      this.settingsStatus.set(
        `${option.name} needs ${needed} more ${needed === 1 ? 'token' : 'tokens'}.`
      );
      return;
    }

    this.confirm(
      {
        title: `Unlock ${option.name}?`,
        message: `Spend ${option.tokenCost} ${option.tokenCost === 1 ? 'token' : 'tokens'} to permanently unlock and equip this card backing?`,
        confirmLabel: 'Unlock backing'
      },
      () => {
        const result = this.progression.purchaseCardBacking(option.id);
        if (result.status === 'unlocked' || result.status === 'already_unlocked') {
          this.settingsStatus.set(
            `${option.name} unlocked and equipped. ${result.tokenBalance} ${result.tokenBalance === 1 ? 'token remains' : 'tokens remain'}.`
          );
        } else if (result.status === 'insufficient_tokens') {
          this.settingsStatus.set('Your token balance changed before the purchase could complete.');
        }
      }
    );
  }

  backingActionLabel(option: CardBackingOption): string {
    if (this.settings.selectedCardBacking() === option.id) return `${option.name}, selected`;
    if (this.progression.isCardBackingUnlocked(option.id)) return `Equip ${option.name}`;
    return `Unlock ${option.name} for ${option.tokenCost} ${option.tokenCost === 1 ? 'token' : 'tokens'}`;
  }

  signed(value: number): string {
    return value > 0 ? `+${value}` : `${value}`;
  }

  onAvatarError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = 'https://api.dicebear.com/7.x/bottts/svg?seed=Commander';
  }

  private confirm(data: ProfileConfirmationData, onConfirm: () => void): void {
    this.dialog
      .open(ProfileConfirmationDialogComponent, {
        data,
        width: 'min(430px, calc(100vw - 24px))',
        maxWidth: 'calc(100vw - 24px)',
        autoFocus: 'first-tabbable',
        restoreFocus: true
      })
      .afterClosed()
      .subscribe(confirmed => {
        if (confirmed) onConfirm();
      });
  }
}

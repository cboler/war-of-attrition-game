import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from './core/services/auth.service';
import { SettingsService } from './core/services/settings.service';
import { ProfileDialogComponent } from './shared/components/profile-dialog/profile-dialog.component';
import { GameTelemetryService } from './services/game-telemetry.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatDialogModule,
    MatTooltipModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  private authService = inject(AuthService);
  private settingsService = inject(SettingsService);
  private dialog = inject(MatDialog);
  // Eager construction is required because GameEventBusService is non-replaying.
  private readonly gameTelemetry = inject(GameTelemetryService);

  protected readonly title = signal('ATTRITION');
  protected readonly activeProfile = this.authService.activeProfile;
  protected readonly deckHand = this.settingsService.deckHand;
  protected readonly profileButtonLabel = computed(
    () => `Open profile for ${this.activeProfile().name}; career records, achievements, and settings`
  );

  protected openProfileDialog(): void {
    this.dialog.open(ProfileDialogComponent, {
      width: '720px',
      maxWidth: 'calc(100vw - 20px)',
      maxHeight: 'calc(100dvh - 20px)',
      closeOnNavigation: true,
      panelClass: 'glass-dialog-panel'
    });
  }
}

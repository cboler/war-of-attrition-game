import { Component, signal, inject, effect, HostListener } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from './core/services/auth.service';
import { SettingsService } from './core/services/settings.service';
import { GameControllerService } from './services/game-controller.service';
import { ProfileDialogComponent } from './shared/components/profile-dialog/profile-dialog.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatTooltipModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private authService = inject(AuthService);
  private settingsService = inject(SettingsService);
  private gameController = inject(GameControllerService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  protected readonly title = signal('ATTRITION');
  protected readonly showRestartConfirm = signal(false);
  readonly activeProfile = this.authService.activeProfile;

  constructor() {
    effect(() => {
      const theme = this.settingsService.theme();
      this.applyTheme(theme);
    });
  }

  private applyTheme(theme: 'light' | 'dark' | 'auto'): void {
    if (typeof document === 'undefined') return;
    const isDark = theme === 'dark' || (theme === 'auto' && window.matchMedia?.('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }

  protected toggleRestartConfirm(event: MouseEvent): void {
    event.stopPropagation();
    this.showRestartConfirm.update(open => !open);
  }

  protected cancelRestart(): void {
    this.showRestartConfirm.set(false);
  }

  protected confirmRestart(): void {
    this.showRestartConfirm.set(false);
    this.gameController.startNewGame();
    if (this.router.url !== '/') {
      this.router.navigate(['/']);
    }
  }

  @HostListener('document:click')
  protected onDocumentClick(): void {
    if (this.showRestartConfirm()) {
      this.showRestartConfirm.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.showRestartConfirm()) {
      this.showRestartConfirm.set(false);
    }
  }

  protected openProfileDialog(): void {
    this.dialog.open(ProfileDialogComponent, {
      width: '640px',
      maxWidth: '95vw',
      panelClass: 'glass-dialog-panel'
    });
  }
}


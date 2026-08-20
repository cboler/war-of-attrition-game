import { Component, signal, inject, effect } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from './core/services/auth.service';
import { SettingsService } from './core/services/settings.service';
import { ProfileDialogComponent } from './shared/components/profile-dialog/profile-dialog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
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
  private dialog = inject(MatDialog);

  protected readonly title = signal('ATTRITION');
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

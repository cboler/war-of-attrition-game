import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from './core/services/auth.service';
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
export class App implements OnInit {
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);

  protected readonly title = signal('ATTRITION');
  protected readonly isDarkMode = signal(false);
  readonly activeProfile = this.authService.activeProfile;

  private readonly THEME_STORAGE_KEY = 'war-of-attrition-theme';

  ngOnInit(): void {
    this.loadThemePreference();
  }

  private loadThemePreference(): void {
    const savedTheme = localStorage.getItem(this.THEME_STORAGE_KEY);
    const prefersDark = savedTheme ? savedTheme === 'dark' : (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    this.isDarkMode.set(prefersDark);
    this.applyTheme(prefersDark);
  }

  private applyTheme(isDark: boolean): void {
    if (typeof document !== 'undefined') {
      if (isDark) {
        document.body.classList.add('dark-theme');
      } else {
        document.body.classList.remove('dark-theme');
      }
    }
  }

  private saveThemePreference(isDark: boolean): void {
    try {
      localStorage.setItem(this.THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
    } catch {
      // Ignore localStorage errors
    }
  }

  protected toggleTheme(): void {
    this.isDarkMode.update(current => {
      const newValue = !current;
      this.applyTheme(newValue);
      this.saveThemePreference(newValue);
      return newValue;
    });
  }

  protected openProfileDialog(): void {
    this.dialog.open(ProfileDialogComponent, {
      width: '640px',
      maxWidth: '95vw',
      panelClass: 'glass-dialog-panel'
    });
  }
}

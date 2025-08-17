import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule, MatIconModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('War of Attrition');
  protected readonly isDarkMode = signal(false);
  
  private readonly THEME_STORAGE_KEY = 'war-of-attrition-theme';
  
  ngOnInit(): void {
    this.loadThemePreference();
  }
  
  private loadThemePreference(): void {
    const savedTheme = localStorage.getItem(this.THEME_STORAGE_KEY);
    const prefersDark = savedTheme ? savedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    this.isDarkMode.set(prefersDark);
    this.applyTheme(prefersDark);
  }
  
  private applyTheme(isDark: boolean): void {
    if (isDark) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }
  
  private saveThemePreference(isDark: boolean): void {
    localStorage.setItem(this.THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
  }
  
  protected toggleTheme(): void {
    this.isDarkMode.update(current => {
      const newValue = !current;
      this.applyTheme(newValue);
      this.saveThemePreference(newValue);
      return newValue;
    });
  }
}

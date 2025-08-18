import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { RouterLink } from '@angular/router';
import { SettingsService } from '../core/services/settings.service';

@Component({
  selector: 'app-settings',
  imports: [
    MatCardModule, 
    MatButtonModule, 
    MatSlideToggleModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTabsModule,
    MatIconModule,
    MatDividerModule,
    RouterLink
  ],
  templateUrl: './settings.html',
  styleUrl: './settings.scss'
})
export class Settings {
  constructor(public settingsService: SettingsService) {}

  onResetSettings(): void {
    if (confirm('Are you sure you want to reset all settings to default values? This action cannot be undone.')) {
      this.settingsService.resetSettings();
    }
  }

  onResetStatistics(): void {
    if (confirm('Are you sure you want to reset all game statistics? This action cannot be undone.')) {
      this.settingsService.resetStatistics();
    }
  }

  onExportSettings(): void {
    const settings = this.settingsService.exportSettings();
    const blob = new Blob([settings], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'war-of-attrition-settings.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  onImportSettings(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const success = this.settingsService.importSettings(content);
        if (success) {
          alert('Settings imported successfully!');
        } else {
          alert('Failed to import settings. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  }

  formatDuration(milliseconds: number): string {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }

  formatLastPlayed(date?: Date): string {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString();
  }
}

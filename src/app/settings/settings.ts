import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { Inject } from '@angular/core';
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
    MatDialogModule,
    MatSnackBarModule,
    RouterLink
  ],
  templateUrl: './settings.html',
  styleUrl: './settings.scss'
})
export class Settings {
  constructor(
    public settingsService: SettingsService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  onResetSettings(): void {
    this.showConfirmDialog(
      'Reset Settings',
      'Are you sure you want to reset all settings to default values? This action cannot be undone.'
    ).subscribe(result => {
      if (result) {
        this.settingsService.resetSettings();
      }
    });
  }

  onResetStatistics(): void {
    this.showConfirmDialog(
      'Reset Statistics', 
      'Are you sure you want to reset all game statistics? This action cannot be undone.'
    ).subscribe(result => {
      if (result) {
        this.settingsService.resetStatistics();
      }
    });
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
          this.snackBar.open('Settings imported successfully!', 'OK', { duration: 3000 });
        } else {
          this.snackBar.open('Failed to import settings. Please check the file format.', 'OK', { duration: 5000 });
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

  private showConfirmDialog(title: string, message: string): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title, message },
      width: '400px'
    });
    return dialogRef.afterClosed();
  }
}

@Component({
  selector: 'app-confirm-dialog',
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="warn" (click)="onConfirm()">Confirm</button>
    </mat-dialog-actions>
  `
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; message: string }
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}

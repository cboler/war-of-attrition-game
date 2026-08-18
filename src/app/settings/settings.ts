import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
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
    RouterLink
  ],
  templateUrl: './settings.html',
  styleUrl: './settings.scss'
})
export class Settings {
  readonly settingsService = inject(SettingsService);
  private readonly dialog = inject(MatDialog);

  onResetSettings(): void {
    this.showConfirmDialog(
      'Reset Settings',
      'Are you sure you want to reset all preferences to default values? This action cannot be undone.'
    ).subscribe(result => {
      if (result) {
        this.settingsService.resetSettings();
      }
    });
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

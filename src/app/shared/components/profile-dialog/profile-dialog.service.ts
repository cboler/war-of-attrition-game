import { Injectable, inject } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ProfileDialogComponent } from './profile-dialog.component';

@Injectable({ providedIn: 'root' })
export class ProfileDialogService {
  private readonly dialog = inject(MatDialog);

  open(): MatDialogRef<ProfileDialogComponent> {
    return this.dialog.open(ProfileDialogComponent, {
      width: '720px',
      maxWidth: 'calc(100vw - 20px)',
      maxHeight: 'calc(100dvh - 20px)',
      closeOnNavigation: true,
      panelClass: 'glass-dialog-panel',
    });
  }
}

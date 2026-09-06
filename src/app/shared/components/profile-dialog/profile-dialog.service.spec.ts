import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ProfileDialogComponent } from './profile-dialog.component';
import { ProfileDialogService } from './profile-dialog.service';

describe('ProfileDialogService', () => {
  it('opens the one existing Profile dialog with the shared responsive configuration', () => {
    const dialogRef = {} as MatDialogRef<ProfileDialogComponent>;
    const dialog = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);
    dialog.open.and.returnValue(dialogRef);
    TestBed.configureTestingModule({ providers: [{ provide: MatDialog, useValue: dialog }] });

    const result = TestBed.inject(ProfileDialogService).open();

    expect(result).toBe(dialogRef);
    expect(dialog.open).toHaveBeenCalledOnceWith(ProfileDialogComponent, {
      width: '720px',
      maxWidth: 'calc(100vw - 20px)',
      maxHeight: 'calc(100dvh - 20px)',
      closeOnNavigation: true,
      panelClass: 'glass-dialog-panel',
    });
  });
});

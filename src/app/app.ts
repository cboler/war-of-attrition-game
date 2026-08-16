import { Component, signal, inject } from '@angular/core';
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
export class App {
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);

  protected readonly title = signal('ATTRITION');
  readonly activeProfile = this.authService.activeProfile;

  protected openProfileDialog(): void {
    this.dialog.open(ProfileDialogComponent, {
      width: '640px',
      maxWidth: '95vw',
      panelClass: 'glass-dialog-panel'
    });
  }
}

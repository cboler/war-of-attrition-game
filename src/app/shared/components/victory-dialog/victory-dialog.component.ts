import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/services/auth.service';

export interface VictoryDialogData {
  winner: 'player' | 'opponent';
  totalTurns: number;
  playerCardCount: number;
  opponentCardCount: number;
  discardedCardCount: number;
  challengesCount?: number;
  battlesCount?: number;
}

@Component({
  selector: 'app-victory-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule
  ],
  template: `
    <div class="victory-dialog-container" [class.win]="isWin" [class.loss]="!isWin">
      <div class="victory-banner">
        <div class="trophy-glow">
          <mat-icon>{{ isWin ? 'emoji_events' : 'sentiment_dissatisfied' }}</mat-icon>
        </div>
        <h2>{{ isWin ? 'VICTORY!' : 'DEFEAT' }}</h2>
        <p class="subtitle">{{ isWin ? 'You outlasted your opponent in the War of Attrition!' : 'Your deck was depleted in combat.' }}</p>
      </div>

      <div class="dialog-body">
        <div class="metrics-row">
          <div class="metric-box">
            <span class="value">{{ data.totalTurns }}</span>
            <span class="label">Total Turns</span>
          </div>

          <div class="metric-box">
            <span class="value">{{ data.playerCardCount }} vs {{ data.opponentCardCount }}</span>
            <span class="label">Final Cards (You / Opponent)</span>
          </div>

          <div class="metric-box">
            <span class="value">{{ data.discardedCardCount }}</span>
            <span class="label">Cards Discarded</span>
          </div>
        </div>

        <mat-divider class="body-divider"></mat-divider>

        <div class="updated-user-summary">
          <img [src]="profile().avatarUrl" [alt]="profile().name" class="user-thumb" />
          <div class="user-stats-compact">
            <span class="user-name">{{ profile().name }}</span>
            <span class="user-lifetime">
              Lifetime Win Rate: <strong>{{ stats().winRatePercentage }}%</strong> ({{ stats().gamesWon }}W / {{ stats().gamesLost }}L)
            </span>
          </div>
        </div>
      </div>

      <div class="dialog-actions">
        <button mat-button class="view-profile-btn" (click)="openProfile()">
          <mat-icon>person</mat-icon> View Full Stats
        </button>

        <button mat-raised-button color="primary" class="play-again-btn" (click)="playAgain()">
          <mat-icon>replay</mat-icon> Play Again
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./victory-dialog.component.scss']
})
export class VictoryDialogComponent {
  private authService = inject(AuthService);
  private dialogRef = inject(MatDialogRef<VictoryDialogComponent>);

  readonly profile = this.authService.activeProfile;
  readonly stats = this.authService.userStats;

  constructor(@Inject(MAT_DIALOG_DATA) public data: VictoryDialogData) {}

  get isWin(): boolean {
    return this.data.winner === 'player';
  }

  playAgain(): void {
    this.dialogRef.close({ action: 'playAgain' });
  }

  openProfile(): void {
    this.dialogRef.close({ action: 'openProfile' });
  }
}

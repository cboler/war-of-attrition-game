import { Component, Inject, computed } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';
import { Card, Suit } from '../../../core/models/card.model';
import { CardComponent } from '../card/card.component';

export interface DiscardPileData {
  discardedCards: Card[];
}

export interface DiscardedCardInfo {
  card: Card;
  playerType: 'player' | 'opponent';
  turnNumber?: number;
  reason?: string;
}

@Component({
  selector: 'app-discard-pile-viewer',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    CardComponent
  ],
  template: `
    <mat-toolbar>
      <span class="title">
        <mat-icon>delete</mat-icon>
        Discard Pile
      </span>
      <span class="spacer"></span>
      <span class="card-count">{{ discardedCards().length }} cards</span>
      <button mat-icon-button (click)="close()">
        <mat-icon>close</mat-icon>
      </button>
    </mat-toolbar>

    <div class="dialog-content">
      @if (discardedCards().length === 0) {
        <div class="empty-state">
          <mat-icon class="empty-icon">delete_outline</mat-icon>
          <h3>No Cards Discarded</h3>
          <p>Cards lost during gameplay will appear here.</p>
        </div>
      } @else {
        <div class="cards-container">
          <div class="sort-info">
            <small>Most recent discards shown first</small>
          </div>
          <div class="cards-scroll">
            @for (cardInfo of discardedCardInfos(); track $index) {
              <div class="card-item" [class]="'lost-by-' + cardInfo.playerType">
                <div class="card-wrapper">
                  <app-card [card]="cardInfo.card" [faceDown]="false"></app-card>
                </div>
                <div class="card-info">
                  <div class="player-indicator" [class]="cardInfo.playerType">
                    @if (cardInfo.playerType === 'player') {
                      Your Card
                    } @else {
                      Opponent's Card
                    }
                  </div>
                  <!-- Only show turn and reason info if available -->
                  @if (cardInfo.turnNumber) {
                    <div class="turn-info">Turn {{ cardInfo.turnNumber }}</div>
                  }
                  @if (cardInfo.reason) {
                    <div class="reason">{{ cardInfo.reason }}</div>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>

    <div class="dialog-actions">
      <button mat-button (click)="close()">Close</button>
      @if (discardedCards().length > 0) {
        <button mat-raised-button color="primary" (click)="scrollToTop()">
          <mat-icon>keyboard_arrow_up</mat-icon>
          Back to Recent
        </button>
      }
    </div>
  `,
  styles: [`
    .title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
    }

    .spacer {
      flex: 1;
    }

    .card-count {
      font-size: 0.9em;
      opacity: 0.8;
    }

    .dialog-content {
      max-height: 70vh;
      min-height: 300px;
      padding: 0;
      overflow: hidden;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 300px;
      text-align: center;
      color: rgba(0, 0, 0, 0.6);
      
      .empty-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        margin-bottom: 16px;
        opacity: 0.3;
      }
      
      h3 {
        margin: 0 0 8px 0;
        font-weight: 400;
      }
      
      p {
        margin: 0;
        font-size: 0.9em;
      }
    }

    .cards-container {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .sort-info {
      padding: 8px 16px;
      background: rgba(0, 0, 0, 0.03);
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);
      text-align: center;
      
      small {
        color: rgba(0, 0, 0, 0.6);
        font-size: 0.75em;
      }
    }

    .cards-scroll {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .card-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px;
      border-radius: 8px;
      border: 1px solid rgba(0, 0, 0, 0.12);
      background-color: rgba(0, 0, 0, 0.02);
      transition: all 0.2s ease;
      
      &:hover {
        background-color: rgba(0, 0, 0, 0.04);
      }
      
      &.lost-by-player {
        border-left: 4px solid #f44336;
      }
      
      &.lost-by-opponent {
        border-left: 4px solid #4caf50;
      }
    }

    .card-wrapper {
      flex-shrink: 0;
    }

    .card-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .player-indicator {
      font-weight: 500;
      font-size: 0.9em;
      
      &.player {
        color: #f44336;
      }
      
      &.opponent {
        color: #4caf50;
      }
    }

    .turn-info {
      font-size: 0.8em;
      opacity: 0.7;
    }

    .reason {
      font-size: 0.8em;
      font-style: italic;
      opacity: 0.8;
    }

    .dialog-actions {
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid rgba(0, 0, 0, 0.12);
    }

    @media (max-width: 599px) {
      .card-item {
        flex-direction: column;
        text-align: center;
        gap: 8px;
      }
      
      .card-info {
        align-items: center;
      }
      
      .dialog-actions {
        flex-direction: column;
        gap: 8px;
        
        button {
          width: 100%;
        }
      }
    }

    // Dark theme support
    :host-context(.dark-theme) {
      .card-item {
        border-color: rgba(255, 255, 255, 0.12);
        background-color: rgba(255, 255, 255, 0.02);
        
        &:hover {
          background-color: rgba(255, 255, 255, 0.04);
        }
      }
      
      .empty-state {
        color: rgba(255, 255, 255, 0.6);
      }
      
      .dialog-actions {
        border-top-color: rgba(255, 255, 255, 0.12);
      }
      
      .sort-info {
        background: rgba(255, 255, 255, 0.03);
        border-bottom-color: rgba(255, 255, 255, 0.08);
        
        small {
          color: rgba(255, 255, 255, 0.6);
        }
      }
    }
  `]
})
export class DiscardPileViewerComponent {
  discardedCards = computed(() => this.data.discardedCards || []);
  
  // Show discarded cards in reverse chronological order (newest first) for better UX
  discardedCardInfos = computed((): DiscardedCardInfo[] => 
    this.discardedCards()
      .map((card, index) => ({
        card,
        playerType: (card.suit === Suit.HEARTS || card.suit === Suit.DIAMONDS ? 'player' : 'opponent') as 'player' | 'opponent', // Determine by card color
        turnNumber: undefined, // Don't show turn numbers since we don't have reliable tracking
        reason: undefined // Don't show reasons since we don't have reliable tracking
      }))
      .reverse() // Show newest discards first
  );

  constructor(
    private dialogRef: MatDialogRef<DiscardPileViewerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DiscardPileData
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  scrollToTop(): void {
    const scrollContainer = document.querySelector('.cards-scroll');
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
    }
  }
}
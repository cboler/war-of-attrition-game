import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card } from '../../../core/models/card.model';
import { CardComponent } from '../card/card.component';
import { HealthBarComponent } from '../health-bar/health-bar.component';

@Component({
  selector: 'app-game-board',
  standalone: true,
  imports: [CommonModule, CardComponent, HealthBarComponent],
  template: `
    <div class="game-board">
      <!-- Opponent Area (Top) -->
      <div class="player-area opponent-area">
        <div class="player-info">
          <app-health-bar 
            label="Opponent"
            [current]="opponentCardCount()"
            [maximum]="26"
            [inDanger]="opponentCardsInDanger()">
          </app-health-bar>
        </div>
        
        <div class="player-deck-area">
          <div class="deck-container" 
               [class.can-select]="false">
            <app-card 
              [card]="null"
              [faceDown]="true">
            </app-card>
            @if (opponentCardCount() > 1) {
              <div class="deck-count">{{ opponentCardCount() }}</div>
            }
          </div>
        </div>
      </div>

      <!-- Central Table Area -->
      <div class="table-area">
        <div class="active-cards">
          @if (opponentActiveCard()) {
            <app-card
              [card]="opponentActiveCard()"
              [faceDown]="false"
              [glow]="opponentCardGlow()">
            </app-card>
          }
          
          @if (playerActiveCard()) {
            <app-card
              [card]="playerActiveCard()"
              [faceDown]="false"
              [glow]="playerCardGlow()">
            </app-card>
          }
        </div>
        
        @if (gameMessage()) {
          <div class="game-message">
            {{ gameMessage() }}
          </div>
        }
        
        @if (challengeAvailable()) {
          <div class="challenge-prompt">
            Challenge?
          </div>
        }
      </div>

      <!-- Player Area (Bottom) -->
      <div class="player-area player-area-bottom">
        <div class="player-deck-area">
          <div class="deck-container" 
               [class.can-select]="canPlayerAct()"
               [class.glowing]="canPlayerAct()"
               (click)="onPlayerDeckClick()">
            <app-card 
              [card]="null"
              [faceDown]="true"
              [glow]="canPlayerAct() ? 'blue' : null">
            </app-card>
            @if (playerCardCount() > 1) {
              <div class="deck-count">{{ playerCardCount() }}</div>
            }
          </div>
        </div>
        
        <div class="player-info">
          <app-health-bar 
            label="You"
            [current]="playerCardCount()"
            [maximum]="26"
            [inDanger]="playerCardsInDanger()">
          </app-health-bar>
        </div>
      </div>
    </div>
  `,
  styleUrl: './game-board.component.scss'
})
export class GameBoardComponent {
  // Input properties
  playerCardCount = input<number>(26);
  opponentCardCount = input<number>(26);
  playerActiveCard = input<Card | null>(null);
  opponentActiveCard = input<Card | null>(null);
  playerCardGlow = input<'green' | 'red' | 'blue' | null>(null);
  opponentCardGlow = input<'green' | 'red' | 'blue' | null>(null);
  playerCardsInDanger = input<number>(0);
  opponentCardsInDanger = input<number>(0);
  gameMessage = input<string | null>(null);
  challengeAvailable = input<boolean>(false);
  canPlayerAct = input<boolean>(false);

  // Output events
  playerDeckClicked = output<void>();

  protected onPlayerDeckClick(): void {
    if (this.canPlayerAct()) {
      this.playerDeckClicked.emit();
    }
  }
}
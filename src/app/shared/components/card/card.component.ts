import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card, Suit, Rank } from '../../../core/models/card.model';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card" 
         [class.face-down]="faceDown()"
         [class.red-card]="isRed()"
         [class.black-card]="!isRed()"
         [class.glowing]="glow()"
         [class.glow-green]="glow() === 'green'"
         [class.glow-red]="glow() === 'red'"
         [class.glow-blue]="glow() === 'blue'">
      
      @if (faceDown()) {
        <div class="card-back">
          <div class="card-pattern"></div>
        </div>
      } @else {
        <div class="card-face">
          <div class="card-corner top-left">
            <div class="rank">{{ displayRank() }}</div>
            <div class="suit">{{ displaySuit() }}</div>
          </div>
          
          <div class="card-center">
            <div class="suit-symbol">{{ displaySuit() }}</div>
          </div>
          
          <div class="card-corner bottom-right">
            <div class="rank">{{ displayRank() }}</div>
            <div class="suit">{{ displaySuit() }}</div>
          </div>
        </div>
      }
    </div>
  `,
  styleUrl: './card.component.scss'
})
export class CardComponent {
  card = input<Card | null>(null);
  faceDown = input<boolean>(false);
  glow = input<'green' | 'red' | 'blue' | null>(null);

  protected isRed = computed(() => this.card()?.isRed ?? false);
  
  protected displayRank = computed(() => {
    const cardValue = this.card();
    if (!cardValue) return '';
    return cardValue.rank;
  });

  protected displaySuit = computed(() => {
    const cardValue = this.card();
    if (!cardValue) return '';
    
    switch (cardValue.suit) {
      case Suit.HEARTS: return '♥';
      case Suit.DIAMONDS: return '♦';
      case Suit.CLUBS: return '♣';
      case Suit.SPADES: return '♠';
      default: return '';
    }
  });
}
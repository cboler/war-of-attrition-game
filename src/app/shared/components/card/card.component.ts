import { Component, input, computed, output } from '@angular/core';
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
         [class.glow-blue]="glow() === 'blue'"
         [class.clickable]="clickable()"
         [class.animate-slide-in]="animationState() === 'slide-in'"
         [class.animate-flip]="animationState() === 'flip'"
         [class.animate-clash-win]="animationState() === 'clash-win'"
         [class.animate-clash-lose]="animationState() === 'clash-lose'"
         [class.animate-fall-away]="animationState() === 'fall-away'"
         [class.from-deck]="fromPosition() === 'deck'"
         [attr.role]="clickable() ? 'button' : null"
         [attr.aria-label]="ariaLabel()"
         [attr.tabindex]="clickable() ? 0 : null"
         (click)="onCardClick()"
         (keydown.enter)="onCardClick()"
         (keydown.space)="onCardClick()">
      
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
  clickable = input<boolean>(false);
  
  // Animation states
  animationState = input<'slide-in' | 'flip' | 'clash-win' | 'clash-lose' | 'fall-away' | null>(null);
  fromPosition = input<'deck' | 'table' | null>(null);

  // Event outputs
  cardClicked = output<void>();

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

  protected ariaLabel = computed(() => {
    if (this.faceDown()) {
      return 'Face down card';
    }
    
    const cardValue = this.card();
    if (!cardValue) return 'Empty card slot';
    
    const suitName = cardValue.suit.charAt(0).toUpperCase() + cardValue.suit.slice(1);
    const rankName = this.getRankName(cardValue.rank);
    
    return `${rankName} of ${suitName}`;
  });

  private getRankName(rank: Rank): string {
    switch (rank) {
      case Rank.ACE: return 'Ace';
      case Rank.KING: return 'King';
      case Rank.QUEEN: return 'Queen';
      case Rank.JACK: return 'Jack';
      default: return rank;
    }
  }

  protected onCardClick(): void {
    if (this.clickable()) {
      this.cardClicked.emit();
    }
  }

  protected onKeyDown(event: KeyboardEvent): void {
    if (this.clickable() && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      this.cardClicked.emit();
    }
  }
}
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../card/card.component';

@Component({
  selector: 'app-player-seat',
  imports: [CommonModule, CardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      class="seat"
      [class.is-bottom]="position() === 'bottom'"
      [class.deck-left]="position() === 'bottom' && deckHand() === 'left'"
      [attr.aria-label]="name() + ' seat'">
      
      <div class="identity">
        <span class="status-dot" [class.thinking]="thinking()" aria-hidden="true"></span>
        <div>
          <strong>{{ name() }}</strong>
          <span>{{ cardCount() }} cards<span class="at-risk">{{ dangerLabel() }}</span></span>
        </div>
      </div>

      @if (quip()) {
        <p class="quip" role="status">{{ quip() }}</p>
      }

      <button
        class="deck"
        [ngClass]="thicknessClass()"
        type="button"
        [class.actionable]="deckInteractive()"
        [disabled]="!deckInteractive()"
        [attr.aria-label]="deckInteractive() ? 'Draw from your deck' : name() + ' deck, ' + cardCount() + ' cards'"
        (click)="deckActivated.emit()">
        @if (cardCount() > 0) {
          @if (cardCount() >= 21) {
            <span class="deck-shadow shadow-four" aria-hidden="true"></span>
          }
          @if (cardCount() >= 11) {
            <span class="deck-shadow shadow-three" aria-hidden="true"></span>
          }
          @if (cardCount() >= 5) {
            <span class="deck-shadow shadow-two" aria-hidden="true"></span>
          }
          @if (cardCount() >= 2) {
            <span class="deck-shadow shadow-one" aria-hidden="true"></span>
          }
          <app-card [card]="null" [faceDown]="true" />
        } @else {
          <span class="empty-deck" aria-hidden="true"></span>
        }
        <span class="deck-count">{{ cardCount() }}</span>
      </button>
    </section>
  `,
  styleUrl: './player-seat.component.scss'
})
export class PlayerSeatComponent {
  name = input.required<string>();
  position = input<'top' | 'right' | 'bottom' | 'left'>('bottom');
  cardCount = input(0);
  cardsAtRisk = input(0);
  deckInteractive = input(false);
  thinking = input(false);
  quip = input<string | null>(null);
  deckHand = input<'right' | 'left'>('right');
  deckActivated = output<void>();

  protected dangerLabel = computed(() =>
    this.cardsAtRisk() > 0 ? ` · ${this.cardsAtRisk()} at stake` : ''
  );

  protected thicknessClass = computed(() => {
    const count = this.cardCount();
    if (count === 0) return 'thickness-empty';
    if (count === 1) return 'thickness-1';
    if (count <= 4) return 'thickness-thin';
    if (count <= 10) return 'thickness-modest';
    if (count <= 20) return 'thickness-substantial';
    return 'thickness-thick';
  });
}

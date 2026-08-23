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
      [class.motion-disabled]="motionDisabled()"
      [attr.aria-label]="name() + ' seat'">
      
      <div class="identity">
        <span class="status-dot" [class.thinking]="thinking()" aria-hidden="true"></span>
        <div>
          <strong>{{ name() }}</strong>
          @if (title()) {
            <span class="seat-title">{{ title() }}</span>
          }
          <span>{{ cardCount() }} cards<span class="at-risk">{{ dangerLabel() }}</span></span>
          @if (reserves(); as res) {
            <span
              class="reserve-badge"
              [class.reserve-exhausted]="res.remaining === 0"
              [attr.aria-label]="'Reserves: ' + res.remaining + ' of ' + res.max + ' remaining'">
              <span class="reserve-label">RESERVES</span>
              <strong class="reserve-count">{{ res.remaining }} / {{ res.max }}</strong>
            </span>
          }
          @if (totalWarDifferential() !== null) {
            <span
              class="total-war-badge"
              [class.diff-positive]="(totalWarDifferential() ?? 0) > 0"
              [class.diff-negative]="(totalWarDifferential() ?? 0) < 0"
              [attr.aria-label]="'Total War running differential: ' + ((totalWarDifferential() ?? 0) >= 0 ? '+' : '') + totalWarDifferential()">
              <span class="total-war-label">TOTAL WAR</span>
              <strong class="total-war-diff">DIFF {{ (totalWarDifferential() ?? 0) >= 0 ? '+' : '' }}{{ totalWarDifferential() }}</strong>
            </span>
          }
        </div>
      </div>

      @if (quip()) {
        <p class="quip" role="status">{{ quip() }}</p>
      }

      <button
        class="deck"
        [ngClass]="[thicknessClass(), urgencyClass()]"
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
        @if (cardCount() > 0 || defeatPopping()) {
          <span class="deck-count" [class.defeat-pop]="defeatPopping()">
            {{ defeatPopping() ? 1 : cardCount() }}
            @if (defeatPopping()) {
              <span class="pop-fragments" aria-hidden="true">
                <i></i><i></i><i></i><i></i><i></i><i></i>
              </span>
            }
          </span>
        }
      </button>
    </section>
  `,
  styleUrl: './player-seat.component.scss'
})
export class PlayerSeatComponent {
  name = input.required<string>();
  title = input<string | null>(null);
  position = input<'top' | 'right' | 'bottom' | 'left'>('bottom');
  cardCount = input(0);
  cardsAtRisk = input(0);
  deckInteractive = input(false);
  thinking = input(false);
  quip = input<string | null>(null);
  deckHand = input<'right' | 'left'>('right');
  defeatPopping = input(false);
  motionDisabled = input(false);
  reserves = input<{ remaining: number; max: number } | null>(null);
  totalWarDifferential = input<number | null>(null);

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

  protected urgencyClass = computed(() => {
    const count = this.cardCount();
    return count > 0 && count <= 5 ? `urgency-${count}` : '';
  });
}

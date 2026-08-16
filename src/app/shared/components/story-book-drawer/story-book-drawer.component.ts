import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  inject,
  input,
  output,
  effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { StoryBookEntry, StoryBookService } from '../../../services/story-book.service';
import { CardComponent } from '../card/card.component';

@Component({
  selector: 'app-story-book-drawer',
  imports: [CommonModule, MatIconModule, CardComponent],
  template: `
    <div class="drawer-backdrop" (click)="closed.emit()" aria-hidden="true"></div>
    <aside
      #drawerContainer
      class="story-book-drawer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="story-book-title">
      <header class="drawer-header">
        <div class="title-group">
          <div class="eyebrow">CURRENT GAME JOURNAL</div>
          <h2 id="story-book-title">Story Book</h2>
        </div>
        <button
          #closeBtn
          type="button"
          class="close-button"
          aria-label="Close Story Book"
          (click)="closed.emit()">
          <mat-icon>close</mat-icon>
        </button>
      </header>

      <div class="drawer-content" tabindex="0">
        @if (storyBook.entries().length === 0) {
          <div class="empty-state">
            <mat-icon class="empty-icon">auto_stories</mat-icon>
            <p>The story has just begun.</p>
            <small>Turns, battles, challenges, and memorable events will be recorded here as you play.</small>
          </div>
        } @else {
          <div class="timeline">
            @for (entry of storyBook.entries(); track entry.id) {
              <article
                class="story-node"
                [class]="'type-' + entry.type"
                [class.has-badge]="entry.badge">
                
                @if (entry.eyebrow) {
                  <span class="node-eyebrow">{{ entry.eyebrow }}</span>
                }
                
                @if (entry.title) {
                  <h3 class="node-title">{{ entry.title }}</h3>
                }

                <div class="node-body">
                  <p class="node-text">{{ entry.text }}</p>

                  @if (entry.cards && entry.cards.length > 0 && entry.type === 'casualty') {
                    <div class="casualties-strip" aria-label="Revealed casualty cards">
                      @for (card of entry.cards; track card.id) {
                        <app-card [card]="card" [faceDown]="false" />
                      }
                    </div>
                  }
                </div>

                @if (entry.badge) {
                  <span class="node-badge" [class]="'badge-' + entry.badge" aria-hidden="true">
                    @switch (entry.badge) {
                      @case ('victory') { <mat-icon>shield</mat-icon> }
                      @case ('defeat') { <mat-icon>heart_broken</mat-icon> }
                      @case ('battle') { <mat-icon>swords</mat-icon> }
                      @case ('achievement') { <mat-icon>emoji_events</mat-icon> }
                      @case ('challenge') { <mat-icon>flag</mat-icon> }
                    }
                  </span>
                }
              </article>
            }
          </div>
        }
      </div>

      <footer class="drawer-footer">
        <span>Game in progress · Clears on New Game</span>
        <button type="button" class="done-btn" (click)="closed.emit()">Back to Table</button>
      </footer>
    </aside>
  `,
  styleUrl: './story-book-drawer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StoryBookDrawerComponent {
  protected readonly storyBook = inject(StoryBookService);
  closed = output<void>();

  @ViewChild('closeBtn') private closeBtn?: ElementRef<HTMLButtonElement>;

  @HostListener('keydown.escape')
  onEscape(): void {
    this.closed.emit();
  }
}

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  ViewChild,
  inject,
  output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { StoryBookService } from '../../../services/story-book.service';
import { CardComponent } from '../card/card.component';

@Component({
  selector: 'app-story-book-drawer',
  imports: [CommonModule, MatIconModule, CardComponent],
  template: `
    <div class="drawer-backdrop" (click)="closeDrawer()" aria-hidden="true"></div>
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
          (click)="closeDrawer()">
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
                [ngClass]="'type-' + entry.type"
                [class.has-badge]="!!entry.badge">
                
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
                  <span class="node-badge" [ngClass]="'badge-' + entry.badge" aria-hidden="true">
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
        <button type="button" class="done-btn" (click)="closeDrawer()">Back to Table</button>
      </footer>
    </aside>
  `,
  styleUrl: './story-book-drawer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StoryBookDrawerComponent implements AfterViewInit, OnDestroy {
  protected readonly storyBook = inject(StoryBookService);
  closed = output<void>();

  @ViewChild('drawerContainer') private drawerContainer?: ElementRef<HTMLElement>;
  @ViewChild('closeBtn') private closeBtn?: ElementRef<HTMLButtonElement>;

  private previousActiveElement: HTMLElement | null = null;

  ngAfterViewInit(): void {
    if (typeof document !== 'undefined') {
      this.previousActiveElement = document.activeElement as HTMLElement | null;
      setTimeout(() => {
        this.closeBtn?.nativeElement.focus();
      }, 0);
    }
  }

  ngOnDestroy(): void {
    if (this.previousActiveElement && typeof this.previousActiveElement.focus === 'function') {
      this.previousActiveElement.focus();
    }
  }

  closeDrawer(): void {
    this.closed.emit();
  }

  @HostListener('keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.closeDrawer();
      return;
    }

    if (event.key === 'Tab' && this.drawerContainer) {
      const focusableElements = this.drawerContainer.nativeElement.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }
}

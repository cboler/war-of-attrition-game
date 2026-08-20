import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  ViewChild,
  inject,
  output,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { StoryBookService } from '../../../services/story-book.service';
import { CardComponent } from '../card/card.component';

@Component({
  selector: 'app-story-book-drawer',
  standalone: true,
  imports: [CommonModule, MatIconModule, CardComponent],
  template: `
    <div class="drawer-backdrop" (click)="closeDrawer()" aria-hidden="true"></div>
    <aside
      #drawerContainer
      class="story-book-drawer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="field-manual-title">
      <header class="drawer-header">
        <div class="title-group">
          <div class="eyebrow">TACTICAL INTELLIGENCE</div>
          <h2 id="field-manual-title">Field Manual</h2>
        </div>
        <button
          #closeBtn
          type="button"
          class="close-button"
          aria-label="Close Field Manual"
          (click)="closeDrawer()">
          <mat-icon>close</mat-icon>
        </button>
      </header>

      <nav class="drawer-tabs" role="tablist" aria-label="Field Manual Sections">
        <button
          type="button"
          role="tab"
          class="tab-btn"
          [class.active]="activeTab() === 'journal'"
          [attr.aria-selected]="activeTab() === 'journal'"
          aria-controls="panel-journal"
          id="tab-journal"
          (click)="activeTab.set('journal')">
          <mat-icon>history_edu</mat-icon>
          <span>Mission Log</span>
        </button>
        <button
          type="button"
          role="tab"
          class="tab-btn"
          [class.active]="activeTab() === 'rules'"
          [attr.aria-selected]="activeTab() === 'rules'"
          aria-controls="panel-rules"
          id="tab-rules"
          (click)="activeTab.set('rules')">
          <mat-icon>gavel</mat-icon>
          <span>Rules of Engagement</span>
        </button>
      </nav>

      <div class="drawer-content" tabindex="0">
        @if (activeTab() === 'journal') {
          <div id="panel-journal" role="tabpanel" aria-labelledby="tab-journal">
            @if (storyBook.entries().length === 0) {
              <div class="empty-state">
                <mat-icon class="empty-icon">menu_book</mat-icon>
                <p>The mission log is clean.</p>
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
        } @else {
          <div id="panel-rules" role="tabpanel" aria-labelledby="tab-rules" class="rules-reference">
            <section class="rule-card">
              <div class="rule-icon"><mat-icon>flag</mat-icon></div>
              <div class="rule-body">
                <h3>1. Objective & Flow</h3>
                <p>War of Attrition is a battle of endurance. Each commander starts with 26 cards. Tap your deck to deal 1 card each round. The commander with the higher rank captures all cards at stake.</p>
              </div>
            </section>

            <section class="rule-card">
              <div class="rule-icon"><mat-icon>stars</mat-icon></div>
              <div class="rule-body">
                <h3>2. Ranks & The 2-vs-Ace Feat</h3>
                <p>Hierarchy ranks from <strong>Ace</strong> (high) down to <strong>2</strong> (low). However, a legendary special rule applies: <em>A humble 2 conquers and assassinates an Ace!</em></p>
              </div>
            </section>

            <section class="rule-card">
              <div class="rule-icon"><mat-icon>swords</mat-icon></div>
              <div class="rule-body">
                <h3>3. Deadlocks & Battles</h3>
                <p>When matching ranks clash, a <strong>Battle</strong> is declared. Both commanders commit 3 cards face-down. You choose 1 of the opponent's 3 cards blindly, and they choose 1 of yours. Only the chosen cards flip up to determine victory.</p>
              </div>
            </section>

            <section class="rule-card">
              <div class="rule-icon"><mat-icon>shield</mat-icon></div>
              <div class="rule-body">
                <h3>4. Tactical Reinforcements (Challenges)</h3>
                <p>If you lose an ordinary clash, you can commit 1 reinforcement card to challenge. If your reinforcement beats the winning card, you rescue both cards. But beware: if your reinforcement ties or loses, both of your cards perish in the Boneyard!</p>
              </div>
            </section>

            <section class="rule-card">
              <div class="rule-icon"><mat-icon>delete_forever</mat-icon></div>
              <div class="rule-body">
                <h3>5. The Boneyard</h3>
                <p>Conceded cards and battle casualties are eliminated into the public Boneyard. These casualties are permanently out of play for the rest of the war.</p>
              </div>
            </section>

            <section class="rule-card">
              <div class="rule-icon"><mat-icon>military_tech</mat-icon></div>
              <div class="rule-body">
                <h3>6. War Resolution</h3>
                <p>The war ends when one commander’s army is completely depleted. The surviving commander claims ultimate victory.</p>
              </div>
            </section>
          </div>
        }
      </div>

      <footer class="drawer-footer">
        <span>Field Manual · Permanent Reference</span>
        <button type="button" class="done-btn" (click)="closeDrawer()">Back to Table</button>
      </footer>
    </aside>
  `,
  styleUrl: './story-book-drawer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StoryBookDrawerComponent implements AfterViewInit, OnDestroy {
  protected readonly storyBook = inject(StoryBookService);
  protected readonly activeTab = signal<'journal' | 'rules'>('journal');
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

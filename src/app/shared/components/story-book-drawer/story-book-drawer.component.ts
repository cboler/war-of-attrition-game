import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  computed,
  effect,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Card, Rank } from '../../../core/models/card.model';
import { StoryBookService } from '../../../services/story-book.service';
import { CardComponent } from '../card/card.component';
import { RuleDemoComponent, RuleDemoKind } from '../rule-demo/rule-demo.component';

type FieldManualTab = 'chronicle' | 'rules' | 'reference';

interface RuleEntry {
  readonly id: RuleDemoKind;
  readonly icon: string;
  readonly title: string;
  readonly description: string;
}

const RULE_ENTRIES: readonly RuleEntry[] = [
  {
    id: 'objective',
    icon: 'flag',
    title: '1. Objective & Flow',
    description:
      'Each commander starts with 26 cards and deals one card per ordinary clash. The higher rank wins: surviving cards return to their owner, while defeated cards are eliminated to the Boneyard.'
  },
  {
    id: 'ranks',
    icon: 'stars',
    title: '2. Ranks & the 2-vs-Ace Rule',
    description:
      'Ace is normally highest, followed by King through 2. One deliberate exception applies: a 2 defeats an Ace. Suits never break a tie.'
  },
  {
    id: 'battle',
    icon: 'swords',
    title: '3. Deadlocks & Battles',
    description:
      'Equal ranks tie and begin a Battle. Each commander commits three new cards face-down, then each selects one opposing target blindly. Only those champions reveal. Another tie can deepen the Battle when each deck can commit three more cards.'
  },
  {
    id: 'reinforcement',
    icon: 'shield',
    title: '4. Tactical Reinforcements',
    description:
      'After losing an ordinary clash, a commander may draw one reinforcement. It replaces—not adds to—the beaten card for the new comparison. A win rescues both owned cards, a loss eliminates both, and a tie begins a Battle.'
  },
  {
    id: 'boneyard',
    icon: 'delete_forever',
    title: '5. The Boneyard',
    description:
      'Conceded cards and Battle casualties enter the public Boneyard. They remain visible as a casualty record and stay out of play for the rest of that War.'
  },
  {
    id: 'war-resolution',
    icon: 'military_tech',
    title: '6. War Resolution',
    description:
      'The War ends after settlement leaves one commander with no cards. The commander who still has cards wins; simultaneous depletion produces a tie.'
  }
];

@Component({
  selector: 'app-story-book-drawer',
  imports: [MatIconModule, CardComponent, RuleDemoComponent],
  templateUrl: './story-book-drawer.component.html',
  styleUrl: './story-book-drawer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(keydown)': 'handleKeyDown($event)'
  }
})
export class StoryBookDrawerComponent implements AfterViewInit, OnDestroy {
  protected readonly storyBook = inject(StoryBookService);
  protected readonly rules = RULE_ENTRIES;
  protected readonly activeTab = signal<FieldManualTab>('chronicle');
  protected readonly activeDemo = signal<RuleDemoKind | null>(null);

  readonly referenceCard = input<Card | null>(null);
  readonly closed = output<void>();

  protected readonly availableTabs = computed<readonly FieldManualTab[]>(() =>
    this.referenceCard()
      ? ['chronicle', 'rules', 'reference']
      : ['chronicle', 'rules']
  );

  @ViewChild('drawerContainer') private drawerContainer?: ElementRef<HTMLElement>;
  @ViewChild('closeBtn') private closeBtn?: ElementRef<HTMLButtonElement>;

  private previousActiveElement: HTMLElement | null = null;
  private ruleDemoLauncherId: RuleDemoKind | null = null;
  private lastReferenceId: string | null = null;

  constructor() {
    effect(() => {
      const card = this.referenceCard();
      if (card && card.id !== this.lastReferenceId) {
        this.lastReferenceId = card.id;
        this.activeDemo.set(null);
        this.activeTab.set('reference');
      }
    });
  }

  ngAfterViewInit(): void {
    if (typeof document === 'undefined') return;

    this.previousActiveElement = document.activeElement as HTMLElement | null;
    setTimeout(() => this.closeBtn?.nativeElement.focus(), 0);
  }

  ngOnDestroy(): void {
    if (this.previousActiveElement && typeof this.previousActiveElement.focus === 'function') {
      this.previousActiveElement.focus();
    }
  }

  protected selectTab(tab: FieldManualTab): void {
    this.activeDemo.set(null);
    this.activeTab.set(tab);
  }

  protected handleTabKeyDown(event: KeyboardEvent, current: FieldManualTab): void {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;

    event.preventDefault();
    const tabs = this.availableTabs();
    const currentIndex = Math.max(0, tabs.indexOf(current));
    let nextIndex = currentIndex;

    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = tabs.length - 1;
    if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabs.length;

    const nextTab = tabs[nextIndex];
    this.selectTab(nextTab);
    queueMicrotask(() => {
      this.drawerContainer?.nativeElement
        .querySelector<HTMLElement>(`#tab-${nextTab}`)
        ?.focus();
    });
  }

  protected openRuleDemo(rule: RuleDemoKind): void {
    this.ruleDemoLauncherId = rule;
    this.activeDemo.set(rule);
  }

  protected closeRuleDemo(): void {
    const launcherId = this.ruleDemoLauncherId;
    this.activeDemo.set(null);
    setTimeout(() => {
      if (!launcherId) return;
      const launchers = this.drawerContainer?.nativeElement.querySelectorAll<HTMLButtonElement>(
        '[data-rule-demo-id]'
      );
      Array.from(launchers ?? [])
        .find(button => button.dataset['ruleDemoId'] === launcherId)
        ?.focus();
    }, 0);
  }

  protected cardName(card: Card): string {
    const rank = this.rankName(card.rank);
    const suit = card.suit.charAt(0).toUpperCase() + card.suit.slice(1);
    return `${rank} of ${suit}`;
  }

  protected rankGuidance(card: Card): string {
    if (card.rank === Rank.TWO) {
      return 'A 2 is normally lowest, but it specifically defeats an Ace.';
    }
    if (card.rank === Rank.ACE) {
      return 'An Ace is normally highest, but it specifically loses to a 2.';
    }
    return `Its comparison value is ${card.value}. Higher ranks win; equal ranks tie.`;
  }

  closeDrawer(): void {
    this.closed.emit();
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      if (this.activeDemo()) {
        this.closeRuleDemo();
      } else {
        this.closeDrawer();
      }
      return;
    }

    if (event.key !== 'Tab' || !this.drawerContainer) return;

    const focusableElements = this.drawerContainer.nativeElement.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
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

  private rankName(rank: Rank): string {
    switch (rank) {
      case Rank.ACE:
        return 'Ace';
      case Rank.KING:
        return 'King';
      case Rank.QUEEN:
        return 'Queen';
      case Rank.JACK:
        return 'Jack';
      default:
        return rank;
    }
  }
}

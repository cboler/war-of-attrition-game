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
import { Card, CardImpl, Rank, Suit } from '../../../core/models/card.model';
import {
  CardServiceRecord,
  isDecoratedCard,
  isValidCanonicalCardId
} from '../../../core/models/hall-of-valor.model';
import { HallOfValorService } from '../../../services/hall-of-valor.service';
import { CampaignProgressionService } from '../../../core/services/campaign-progression.service';
import { GameStateService } from '../../../core/services/game-state.service';
import { GamePhase } from '../../../core/models/game-state.model';
import { StoryBookEntry, StoryBookService } from '../../../services/story-book.service';
import { CardComponent } from '../card/card.component';
import { RuleDemoComponent, RuleDemoKind } from '../rule-demo/rule-demo.component';

import { OpponentCommanderId } from '../../../core/models/commander.model';
import { CommanderIdentity, getCommanderIdentity } from '../../../core/models/commander-identity.model';
import { CommanderDossierRecord } from '../../../core/models/narrative.model';
import { NarrativeResolverService } from '../../../narrative/narrative-resolver.service';
import { getCommanderCrest, getCommanderPortrait } from '../../../core/models/commander-art.model';
import { UiSurfaceTelemetryContext } from '../../../core/models/telemetry.model';
import { UiTelemetryService } from '../../../services/ui-telemetry.service';

type FieldManualTab = 'chronicle' | 'valor' | 'rules' | 'dossier' | 'reference';

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
    icon: 'sports_martial_arts',
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
  protected readonly hallOfValor = inject(HallOfValorService);
  protected readonly progression = inject(CampaignProgressionService, { optional: true });
  protected readonly gameState = inject(GameStateService, { optional: true });
  protected readonly narrativeResolver = inject(NarrativeResolverService, { optional: true });
  private readonly uiTelemetry = inject(UiTelemetryService);
  protected readonly rules = RULE_ENTRIES;
  protected readonly activeTab = signal<FieldManualTab>('chronicle');
  protected readonly activeDemo = signal<RuleDemoKind | null>(null);
  protected readonly selectedValorCardId = signal<string | null>(null);
  protected readonly expandedComparisonEntryIds = signal<ReadonlySet<string>>(new Set());
  protected readonly selectedCommanderId = signal<OpponentCommanderId>('quartermaster');

  readonly referenceCard = input<Card | null>(null);
  readonly targetCommanderId = input<OpponentCommanderId | null>(null);
  readonly initialTab = input<FieldManualTab | null>(null);
  readonly closed = output<void>();

  readonly isFogOfWarActive = computed<boolean>(() =>
    (this.progression?.isFogOfWar() ?? false) &&
    this.gameState?.currentPhase !== GamePhase.GAME_OVER
  );

  protected readonly availableTabs = computed<readonly FieldManualTab[]>(() =>
    this.referenceCard()
      ? ['chronicle', 'valor', 'rules', 'dossier', 'reference']
      : ['chronicle', 'valor', 'rules', 'dossier']
  );

  protected readonly unlockedCommanders = computed<readonly CommanderIdentity[]>(() => {
    const all: OpponentCommanderId[] = [
      'quartermaster',
      'analyst',
      'attritionist',
      'gambler',
      'cornered-general'
    ];
    if (!this.narrativeResolver) {
      return [getCommanderIdentity('quartermaster')];
    }
    const list = all
      .filter(id => (this.narrativeResolver?.dossierFor(id)?.length ?? 0) > 0)
      .map(id => getCommanderIdentity(id));
    return list.length > 0 ? list : [getCommanderIdentity('quartermaster')];
  });

  protected readonly activeCommanderIdentity = computed<CommanderIdentity>(() =>
    getCommanderIdentity(this.selectedCommanderId())
  );

  protected readonly activeCommanderDossier = computed<readonly CommanderDossierRecord[]>(() =>
    this.narrativeResolver?.dossierFor(this.selectedCommanderId()) ?? []
  );
  protected readonly activeCommanderPortrait = computed(() =>
    getCommanderPortrait(this.selectedCommanderId(), 'calm')
  );

  protected commanderCrest(commanderId: OpponentCommanderId): string {
    return getCommanderCrest(commanderId);
  }

  selectDossierCommander(commanderId: OpponentCommanderId): void {
    this.selectedCommanderId.set(commanderId);
  }

  protected handleDossierKeyDown(event: KeyboardEvent, current: OpponentCommanderId): void {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;

    event.preventDefault();
    const commanders = this.unlockedCommanders();
    const currentIndex = Math.max(
      0,
      commanders.findIndex((commander) => commander.commanderId === current),
    );
    let nextIndex = currentIndex;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = commanders.length - 1;
    if (event.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + commanders.length) % commanders.length;
    }
    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % commanders.length;

    const nextId = commanders[nextIndex].commanderId;
    this.selectDossierCommander(nextId);
    queueMicrotask(() => {
      this.drawerContainer?.nativeElement
        .querySelector<HTMLElement>(`[data-commander-id="${nextId}"]`)
        ?.focus();
    });
  }

  protected entryText(entry: StoryBookEntry): string {
    if (!this.isFogOfWarActive()) {
      return entry.text;
    }
    switch (entry.type) {
      case 'clash':
        return 'Comparison resolved under Fog of War.';
      case 'challenge':
        if (entry.text.includes('committed')) {
          return 'Reinforcement committed under Fog of War.';
        }
        if (entry.text.includes('conceded')) {
          return 'Challenge conceded under Fog of War.';
        }
        if (entry.badge === 'victory') {
          return 'Card rescued under Fog of War.';
        }
        if (entry.badge === 'defeat') {
          return 'Reinforcement failed under Fog of War.';
        }
        if (entry.badge === 'battle') {
          return 'Reinforcement tied. Battle initiated under Fog of War.';
        }
        return 'Challenge resolved under Fog of War.';
      case 'battle_reveal':
        if (entry.badge === 'victory') {
          return 'Player champion prevailed under Fog of War.';
        }
        if (entry.badge === 'defeat') {
          return 'Opponent champion prevailed under Fog of War.';
        }
        if (entry.badge === 'battle') {
          return 'Champions tied under Fog of War. Battle continues!';
        }
        return 'Battle champions revealed under Fog of War.';
      case 'casualty':
        return 'Battle resolved. Casualties surrendered to the sealed Boneyard.';
      case 'achievement':
        if (entry.eyebrow?.includes('VALOR')) {
          return 'Combat citation recorded in field records.';
        }
        return entry.text;
      default:
        return entry.text;
    }
  }

  protected entryEyebrow(entry: StoryBookEntry): string {
    if (!this.isFogOfWarActive()) {
      return entry.eyebrow ?? '';
    }
    if (entry.eyebrow?.includes('VALOR CITATION')) {
      return 'VALOR CITATION · SEALED';
    }
    if (entry.eyebrow?.includes('SPECIAL FEAT') || entry.eyebrow?.includes('ASSASSINATION')) {
      return entry.turnNumber ? `TURN ${entry.turnNumber} · CLASH` : 'CLASH';
    }
    return entry.eyebrow ?? '';
  }

  protected showEntryCards(entry: StoryBookEntry): boolean {
    if (this.isFogOfWarActive()) return false;
    return !!(entry.cards && entry.cards.length > 0 && entry.type === 'casualty');
  }

  protected showEntryComparison(entry: StoryBookEntry): boolean {
    if (this.isFogOfWarActive()) return false;
    return !!entry.comparison;
  }

  protected isComparisonExpanded(entryId: string): boolean {
    return this.expandedComparisonEntryIds().has(entryId);
  }

  protected toggleComparisonExpanded(entry: StoryBookEntry): void {
    if (this.isFogOfWarActive()) return;
    const entryId = entry.id;
    const wasExpanded = this.expandedComparisonEntryIds().has(entryId);
    this.expandedComparisonEntryIds.update(current => {
      const next = new Set(current);
      if (next.has(entryId)) {
        next.delete(entryId);
      } else {
        next.add(entryId);
      }
      return next;
    });
    const trackingKey = this.chronicleEntryTrackingKey(entryId);
    if (wasExpanded) {
      this.uiTelemetry.closeSurface(trackingKey);
    } else {
      this.uiTelemetry.openSurface(
        {
          surface: 'chronicle',
          subsurface: 'entry_detail',
          sourceSurface: 'chronicle',
          chronicleEntry: entry.type,
        },
        trackingKey,
      );
    }
  }

  protected readonly selectedValorCard = computed<CardServiceRecord | null>(() => {
    const id = this.selectedValorCardId();
    return id ? this.hallOfValor.getRecord(id) : null;
  });

  @ViewChild('drawerContainer') private drawerContainer?: ElementRef<HTMLElement>;
  @ViewChild('closeBtn') private closeBtn?: ElementRef<HTMLButtonElement>;

  private previousActiveElement: HTMLElement | null = null;
  private ruleDemoLauncherId: RuleDemoKind | null = null;
  private lastReferenceId: string | null = null;
  private readonly fieldManualTrackingKey = 'field_manual.drawer';
  private readonly fieldManualTabTrackingKey = 'field_manual.active_tab';

  constructor() {
    this.uiTelemetry.openSurface(
      { surface: 'field_manual', sourceSurface: 'table' },
      this.fieldManualTrackingKey,
    );

    effect(() => {
      const card = this.referenceCard();
      if (card && card.id !== this.lastReferenceId) {
        this.lastReferenceId = card.id;
        this.activeDemo.set(null);
        this.selectedValorCardId.set(null);
        this.activeTab.set('reference');
      }
    });

    effect(() => {
      const target = this.targetCommanderId();
      if (target) {
        this.selectedCommanderId.set(target);
        this.activeTab.set('dossier');
      }
    });

    effect(() => {
      const initial = this.initialTab();
      if (initial) {
        this.activeTab.set(initial);
      }
    });

    effect(() => {
      this.uiTelemetry.openSurface(
        this.telemetryContextForActiveTab(),
        this.fieldManualTabTrackingKey,
      );
    });
  }

  ngAfterViewInit(): void {
    if (typeof document === 'undefined') return;

    this.previousActiveElement = document.activeElement as HTMLElement | null;
    setTimeout(() => this.closeBtn?.nativeElement.focus(), 0);
  }

  ngOnDestroy(): void {
    for (const entryId of this.expandedComparisonEntryIds()) {
      this.uiTelemetry.closeSurface(this.chronicleEntryTrackingKey(entryId));
    }
    this.uiTelemetry.closeSurface(this.fieldManualTabTrackingKey);
    this.uiTelemetry.closeSurface(this.fieldManualTrackingKey);
    if (this.previousActiveElement && typeof this.previousActiveElement.focus === 'function') {
      this.previousActiveElement.focus();
    }
  }

  protected selectTab(tab: FieldManualTab): void {
    if (this.activeTab() === 'chronicle' && tab !== 'chronicle') {
      for (const entryId of this.expandedComparisonEntryIds()) {
        this.uiTelemetry.closeSurface(this.chronicleEntryTrackingKey(entryId));
      }
    }
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

  protected selectValorCard(cardId: string): void {
    this.selectedValorCardId.set(cardId);
  }

  protected closeValorDetail(): void {
    this.selectedValorCardId.set(null);
  }

  protected viewInHallOfValor(cardId: string): void {
    this.selectedValorCardId.set(cardId);
    this.selectTab('valor');
  }

  protected cardFromId(cardId: string): Card {
    if (!isValidCanonicalCardId(cardId)) {
      return new CardImpl(Suit.HEARTS, Rank.ACE);
    }
    const [suitStr, rankStr] = cardId.split('-');
    return new CardImpl(suitStr as Suit, rankStr as Rank);
  }

  protected cardName(card: Card): string {
    const rank = this.rankName(card.rank);
    const suit = card.suit.charAt(0).toUpperCase() + card.suit.slice(1);
    return `${rank} of ${suit}`;
  }

  protected cardNameFromId(cardId: string): string {
    return this.cardName(this.cardFromId(cardId));
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

  protected primaryRivalLabel(record: CardServiceRecord): string {
    const entries = Object.entries(record.notableLosses || {});
    if (entries.length === 0) return '';
    entries.sort((a, b) => b[1] - a[1]);
    const [rivalId, count] = entries[0];
    const rivalCard = this.cardFromId(rivalId);
    const symbol = this.suitSymbol(rivalCard.suit);
    return `${rivalCard.rank}${symbol} (${count} ${count === 1 ? 'defeat' : 'defeats'})`;
  }

  protected rivalLossesList(record: CardServiceRecord): Array<{
    rivalId: string;
    card: Card;
    name: string;
    count: number;
  }> {
    const entries = Object.entries(record.notableLosses || {});
    entries.sort((a, b) => b[1] - a[1]);
    return entries.map(([rivalId, count]) => {
      const card = this.cardFromId(rivalId);
      return {
        rivalId,
        card,
        name: this.cardName(card),
        count
      };
    });
  }

  protected valorCardSummary(cardId: string): string {
    const record = this.hallOfValor.getRecord(cardId);
    if (!record || !isDecoratedCard(record)) return '';

    const parts: string[] = [];
    if (record.juggernautCitations > 0) {
      parts.push(`${record.juggernautCitations} Juggernaut ${record.juggernautCitations === 1 ? 'Citation' : 'Citations'}`);
    }
    if (record.aceAssassinations > 0) {
      parts.push(`${record.aceAssassinations} Ace ${record.aceAssassinations === 1 ? 'Assassination' : 'Assassinations'}`);
    }
    if (record.confirmedCasualties > 0) {
      parts.push(`${record.confirmedCasualties} ${record.confirmedCasualties === 1 ? 'Casualty' : 'Casualties'}`);
    }
    if (record.reinforcementRescues > 0) {
      parts.push(`${record.reinforcementRescues} ${record.reinforcementRescues === 1 ? 'Rescue' : 'Rescues'}`);
    }
    if (record.victoriousWarsSurvived > 0) {
      parts.push(`Survived ${record.victoriousWarsSurvived} ${record.victoriousWarsSurvived === 1 ? 'War' : 'Wars'}`);
    }
    return parts.join(' · ');
  }

  closeDrawer(): void {
    this.closed.emit();
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      if (this.activeDemo()) {
        this.closeRuleDemo();
      } else if (this.selectedValorCardId()) {
        this.closeValorDetail();
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

  private suitSymbol(suit: string): string {
    switch (suit) {
      case 'hearts':
        return '♥';
      case 'diamonds':
        return '♦';
      case 'clubs':
        return '♣';
      case 'spades':
        return '♠';
      default:
        return '';
    }
  }

  private telemetryContextForActiveTab(): UiSurfaceTelemetryContext {
    switch (this.activeTab()) {
      case 'chronicle':
        return { surface: 'chronicle', sourceSurface: 'field_manual' };
      case 'rules': {
        const ruleId = this.activeDemo();
        return ruleId
          ? {
              surface: 'rules',
              subsurface: 'rule_demo',
              sourceSurface: 'field_manual',
              ruleId,
            }
          : { surface: 'rules', sourceSurface: 'field_manual' };
      }
      case 'dossier':
        return {
          surface: 'field_manual',
          subsurface: 'commander_dossier',
          sourceSurface: 'field_manual',
          commanderId: this.selectedCommanderId(),
          manualEntryType: 'commander_dossier',
        };
      case 'reference':
        return {
          surface: 'field_manual',
          subsurface: 'card_reference',
          sourceSurface: 'field_manual',
          manualEntryType: 'card_reference',
        };
      case 'valor':
        return {
          surface: 'field_manual',
          subsurface: 'hall_of_valor',
          sourceSurface: 'field_manual',
          manualEntryType: 'hall_of_valor',
        };
    }
  }

  private chronicleEntryTrackingKey(entryId: string): string {
    return `field_manual.chronicle_entry.${entryId}`;
  }
}

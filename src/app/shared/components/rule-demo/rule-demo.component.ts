import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  ViewChild,
  computed,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Card, Rank, Suit } from '../../../core/models/card.model';
import { SettingsService } from '../../../core/services/settings.service';
import { SoundService } from '../../../core/services/sound.service';
import { CardComponent } from '../card/card.component';

export type RuleDemoKind =
  | 'objective'
  | 'ranks'
  | 'battle'
  | 'reinforcement'
  | 'boneyard'
  | 'war-resolution';

type DemoGlow = 'green' | 'red' | 'blue' | null;

interface RuleDemoFrame {
  readonly cue: string;
  readonly narration: string;
  readonly leftCard: Card | null;
  readonly rightCard: Card | null;
  readonly leftFaceDown?: boolean;
  readonly rightFaceDown?: boolean;
  readonly leftStrength?: number | null;
  readonly rightStrength?: number | null;
  readonly leftGlow?: DemoGlow;
  readonly rightGlow?: DemoGlow;
  readonly supportingCard?: Card;
  readonly supportingCardInactive?: boolean;
  readonly rightInBoneyard?: boolean;
  readonly showBoneyard?: boolean;
  readonly boneyardCard?: Card;
  readonly rightMovesToBoneyard?: boolean;
  readonly warCelebration?: boolean;
  readonly special?: boolean;
  readonly playerDeckCount?: number;
  readonly opponentDeckCount?: number;
  readonly battleEscalation?: boolean;
  readonly battleCommitment?: {
    readonly playerCards: readonly Card[];
    readonly opponentCards: readonly Card[];
    readonly playerSelectedIndex: number;
    readonly opponentSelectedIndex: number;
    readonly revealSelected: boolean;
  };
}

interface RuleDemoDefinition {
  readonly title: string;
  readonly summary: string;
  readonly frames: readonly RuleDemoFrame[];
}

function card(id: string, suit: Suit, rank: Rank, value: number): Card {
  return {
    id: `rule-demo-${id}`,
    suit,
    rank,
    value,
    isRed: suit === Suit.HEARTS || suit === Suit.DIAMONDS
  };
}

const TEN_HEARTS = card('ten-hearts', Suit.HEARTS, Rank.TEN, 10);
const EIGHT_CLUBS = card('eight-clubs', Suit.CLUBS, Rank.EIGHT, 8);
const ACE_HEARTS = card('ace-hearts', Suit.HEARTS, Rank.ACE, 14);
const TWO_SPADES = card('two-spades', Suit.SPADES, Rank.TWO, 2);
const SEVEN_DIAMONDS = card('seven-diamonds', Suit.DIAMONDS, Rank.SEVEN, 7);
const SEVEN_CLUBS = card('seven-clubs', Suit.CLUBS, Rank.SEVEN, 7);
const NINE_HEARTS = card('nine-hearts', Suit.HEARTS, Rank.NINE, 9);
const SIX_SPADES = card('six-spades', Suit.SPADES, Rank.SIX, 6);
const FIVE_DIAMONDS = card('five-diamonds', Suit.DIAMONDS, Rank.FIVE, 5);
const KING_CLUBS = card('king-clubs', Suit.CLUBS, Rank.KING, 13);
const QUEEN_SPADES = card('queen-spades', Suit.SPADES, Rank.QUEEN, 12);
const NINE_DIAMONDS = card('nine-diamonds', Suit.DIAMONDS, Rank.NINE, 9);
const FOUR_HEARTS = card('four-hearts', Suit.HEARTS, Rank.FOUR, 4);
const JACK_DIAMONDS = card('jack-diamonds', Suit.DIAMONDS, Rank.JACK, 11);
const THREE_CLUBS = card('three-clubs', Suit.CLUBS, Rank.THREE, 3);
const QUEEN_CLUBS = card('queen-clubs', Suit.CLUBS, Rank.QUEEN, 12);

const RULE_DEMOS: Readonly<Record<RuleDemoKind, RuleDemoDefinition>> = {
  objective: {
    title: 'Objective & Flow',
    summary: 'A higher card survives while the defeated card leaves play.',
    frames: [
      {
        cue: 'Deal',
        narration: 'Each commander deals one card from their own deck.',
        leftCard: TEN_HEARTS,
        rightCard: EIGHT_CLUBS,
        leftStrength: 10,
        rightStrength: 8,
        playerDeckCount: 25,
        opponentDeckCount: 25
      },
      {
        cue: 'Compare',
        narration: '10 outranks 8. Suits do not affect the comparison.',
        leftCard: TEN_HEARTS,
        rightCard: EIGHT_CLUBS,
        leftStrength: 2,
        rightStrength: 0,
        leftGlow: 'green',
        rightGlow: 'red',
        playerDeckCount: 25,
        opponentDeckCount: 25
      },
      {
        cue: 'Settle',
        narration: 'The winning 10 returns to its owner. The defeated 8 goes to the Boneyard.',
        leftCard: TEN_HEARTS,
        rightCard: EIGHT_CLUBS,
        leftStrength: 10,
        rightStrength: 0,
        leftGlow: 'green',
        rightInBoneyard: true,
        playerDeckCount: 26,
        opponentDeckCount: 25
      }
    ]
  },
  ranks: {
    title: 'Ranks & the 2-vs-Ace Rule',
    summary: 'Ace is normally highest, but a 2 specifically defeats an Ace.',
    frames: [
      {
        cue: 'Normal values',
        narration: 'The Ace keeps its truthful base value of 14; the 2 keeps its value of 2.',
        leftCard: TWO_SPADES,
        rightCard: ACE_HEARTS,
        leftStrength: 2,
        rightStrength: 14
      },
      {
        cue: 'Special override',
        narration: 'Special rule: a 2 defeats an Ace. This exception does not change the normal rank order.',
        leftCard: TWO_SPADES,
        rightCard: ACE_HEARTS,
        leftStrength: 2,
        rightStrength: 0,
        leftGlow: 'green',
        rightGlow: 'red',
        special: true
      }
    ]
  },
  battle: {
    title: 'Deadlocks & Battles',
    summary: 'Equal ranks tie. Each side commits three new cards and one blind target is chosen.',
    frames: [
      {
        cue: 'Tie',
        narration: '7 ties 7 even though the suits differ. A Battle begins.',
        leftCard: SEVEN_DIAMONDS,
        rightCard: SEVEN_CLUBS,
        leftStrength: 0,
        rightStrength: 0,
        leftGlow: 'blue',
        rightGlow: 'blue'
      },
      {
        cue: 'Escalate',
        narration: 'The equal comparison deadlocks. Battle now requires three new cards from each deck.',
        leftCard: SEVEN_DIAMONDS,
        rightCard: SEVEN_CLUBS,
        leftStrength: 0,
        rightStrength: 0,
        leftGlow: 'blue',
        rightGlow: 'blue',
        battleEscalation: true
      },
      {
        cue: 'Commit three each',
        narration: 'Both commanders commit three new cards face-down. A target is chosen blindly.',
        leftCard: null,
        rightCard: null,
        leftStrength: null,
        rightStrength: null,
        battleCommitment: {
          playerCards: [FOUR_HEARTS, NINE_HEARTS, JACK_DIAMONDS],
          opponentCards: [SIX_SPADES, THREE_CLUBS, QUEEN_CLUBS],
          playerSelectedIndex: 1,
          opponentSelectedIndex: 0,
          revealSelected: false
        }
      },
      {
        cue: 'Reveal champions',
        narration: 'Only the selected champions reveal. 9 defeats 6 and resolves this Battle layer.',
        leftCard: null,
        rightCard: null,
        leftStrength: 3,
        rightStrength: 0,
        leftGlow: 'green',
        rightGlow: 'red',
        battleCommitment: {
          playerCards: [FOUR_HEARTS, NINE_HEARTS, JACK_DIAMONDS],
          opponentCards: [SIX_SPADES, THREE_CLUBS, QUEEN_CLUBS],
          playerSelectedIndex: 1,
          opponentSelectedIndex: 0,
          revealSelected: true
        }
      }
    ]
  },
  reinforcement: {
    title: 'Tactical Reinforcements',
    summary: 'A reinforcement replaces the beaten card for the new comparison; values never add.',
    frames: [
      {
        cue: 'Card beaten',
        narration: 'Your 5 loses to the opposing 10. You may concede or challenge.',
        leftCard: FIVE_DIAMONDS,
        rightCard: TEN_HEARTS,
        leftStrength: 0,
        rightStrength: 5,
        leftGlow: 'red',
        rightGlow: 'green'
      },
      {
        cue: 'Replacement',
        narration: 'The original 5 stays on the table but becomes inactive. The King is the sole comparator.',
        leftCard: KING_CLUBS,
        rightCard: TEN_HEARTS,
        leftStrength: 13,
        rightStrength: 10,
        supportingCard: FIVE_DIAMONDS,
        supportingCardInactive: true
      },
      {
        cue: 'Rescue',
        narration: 'The King defeats the 10 and rescues the original 5. No values were added together.',
        leftCard: KING_CLUBS,
        rightCard: TEN_HEARTS,
        leftStrength: 3,
        rightStrength: 0,
        leftGlow: 'green',
        rightGlow: 'red',
        supportingCard: FIVE_DIAMONDS
      }
    ]
  },
  boneyard: {
    title: 'The Boneyard',
    summary: 'Defeated cards are public casualties and remain out of play for the rest of the War.',
    frames: [
      {
        cue: 'Clash',
        narration: 'Queen defeats 9.',
        leftCard: QUEEN_SPADES,
        rightCard: NINE_DIAMONDS,
        leftStrength: 3,
        rightStrength: 0,
        leftGlow: 'green',
        rightGlow: 'red',
        showBoneyard: true
      },
      {
        cue: 'Eliminate',
        narration: 'The defeated 9 moves to the public Boneyard and cannot return this War.',
        leftCard: QUEEN_SPADES,
        rightCard: NINE_DIAMONDS,
        leftStrength: 12,
        rightStrength: 0,
        leftGlow: 'green',
        rightGlow: 'red',
        showBoneyard: true,
        boneyardCard: NINE_DIAMONDS,
        rightMovesToBoneyard: true
      }
    ]
  },
  'war-resolution': {
    title: 'War Resolution',
    summary: 'The War ends when a commander has no cards remaining after settlement.',
    frames: [
      {
        cue: 'Final clash',
        narration: 'The opponent commits their final card.',
        leftCard: TEN_HEARTS,
        rightCard: EIGHT_CLUBS,
        leftStrength: 10,
        rightStrength: 8,
        playerDeckCount: 4,
        opponentDeckCount: 0
      },
      {
        cue: 'War resolved',
        narration: 'The 10 wins. With no cards remaining, the opponent loses the War.',
        leftCard: TEN_HEARTS,
        rightCard: EIGHT_CLUBS,
        leftStrength: 2,
        rightStrength: 0,
        leftGlow: 'green',
        rightGlow: 'red',
        rightInBoneyard: true,
        warCelebration: true,
        playerDeckCount: 5,
        opponentDeckCount: 0
      }
    ]
  }
};

@Component({
  selector: 'app-rule-demo',
  imports: [MatIconModule, CardComponent],
  templateUrl: './rule-demo.component.html',
  styleUrl: './rule-demo.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RuleDemoComponent implements AfterViewInit {
  private readonly settings = inject(SettingsService);
  private readonly sound = inject(SoundService);
  private readonly destroyRef = inject(DestroyRef);
  private timer: ReturnType<typeof setTimeout> | null = null;

  readonly rule = input.required<RuleDemoKind>();
  readonly closed = output<void>();
  readonly frameIndex = signal(0);
  readonly playing = signal(false);
  readonly demo = computed(() => RULE_DEMOS[this.rule()]);
  readonly frame = computed(() => this.demo().frames[this.frameIndex()]);
  readonly stepLabel = computed(
    () => `Step ${this.frameIndex() + 1} of ${this.demo().frames.length}`
  );
  readonly isFinalFrame = computed(
    () => this.frameIndex() === this.demo().frames.length - 1
  );
  protected readonly motionDisabled = computed(() => !this.settings.autoPlayAnimations());

  @ViewChild('demoHeading') private demoHeading?: ElementRef<HTMLElement>;

  constructor() {
    this.destroyRef.onDestroy(() => this.clearTimer());
  }

  ngAfterViewInit(): void {
    this.demoHeading?.nativeElement.focus();
    this.replay();
  }

  replay(): void {
    this.clearTimer();
    this.frameIndex.set(0);

    if (!this.motionEnabled()) {
      this.finish();
      return;
    }

    this.playFrameSound(this.frame());
    this.playing.set(true);
    this.scheduleNextFrame();
  }

  skip(): void {
    this.finish();
  }

  close(): void {
    this.clearTimer();
    this.closed.emit();
  }

  private scheduleNextFrame(): void {
    this.timer = setTimeout(() => {
      if (this.isFinalFrame()) {
        this.playing.set(false);
        this.timer = null;
        return;
      }

      this.frameIndex.update(index => index + 1);
      this.playFrameSound(this.frame());
      this.scheduleNextFrame();
    }, 950);
  }

  private finish(): void {
    this.clearTimer();
    this.frameIndex.set(this.demo().frames.length - 1);
    this.playFrameSound(this.frame());
    this.playing.set(false);
  }

  private clearTimer(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private motionEnabled(): boolean {
    const reducedMotion = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    return this.settings.autoPlayAnimations() && !reducedMotion;
  }

  private playFrameSound(frame: RuleDemoFrame): void {
    if (!this.settings.soundEnabled()) return;

    if (frame.rightInBoneyard || frame.boneyardCard) {
      this.sound.playBoneyard();
      return;
    }

    if (
      frame.leftFaceDown ||
      frame.rightFaceDown ||
      (frame.battleCommitment && !frame.battleCommitment.revealSelected)
    ) {
      this.sound.playCardDraw();
      return;
    }

    if (frame.leftGlow === 'blue' && frame.rightGlow === 'blue') {
      this.sound.playClash();
      return;
    }

    if (frame.leftGlow === 'green') {
      if (this.rule() === 'battle') {
        this.sound.playBattleVictory();
      } else {
        this.sound.playPositiveResolution();
      }
      return;
    }

    if (frame.rightGlow === 'green') {
      this.sound.playNegativeResolution();
      return;
    }

    this.sound.playCardDraw();
  }
}

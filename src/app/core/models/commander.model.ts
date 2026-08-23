import { Rank } from './card.model';

export type OpponentCommanderId =
  | 'quartermaster'
  | 'gambler'
  | 'analyst'
  | 'attritionist'
  | 'cornered-general';

export interface OpponentCommanderStrategy {
  /** Multiplier on the base strategic value of the card at risk (baseline 0.68). */
  readonly cardValueWeight: number;
  /** Multiplier for clean win probability derived from the public candidate pool (baseline 34). */
  readonly winRateWeight: number;
  /** Multiplier for tie probability when deck has >= 4 cards to support a Battle (baseline 10). */
  readonly supportedTieWeight: number;
  /** Penalty multiplier for tie probability when deck has < 4 cards (baseline -22). */
  readonly unsupportedTiePenalty: number;
  /** Additional penalty applied when deck is critically low or near the Battle sustainability threshold. */
  readonly reserveDepletionPenalty: number;
  /** Low-deck urgency bonuses applied as the deck count drops. */
  readonly desperationWeights: {
    readonly severe: number; // deck <= 3
    readonly moderate: number; // deck <= 6
    readonly mild: number; // deck <= 10
  };
  /** Score threshold (0-100) at or above which the AI will deterministically accept a challenge. */
  readonly autoAcceptScore: number;
  /** Score threshold (0-100) below which the AI will deterministically concede. */
  readonly autoRejectScore: number;
  /** Weight on how much the average candidate pool quality influences the challenge score. */
  readonly candidatePoolStrengthWeight: number;
  /** Multiplier on probabilistic acceptance in the marginal judgment band. */
  readonly gambleBandMultiplier: number;
}

export interface OpponentCommanderDialogue {
  /** Reactions spoken after a 2 defeats an Ace special clash. */
  readonly specialClash: readonly string[];
  /** Reactions spoken after a narrow 1-rank difference clash (e.g., Jack over 10). */
  readonly narrowClash: readonly string[];
  /** Reactions spoken when the commander successfully rescues their card via reinforcement. */
  readonly rescue: readonly string[];
  /** Reactions spoken when the commander's reinforcement fails and both cards are lost. */
  readonly failedRescue: readonly string[];
  /** Reactions spoken when the commander suffers a notable Battle casualty. */
  readonly battleLoss: {
    readonly aceLost: readonly string[];
    readonly twoLost: readonly string[];
    readonly aceAndTwoLost?: readonly string[];
    readonly deepBattle: readonly string[];
    readonly largeLoss: readonly string[];
    readonly general: readonly string[];
  };
  /** Reactions spoken after the commander concedes a clash without reinforcing. */
  readonly concession?: readonly string[];
  /** Defiant low-deck reaction line when reinforcing near exhaustion. */
  readonly desperateRescue?: readonly string[];
}

export interface OpponentCommander {
  readonly id: OpponentCommanderId;
  readonly name: string;
  readonly title: string;
  readonly description: string;
  readonly strategy: OpponentCommanderStrategy;
  readonly dialogue: OpponentCommanderDialogue;
}

export const COMMANDER_IDS: readonly OpponentCommanderId[] = [
  'quartermaster',
  'gambler',
  'analyst',
  'attritionist',
  'cornered-general'
];

export const DEFAULT_COMMANDER_ID: OpponentCommanderId = 'quartermaster';

export const COMMANDERS: Record<OpponentCommanderId, OpponentCommander> = {
  quartermaster: {
    id: 'quartermaster',
    name: 'The Quartermaster',
    title: 'Conservative Logistics',
    description:
      'Highly values preserving high-value resources, dislikes speculative reinforcement, and requires favorable odds to spend reserve cards.',
    strategy: {
      cardValueWeight: 0.84,
      winRateWeight: 38,
      supportedTieWeight: 8,
      unsupportedTiePenalty: -26,
      reserveDepletionPenalty: 6,
      desperationWeights: {
        severe: 34,
        moderate: 22,
        mild: 10
      },
      autoAcceptScore: 82,
      autoRejectScore: 26,
      candidatePoolStrengthWeight: 0.08,
      gambleBandMultiplier: 0.85
    },
    dialogue: {
      specialClash: [
        'An irregular casualty. We adjust the ledger.',
        'A rare exchange. We can absorb it.',
        'The exception proved costly.'
      ],
      narrowClash: [
        'A marginal deficit. Acceptable.',
        'One rank was enough.',
        'Within expected variance.'
      ],
      rescue: [
        'That one was worth saving.',
        'Reinforcement delivered on requisition.',
        'Preserve the line.'
      ],
      failedRescue: [
        'Too costly.',
        'A wasted requisition.',
        'We should have absorbed the single loss.'
      ],
      battleLoss: {
        aceLost: ['An expensive piece off the board.', 'That Ace was a vital asset.'],
        twoLost: ['Our specialist card is spent.', 'The assassin was lost.'],
        aceAndTwoLost: ['A devastating logistical deficit.'],
        deepBattle: ['Too many supplies expended on one deadlock.', 'The reserve was drained too far.'],
        largeLoss: ['A significant expenditure of force.', 'We must consolidate our remaining stock.'],
        general: ['We can absorb the loss.', 'A costly exchange.']
      },
      concession: [
        'Not worth the reserve.',
        'We can absorb the loss.',
        'Preserve supplies for later.'
      ],
      desperateRescue: [
        'Emergency reserves authorized.',
        'Spend what remains to hold the line.'
      ]
    }
  },

  gambler: {
    id: 'gambler',
    name: 'The Gambler',
    title: 'High Risk Tolerance',
    description:
      'Comfortable with uncertainty, readily accepts marginal reinforcement odds, defends mid-value cards, and embraces the chaos of Battles.',
    strategy: {
      cardValueWeight: 0.52,
      winRateWeight: 26,
      supportedTieWeight: 16,
      unsupportedTiePenalty: -12,
      reserveDepletionPenalty: 0,
      desperationWeights: {
        severe: 36,
        moderate: 24,
        mild: 14
      },
      autoAcceptScore: 72,
      autoRejectScore: 16,
      candidatePoolStrengthWeight: 0.04,
      gambleBandMultiplier: 1.35
    },
    dialogue: {
      specialClash: [
        'Now that is a lucky pull.',
        'You love to see the long shot pay off.',
        'That Ace had bad luck.'
      ],
      narrowClash: [
        'Half a step away.',
        'Almost had that one.',
        'The margins are where it gets fun.'
      ],
      rescue: [
        'Worth the card.',
        'I have seen worse odds pay out.',
        'Fortune favored the play.'
      ],
      failedRescue: [
        'That is the trouble with a sure thing.',
        'Took the shot anyway.',
        'Double or nothing did not pay.'
      ],
      battleLoss: {
        aceLost: ['A high-stakes gamble that did not land.', 'There goes the big card.'],
        twoLost: ['Down goes the wild card.', 'Lost the specialist.'],
        aceAndTwoLost: ['Swept the table. Well played.'],
        deepBattle: ['Now that was a real pot.', 'A wild ride all the way down.'],
        largeLoss: ['Big pot to lose. On to the next hand.', 'High stakes, high cost.'],
        general: ['You took that round.', 'One more card.']
      },
      concession: [
        'Even I know when the table is cold.',
        'Not this hand.',
        'Saving the cards for a better pot.'
      ],
      desperateRescue: [
        'All in on this draw.',
        'Nothing left to lose. Let us see the card.'
      ]
    }
  },

  analyst: {
    id: 'analyst',
    name: 'The Analyst',
    title: 'Casualty Analysis',
    description:
      'Probability-driven strategist who heavily weighs public Boneyard casualty ratios and adjusts decisions strictly as visible cards change.',
    strategy: {
      cardValueWeight: 0.38,
      winRateWeight: 56,
      supportedTieWeight: 14,
      unsupportedTiePenalty: -28,
      reserveDepletionPenalty: 4,
      desperationWeights: {
        severe: 32,
        moderate: 20,
        mild: 10
      },
      autoAcceptScore: 78,
      autoRejectScore: 22,
      candidatePoolStrengthWeight: 0.16,
      gambleBandMultiplier: 1.0
    },
    dialogue: {
      specialClash: [
        'The probability of that exception was documented.',
        'Interesting. The two found its solitary target.',
        'A low-probability outcome confirmed.'
      ],
      narrowClash: [
        'A single-rank differential outcome.',
        'Within standard distribution.',
        'The narrowest delta.'
      ],
      rescue: [
        'As expected.',
        'The probability shifted in my favor.',
        'A calculated success.'
      ],
      failedRescue: [
        'An outlier outcome.',
        'The remaining candidate pool failed the distribution.',
        'A calculated risk that did not resolve.'
      ],
      battleLoss: {
        aceLost: ['The Ace casualty alters remaining probabilities.', 'Significant public data point.'],
        twoLost: ['The assassin is cataloged in the Boneyard.', 'Specialist removed from calculations.'],
        aceAndTwoLost: ['Catastrophic shift in remaining card distribution.'],
        deepBattle: ['Three recursive layers was a statistical rarity.', 'High variance engagement.'],
        largeLoss: ['The Boneyard tells the story now.', 'A major redistribution of remaining ranks.'],
        general: ['The data evolves.', 'Documented and accounted.']
      },
      concession: [
        'The odds do not justify commitment.',
        'The Boneyard indicates a negative expectation.',
        'A rational concession.'
      ],
      desperateRescue: [
        'Critical deck threshold reached. Altering parameters.',
        'Exhaustion models dictate a commitment here.'
      ]
    }
  },

  attritionist: {
    id: 'attritionist',
    name: 'The Attritionist',
    title: 'Deck Depth Specialist',
    description:
      'Long-horizon strategist who treats remaining deck depth as a primary resource, preserving reserves to ensure Battle sustainability.',
    strategy: {
      cardValueWeight: 0.58,
      winRateWeight: 30,
      supportedTieWeight: 12,
      unsupportedTiePenalty: -36,
      reserveDepletionPenalty: 18,
      desperationWeights: {
        severe: 28,
        moderate: 16,
        mild: 8
      },
      autoAcceptScore: 80,
      autoRejectScore: 24,
      candidatePoolStrengthWeight: 0.08,
      gambleBandMultiplier: 0.9
    },
    dialogue: {
      specialClash: [
        'A single casualty does not decide the War.',
        'One card down. The reserve holds.',
        'The campaign is measured in depth, not clashes.'
      ],
      narrowClash: [
        'One rank given. We still have depth.',
        'A minor exchange.',
        'We hold the deeper line.'
      ],
      rescue: [
        'The line holds without breaking reserve.',
        'Depth allowed that recovery.',
        'We still have depth.'
      ],
      failedRescue: [
        'Spend nothing cheaply.',
        'Two cards lost without gaining ground.',
        'A waste of reserve depth.'
      ],
      battleLoss: {
        aceLost: ['An Ace fallen, but the line remains.', 'We absorb the loss and dig in.'],
        twoLost: ['A loss, but our bulk remains intact.', 'The specialist is gone; the army fights on.'],
        aceAndTwoLost: ['A severe loss, but the War continues.'],
        deepBattle: ['That engagement tested our reserves.', 'A deep exchange of attrition.'],
        largeLoss: ['A heavy casualty toll. We must preserve remaining depth.', 'The War is longer than this clash.'],
        general: ['The War is longer than this clash.', 'Casualties are inevitable; depth is decisive.']
      },
      concession: [
        'Let it go. Preserve the reserve.',
        'The War is longer than this clash.',
        'Save our strength for the decisive Battle.'
      ],
      desperateRescue: [
        'No reserve left to protect. Stand here.',
        'Our depth is spent. Every card must count.'
      ]
    }
  },

  'cornered-general': {
    id: 'cornered-general',
    name: 'The Cornered General',
    title: 'Desperate Defense',
    description:
      'Composed and disciplined at healthy deck counts, transitioning into aggressive, defiant desperation as deck exhaustion approaches.',
    strategy: {
      cardValueWeight: 0.66,
      winRateWeight: 32,
      supportedTieWeight: 10,
      unsupportedTiePenalty: -20,
      reserveDepletionPenalty: 2,
      desperationWeights: {
        severe: 58, // dramatic surge at low deck (<= 3)
        moderate: 38, // sharp surge at (<= 6)
        mild: 14
      },
      autoAcceptScore: 80,
      autoRejectScore: 20,
      candidatePoolStrengthWeight: 0.08,
      gambleBandMultiplier: 1.15
    },
    dialogue: {
      specialClash: [
        'A setback. We maintain composure.',
        'Discipline in all ranks.',
        'An orderly response is required.'
      ],
      narrowClash: [
        'Hold.',
        'We have room.',
        'Steady.'
      ],
      rescue: [
        'The defense holds.',
        'Position secured.',
        'Right on time.'
      ],
      failedRescue: [
        'A setback, but our command remains intact.',
        'The cost was steep.',
        'We regroup.'
      ],
      battleLoss: {
        aceLost: ['Our commander card is down. We stand firm.', 'A blow to our center.'],
        twoLost: ['The assassin fell. Realign the flank.', 'Lost our forward scout.'],
        aceAndTwoLost: ['A devastating blow to our line. Stand fast!'],
        deepBattle: ['A brutal engagement across all layers.', 'The line was tested to the limit.'],
        largeLoss: ['Heavy casualties, but we do not break.', 'Hold what remains.'],
        general: ['Hold.', 'We have room to fight.']
      },
      concession: [
        'Not yet. We choose our ground.',
        'Hold. We have room.',
        'Conserve our strength for when the line breaks.'
      ],
      desperateRescue: [
        'No ground left to give! Spend everything!',
        'Then we spend everything. Attack!',
        'This is our last line. Hold at all costs!'
      ]
    }
  }
};

export function getCommander(id?: string | null): OpponentCommander {
  if (id && id in COMMANDERS) {
    return COMMANDERS[id as OpponentCommanderId];
  }
  return COMMANDERS[DEFAULT_COMMANDER_ID];
}

/**
 * Selects the next commander for a new Campaign, picking pseudo-randomly
 * from available commanders while avoiding immediate back-to-back repetition.
 */
export function selectNextCommander(
  previousCommanderId?: string | null,
  random: () => number = Math.random
): OpponentCommanderId {
  const eligible = COMMANDER_IDS.filter(id => id !== previousCommanderId);
  if (eligible.length === 0) return DEFAULT_COMMANDER_ID;
  const index = Math.floor(random() * eligible.length);
  return eligible[index];
}

export function isCommanderId(value: unknown): value is OpponentCommanderId {
  return typeof value === 'string' && COMMANDER_IDS.includes(value as OpponentCommanderId);
}

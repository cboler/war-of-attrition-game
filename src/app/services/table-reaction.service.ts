import { InjectionToken, Injectable, inject } from '@angular/core';
import { Card, Rank } from '../core/models/card.model';
import {
  DEFAULT_COMMANDER_ID,
  OpponentCommander,
  OpponentCommanderId,
  getCommander
} from '../core/models/commander.model';
import { TableReactionCategory } from '../core/models/game-events.model';
import { GameOutcome, PlayerType } from '../core/models/game-state.model';
import { CommanderExpression } from '../core/models/commander-art.model';
import { NarrativeGameplayEvent } from '../core/models/narrative.model';
import { CampaignWarIndex } from '../core/models/campaign-chapter.model';
import { CampaignProgressionService } from '../core/services/campaign-progression.service';
import { NarrativeResolverService } from '../narrative/narrative-resolver.service';

export const REACTION_RANDOM = new InjectionToken<() => number>('REACTION_RANDOM', {
  providedIn: 'root',
  factory: () => Math.random
});

export interface TableReaction {
  readonly speaker: PlayerType;
  readonly message: string;
  readonly category: TableReactionCategory;
  /** Authored narrative is protected from replacement by procedural table chatter. */
  readonly authored?: boolean;
  /** Explicit presentation metadata; never inferred from the dialogue text. */
  readonly expression?: CommanderExpression;
}

/** Every field is already face-up when a clash reaction may be requested. */
export interface ClashReactionContext {
  readonly playerCard: Card;
  readonly opponentCard: Card;
  readonly winner: PlayerType;
  readonly specialRule: boolean;
}

/** Challenge reactions are valid only after the random reinforcement is revealed. */
export interface ChallengeReactionContext {
  readonly challenger: PlayerType;
  readonly originalBeatenCard: Card;
  readonly reinforcementCard: Card;
  readonly originalWinnerCard: Card;
  readonly challengerWon: boolean;
}

export interface BattleReactionContext {
  readonly decisiveCard?: Card;
  readonly battleDepth?: number;
  readonly winnerBattleStreak?: number;
  readonly loserBattleStreak?: number;
}

@Injectable({ providedIn: 'root' })
export class TableReactionService {
  private readonly random = inject(REACTION_RANDOM);
  private readonly narrativeResolver = inject(NarrativeResolverService, { optional: true });
  private readonly progression = inject(CampaignProgressionService, { optional: true });
  private readonly usedDialogueIds = new Set<string>();
  private activeWarSignature = '';

  forClash(
    context: ClashReactionContext,
    commanderInput?: OpponentCommander | OpponentCommanderId
  ): TableReaction | null {
    const loser = this.opposite(context.winner);
    const commander = this.resolveCommander(commanderInput);

    if (context.specialRule) {
      const authored =
        loser === PlayerType.OPPONENT
          ? this.getAuthoredLine(commander.id, 'special_clash')
          : null;
      const variants =
        loser === PlayerType.OPPONENT
          ? commander.dialogue.specialClash
          : ['The little card had one job.', 'A Two changes everything.', 'That Ace found its exception.'];
      return this.pick(0.28, loser, 'special_clash', variants, authored, 'surprised');
    }

    const winningCard =
      context.winner === PlayerType.PLAYER ? context.playerCard : context.opponentCard;
    const losingCard =
      context.winner === PlayerType.PLAYER ? context.opponentCard : context.playerCard;
    if (winningCard.rank !== Rank.JACK || losingCard.rank !== Rank.TEN) return null;

    const authored =
      loser === PlayerType.OPPONENT
        ? this.getAuthoredLine(commander.id, 'narrow_clash')
        : null;
    const variants =
      loser === PlayerType.OPPONENT
        ? commander.dialogue.narrowClash
        : ['Too close.', 'One rank was enough.', 'A narrow edge.'];
    return this.pick(0.14, loser, 'narrow_clash', variants, authored, 'surprised');
  }

  forChallengeResolution(
    context: ChallengeReactionContext,
    commanderInput?: OpponentCommander | OpponentCommanderId
  ): TableReaction | null {
    const rescuedSpecialCard = this.isValuable(context.originalBeatenCard);
    const commander = this.resolveCommander(commanderInput);
    const speaker = context.challengerWon
      ? this.opposite(context.challenger)
      : context.challenger;

    if (context.challengerWon) {
      let variants: readonly string[];
      let authored: string | null = null;
      if (speaker === PlayerType.OPPONENT) {
        authored = this.getAuthoredLine(commander.id, 'rescue');
        variants = commander.dialogue.rescue;
      } else {
        variants =
          context.originalBeatenCard.rank === Rank.TWO &&
          context.reinforcementCard.rank === Rank.ACE
            ? ['The cavalry arrived.', 'An Ace, right on time.', 'That Two lives to fight again.']
            : ['A timely rescue.', 'That card was worth saving.', 'Reinforcement held.'];
      }
      return this.pick(
        rescuedSpecialCard ? 0.24 : 0.12,
        speaker,
        'rescue',
        variants,
        authored,
        'surprised',
      );
    }

    const costly = rescuedSpecialCard || this.isValuable(context.reinforcementCard);
    if (!costly) return null;

    const authored =
      speaker === PlayerType.OPPONENT
        ? this.getAuthoredLine(commander.id, 'failed_rescue')
        : null;
    const variants =
      speaker === PlayerType.OPPONENT
        ? commander.dialogue.failedRescue
        : ['That reinforcement cost dearly.', 'Two cards gone for nothing.', 'A costly gamble.'];
    return this.pick(0.2, speaker, 'failed_rescue', variants, authored, 'angry');
  }

  forBattleLoss(
    loser: PlayerType,
    cards: readonly Card[],
    context: BattleReactionContext = {},
    commanderInput?: OpponentCommander | OpponentCommanderId
  ): TableReaction | null {
    const lostAce = cards.some(card => card.rank === Rank.ACE);
    const lostTwo = cards.some(card => card.rank === Rank.TWO);
    const largeLoss = cards.length >= 8;
    const highValueLosses = cards.filter(card => this.isValuable(card)).length;
    const decisiveRampage = !!context.decisiveCard && cards.length >= 3 && highValueLosses >= 2;
    const deepBattle = (context.battleDepth ?? 0) >= 3;
    const longStreak =
      Math.max(context.winnerBattleStreak ?? 0, context.loserBattleStreak ?? 0) >= 3;

    if (!lostAce && !lostTwo && !largeLoss && !decisiveRampage && !deepBattle && !longStreak) {
      return null;
    }

    // Even earned reactions should be exceptional; silence is the default.
    const chance = largeLoss || decisiveRampage || deepBattle ? 0.22 : 0.16;
    if (this.random() >= chance) return null;

    const commander = this.resolveCommander(commanderInput);
    let variants: readonly string[];
    let authored: string | null = null;

    if (loser === PlayerType.OPPONENT) {
      if (lostAce) {
        authored = this.getAuthoredLine(commander.id, 'battle_ace_lost');
      } else if (lostTwo) {
        authored = this.getAuthoredLine(commander.id, 'battle_two_lost');
      } else if (deepBattle) {
        authored = this.getAuthoredLine(commander.id, 'deep_battle');
      } else if (largeLoss) {
        authored = this.getAuthoredLine(commander.id, 'large_battle_loss');
      }

      const bDialogue = commander.dialogue.battleLoss;
      if (lostAce && lostTwo && bDialogue.aceAndTwoLost && bDialogue.aceAndTwoLost.length > 0) {
        variants = bDialogue.aceAndTwoLost;
      } else if (lostAce && bDialogue.aceLost && bDialogue.aceLost.length > 0) {
        variants = bDialogue.aceLost;
      } else if (lostTwo && bDialogue.twoLost && bDialogue.twoLost.length > 0) {
        variants = bDialogue.twoLost;
      } else if (deepBattle && bDialogue.deepBattle && bDialogue.deepBattle.length > 0) {
        variants = bDialogue.deepBattle;
      } else if (largeLoss && bDialogue.largeLoss && bDialogue.largeLoss.length > 0) {
        variants = bDialogue.largeLoss;
      } else {
        variants = bDialogue.general;
      }
    } else {
      if (decisiveRampage) {
        variants = [
          'One champion did all of that.',
          'That card carved through the line.',
          'A devastating champion.'
        ];
      } else if (deepBattle) {
        variants = ['That Battle went deep.', 'Too far down to turn back.', 'A long way to fall.'];
      } else if (lostAce && lostTwo) {
        variants = [
          'That was catastrophic.',
          'The Ace and the assassin. Gone.',
          'That table took everything.'
        ];
      } else if (lostTwo) {
        variants = [
          'There goes the assassin.',
          'That two was worth more than it looked.',
          'That one hurt.'
        ];
      } else if (lostAce) {
        variants = ['Not the Ace…', 'That Ace never came home.', 'A very expensive Battle.'];
      } else {
        variants = [
          'That was catastrophic.',
          'A very expensive Battle.',
          'You had no idea what you just won.'
        ];
      }
    }

    const message = authored ?? variants[Math.floor(this.random() * variants.length)];
    return {
      speaker: loser,
      message,
      category: 'battle',
      authored: authored !== null,
      expression:
        lostAce && lostTwo
          ? 'sad'
          : largeLoss || decisiveRampage || lostAce
            ? 'angry'
            : deepBattle || longStreak
              ? 'determined'
              : 'sad',
    };
  }

  forIntroduction(commanderInput?: OpponentCommander | OpponentCommanderId): TableReaction | null {
    const commander = this.resolveCommander(commanderInput);
    const line = this.getAuthoredLine(commander.id, 'introduction');
    if (!line) return null;
    return {
      speaker: PlayerType.OPPONENT,
      category: 'introduction',
      message: line,
      authored: true,
      expression: 'calm',
    };
  }

  forContext(commanderInput?: OpponentCommander | OpponentCommanderId): TableReaction | null {
    const commander = this.resolveCommander(commanderInput);
    const line = this.getAuthoredLine(commander.id, 'context');
    if (!line) return null;
    return {
      speaker: PlayerType.OPPONENT,
      category: 'introduction',
      message: line,
      authored: true,
      expression: 'calm',
    };
  }

  forResult(
    commanderInput?: OpponentCommander | OpponentCommanderId,
    outcome?: GameOutcome,
  ): TableReaction | null {
    const commander = this.resolveCommander(commanderInput);
    const line = this.getAuthoredLine(commander.id, 'result');
    if (!line) return null;
    return {
      speaker: PlayerType.OPPONENT,
      category: 'result',
      message: line,
      authored: true,
      expression:
        outcome === GameOutcome.OPPONENT_WIN
          ? 'smug'
          : outcome === GameOutcome.PLAYER_WIN
            ? 'sad'
            : outcome === GameOutcome.TIE
              ? 'determined'
              : 'calm',
    };
  }

  forResolution(
    commanderInput?: OpponentCommander | OpponentCommanderId,
    outcome?: GameOutcome,
  ): TableReaction | null {
    const commander = this.resolveCommander(commanderInput);
    const line = this.getAuthoredLine(commander.id, 'resolution');
    if (!line) return null;
    return {
      speaker: PlayerType.OPPONENT,
      category: 'result',
      message: line,
      authored: true,
      expression:
        outcome === GameOutcome.OPPONENT_WIN
          ? 'smug'
          : outcome === GameOutcome.PLAYER_WIN
            ? 'sad'
            : outcome === GameOutcome.TIE
              ? 'determined'
              : 'calm',
    };
  }

  forConcession(commanderInput?: OpponentCommander | OpponentCommanderId): TableReaction | null {
    const commander = this.resolveCommander(commanderInput);
    const authored = this.getAuthoredLine(commander.id, 'concession');
    const variants = commander.dialogue.concession ?? ['We yield this ground.', 'Hold. We have room.', 'Concede the clash.'];
    return this.pick(0.55, PlayerType.OPPONENT, 'concession', variants, authored, 'determined');
  }

  forDesperateRescue(commanderInput?: OpponentCommander | OpponentCommanderId): TableReaction | null {
    const commander = this.resolveCommander(commanderInput);
    const authored = this.getAuthoredLine(commander.id, 'desperate_rescue');
    const variants = commander.dialogue.desperateRescue ?? ['Spend everything! Attack!', 'Hold the line at all costs!', 'No reserve left. Stand here!'];
    return this.pick(0.65, PlayerType.OPPONENT, 'desperate_rescue', variants, authored, 'determined');
  }

  forContextual(commanderInput?: OpponentCommander | OpponentCommanderId): TableReaction | null {
    const commander = this.resolveCommander(commanderInput);
    const authored = this.getAuthoredLine(commander.id, 'contextual');
    if (!authored) return null;
    return {
      speaker: PlayerType.OPPONENT,
      category: 'contextual',
      message: authored,
      authored: true,
      expression: 'calm',
    };
  }


  clearUsedDialogue(): void {
    this.usedDialogueIds.clear();
    this.activeWarSignature = '';
  }

  private getAuthoredLine(
    commanderId: OpponentCommanderId,
    event: NarrativeGameplayEvent,
    warIndexOverride?: CampaignWarIndex
  ): string | null {
    if (!this.narrativeResolver) return null;

    const mode = this.progression?.activeCampaignMode() ?? 'standard';
    const schedule = this.progression?.currentCampaign()?.commanderSchedule;
    let warIndex: CampaignWarIndex = warIndexOverride ?? (this.progression?.campaignWarIndex() ?? 1);

    if (schedule && !warIndexOverride) {
      const scheduledIdx = schedule.indexOf(commanderId);
      if (scheduledIdx !== -1) {
        warIndex = (scheduledIdx + 1) as CampaignWarIndex;
      }
    }

    const chapterCompleted = this.progression?.isChapterCompleted(mode) ?? false;
    const warSig = `${mode}:${warIndex}:${commanderId}`;

    if (this.activeWarSignature !== warSig) {
      this.activeWarSignature = warSig;
      this.usedDialogueIds.clear();
    }

    const authored = this.narrativeResolver.dialogueFor({
      commanderId,
      mode,
      warIndex,
      event,
      chapterCompleted,
      excludeIds: Array.from(this.usedDialogueIds)
    });

    if (authored) {
      this.usedDialogueIds.add(authored.id);
      return authored.text;
    }
    return null;
  }

  private pick(
    chance: number,
    speaker: PlayerType,
    category: TableReaction['category'],
    variants: readonly string[],
    authoredOverride: string | null = null,
    expression: CommanderExpression = 'calm',
  ): TableReaction | null {
    if (this.random() >= chance) return null;
    const message =
      authoredOverride ?? variants[Math.floor(this.random() * variants.length)];
    return {
      speaker,
      category,
      message,
      authored: authoredOverride !== null,
      expression,
    };
  }

  private resolveCommander(commander?: OpponentCommander | OpponentCommanderId): OpponentCommander {
    if (typeof commander === 'string') return getCommander(commander);
    if (commander && typeof commander === 'object' && 'dialogue' in commander) return commander;
    return getCommander(DEFAULT_COMMANDER_ID);
  }

  private isValuable(card: Card): boolean {
    return [Rank.ACE, Rank.KING, Rank.QUEEN, Rank.JACK, Rank.TWO].includes(card.rank);
  }

  private opposite(player: PlayerType): PlayerType {
    return player === PlayerType.PLAYER ? PlayerType.OPPONENT : PlayerType.PLAYER;
  }
}

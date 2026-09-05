import { Injectable, computed, inject, signal } from '@angular/core';
import { Card } from '../core/models/card.model';
import { ComparisonResult, GameOutcome, PlayerType } from '../core/models/game-state.model';
import { CardComparisonService, ComparisonExplanation } from '../core/services/card-comparison.service';
import { GameEvent, GameEventBusService } from './game-event-bus.service';
import { battleCasualtySummary, hiddenCardsReturn } from './table-copy';

export type StoryBookEntryType =
  | 'clash'
  | 'challenge'
  | 'battle_header'
  | 'battle_selection'
  | 'battle_reveal'
  | 'casualty'
  | 'quip'
  | 'achievement'
  | 'game_over';

export interface StoryBookEntry {
  readonly id: string;
  readonly turnNumber: number;
  readonly type: StoryBookEntryType;
  readonly eyebrow?: string;
  readonly title?: string;
  readonly text: string;
  readonly cards?: readonly Card[];
  readonly actor?: PlayerType;
  readonly badge?: 'victory' | 'defeat' | 'battle' | 'achievement' | 'challenge';
  readonly comparison?: ComparisonExplanation;
}

@Injectable({ providedIn: 'root' })
export class StoryBookService {
  private readonly eventBus = inject(GameEventBusService);
  private readonly comparisonService = inject(CardComparisonService);
  private readonly entriesSignal = signal<readonly StoryBookEntry[]>([]);
  private entryCounter = 0;

  readonly entries = this.entriesSignal.asReadonly();
  readonly entryCount = computed(() => this.entries().length);
  readonly hasEntries = computed(() => this.entries().length > 0);

  constructor() {
    this.eventBus.events$.subscribe((event) => this.handleGameEvent(event));
  }

  clear(): void {
    this.entriesSignal.set([]);
    this.entryCounter = 0;
  }

  addEntry(entry: Omit<StoryBookEntry, 'id'>): void {
    const newEntry: StoryBookEntry = {
      ...entry,
      id: `story-entry-${++this.entryCounter}`,
    };
    this.entriesSignal.update((current) => [...current, newEntry]);
  }

  private handleGameEvent(event: GameEvent): void {
    switch (event.type) {
      case 'clash_resolved': {
        const pCardStr = this.formatCard(event.playerCard);
        const oCardStr = this.formatCard(event.opponentCard);
        const text = event.specialRule
          ? event.winner === PlayerType.PLAYER
            ? `${pCardStr} assassinated ${oCardStr}!`
            : `${oCardStr} assassinated ${pCardStr}!`
          : event.message;
        const comparison = this.comparisonService.explainComparison(
          event.playerCard,
          event.opponentCard,
          event.comparison,
          event.specialRule
        );

        this.addEntry({
          turnNumber: event.turnNumber,
          type: 'clash',
          eyebrow: event.specialRule
            ? `TURN ${event.turnNumber} · SPECIAL FEAT`
            : `TURN ${event.turnNumber} · CLASH`,
          text,
          cards: [event.playerCard, event.opponentCard],
          badge:
            event.winner === PlayerType.PLAYER
              ? 'victory'
              : event.winner === PlayerType.OPPONENT
                ? 'defeat'
                : 'battle',
          comparison,
        });
        break;
      }

      case 'challenge_accepted':
        this.addEntry({
          turnNumber: event.turnNumber,
          type: 'challenge',
          eyebrow: `TURN ${event.turnNumber} · CHALLENGE`,
          // The decision is public before the card face is. Card identity is
          // deliberately deferred to the authoritative resolution event.
          text: `${event.challenger === PlayerType.PLAYER ? 'You committed' : 'Opponent committed'} a reinforcement.`,
          badge: 'challenge',
        });
        break;

      case 'challenge_conceded':
        this.addEntry({
          turnNumber: event.turnNumber,
          type: 'challenge',
          eyebrow: `TURN ${event.turnNumber} · CONCESSION`,
          text:
            event.loser === PlayerType.PLAYER
              ? 'You conceded the challenge. Your card was lost to the Boneyard.'
              : 'Opponent conceded the challenge. Card surrendered to the Boneyard.',
          badge: event.winner === PlayerType.PLAYER ? 'victory' : 'defeat',
        });
        break;

      case 'challenge_resolved': {
        const reinfStr = this.formatCard(event.reinforcementCard);
        const origStr = this.formatCard(event.originalWinnerCard);
        let text = '';
        if (event.comparison === ComparisonResult.TIE) {
          text = `Reinforcement ${reinfStr} tied ${origStr}. ${
            event.escalatedToBattle ? 'Battle initiated!' : event.message
          }`;
        } else if (event.challengerWon) {
          text =
            event.challenger === PlayerType.PLAYER
              ? `Card rescued. ${reinfStr} defeated ${origStr}, and both of your cards survive.`
              : `Opponent rescues their card. ${reinfStr} defeated ${origStr}.`;
        } else {
          text =
            event.challenger === PlayerType.PLAYER
              ? `${reinfStr} could not rescue the card. Both are now lost.`
              : `Both opponent cards are now lost. ${origStr} holds.`;
        }

        const isSpecialRule = this.comparisonService.isSpecialAceVsTwoRule(
          event.reinforcementCard,
          event.originalWinnerCard
        );
        const comparison = this.comparisonService.explainComparison(
          event.reinforcementCard,
          event.originalWinnerCard,
          event.comparison,
          isSpecialRule
        );

        this.addEntry({
          turnNumber: event.turnNumber,
          type: 'challenge',
          eyebrow: `TURN ${event.turnNumber} · RESOLUTION`,
          text,
          cards: [event.reinforcementCard, event.originalWinnerCard],
          badge:
            event.winner === PlayerType.PLAYER
              ? 'victory'
              : event.winner === PlayerType.OPPONENT
                ? 'defeat'
                : 'battle',
          comparison,
        });
        break;
      }

      case 'battle_started':
      case 'battle_layer_added':
        this.addEntry({
          turnNumber: event.turnNumber,
          type: 'battle_header',
          eyebrow:
            event.layerRound === 1
              ? `TURN ${event.turnNumber} · BATTLE`
              : `TURN ${event.turnNumber} · BATTLE DEPTH ${event.layerRound}`,
          text:
            event.layerRound === 1
              ? 'Each side commits 3 cards face-down. Champions are chosen blindly.'
              : 'The deadlock deepens. Each side commits 3 new cards for another blind choice.',
          badge: 'battle',
        });
        break;

      case 'battle_target_selected':
        // Left/centre/right target taps are routine mechanics, not Chronicle
        // events. The reveal below preserves the authoritative chosen cards.
        break;

      case 'battle_cards_revealed': {
        const { layerRound, playerCard, opponentCard, winner, comparison: compResult, specialRule } =
          event.selection;
        const pCardStr = this.formatCard(playerCard);
        const oCardStr = this.formatCard(opponentCard);
        let text = '';
        if (winner === PlayerType.PLAYER) {
          text = `${pCardStr} defeated ${oCardStr}.`;
        } else if (winner === PlayerType.OPPONENT) {
          text = `${oCardStr} defeated ${pCardStr}.`;
        } else {
          text = `${pCardStr} tied ${oCardStr}. Recursive Battle continues!`;
        }

        const comparison = this.comparisonService.explainComparison(
          playerCard,
          opponentCard,
          compResult,
          specialRule
        );

        this.addEntry({
          turnNumber: event.turnNumber,
          type: 'battle_reveal',
          eyebrow: layerRound === 1 ? 'BATTLE REVEAL' : `BATTLE DEPTH ${layerRound} REVEAL`,
          text,
          cards: [playerCard, opponentCard],
          badge: winner
            ? winner === PlayerType.PLAYER
              ? 'victory'
              : 'defeat'
            : 'battle',
          comparison,
        });
        break;
      }

      case 'battle_resolved': {
        const { outcome } = event;
        const casualtiesText = battleCasualtySummary(outcome.loser, outcome.casualties.length);
        const hiddenReturnedText =
          outcome.hiddenWinnerCount > 0
            ? ` (${hiddenCardsReturn(outcome.hiddenWinnerCount)})`
            : '';

        this.addEntry({
          turnNumber: event.turnNumber,
          type: 'casualty',
          eyebrow: `BATTLE RESOLVED (DEPTH ${outcome.battleDepth})`,
          text: `${casualtiesText}${hiddenReturnedText}`,
          cards: outcome.casualties,
          badge: outcome.winner === PlayerType.PLAYER ? 'victory' : 'defeat',
        });
        break;
      }

      case 'quip_spoken':
        this.addEntry({
          turnNumber: event.turnNumber,
          type: 'quip',
          eyebrow: event.speaker === PlayerType.PLAYER ? 'YOUR REACTION' : 'OPPONENT REACTION',
          text: `"${event.message}"`,
          actor: event.speaker,
        });
        break;

      case 'achievement_unlocked':
        this.addEntry({
          turnNumber: event.turnNumber,
          type: 'achievement',
          eyebrow: 'ACHIEVEMENT UNLOCKED',
          title: event.name,
          text: event.description,
          badge: 'achievement',
        });
        break;

      case 'valor_citation_awarded':
        this.addEntry({
          turnNumber: event.turnNumber,
          type: 'achievement',
          eyebrow: `VALOR CITATION · ${this.formatCard(event.card)}`,
          title: event.citationName,
          text: event.description,
          cards: [event.card],
          badge: 'achievement',
        });
        break;

      case 'game_resolved': {
        let title = '';
        let text = '';
        let badge: 'victory' | 'defeat' | 'battle' = 'battle';

        if (event.outcome === GameOutcome.PLAYER_WIN) {
          title = 'WAR WON · VICTORY';
          text = `You won the war in ${event.turns} ${event.turns === 1 ? 'turn' : 'turns'} with ${event.playerCardsRemaining} cards remaining!`;
          if (event.isComeback) {
            text += ` (Overcame a ${event.maxDeficitExperienced}-card deficit!)`;
          }
          badge = 'victory';
        } else if (event.outcome === GameOutcome.OPPONENT_WIN) {
          title = 'WAR LOST · DEFEAT';
          text = `Opponent conquered after ${event.turns} ${event.turns === 1 ? 'turn' : 'turns'} with ${event.opponentCardsRemaining} cards remaining.`;
          badge = 'defeat';
        } else {
          title = 'MUTUAL ATTRITION · TIE';
          text = `The war concluded in an attrition tie after ${event.turns} turns.`;
          badge = 'battle';
        }

        this.addEntry({
          turnNumber: event.turnNumber,
          type: 'game_over',
          title,
          text,
          badge,
        });
        break;
      }
    }
  }

  private formatCard(card: Card): string {
    const suitSymbol = this.suitSymbol(card.suit);
    return `${card.rank}${suitSymbol}`;
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
}

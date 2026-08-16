import { Injectable, computed, inject, signal } from '@angular/core';
import { Card } from '../core/models/card.model';
import { GameOutcome, PlayerType } from '../core/models/game-state.model';
import { GameEvent, GameEventBusService } from './game-event-bus.service';

export type StoryBookEntryType =
  | 'turn'
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
}

@Injectable({ providedIn: 'root' })
export class StoryBookService {
  private readonly eventBus = inject(GameEventBusService);
  private readonly entriesSignal = signal<readonly StoryBookEntry[]>([]);
  private entryCounter = 0;

  readonly entries = this.entriesSignal.asReadonly();
  readonly entryCount = computed(() => this.entries().length);
  readonly hasEntries = computed(() => this.entries().length > 0);

  constructor() {
    this.eventBus.events$.subscribe(event => this.handleGameEvent(event));
  }

  clear(): void {
    this.entriesSignal.set([]);
    this.entryCounter = 0;
  }

  addEntry(entry: Omit<StoryBookEntry, 'id'>): void {
    const newEntry: StoryBookEntry = {
      ...entry,
      id: `story-entry-${++this.entryCounter}`
    };
    this.entriesSignal.update(current => [...current, newEntry]);
  }

  private handleGameEvent(event: GameEvent): void {
    switch (event.type) {
      case 'turn_started':
        this.addEntry({
          turnNumber: event.turnNumber,
          type: 'turn',
          text: `TURN ${event.turnNumber}`
        });
        break;

      case 'clash_resolved': {
        const pCardStr = this.formatCard(event.playerCard);
        const oCardStr = this.formatCard(event.opponentCard);
        let narrative = '';
        if (event.winner === PlayerType.PLAYER) {
          narrative = event.specialRule
            ? `${pCardStr} assassinated ${oCardStr}!`
            : `${pCardStr} defeated ${oCardStr}.`;
        } else if (event.winner === PlayerType.OPPONENT) {
          narrative = event.specialRule
            ? `${oCardStr} assassinated ${pCardStr}!`
            : `${oCardStr} defeated ${pCardStr}.`;
        } else {
          narrative = `${pCardStr} tied ${oCardStr}.`;
        }

        this.addEntry({
          turnNumber: event.turnNumber,
          type: 'clash',
          text: narrative,
          cards: [event.playerCard, event.opponentCard],
          badge: event.winner ? (event.winner === PlayerType.PLAYER ? 'victory' : 'defeat') : 'battle'
        });
        break;
      }

      case 'challenge_offered':
        if (event.defender === PlayerType.OPPONENT) {
          this.addEntry({
            turnNumber: event.turnNumber,
            type: 'challenge',
            text: 'Opponent is considering reinforcement...'
          });
        }
        break;

      case 'challenge_accepted':
        this.addEntry({
          turnNumber: event.turnNumber,
          type: 'challenge',
          text: `${event.challenger === PlayerType.PLAYER ? 'You' : 'Opponent'} sent reinforcement ${this.formatCard(event.reinforcementCard)}.`,
          cards: [event.reinforcementCard],
          badge: 'challenge'
        });
        break;

      case 'challenge_conceded':
        this.addEntry({
          turnNumber: event.turnNumber,
          type: 'challenge',
          text: event.loser === PlayerType.PLAYER
            ? 'You conceded. Your card went to the Boneyard.'
            : 'Opponent conceded. Their card went to the Boneyard.',
          badge: event.winner === PlayerType.PLAYER ? 'victory' : 'defeat'
        });
        break;

      case 'challenge_resolved': {
        const reinfStr = this.formatCard(event.reinforcementCard);
        const origStr = this.formatCard(event.originalWinnerCard);
        let text = '';
        if (event.challengerWon) {
          text = event.challenger === PlayerType.PLAYER
            ? `${reinfStr} held against ${origStr}. You saved both cards!`
            : `Opponent reinforcement ${reinfStr} defeated ${origStr}.`;
        } else if (event.winner === null) {
          text = `Reinforcement ${reinfStr} tied ${origStr}. BATTLE!`;
        } else {
          text = event.challenger === PlayerType.PLAYER
            ? `Reinforcement ${reinfStr} was beaten by ${origStr}. Both cards lost.`
            : `Original card ${origStr} held against opponent reinforcement ${reinfStr}.`;
        }

        this.addEntry({
          turnNumber: event.turnNumber,
          type: 'challenge',
          text,
          cards: [event.reinforcementCard, event.originalWinnerCard],
          badge: event.winner === PlayerType.PLAYER ? 'victory' : (event.winner === PlayerType.OPPONENT ? 'defeat' : 'battle')
        });
        break;
      }

      case 'battle_started':
      case 'battle_layer_added':
        this.addEntry({
          turnNumber: event.turnNumber,
          type: 'battle_header',
          eyebrow: `BATTLE · LAYER ${event.layerRound}`,
          text: 'Only the chosen cards turn over.',
          badge: 'battle'
        });
        break;

      case 'battle_target_selected': {
        const posStr = event.targetIndex === 0 ? 'left' : (event.targetIndex === 1 ? 'center' : 'right');
        const text = event.selector === PlayerType.PLAYER
          ? `You selected the opponent's ${posStr} card.`
          : `Opponent selected your ${posStr} card.`;
        this.addEntry({
          turnNumber: event.turnNumber,
          type: 'battle_selection',
          text,
          actor: event.selector
        });
        break;
      }

      case 'battle_cards_revealed': {
        const pCardStr = this.formatCard(event.playerChosenCard);
        const oCardStr = this.formatCard(event.opponentChosenCard);
        let text = '';
        if (event.winner === PlayerType.PLAYER) {
          text = `${pCardStr} defeated ${oCardStr}.`;
        } else if (event.winner === PlayerType.OPPONENT) {
          text = `${oCardStr} defeated ${pCardStr}.`;
        } else {
          text = `${pCardStr} tied ${oCardStr}. BATTLE CONTINUES.`;
        }

        this.addEntry({
          turnNumber: event.turnNumber,
          type: 'battle_reveal',
          eyebrow: `LAYER ${event.layerRound} REVEAL`,
          text,
          cards: [event.playerChosenCard, event.opponentChosenCard],
          badge: event.winner ? (event.winner === PlayerType.PLAYER ? 'victory' : 'defeat') : 'battle'
        });
        break;
      }

      case 'battle_resolved': {
        const loserName = event.loser === PlayerType.PLAYER ? 'You' : 'Opponent';
        const casualtiesText = `${loserName} lost ${event.revealedCasualties.length} cards to the Boneyard.`;
        const hiddenReturnedText = event.hiddenWinnerCardCount > 0
          ? ` (${event.hiddenWinnerCardCount} hidden winner cards returned face-down)`
          : '';

        this.addEntry({
          turnNumber: event.turnNumber,
          type: 'casualty',
          text: `${casualtiesText}${hiddenReturnedText}`,
          cards: event.revealedCasualties,
          badge: event.winner === PlayerType.PLAYER ? 'victory' : 'defeat'
        });
        break;
      }

      case 'quip_spoken':
        this.addEntry({
          turnNumber: event.turnNumber,
          type: 'quip',
          text: `"${event.message}"`,
          actor: event.speaker
        });
        break;

      case 'achievement_unlocked':
        this.addEntry({
          turnNumber: event.turnNumber,
          type: 'achievement',
          eyebrow: 'ACHIEVEMENT UNLOCKED',
          title: event.name,
          text: event.description,
          badge: 'achievement'
        });
        break;

      case 'game_resolved': {
        let title = '';
        let text = '';
        let badge: 'victory' | 'defeat' | 'battle' = 'battle';

        if (event.outcome === GameOutcome.PLAYER_WIN) {
          title = 'VICTORY';
          text = `You won the war in ${event.turns} ${event.turns === 1 ? 'turn' : 'turns'} with ${event.playerCardsRemaining} cards remaining!`;
          if (event.isComeback) {
            text += ` (Comeback from a ${event.maxDeficitExperienced}-card deficit!)`;
          }
          badge = 'victory';
        } else if (event.outcome === GameOutcome.OPPONENT_WIN) {
          title = 'DEFEAT';
          text = `Opponent won the war in ${event.turns} ${event.turns === 1 ? 'turn' : 'turns'} with ${event.opponentCardsRemaining} cards remaining.`;
          badge = 'defeat';
        } else {
          title = 'TRUE TIE';
          text = `The war ended in a mutual attrition tie after ${event.turns} turns.`;
          badge = 'battle';
        }

        this.addEntry({
          turnNumber: event.turnNumber,
          type: 'game_over',
          title,
          text,
          badge
        });
        break;
      }

      case 'game_abandoned':
        this.addEntry({
          turnNumber: event.turnNumber,
          type: 'game_over',
          title: 'WAR ABANDONED',
          text: `Game abandoned after ${event.turnsPlayed} turns.`
        });
        break;
    }
  }

  private formatCard(card: Card): string {
    const suitSymbol = this.suitSymbol(card.suit);
    return `${card.rank}${suitSymbol}`;
  }

  private suitSymbol(suit: string): string {
    switch (suit) {
      case 'hearts': return '♥';
      case 'diamonds': return '♦';
      case 'clubs': return '♣';
      case 'spades': return '♠';
      default: return '';
    }
  }
}

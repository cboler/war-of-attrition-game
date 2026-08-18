import { Card } from './card.model';
import { GameOutcome, PlayerType } from './game-state.model';
import { ComparisonResult } from '../services/card-comparison.service';

export type GameEventType =
  | 'turn_started'
  | 'clash_resolved'
  | 'challenge_offered'
  | 'challenge_accepted'
  | 'challenge_conceded'
  | 'challenge_resolved'
  | 'battle_started'
  | 'battle_layer_added'
  | 'battle_target_selected'
  | 'battle_cards_revealed'
  | 'battle_continues'
  | 'casualty_revealed'
  | 'battle_resolved'
  | 'cards_returned'
  | 'cards_sent_to_boneyard'
  | 'quip_spoken'
  | 'achievement_unlocked'
  | 'game_resolved'
  | 'game_abandoned';

export interface BaseGameEvent {
  readonly type: GameEventType;
  readonly turnNumber: number;
}

export interface TurnStartedEvent extends BaseGameEvent {
  readonly type: 'turn_started';
}

export interface ClashResolvedEvent extends BaseGameEvent {
  readonly type: 'clash_resolved';
  readonly playerCard: Card;
  readonly opponentCard: Card;
  readonly comparison: ComparisonResult;
  readonly winner: PlayerType | null;
  readonly specialRule: boolean; // e.g. 2 beats Ace
  readonly message: string;
}

export interface ChallengeOfferedEvent extends BaseGameEvent {
  readonly type: 'challenge_offered';
  readonly defender: PlayerType; // The player whose card is beaten and has option to challenge
}

export interface ChallengeAcceptedEvent extends BaseGameEvent {
  readonly type: 'challenge_accepted';
  readonly challenger: PlayerType;
  readonly reinforcementCard: Card;
}

export interface ChallengeConcededEvent extends BaseGameEvent {
  readonly type: 'challenge_conceded';
  readonly loser: PlayerType;
  readonly winner: PlayerType;
  readonly message: string;
}

export interface ChallengeResolvedEvent extends BaseGameEvent {
  readonly type: 'challenge_resolved';
  readonly challenger: PlayerType;
  readonly reinforcementCard: Card;
  readonly originalWinnerCard: Card;
  readonly comparison: ComparisonResult;
  readonly winner: PlayerType | null;
  readonly challengerWon: boolean;
  readonly message: string;
  readonly savedTwo: boolean; // challenger's initial beaten card was a 2 and saved
}

export interface BattleStartedEvent extends BaseGameEvent {
  readonly type: 'battle_started';
  readonly layerRound: number;
}

export interface BattleLayerAddedEvent extends BaseGameEvent {
  readonly type: 'battle_layer_added';
  readonly layerRound: number;
}

export interface BattleTargetSelectedEvent extends BaseGameEvent {
  readonly type: 'battle_target_selected';
  readonly layerRound: number;
  readonly selector: PlayerType;
  readonly targetIndex: number; // 0=left, 1=center, 2=right
}

export interface BattleCardsRevealedEvent extends BaseGameEvent {
  readonly type: 'battle_cards_revealed';
  readonly layerRound: number;
  readonly playerChosenCard: Card;
  readonly opponentChosenCard: Card;
  readonly comparison: ComparisonResult;
  readonly winner: PlayerType | null;
  readonly specialRule: boolean;
  readonly message: string;
}

export interface BattleContinuesEvent extends BaseGameEvent {
  readonly type: 'battle_continues';
  readonly layerRound: number;
}

export interface CasualtyRevealedEvent extends BaseGameEvent {
  readonly type: 'casualty_revealed';
  readonly card: Card;
  readonly casualtyIndex: number;
  readonly totalCasualties: number;
  readonly loser: PlayerType;
}

export interface BattleResolvedEvent extends BaseGameEvent {
  readonly type: 'battle_resolved';
  readonly winner: PlayerType;
  readonly loser: PlayerType;
  readonly layerDepth: number;
  readonly revealedCasualties: readonly Card[];
  readonly hiddenWinnerCardCount: number;
  readonly totalCardsAtStake: number;
  readonly lostAce: boolean;
  readonly lostTwo: boolean;
  readonly lostAceAndTwo: boolean;
}

export interface CardsReturnedEvent extends BaseGameEvent {
  readonly type: 'cards_returned';
  readonly winner: PlayerType;
  readonly hiddenCount: number;
  readonly publicCount: number;
}

export interface CardsSentToBoneyardEvent extends BaseGameEvent {
  readonly type: 'cards_sent_to_boneyard';
  readonly cards: readonly Card[];
}

export interface QuipSpokenEvent extends BaseGameEvent {
  readonly type: 'quip_spoken';
  readonly speaker: PlayerType;
  readonly message: string;
}

export interface AchievementUnlockedEvent extends BaseGameEvent {
  readonly type: 'achievement_unlocked';
  readonly achievementId: string;
  readonly name: string;
  readonly description: string;
  readonly icon: string;
}

export interface GameResolvedEvent extends BaseGameEvent {
  readonly type: 'game_resolved';
  readonly outcome: GameOutcome;
  readonly turns: number;
  readonly playerCardsRemaining: number;
  readonly opponentCardsRemaining: number;
  readonly maxDeficitExperienced: number;
  readonly isComeback: boolean;
  readonly battlesCount: number;
  readonly playerReinforcementsSent: number;
}

export interface GameAbandonedEvent extends BaseGameEvent {
  readonly type: 'game_abandoned';
  readonly turnsPlayed: number;
}

export type GameEvent =
  | TurnStartedEvent
  | ClashResolvedEvent
  | ChallengeOfferedEvent
  | ChallengeAcceptedEvent
  | ChallengeConcededEvent
  | ChallengeResolvedEvent
  | BattleStartedEvent
  | BattleLayerAddedEvent
  | BattleTargetSelectedEvent
  | BattleCardsRevealedEvent
  | BattleContinuesEvent
  | CasualtyRevealedEvent
  | BattleResolvedEvent
  | CardsReturnedEvent
  | CardsSentToBoneyardEvent
  | QuipSpokenEvent
  | AchievementUnlockedEvent
  | GameResolvedEvent
  | GameAbandonedEvent;

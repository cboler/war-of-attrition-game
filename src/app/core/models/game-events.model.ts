import { Card } from './card.model';
import { OpponentCommanderId } from './commander.model';
import { AchievementClassification } from './achievement.model';
import {
  BattleSelectionOutcome,
  ComparisonResult,
  DeckColor,
  GameOutcome,
  GamePhase,
  PlayerType,
  SettlementAttribution,
} from './game-state.model';

export type { AchievementClassification };

export type GameEventType =
  | 'war_started'
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
  | 'battle_presentation_complete'
  | 'cards_returned'
  | 'cards_sent_to_boneyard'
  | 'settlement_resolved'
  | 'quip_spoken'
  | 'achievement_unlocked'
  | 'achievement_observed'
  | 'valor_citation_awarded'
  | 'game_resolved'
  | 'game_abandoned';

export interface BaseGameEvent {
  readonly type: GameEventType;
  readonly turnNumber: number;
}

/** Public, stable ownership assignment for one newly initialized War. */
export interface WarStartedEvent extends BaseGameEvent {
  readonly type: 'war_started';
  readonly playerDeckColor: DeckColor;
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
  /** Turn/attrition winner; may be non-null even when the comparison tied. */
  readonly winner: PlayerType | null;
  /** True iff the challenger won the reinforcement comparison outright. */
  readonly challengerWon: boolean;
  /** The tie proceeds into Battle; false for immediate terminal attrition, including a true tie. */
  readonly escalatedToBattle: boolean;
  readonly message: string;
  readonly savedTwo: boolean; // challenger's initial beaten card was a 2 and saved
  /** Explicit original card avoids reconstructing challenge causality from presentation state. */
  readonly originalBeatenCard: Card;
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
  /** Canonical selection record; compatibility fields above only mirror this object. */
  readonly selection: BattleSelectionOutcome;
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
  /** Public causal context used for card-story analysis without hidden state. */
  readonly source?: SettlementAttribution['source'];
  readonly decisiveCard?: Card;
}

/**
 * Public account of a resolved Battle. Internal BattleOutcome values also
 * contain every face-down layer and hidden winner identity, so they must never
 * cross the game-event boundary.
 */
export interface PublicBattleResolution {
  readonly winner: PlayerType;
  readonly loser: PlayerType;
  readonly battleDepth: number;
  readonly selection: BattleSelectionOutcome | null;
  readonly selectedPlayerChampion: Card | null;
  readonly selectedOpponentChampion: Card | null;
  readonly casualties: readonly Card[];
  readonly casualtyIds: readonly string[];
  readonly hiddenWinnerCount: number;
  readonly publicWinnerCount: number;
  readonly playerCardsAtStakeCount: number;
  readonly opponentCardsAtStakeCount: number;
  readonly finalPlayerDeckCount: number;
  readonly finalOpponentDeckCount: number;
  readonly finalBoneyardCount: number;
}

export interface BattleResolvedEvent extends BaseGameEvent {
  readonly type: 'battle_resolved';
  readonly outcome: PublicBattleResolution;
}

/** Emitted only once a Battle's ordered presentation has released control. */
export interface BattlePresentationCompleteEvent extends BaseGameEvent {
  readonly type: 'battle_presentation_complete';
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

export interface SettlementResolvedEvent extends BaseGameEvent {
  readonly type: 'settlement_resolved';
  readonly attribution: SettlementAttribution;
  readonly playerCardsRemaining?: number;
  readonly opponentCardsRemaining?: number;
}

export type TableReactionCategory =
  | 'special_clash'
  | 'narrow_clash'
  | 'rescue'
  | 'failed_rescue'
  | 'battle'
  | 'introduction'
  | 'result'
  | 'concession'
  | 'desperate_rescue'
  | 'contextual'
  | 'two_lost'
  | 'double_two_lost';

/**
 * Three-tier taxonomy for gameplay event classification:
 *
 * 1. Permanent Achievements: Genuinely collectible/milestone accomplishments stored permanently
 *    on the user profile and synchronized with Google Play Games (e.g. Assassin, Veteran, Centurion).
 * 2. Significant Events: Notable, repeatable in-match tactical occurrences worthy of Log/Chronicle
 *    record and specific commander acknowledgment (e.g. capturing both enemy 2s, deep battles).
 * 3. Ambient Reactions: Common, responsive turn-level flavor that makes commanders feel attentive
 *    and alive (e.g. narrow clashes, routine rescues, deck pokes).
 */
export type GameplayEventTier =
  | 'permanent_achievement'
  | 'significant_event'
  | 'ambient_reaction';


export interface QuipSpokenEvent extends BaseGameEvent {
  readonly type: 'quip_spoken';
  readonly speaker: PlayerType;
  readonly message: string;
  readonly category?: TableReactionCategory;
}

export interface AchievementUnlockedEvent extends BaseGameEvent {
  readonly type: 'achievement_unlocked';
  readonly achievementId: string;
  readonly name: string;
  readonly description: string;
  readonly icon: string;
  readonly classification?: AchievementClassification;
}

export interface AchievementObservedEvent extends BaseGameEvent {
  readonly type: 'achievement_observed';
  readonly achievementId: string;
  readonly classification: AchievementClassification;
}

export type ValorCitationType = 'juggernaut';

export interface ValorCitationAwardedEvent extends BaseGameEvent {
  readonly type: 'valor_citation_awarded';
  readonly card: Card;
  readonly cardId: string;
  readonly citation: ValorCitationType;
  readonly citationName: string;
  readonly description: string;
  readonly commanderId?: OpponentCommanderId;
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
  readonly playerDeckColor?: DeckColor;
  readonly survivingPlayerCardIds?: readonly string[];
  readonly anomaliesObserved?: number;
}

export type ExplicitAbandonmentDecision =
  | 'draw'
  | 'challenge'
  | 'concede'
  | 'battle_target'
  | 'continue'
  | 'restart'
  | 'abandon';

export type RecentGameEventCategory =
  | 'clash'
  | 'challenge'
  | 'battle'
  | 'settlement'
  | 'presentation';

export interface GameAbandonedEvent extends BaseGameEvent {
  readonly type: 'game_abandoned';
  readonly turnsPlayed: number;
  readonly playerDeckCount: number;
  readonly opponentDeckCount: number;
  readonly playerCardsAtStakeCount: number;
  readonly opponentCardsAtStakeCount: number;
  /** Opponent deck count minus player deck count; positive means the player trails. */
  readonly playerCardDeficit: number;
  readonly gamePhase: GamePhase;
  readonly battleDepth: number;
  readonly currentBattleWinStreak?: number;
  readonly currentBattleLossStreak?: number;
  readonly presentationPhase?: string;
  readonly animationSpeed?: 'slow' | 'normal' | 'fast';
  readonly lastDecision?: ExplicitAbandonmentDecision;
  readonly recentEventCategory?: RecentGameEventCategory;
  readonly recentReactionCategory?: TableReactionCategory;
  /** The explicit destructive control used; separate from last gameplay decision. */
  readonly abandonmentAction?: 'restart' | 'abandon';
}

export type GameEvent =
  | WarStartedEvent
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
  | BattlePresentationCompleteEvent
  | CardsReturnedEvent
  | CardsSentToBoneyardEvent
  | SettlementResolvedEvent
  | QuipSpokenEvent
  | AchievementUnlockedEvent
  | AchievementObservedEvent
  | ValorCitationAwardedEvent
  | GameResolvedEvent
  | GameAbandonedEvent;

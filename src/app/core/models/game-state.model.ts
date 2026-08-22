import { Card } from './card.model';

export enum ComparisonResult {
  PLAYER_WINS = 'player_wins',
  OPPONENT_WINS = 'opponent_wins',
  TIE = 'tie',
}

export enum DeckColor {
  RED = 'red',
  BLACK = 'black',
}

export enum GamePhase {
  SETUP = 'setup',
  NORMAL = 'normal',
  CHALLENGE = 'challenge',
  BATTLE = 'battle',
  GAME_OVER = 'game_over',
}

export enum PlayerType {
  PLAYER = 'player',
  OPPONENT = 'opponent',
}

/** A terminal result. Unlike `winner`, this represents a true tie explicitly. */
export enum GameOutcome {
  PLAYER_WIN = 'player_win',
  OPPONENT_WIN = 'opponent_win',
  TIE = 'tie',
}

export interface GameStats {
  turnNumber: number;
  playerCardCount: number;
  opponentCardCount: number;
  discardedCardCount: number;
}

/**
 * One geological layer of a Battle. The names describe ownership: the player
 * cards are the cards dealt from the human player's deck. Only the newest
 * layer may be targeted when a Battle recurses.
 */
export interface BattleLayer {
  readonly round: number;
  readonly playerCards: readonly Card[];
  readonly opponentCards: readonly Card[];
  readonly selectedPlayerCardId: string | null;
  readonly selectedOpponentCardId: string | null;
}

/**
 * The one authoritative account of the physical champions selected for a
 * Battle layer and the comparison performed on them.
 */
export interface BattleSelectionOutcome {
  readonly layerRound: number;
  readonly playerCard: Card;
  readonly opponentCard: Card;
  readonly playerCardId: string;
  readonly opponentCardId: string;
  readonly comparison: ComparisonResult;
  readonly winner: PlayerType | null;
  readonly specialRule: boolean;
}

export type SettlementSource = 'clash' | 'challenge' | 'battle';

/** Explicit causal attribution for cards actually sent to the Boneyard. */
export interface SettlementAttribution {
  readonly source: SettlementSource;
  readonly winner: PlayerType;
  readonly loser: PlayerType;
  readonly decisiveCard: Card;
  readonly casualties: readonly Card[];
  readonly battleDepth: number;
}

/**
 * The immutable account of a decisive Battle, captured before its presentation
 * starts.  Every consumer of Battle settlement (the Boneyard, animations,
 * the Field Manual, and achievements) must use this one account rather than
 * rebuilding a partial collection from the current UI.
 */
export interface BattleOutcome {
  readonly winner: PlayerType;
  readonly loser: PlayerType;
  readonly battleDepth: number;
  readonly layers: readonly BattleLayer[];
  readonly playerCardsAtStake: readonly Card[];
  readonly opponentCardsAtStake: readonly Card[];
  readonly winningCards: readonly Card[];
  readonly casualties: readonly Card[];
  readonly publicWinnerCards: readonly Card[];
  readonly hiddenWinnerCards: readonly Card[];
  readonly selectedPlayerChampion: Card | null;
  readonly selectedOpponentChampion: Card | null;
  readonly battleSelection: BattleSelectionOutcome | null;
  readonly playerDeckCountBeforeSettlement: number;
  readonly opponentDeckCountBeforeSettlement: number;
  readonly boneyardCountBeforeSettlement: number;
  readonly finalPlayerDeckCount: number;
  readonly finalOpponentDeckCount: number;
  readonly finalBoneyardCount: number;
}

export interface ActiveTurn {
  readonly playerCard: Card;
  readonly opponentCard: Card;
  readonly phase: GamePhase;
  readonly playerChallengeCard: Card | null;
  readonly opponentChallengeCard: Card | null;
  readonly battleLayers: readonly BattleLayer[];
  /** Card ids that have legally become public during this turn. */
  readonly publicCardIds: readonly string[];
}

export interface GameState {
  phase: GamePhase;
  stats: GameStats;
  activeTurn: ActiveTurn | null;
  winner: PlayerType | null;
  outcome: GameOutcome | null;
  isPlayerTurn: boolean;
  canChallenge: boolean;
  lastResult: string | null;
  playerDeckColor: DeckColor;
}

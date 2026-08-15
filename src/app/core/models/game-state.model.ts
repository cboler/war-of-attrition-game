import { Card } from './card.model';

export enum GamePhase {
  SETUP = 'setup',
  NORMAL = 'normal',
  CHALLENGE = 'challenge',
  BATTLE = 'battle',
  GAME_OVER = 'game_over'
}

export enum PlayerType {
  PLAYER = 'player',
  OPPONENT = 'opponent'
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
  isPlayerTurn: boolean;
  canChallenge: boolean;
  lastResult: string | null;
}

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

export interface ActiveTurn {
  playerCard: any; // Card | null
  opponentCard: any; // Card | null
  phase: GamePhase;
  challengeCard?: any; // Card | null
  battleCards?: {
    playerCards: any[]; // Card[]
    opponentCards: any[]; // Card[]
    selectedPlayerCard?: any; // Card | null
  playerCard: Card | null;
  opponentCard: Card | null;
  phase: GamePhase;
  challengeCard?: Card | null;
  battleCards?: {
    playerCards: Card[];
    opponentCards: Card[];
    selectedPlayerCard?: Card | null;
    selectedOpponentCard?: Card | null;
  };
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
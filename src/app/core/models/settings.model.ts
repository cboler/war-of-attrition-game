import { UnlockedAchievement } from './achievement.model';

export interface CardBackingOption {
  id: string;
  name: string;
  description: string;
  pattern: string; // CSS pattern or image reference
  preview: string; // Preview image or CSS for display
  tokenCost: number;
}

export interface GameStatistics {
  // Basic
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  gamesTied: number;
  gamesAbandoned: number;
  winRatePercentage: number;
  currentWinStreak: number;
  bestWinStreak: number;

  // Game Length
  totalTurns: number;
  averageTurnsPerGame: number;
  longestGameTurns: number;
  shortestGameTurns: number;
  totalPlayTime: number; // in milliseconds
  averageGameDuration: number; // in milliseconds

  // Battles
  totalBattles: number;
  mostBattlesInGame: number;
  deepestRecursiveBattle: number;
  mostCardsAtStake: number;
  mostCardsLostInBattle: number;
  mostOpponentCardsDefeatedInBattle: number;
  currentBattleWinStreak: number;
  bestBattleWinStreak: number;
  currentBattleLossStreak: number;
  bestBattleLossStreak: number;

  // Challenges
  totalChallenges: number;
  successfulChallenges: number;
  challengeSuccessRate: number;
  mostChallengesInGame: number;
  mostSuccessfulChallengesInGame: number;

  // Memorable Card Events
  acesDefeatedByTwo: number;
  twosSavedByChallenge: number;
  acesRescuedByChallenge: number;
  acesRescuingTwos: number;
  acesLostInBattles: number;
  aceAndTwoLostInSameBattle: number;
  juggernautOccurrences: number;
  juggernautCardIds: readonly string[];

  // Campaign career aggregates (wallet/history remain in profile progression)
  campaignsCompleted: number;
  campaignsWon: number;
  campaignsLost: number;
  campaignsDrawn: number;
  totalCampaignDifferential: number;
  bestCampaignDifferential: number;
  worstCampaignDifferential: number;

  // Victory Quality
  highestCardsRemainingAtVictory: number;
  lowestCardsRemainingAtVictory: number;
  winsWithOneCardRemaining: number;
  comebackWins: number;
  largestComebackDeficit: number;

  // Achievements & Metadata
  unlockedAchievements: readonly string[];
  unlockedAchievementDetails?: readonly UnlockedAchievement[];
  cardsDiscarded?: number;
  recursiveBattles?: number;
  lastPlayed?: Date | string;
}

export interface AppSettings {
  // Appearance
  theme: 'light' | 'dark' | 'auto';

  // Handedness / thumb ergonomics
  deckHand: 'right' | 'left';

  // Card customization
  selectedCardBacking: string; // ID of the selected backing

  // Game preferences
  animationSpeed: 'slow' | 'normal' | 'fast';
  soundEnabled: boolean;
  showTurnCounter: boolean;
  tutorialEnabled: boolean;

  // Advanced settings
  confirmChallenges: boolean;
  autoPlayAnimations: boolean;
  showCardDetails: boolean;
}

export const DEFAULT_STATISTICS: GameStatistics = {
  gamesPlayed: 0,
  gamesWon: 0,
  gamesLost: 0,
  gamesTied: 0,
  gamesAbandoned: 0,
  winRatePercentage: 0,
  currentWinStreak: 0,
  bestWinStreak: 0,
  totalTurns: 0,
  averageTurnsPerGame: 0,
  longestGameTurns: 0,
  shortestGameTurns: 0,
  totalPlayTime: 0,
  averageGameDuration: 0,
  totalBattles: 0,
  mostBattlesInGame: 0,
  deepestRecursiveBattle: 0,
  mostCardsAtStake: 0,
  mostCardsLostInBattle: 0,
  mostOpponentCardsDefeatedInBattle: 0,
  currentBattleWinStreak: 0,
  bestBattleWinStreak: 0,
  currentBattleLossStreak: 0,
  bestBattleLossStreak: 0,
  totalChallenges: 0,
  successfulChallenges: 0,
  challengeSuccessRate: 0,
  mostChallengesInGame: 0,
  mostSuccessfulChallengesInGame: 0,
  acesDefeatedByTwo: 0,
  twosSavedByChallenge: 0,
  acesRescuedByChallenge: 0,
  acesRescuingTwos: 0,
  acesLostInBattles: 0,
  aceAndTwoLostInSameBattle: 0,
  juggernautOccurrences: 0,
  juggernautCardIds: [],
  campaignsCompleted: 0,
  campaignsWon: 0,
  campaignsLost: 0,
  campaignsDrawn: 0,
  totalCampaignDifferential: 0,
  bestCampaignDifferential: 0,
  worstCampaignDifferential: 0,
  highestCardsRemainingAtVictory: 0,
  lowestCardsRemainingAtVictory: 0,
  winsWithOneCardRemaining: 0,
  comebackWins: 0,
  largestComebackDeficit: 0,
  unlockedAchievements: [],
  cardsDiscarded: 0,
  recursiveBattles: 0
};

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'auto',
  deckHand: 'right',
  selectedCardBacking: 'classic-blue',
  animationSpeed: 'normal',
  soundEnabled: true,
  showTurnCounter: true,
  tutorialEnabled: true,
  confirmChallenges: false,
  autoPlayAnimations: true,
  showCardDetails: true
};

export const CARD_BACKING_OPTIONS: CardBackingOption[] = [
  {
    id: 'classic-blue',
    name: 'Classic Blue',
    description: 'Traditional blue card backing with diamond pattern',
    tokenCost: 0,
    pattern: 'linear-gradient(45deg, #1565c0 25%, #1976d2 25%, #1976d2 50%, #1565c0 50%, #1565c0 75%, #1976d2 75%); background-size: 8px 8px',
    preview: 'background: linear-gradient(45deg, #1565c0 25%, #1976d2 25%, #1976d2 50%, #1565c0 50%, #1565c0 75%, #1976d2 75%); background-size: 8px 8px;'
  },
  {
    id: 'classic-red',
    name: 'Classic Red',
    description: 'Traditional red card backing with diamond pattern',
    tokenCost: 1,
    pattern: 'linear-gradient(45deg, #c62828 25%, #d32f2f 25%, #d32f2f 50%, #c62828 50%, #c62828 75%, #d32f2f 75%); background-size: 8px 8px',
    preview: 'background: linear-gradient(45deg, #c62828 25%, #d32f2f 25%, #d32f2f 50%, #c62828 50%, #c62828 75%, #d32f2f 75%); background-size: 8px 8px;'
  },
  {
    id: 'elegant-green',
    name: 'Elegant Green',
    description: 'Sophisticated green pattern for a premium feel',
    tokenCost: 2,
    pattern: 'radial-gradient(circle, #2e7d32 2px, #388e3c 2px); background-size: 12px 12px',
    preview: 'background: radial-gradient(circle, #2e7d32 2px, #388e3c 2px); background-size: 12px 12px;'
  },
  {
    id: 'royal-purple',
    name: 'Royal Purple',
    description: 'Majestic purple design with ornate patterns',
    tokenCost: 3,
    pattern: 'linear-gradient(90deg, #6a1b9a 50%, #7b1fa2 50%); background-size: 4px 4px',
    preview: 'background: linear-gradient(90deg, #6a1b9a 50%, #7b1fa2 50%); background-size: 4px 4px;'
  },
  {
    id: 'minimalist-gray',
    name: 'Minimalist Gray',
    description: 'Clean, modern gray design for minimal distraction',
    tokenCost: 2,
    pattern: 'linear-gradient(135deg, #616161 0%, #757575 100%)',
    preview: 'background: linear-gradient(135deg, #616161 0%, #757575 100%);'
  }
];

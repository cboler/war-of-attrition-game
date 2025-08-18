export interface CardBackingOption {
  id: string;
  name: string;
  description: string;
  pattern: string; // CSS pattern or image reference
  preview: string; // Preview image or CSS for display
}

export interface GameStatistics {
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  totalTurns: number;
  averageTurnsPerGame: number;
  totalPlayTime: number; // in milliseconds
  averageGameDuration: number; // in milliseconds
  lastPlayed?: Date;
}

export interface AppSettings {
  // Theme and appearance
  theme: 'light' | 'dark' | 'auto';
  
  // Card customization
  selectedCardBacking: string; // ID of the selected backing
  
  // Game preferences
  animationSpeed: 'slow' | 'normal' | 'fast';
  soundEnabled: boolean;
  showTurnCounter: boolean;
  
  // Statistics
  statistics: GameStatistics;
  
  // Advanced settings
  confirmChallenges: boolean;
  autoPlayAnimations: boolean;
  showCardDetails: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'auto',
  selectedCardBacking: 'classic-blue',
  animationSpeed: 'normal',
  soundEnabled: true,
  showTurnCounter: true,
  statistics: {
    gamesPlayed: 0,
    gamesWon: 0,
    gamesLost: 0,
    totalTurns: 0,
    averageTurnsPerGame: 0,
    totalPlayTime: 0,
    averageGameDuration: 0
  },
  confirmChallenges: false,
  autoPlayAnimations: true,
  showCardDetails: true
};

export const CARD_BACKING_OPTIONS: CardBackingOption[] = [
  {
    id: 'classic-blue',
    name: 'Classic Blue',
    description: 'Traditional blue card backing with diamond pattern',
    pattern: 'linear-gradient(45deg, #1565c0 25%, #1976d2 25%, #1976d2 50%, #1565c0 50%, #1565c0 75%, #1976d2 75%)',
    preview: 'background: linear-gradient(45deg, #1565c0 25%, #1976d2 25%, #1976d2 50%, #1565c0 50%, #1565c0 75%, #1976d2 75%); background-size: 8px 8px;'
  },
  {
    id: 'classic-red',
    name: 'Classic Red',
    description: 'Traditional red card backing with diamond pattern',
    pattern: 'linear-gradient(45deg, #c62828 25%, #d32f2f 25%, #d32f2f 50%, #c62828 50%, #c62828 75%, #d32f2f 75%)',
    preview: 'background: linear-gradient(45deg, #c62828 25%, #d32f2f 25%, #d32f2f 50%, #c62828 50%, #c62828 75%, #d32f2f 75%); background-size: 8px 8px;'
  },
  {
    id: 'elegant-green',
    name: 'Elegant Green',
    description: 'Sophisticated green pattern for a premium feel',
    pattern: 'radial-gradient(circle, #2e7d32 2px, #388e3c 2px)',
    preview: 'background: radial-gradient(circle, #2e7d32 2px, #388e3c 2px); background-size: 12px 12px;'
  },
  {
    id: 'royal-purple',
    name: 'Royal Purple',
    description: 'Majestic purple design with ornate patterns',
    pattern: 'linear-gradient(90deg, #6a1b9a 50%, #7b1fa2 50%)',
    preview: 'background: linear-gradient(90deg, #6a1b9a 50%, #7b1fa2 50%); background-size: 4px 4px;'
  },
  {
    id: 'minimalist-gray',
    name: 'Minimalist Gray',
    description: 'Clean, modern gray design for minimal distraction',
    pattern: 'linear-gradient(135deg, #616161 0%, #757575 100%)',
    preview: 'background: linear-gradient(135deg, #616161 0%, #757575 100%);'
  }
];
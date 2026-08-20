export enum TutorialStep {
  FIRST_TURN = 'first_turn',
  FIRST_COMPARISON = 'first_comparison',
  FIRST_BONEYARD = 'first_boneyard',
  FIRST_BATTLE = 'first_battle',
  FIRST_REINFORCEMENT = 'first_reinforcement',
  FIRST_BATTLE_RESOLUTION = 'first_battle_resolution',
  FIRST_GAME_CONCLUSION = 'first_game_conclusion'
}

export interface TutorialProgress {
  firstTurn: boolean;
  firstComparison: boolean;
  firstBoneyard: boolean;
  firstBattle: boolean;
  firstReinforcement: boolean;
  firstBattleResolution: boolean;
  firstGameConclusion: boolean;
}

export const DEFAULT_TUTORIAL_PROGRESS: TutorialProgress = {
  firstTurn: false,
  firstComparison: false,
  firstBoneyard: false,
  firstBattle: false,
  firstReinforcement: false,
  firstBattleResolution: false,
  firstGameConclusion: false
};

export interface TutorialPrompt {
  step: TutorialStep;
  title: string;
  eyebrow: string;
  message: string;
  highlightSelector?: string;
  actionText?: string;
  canSkip?: boolean;
}

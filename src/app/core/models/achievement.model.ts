export type AchievementClassification = 'milestone' | 'distinction' | 'prestige' | 'anomaly';

export interface AchievementDefinition {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon: string;
  readonly category: 'signature' | 'battle' | 'endurance' | 'milestone';
  readonly classification: AchievementClassification;
  readonly hidden?: boolean;
}

export interface UnlockedAchievement {
  readonly id: string;
  readonly unlockedAt: string; // ISO date string
}

export const ACHIEVEMENTS: readonly AchievementDefinition[] = [
  // --- MILESTONES ---
  {
    id: 'war.first_casualty',
    name: 'First Casualty',
    description: 'Witness the first public card fall to the Boneyard.',
    icon: 'style',
    category: 'milestone',
    classification: 'milestone'
  },
  {
    id: 'war.first_battle',
    name: 'Baptism by Fire',
    description: 'Experience your first Battle.',
    icon: 'sports_martial_arts',
    category: 'battle',
    classification: 'milestone'
  },
  {
    id: 'war.first_win',
    name: 'First Victory',
    description: 'Win your first resolved game.',
    icon: 'emoji_events',
    category: 'milestone',
    classification: 'milestone'
  },
  {
    id: 'war.first_defeat',
    name: 'Hard Lesson',
    description: 'Complete your first resolved defeat.',
    icon: 'school',
    category: 'milestone',
    classification: 'milestone'
  },
  {
    id: 'war.first_rescue',
    name: 'Rescue Mission',
    description: 'Rescue a beaten card with reinforcement.',
    icon: 'health_and_safety',
    category: 'signature',
    classification: 'milestone'
  },
  {
    id: 'war.first_battle_win',
    name: 'Hold the Field',
    description: 'Win your first Battle.',
    icon: 'flag',
    category: 'battle',
    classification: 'milestone'
  },
  {
    id: 'profile.campaigner',
    name: 'War Tested',
    description: 'Complete 10 resolved Wars.',
    icon: 'route',
    category: 'milestone',
    classification: 'milestone'
  },
  {
    id: 'profile.veteran',
    name: 'Veteran',
    description: 'Complete 25 resolved games.',
    icon: 'military_tech',
    category: 'milestone',
    classification: 'milestone'
  },
  {
    id: 'profile.centurion',
    name: 'Centurion',
    description: 'Complete 100 resolved games.',
    icon: 'workspace_premium',
    category: 'milestone',
    classification: 'milestone'
  },

  // --- DISTINCTIONS ---
  {
    id: 'war.assassin',
    name: 'Assassin',
    description: 'Defeat an Ace with a 2.',
    icon: 'flare',
    category: 'signature',
    classification: 'distinction'
  },
  {
    id: 'war.juggernaut',
    name: 'Juggernaut',
    description: 'Have one Ace, King, Queen, or Jack personally defeat at least 3 enemy cards in a single War.',
    icon: 'local_fire_department',
    category: 'signature',
    classification: 'distinction'
  },
  {
    id: 'war.expert_strategist',
    name: 'Expert Strategist',
    description: 'Win 5 resolved Battles consecutively.',
    icon: 'psychology',
    category: 'battle',
    classification: 'distinction'
  },
  {
    id: 'war.poor_strategy',
    name: 'Poor Strategy',
    description: 'Lose 5 resolved Battles consecutively.',
    icon: 'wrong_location',
    category: 'battle',
    classification: 'distinction'
  },
  {
    id: 'war.grave_intelligence',
    name: 'Grave Intelligence',
    description: 'Lose both of your 2s while both enemy Aces remain at large.',
    icon: 'visibility',
    category: 'signature',
    classification: 'distinction'
  },
  {
    id: 'war.crippled',
    name: 'Crippled',
    description: 'Lose both of your 2s as casualties in one resolved combat event.',
    icon: 'heart_broken',
    category: 'signature',
    classification: 'distinction'
  },
  {
    id: 'war.neverending_stalemate',
    name: 'Neverending Stalemate',
    description: 'Reach three consecutive true tied comparisons.',
    icon: 'all_inclusive',
    category: 'endurance',
    classification: 'distinction'
  },
  {
    id: 'war.cavalry_came',
    name: 'The Cavalry Came',
    description: 'Successfully rescue a 2 by drawing an Ace as reinforcement.',
    icon: 'shield',
    category: 'signature',
    classification: 'distinction'
  },
  {
    id: 'war.battle_layer_3',
    name: 'Down the Rabbit Hole',
    description: 'Reach Battle 3.',
    icon: 'layers',
    category: 'battle',
    classification: 'distinction'
  },
  {
    id: 'war.not_today',
    name: 'Not Today',
    description: 'Successfully reinforce to save an original 2.',
    icon: 'shield',
    category: 'signature',
    classification: 'distinction'
  },
  {
    id: 'war.royal_disaster',
    name: 'Royal Disaster',
    description: 'Lose both an Ace and a 2 in the same Battle.',
    icon: 'sentiment_very_dissatisfied',
    category: 'battle',
    classification: 'distinction'
  },
  {
    id: 'war.no_reinforcements_win',
    name: 'No Reinforcements Needed',
    description: 'Win a resolved game without sending reinforcement.',
    icon: 'front_hand',
    category: 'signature',
    classification: 'distinction'
  },
  {
    id: 'war.five_battles_game',
    name: 'War of Attrition',
    description: 'Resolve a game containing at least 5 distinct Battles.',
    icon: 'military_tech',
    category: 'endurance',
    classification: 'distinction'
  },
  {
    id: 'war.wrong_tool_for_job',
    name: 'Wrong Tool for the Job',
    description: 'Send a 2 as reinforcement and lose the Challenge to a 3, 4, or 5.',
    icon: 'build',
    category: 'signature',
    classification: 'distinction'
  },

  // --- PRESTIGE ---
  {
    id: 'war.battle_assassin',
    name: 'Against the Odds',
    description: 'Win a Battle by defeating an opposing Ace with a 2.',
    icon: 'flare',
    category: 'battle',
    classification: 'prestige'
  },
  {
    id: 'war.pyrrhic_victory',
    name: 'Pyrrhic Victory',
    description: 'Win the war with exactly 1 card remaining.',
    icon: 'emergency',
    category: 'signature',
    classification: 'prestige'
  },
  {
    id: 'war.massacre',
    name: 'Massacre',
    description: 'Defeat at least 14 opponent cards in a single Battle.',
    icon: 'bolt',
    category: 'battle',
    classification: 'prestige'
  },
  {
    id: 'war.deep_battle_win',
    name: 'Into the Breach',
    description: 'Win a Battle at depth 3 or greater.',
    icon: 'shield',
    category: 'battle',
    classification: 'prestige'
  },
  {
    id: 'war.battle_layer_4',
    name: 'How Deep Does This Go?',
    description: 'Reach Battle 4.',
    icon: 'filter_drama',
    category: 'battle',
    classification: 'prestige'
  },
  {
    id: 'war.untouchable',
    name: 'Untouchable',
    description: 'Win the War with at least 18 cards remaining.',
    icon: 'workspace_premium',
    category: 'signature',
    classification: 'prestige'
  },
  {
    id: 'war.marathon',
    name: 'Marathon',
    description: 'Resolve a game lasting at least 42 turns.',
    icon: 'timer',
    category: 'endurance',
    classification: 'prestige'
  },
  {
    id: 'war.comeback_15',
    name: 'Never Tell Me the Odds',
    description: 'Win the war after trailing by at least 15 cards.',
    icon: 'trending_up',
    category: 'signature',
    classification: 'prestige'
  },
  {
    id: 'war.twin_assassins',
    name: 'Twin Assassins',
    description: 'In one War, have each of your two 2s defeat a different enemy Ace.',
    icon: 'flare',
    category: 'signature',
    classification: 'prestige'
  },

  // --- ANOMALIES (Hidden) ---
  {
    id: 'war.perfect_victory',
    name: 'Not a Scratch',
    description: 'Win a War without losing a single card.',
    icon: 'verified',
    category: 'signature',
    classification: 'anomaly',
    hidden: true
  },
  {
    id: 'war.last_standard',
    name: 'The Last Standard',
    description: 'Fall to one card while the enemy still fields at least 15, then win the War.',
    icon: 'flag',
    category: 'signature',
    classification: 'anomaly',
    hidden: true
  },
  {
    id: 'war.comeback_20',
    name: 'Against Arithmetic',
    description: 'Win the War after trailing by at least 20 cards.',
    icon: 'trending_up',
    category: 'signature',
    classification: 'anomaly',
    hidden: true
  },
  {
    id: 'war.battle_layer_6',
    name: 'The Abyss Answers',
    description: 'Reach Battle 6.',
    icon: 'filter_drama',
    category: 'battle',
    classification: 'anomaly',
    hidden: true
  },
  {
    id: 'war.turn_51',
    name: 'Fifty-One',
    description: 'Resolve a War on turn 51.',
    icon: 'timer',
    category: 'endurance',
    classification: 'anomaly',
    hidden: true
  }
];

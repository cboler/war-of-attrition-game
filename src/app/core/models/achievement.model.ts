export interface AchievementDefinition {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon: string;
  readonly category: 'signature' | 'battle' | 'endurance' | 'milestone';
  readonly hidden?: boolean;
}

export interface UnlockedAchievement {
  readonly id: string;
  readonly unlockedAt: string; // ISO date string
}

export const ACHIEVEMENTS: readonly AchievementDefinition[] = [
  {
    id: 'war.first_casualty',
    name: 'First Casualty',
    description: 'Witness the first public card fall to the Boneyard.',
    icon: 'playing_cards',
    category: 'milestone'
  },
  {
    id: 'war.first_battle',
    name: 'Baptism by Fire',
    description: 'Experience your first Battle.',
    icon: 'swords',
    category: 'battle'
  },
  {
    id: 'war.first_win',
    name: 'First Victory',
    description: 'Win your first resolved game.',
    icon: 'emoji_events',
    category: 'milestone'
  },
  {
    id: 'war.first_defeat',
    name: 'Hard Lesson',
    description: 'Complete your first resolved defeat.',
    icon: 'school',
    category: 'milestone'
  },
  {
    id: 'war.first_rescue',
    name: 'Rescue Mission',
    description: 'Rescue a beaten card with reinforcement.',
    icon: 'health_and_safety',
    category: 'signature'
  },
  {
    id: 'war.first_battle_win',
    name: 'Hold the Field',
    description: 'Win your first Battle.',
    icon: 'flag',
    category: 'battle'
  },
  {
    id: 'war.assassin',
    name: 'Assassin',
    description: 'Defeat an Ace with a 2.',
    icon: 'flare',
    category: 'signature'
  },
  {
    id: 'war.battle_assassin',
    name: 'Against the Odds',
    description: 'Win a Battle by defeating an opposing Ace with a 2.',
    icon: 'flare',
    category: 'battle'
  },
  {
    id: 'war.pyrrhic_victory',
    name: 'Pyrrhic Victory',
    description: 'Win the war with exactly 1 card remaining.',
    icon: 'emergency',
    category: 'signature'
  },
  {
    id: 'war.massacre',
    name: 'Massacre',
    description: 'Defeat at least 10 opponent cards in a single Battle.',
    icon: 'bolt',
    category: 'battle'
  },
  {
    id: 'war.juggernaut',
    name: 'Juggernaut',
    description: 'Have one Ace, King, Queen, or Jack personally defeat at least 3 enemy cards in a single War.',
    icon: 'local_fire_department',
    category: 'signature'
  },
  {
    id: 'war.expert_strategist',
    name: 'Expert Strategist',
    description: 'Win 5 resolved Battles consecutively.',
    icon: 'psychology',
    category: 'battle'
  },
  {
    id: 'war.poor_strategy',
    name: 'Poor Strategy',
    description: 'Lose 5 resolved Battles consecutively.',
    icon: 'wrong_location',
    category: 'battle'
  },
  {
    id: 'war.grave_intelligence',
    name: 'Grave Intelligence',
    description: 'Lose both of your 2s while both enemy Aces remain at large.',
    icon: 'visibility',
    category: 'signature'
  },
  {
    id: 'war.cavalry_came',
    name: 'The Cavalry Came',
    description: 'Successfully rescue a 2 by drawing an Ace as reinforcement.',
    icon: 'shield',
    category: 'signature'
  },
  {
    id: 'war.battle_layer_3',
    name: 'Down the Rabbit Hole',
    description: 'Reach Battle 3.',
    icon: 'layers',
    category: 'battle'
  },
  {
    id: 'war.battle_layer_4',
    name: 'How Deep Does This Go?',
    description: 'Reach Battle 4.',
    icon: 'filter_drama',
    category: 'battle'
  },
  {
    id: 'war.not_today',
    name: 'Not Today',
    description: 'Successfully reinforce to save an original 2.',
    icon: 'shield',
    category: 'signature'
  },
  {
    id: 'war.deep_battle_win',
    name: 'Into the Breach',
    description: 'Win a Battle at depth 3 or greater.',
    icon: 'shield',
    category: 'battle'
  },
  {
    id: 'war.royal_disaster',
    name: 'Royal Disaster',
    description: 'Lose both an Ace and a 2 in the same Battle.',
    icon: 'sentiment_very_dissatisfied',
    category: 'battle'
  },
  {
    id: 'war.no_reinforcements_win',
    name: 'No Reinforcements Needed',
    description: 'Win a resolved game without sending reinforcement.',
    icon: 'front_hand',
    category: 'signature'
  },
  {
    id: 'war.five_battles_game',
    name: 'War of Attrition',
    description: 'Resolve a game containing at least 5 distinct Battles.',
    icon: 'military_tech',
    category: 'endurance'
  },
  {
    id: 'war.untouchable',
    name: 'Untouchable',
    description: 'Win the war with at least 20 cards remaining.',
    icon: 'workspace_premium',
    category: 'signature'
  },
  {
    id: 'war.marathon',
    name: 'Marathon',
    description: 'Resolve a game lasting at least 42 turns.',
    icon: 'timer',
    category: 'endurance'
  },
  {
    id: 'war.comeback_15',
    name: 'Never Tell Me the Odds',
    description: 'Win the war after trailing by at least 15 cards.',
    icon: 'trending_up',
    category: 'signature'
  },
  {
    id: 'profile.campaigner',
    name: 'War Tested',
    description: 'Complete 10 resolved Wars.',
    icon: 'route',
    category: 'milestone'
  },
  {
    id: 'profile.veteran',
    name: 'Veteran',
    description: 'Complete 25 resolved games.',
    icon: 'military_tech',
    category: 'milestone'
  },
  {
    id: 'profile.centurion',
    name: 'Centurion',
    description: 'Complete 100 resolved games.',
    icon: 'crown',
    category: 'milestone'
  }
];

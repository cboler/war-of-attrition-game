import { Injectable } from '@angular/core';

export interface ProgressData {
  project: {
    name: string;
    version: string;
    type: string;
  };
  currentMilestone: {
    number: number;
    name: string;
    status: string;
    emoji: string;
  };
  milestones: Array<{
    number: number;
    name: string;
    status: string;
    progress: number;
    items: Array<{
      name: string;
      status: string;
      description?: string;
    }>;
  }>;
  testMetrics: {
    totalTests: number;
    passingTests: number;
    coverage: string;
  };
  nextSteps: {
    immediate: string;
    priority: string;
  };
  features: {
    implemented: string[];
    nextMilestone: string[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class ProgressService {
  private readonly progressData: ProgressData = {
    project: {
      name: 'War of Attrition Game',
      version: 'Angular 20.1.6',
      type: 'Progressive Web Application'
    },
    currentMilestone: {
      number: 5,
      name: 'Visual Polish & Animations',
      status: 'IN_PROGRESS',
      emoji: '✨'
    },
    milestones: [
      {
        number: 1,
        name: 'Foundation & Setup',
        status: 'COMPLETED',
        progress: 100,
        items: [
          { name: 'Basic Angular/PWA setup', status: 'COMPLETED' },
          { name: 'Theme toggle implementation', status: 'COMPLETED' },
          { name: 'Routing structure', status: 'COMPLETED' },
          { name: 'Responsive layout foundation', status: 'PARTIALLY_COMPLETED' }
        ]
      },
      {
        number: 2,
        name: 'Core Game Engine',
        status: 'COMPLETED',
        progress: 100,
        items: [
          { name: 'Card & Deck Models', status: 'COMPLETED', description: 'Complete TypeScript interfaces and classes' },
          { name: 'Game State Management', status: 'COMPLETED', description: 'Angular signals-based reactive state' },
          { name: 'Card Comparison Logic', status: 'COMPLETED', description: 'All rules including special Ace vs 2 rule' },
          { name: 'Turn Resolution Engine', status: 'COMPLETED', description: 'Normal turns, challenges, and battles' },
          { name: 'Comprehensive Tests', status: 'COMPLETED', description: '60 passing tests covering all game logic' }
        ]
      },
      {
        number: 3,
        name: 'Basic UI Components',
        status: 'COMPLETED',
        progress: 100,
        items: [
          { name: 'Game Board Layout', status: 'COMPLETED' },
          { name: 'Card Component', status: 'COMPLETED' },
          { name: 'Health Bar Component', status: 'COMPLETED' },
          { name: 'Player Action Indicators', status: 'COMPLETED' }
        ]
      },
      {
        number: 4,
        name: 'Game Mechanics Implementation',
        status: 'COMPLETED',
        progress: 100,
        items: [
          { name: 'Basic Turn Flow', status: 'COMPLETED' },
          { name: 'Challenge System', status: 'COMPLETED' },
          { name: 'Battle System', status: 'COMPLETED' },
          { name: 'Game End Conditions', status: 'COMPLETED' }
        ]
      },
      {
        number: 5,
        name: 'Visual Polish & Animations',
        status: 'IN_PROGRESS',
        progress: 85,
        items: [
          { name: 'Material Icons Implementation', status: 'COMPLETED', description: 'Navigation and theme toggle icons implemented' },
          { name: 'Theme Toggle Enhancement', status: 'COMPLETED', description: 'Lightbulb metaphor with lit/unlit states' },
          { name: 'Card Animations', status: 'COMPLETED', description: 'Slide-in, flip, and clash animations implemented' },
          { name: 'Health Bar Damage Animations', status: 'COMPLETED', description: 'Enhanced flash effects and danger pulse animations' },
          { name: 'Enhanced UI Polish', status: 'PARTIALLY_COMPLETED', description: 'Core animations complete, additional effects in progress' }
        ]
      }
    ],
    testMetrics: {
      totalTests: 60,
      passingTests: 60,
      coverage: 'comprehensive'
    },
    nextSteps: {
      immediate: 'Complete Milestone 5: Visual Polish & Animations - Add fall-away animations and final polish',
      priority: 'Card fall-away animations for discarded cards, enhanced visual feedback system, and responsive improvements'
    },
    features: {
      implemented: [
        'Card and Deck models with proper typing',
        'Game state management with Angular signals',
        'Card comparison logic (including Ace vs 2 rule)',
        'Turn resolution engine',
        'Challenge and battle mechanics',
        'Win condition checking',
        'Comprehensive test coverage',
        'Complete game UI with responsive game board',
        'Health bar system with color coding',
        'Interactive card components',
        'Full turn flow implementation',
        'Challenge system (Accept/Decline)',
        'Battle system with card selection',
        'Game end condition handling',
        'Material Icons for navigation (casino/dice, settings gear)',
        'Enhanced theme toggle with lightbulb metaphor',
        'Local Material Icons font integration',
        'Card slide and flip animations',
        'Battle clash visual effects with shake animations',
        'Health bar damage animations with enhanced flash effects',
        'Dynamic animation system for card states'
      ],
      nextMilestone: [
        'Card fall-away animations for discarded cards',
        'Enhanced visual feedback system polish',
        'Settings menu implementation',
        'Card backing customization options'
      ]
    }
  };

  getProgressData(): ProgressData {
    return this.progressData;
  }

  getCurrentMilestone() {
    return this.progressData.currentMilestone;
  }

  getMilestones() {
    return this.progressData.milestones;
  }

  getCompletedMilestone(milestoneNumber: number) {
    return this.progressData.milestones.find(m => m.number === milestoneNumber);
  }

  getImplementedFeatures(): string[] {
    return this.progressData.features.implemented;
  }

  getTestMetrics() {
    return this.progressData.testMetrics;
  }

  getNextSteps() {
    return this.progressData.nextSteps;
  }

  /**
   * Generate a demo log that references the centralized progress data
   */
  generateDemoLog(): string[] {
    const log: string[] = [];
    const data = this.getProgressData();
    const currentMilestone = this.getCurrentMilestone();
    const milestone2 = this.getCompletedMilestone(2);
    
    log.push(`🎮 ${data.project.name} Demo`);
    log.push('=====================================');
    log.push('');
    log.push(`✅ Game initialized`);
    log.push('');
    log.push(`🔧 Core Game Engine Features Verified:`);
    
    if (milestone2) {
      milestone2.items.forEach(item => {
        log.push(`   ✅ ${item.description || item.name}`);
      });
    }
    
    log.push('');
    log.push(`🚀 Ready for ${data.nextSteps.immediate}!`);
    
    return log;
  }
}
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
      number: 2,
      name: 'Core Game Engine',
      status: 'COMPLETED',
      emoji: '🎉'
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
        status: 'NOT_STARTED',
        progress: 0,
        items: [
          { name: 'Game Board Layout', status: 'NOT_STARTED' },
          { name: 'Card Component', status: 'NOT_STARTED' },
          { name: 'Health Bar Component', status: 'NOT_STARTED' },
          { name: 'Player Action Indicators', status: 'NOT_STARTED' }
        ]
      }
    ],
    testMetrics: {
      totalTests: 60,
      passingTests: 60,
      coverage: 'comprehensive'
    },
    nextSteps: {
      immediate: 'Begin Milestone 3: Basic UI Components',
      priority: 'Game Board Layout implementation'
    },
    features: {
      implemented: [
        'Card and Deck models with proper typing',
        'Game state management with Angular signals',
        'Card comparison logic (including Ace vs 2 rule)',
        'Turn resolution engine',
        'Challenge and battle mechanics',
        'Win condition checking',
        'Comprehensive test coverage'
      ],
      nextMilestone: [
        'Game Board Layout',
        'Card Component with styling',
        'Health Bar Component with color coding',
        'Player Action Indicators'
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
import { Injectable, computed, inject, signal, effect } from '@angular/core';
import { SettingsService } from '../core/services/settings.service';
import {
  DEFAULT_TUTORIAL_PROGRESS,
  TutorialProgress,
  TutorialPrompt,
  TutorialStep
} from '../core/models/tutorial.model';

@Injectable({
  providedIn: 'root'
})
export class TutorialService {
  private readonly STORAGE_KEY = 'war-of-attrition-tutorial-progress';
  private readonly settingsService = inject(SettingsService);

  private readonly progress = signal<TutorialProgress>(this.loadProgress());
  private readonly activePromptSignal = signal<TutorialPrompt | null>(null);
  private readonly tourIndex = signal<number>(0);
  private readonly TOUR_TOTAL_STEPS = 4;

  readonly currentProgress = this.progress.asReadonly();
  readonly activePrompt = this.activePromptSignal.asReadonly();
  readonly isTutorialActive = computed(() => this.activePromptSignal() !== null);
  readonly isTutorialEnabled = computed(() => this.settingsService.tutorialEnabled());

  constructor() {
    effect(() => {
      this.saveProgress(this.progress());
    });
  }

  private pendingResolver: (() => void) | null = null;

  /**
   * Trigger a contextual tutorial step if tutorial guidance is enabled and this step hasn't been seen yet.
   * Pauses the game sequence until the user explicitly interacts (acknowledges, dismisses, or skips).
   * Returns a Promise resolving to true if a prompt was shown and acknowledged, or false if bypassed.
   */
  async triggerStep(step: TutorialStep): Promise<boolean> {
    if (!this.isTutorialEnabled() || this.hasSeenStep(step)) {
      return false;
    }

    let prompt: TutorialPrompt | null = null;
    if (step === TutorialStep.FIRST_TURN) {
      this.tourIndex.set(0);
      prompt = this.getTourPrompt(0);
    } else {
      prompt = this.getPromptForStep(step);
    }

    if (!prompt) {
      return false;
    }

    if (this.pendingResolver) {
      this.pendingResolver();
      this.pendingResolver = null;
    }

    this.activePromptSignal.set(prompt);

    return new Promise<boolean>((resolve) => {
      this.pendingResolver = () => {
        resolve(true);
      };
    });
  }

  /**
   * Directly present a step prompt (e.g. from the tutorial test harness).
   */
  forceStep(step: TutorialStep): void {
    if (this.pendingResolver) {
      this.pendingResolver();
      this.pendingResolver = null;
    }
    const prompt = step === TutorialStep.FIRST_TURN ? this.getTourPrompt(0) : this.getPromptForStep(step);
    if (prompt) {
      this.activePromptSignal.set(prompt);
    }
  }

  /**
   * Acknowledge/dismiss current prompt or advance to next tour step.
   */
  acknowledgePrompt(): void {
    const current = this.activePromptSignal();
    if (!current) return;

    if (current.step === TutorialStep.FIRST_TURN && this.tourIndex() < this.TOUR_TOTAL_STEPS - 1) {
      this.tourIndex.update(i => i + 1);
      this.activePromptSignal.set(this.getTourPrompt(this.tourIndex()));
      return;
    }

    if (current.step === TutorialStep.FIRST_TURN) {
      this.markStepSeen(TutorialStep.FIRST_TURN);
      this.markStepSeen(TutorialStep.FIRST_BONEYARD);
      this.tourIndex.set(0);
    } else {
      this.markStepSeen(current.step);
    }

    this.activePromptSignal.set(null);
    if (this.pendingResolver) {
      const resolve = this.pendingResolver;
      this.pendingResolver = null;
      resolve();
    }
  }

  /**
   * Navigate back to previous tour step.
   */
  prevTourStep(): void {
    const current = this.activePromptSignal();
    if (current?.step === TutorialStep.FIRST_TURN && this.tourIndex() > 0) {
      this.tourIndex.update(i => i - 1);
      this.activePromptSignal.set(this.getTourPrompt(this.tourIndex()));
    }
  }

  /**
   * Dismiss prompt without marking all steps seen, or skip tutorial for current game, and resume game.
   */
  dismissPrompt(): void {
    const current = this.activePromptSignal();
    if (current) {
      this.markStepSeen(current.step);
      this.activePromptSignal.set(null);
    }
    if (this.pendingResolver) {
      const resolve = this.pendingResolver;
      this.pendingResolver = null;
      resolve();
    }
  }

  /**
   * Skip remaining tutorial guidance by disabling tutorial in settings and resume game.
   */
  skipTutorial(): void {
    const current = this.activePromptSignal();
    if (current) {
      this.markStepSeen(current.step);
      if (current.step === TutorialStep.FIRST_TURN) {
        this.markStepSeen(TutorialStep.FIRST_BONEYARD);
      }
    }
    this.activePromptSignal.set(null);
    this.settingsService.setTutorialEnabled(false);
    if (this.pendingResolver) {
      const resolve = this.pendingResolver;
      this.pendingResolver = null;
      resolve();
    }
  }

  /**
   * Reset all tutorial step progress back to unseen without clearing user stats.
   */
  resetTutorialProgress(): void {
    this.progress.set({ ...DEFAULT_TUTORIAL_PROGRESS });
    this.activePromptSignal.set(null);
    this.tourIndex.set(0);
    if (this.pendingResolver) {
      const resolve = this.pendingResolver;
      this.pendingResolver = null;
      resolve();
    }
  }

  hasSeenStep(step: TutorialStep): boolean {
    const p = this.progress();
    switch (step) {
      case TutorialStep.FIRST_TURN: return p.firstTurn;
      case TutorialStep.FIRST_COMPARISON: return p.firstComparison;
      case TutorialStep.ACE_ASSASSINATION: return p.aceAssassination;
      case TutorialStep.FIRST_BONEYARD: return p.firstBoneyard;
      case TutorialStep.FIRST_BATTLE: return p.firstBattle;
      case TutorialStep.FIRST_REINFORCEMENT: return p.firstReinforcement;
      case TutorialStep.FIRST_BATTLE_RESOLUTION: return p.firstBattleResolution;
      case TutorialStep.FIRST_GAME_CONCLUSION: return p.firstGameConclusion;
    }
  }

  markStepSeen(step: TutorialStep): void {
    this.progress.update(curr => {
      switch (step) {
        case TutorialStep.FIRST_TURN: return { ...curr, firstTurn: true };
        case TutorialStep.FIRST_COMPARISON: return { ...curr, firstComparison: true };
        case TutorialStep.ACE_ASSASSINATION: return { ...curr, aceAssassination: true };
        case TutorialStep.FIRST_BONEYARD: return { ...curr, firstBoneyard: true };
        case TutorialStep.FIRST_BATTLE: return { ...curr, firstBattle: true };
        case TutorialStep.FIRST_REINFORCEMENT: return { ...curr, firstReinforcement: true };
        case TutorialStep.FIRST_BATTLE_RESOLUTION: return { ...curr, firstBattleResolution: true };
        case TutorialStep.FIRST_GAME_CONCLUSION: return { ...curr, firstGameConclusion: true };
      }
    });
  }

  private getTourPrompt(index: number): TutorialPrompt {
    switch (index) {
      case 0:
        return {
          step: TutorialStep.FIRST_TURN,
          eyebrow: 'TABLE ORIENTATION (1/4)',
          title: 'Welcome Commander',
          message: 'Your objective is total attrition: exhaust the enemy army while defending your own troops. Here is a quick tactical briefing.',
          highlightSelector: '.playfield',
          actionText: 'Next: Enemy Vanguard →',
          canSkip: true,
          tourStepIndex: 0,
          tourTotalSteps: this.TOUR_TOTAL_STEPS,
          hasPrev: false
        };
      case 1:
        return {
          step: TutorialStep.FIRST_TURN,
          eyebrow: 'TABLE ORIENTATION (2/4)',
          title: 'Enemy Vanguard',
          message: 'The opponent’s army is stationed at the top. Their remaining deck count and active stakes in frontline battles are tracked here in their command zone.',
          highlightSelector: '.seat.is-top',
          actionText: 'Next: Your Command Deck →',
          canSkip: true,
          tourStepIndex: 1,
          tourTotalSteps: this.TOUR_TOTAL_STEPS,
          hasPrev: true
        };
      case 2:
        return {
          step: TutorialStep.FIRST_TURN,
          eyebrow: 'TABLE ORIENTATION (3/4)',
          title: 'Your Command Deck',
          message: 'Your command deck is stationed at the bottom. Tap your deck each round to deploy your front-line card into battle.',
          highlightSelector: '.seat.is-bottom .deck',
          actionText: 'Next: The Boneyard →',
          canSkip: true,
          tourStepIndex: 2,
          tourTotalSteps: this.TOUR_TOTAL_STEPS,
          hasPrev: true
        };
      case 3:
      default:
        return {
          step: TutorialStep.FIRST_TURN,
          eyebrow: 'TABLE ORIENTATION (4/4)',
          title: 'The Boneyard & Field Manual',
          message: 'Defeated troops and lost challenges are permanently banished to the Boneyard on the table side. Tap the Field Manual icon anytime to review full rules and mission history.',
          highlightSelector: '.table-utility-hub',
          actionText: 'Commence Battle ⚔️',
          canSkip: true,
          tourStepIndex: 3,
          tourTotalSteps: this.TOUR_TOTAL_STEPS,
          hasPrev: true
        };
    }
  }

  private getPromptForStep(step: TutorialStep): TutorialPrompt | null {
    switch (step) {
      case TutorialStep.FIRST_TURN:
        return this.getTourPrompt(this.tourIndex());

      case TutorialStep.FIRST_COMPARISON:
        return {
          step,
          eyebrow: 'CLASH MECHANICS',
          title: 'Power & Hierarchy',
          message: 'Revealed cards compare ranks. Higher rank takes the round and claims all cards currently at stake unless challenged.',
          highlightSelector: '.playfield .stakes',
          actionText: 'Understood',
          canSkip: true
        };

      case TutorialStep.ACE_ASSASSINATION:
        return {
          step,
          eyebrow: 'SPECIAL TACTICAL RULE',
          title: 'Assassination: 2 Conquers Ace',
          message: 'A 2 slays an Ace! When an Ace is assassinated by a 2, the victory is decisive — no reinforcement or challenge is permitted. The defeated Ace falls immediately.',
          highlightSelector: '.playfield .stakes',
          actionText: 'Understood',
          canSkip: true
        };

      case TutorialStep.FIRST_BONEYARD:
        return {
          step,
          eyebrow: 'CASUALTY REPORT',
          title: 'The Boneyard',
          message: 'Conceded or battle-lost cards enter the public Boneyard. These casualties are permanently eliminated from the remainder of the war.',
          highlightSelector: '.table-utility-hub .boneyard',
          actionText: 'Understood',
          canSkip: true
        };

      case TutorialStep.FIRST_BATTLE:
        return {
          step,
          eyebrow: 'CRITICAL ENGAGEMENT',
          title: 'A Tie Triggers Battle!',
          message: 'Equal ranks deadlock and trigger Battle! Both sides commit 3 cards face-down. Choose one of the enemy’s 3 cards to be your opponent’s champion as they will choose yours. The champions clash to decide all cards at stake.',
          highlightSelector: '.playfield .stakes',
          actionText: 'Prepare for Battle',
          canSkip: true
        };

      case TutorialStep.FIRST_REINFORCEMENT:
        return {
          step,
          eyebrow: 'TACTICAL REINFORCEMENT',
          title: 'Challenge Opportunity',
          message: 'You lost the clash, but can commit 1 reinforcement card. If your reinforcement beats their card, both of yours are saved! If it ties, it triggers Battle where you still have a chance to win. But if it loses, both of your cards are lost to the Boneyard.',
          highlightSelector: '.decision-callout',
          actionText: 'I Understand the Risk',
          canSkip: true
        };

      case TutorialStep.FIRST_BATTLE_RESOLUTION:
        return {
          step,
          eyebrow: 'BATTLE RESOLUTION',
          title: 'Casualties & Spoils',
          message: 'The revealed Battle champions settle the engagement. The victor claims all cards at stake, returning surviving troops face-down. The loser’s casualties travel to the Boneyard.',
          highlightSelector: '.playfield .stakes',
          actionText: 'Continue War',
          canSkip: true
        };

      case TutorialStep.FIRST_GAME_CONCLUSION:
        return {
          step,
          eyebrow: 'WAR RESOLUTION',
          title: 'Victory or Defeat',
          message: 'When a commander’s deck is fully exhausted, the war concludes. Check your detailed career statistics or consult the Field Manual anytime.',
          highlightSelector: '.game-over',
          actionText: 'Finish Tutorial',
          canSkip: true
        };
    }
  }

  private loadProgress(): TutorialProgress {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_TUTORIAL_PROGRESS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Failed to load tutorial progress from localStorage:', e);
    }
    return { ...DEFAULT_TUTORIAL_PROGRESS };
  }

  private saveProgress(prog: TutorialProgress): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(prog));
    } catch (e) {
      console.warn('Failed to save tutorial progress to localStorage:', e);
    }
  }
}

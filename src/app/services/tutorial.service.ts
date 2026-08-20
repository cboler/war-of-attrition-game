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

  readonly currentProgress = this.progress.asReadonly();
  readonly activePrompt = this.activePromptSignal.asReadonly();
  readonly isTutorialActive = computed(() => this.activePromptSignal() !== null);
  readonly isTutorialEnabled = computed(() => this.settingsService.tutorialEnabled());

  constructor() {
    effect(() => {
      this.saveProgress(this.progress());
    });
  }

  /**
   * Trigger a contextual tutorial step if tutorial guidance is enabled and this step hasn't been seen yet.
   * Returns true if the prompt is displayed (pausing gameplay), false otherwise.
   */
  triggerStep(step: TutorialStep): boolean {
    if (!this.isTutorialEnabled()) {
      return false;
    }

    if (this.hasSeenStep(step)) {
      return false;
    }

    const prompt = this.getPromptForStep(step);
    if (!prompt) {
      return false;
    }

    this.activePromptSignal.set(prompt);
    return true;
  }

  /**
   * Directly present a step prompt (e.g. from the tutorial test harness).
   */
  forceStep(step: TutorialStep): void {
    const prompt = this.getPromptForStep(step);
    if (prompt) {
      this.activePromptSignal.set(prompt);
    }
  }

  /**
   * Acknowledge/dismiss current prompt and mark step as seen.
   */
  acknowledgePrompt(): void {
    const current = this.activePromptSignal();
    if (current) {
      this.markStepSeen(current.step);
      this.activePromptSignal.set(null);
    }
  }

  /**
   * Dismiss prompt without marking all steps seen, or skip tutorial for current game.
   */
  dismissPrompt(): void {
    const current = this.activePromptSignal();
    if (current) {
      this.markStepSeen(current.step);
      this.activePromptSignal.set(null);
    }
  }

  /**
   * Skip remaining tutorial guidance by disabling tutorial in settings.
   */
  skipTutorial(): void {
    const current = this.activePromptSignal();
    if (current) {
      this.markStepSeen(current.step);
    }
    this.activePromptSignal.set(null);
    this.settingsService.setTutorialEnabled(false);
  }

  /**
   * Reset all tutorial step progress back to unseen without clearing user stats.
   */
  resetTutorialProgress(): void {
    this.progress.set({ ...DEFAULT_TUTORIAL_PROGRESS });
    this.activePromptSignal.set(null);
  }

  hasSeenStep(step: TutorialStep): boolean {
    const p = this.progress();
    switch (step) {
      case TutorialStep.FIRST_TURN: return p.firstTurn;
      case TutorialStep.FIRST_COMPARISON: return p.firstComparison;
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
        case TutorialStep.FIRST_BONEYARD: return { ...curr, firstBoneyard: true };
        case TutorialStep.FIRST_BATTLE: return { ...curr, firstBattle: true };
        case TutorialStep.FIRST_REINFORCEMENT: return { ...curr, firstReinforcement: true };
        case TutorialStep.FIRST_BATTLE_RESOLUTION: return { ...curr, firstBattleResolution: true };
        case TutorialStep.FIRST_GAME_CONCLUSION: return { ...curr, firstGameConclusion: true };
      }
    });
  }

  private getPromptForStep(step: TutorialStep): TutorialPrompt | null {
    switch (step) {
      case TutorialStep.FIRST_TURN:
        return {
          step,
          eyebrow: 'FIELD ORIENTATION',
          title: 'Welcome Commander',
          message: 'Your objective is attrition: conquer the enemy army. Tap your deck at the bottom of the table to deal your card into the frontline clash.',
          highlightSelector: '.seat.is-bottom .deck',
          actionText: 'Got It',
          canSkip: true
        };

      case TutorialStep.FIRST_COMPARISON:
        return {
          step,
          eyebrow: 'CLASH MECHANICS',
          title: 'Power & Assassination',
          message: 'Revealed cards compare ranks. Higher rank takes the round! Key tactical rule: 2 conquers an Ace. The victor claims all cards currently at stake.',
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
          message: 'Equal ranks deadlock and trigger Battle! Both sides commit 3 cards face-down. Choose one of the enemy’s 3 cards blindly to decide the fate of all cards at stake.',
          highlightSelector: '.playfield .stakes',
          actionText: 'Prepare for Battle',
          canSkip: true
        };

      case TutorialStep.FIRST_REINFORCEMENT:
        return {
          step,
          eyebrow: 'TACTICAL REINFORCEMENT',
          title: 'Challenge Opportunity',
          message: 'You lost the clash, but can commit 1 reinforcement card. If your reinforcement beats their winner, both of your cards are saved! But if it loses or ties, both cards perish in the Boneyard.',
          highlightSelector: '.decision-callout',
          actionText: 'I Understand the Risk',
          canSkip: true
        };

      case TutorialStep.FIRST_BATTLE_RESOLUTION:
        return {
          step,
          eyebrow: 'BATTLE RESOLUTION',
          title: 'Casualties & Spoils',
          message: 'The revealed Battle cards settle the engagement. The victor claims all cards at stake and returns their surviving troops face-down. The loser’s casualties travel to the Boneyard.',
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

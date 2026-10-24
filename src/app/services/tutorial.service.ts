import { Injectable, computed, inject, signal, effect } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { SettingsService } from '../core/services/settings.service';
import {
  DEFAULT_TUTORIAL_PROGRESS,
  TutorialProgress,
  TutorialPrompt,
  TutorialStep
} from '../core/models/tutorial.model';
import { APP_LOCAL_STORAGE_KEYS } from '../core/models/app-storage.model';

@Injectable({
  providedIn: 'root'
})
export class TutorialService {
  private readonly settingsService = inject(SettingsService);
  private readonly dialog = inject(MatDialog, { optional: true });

  private readonly progress = signal<TutorialProgress>(this.loadProgress());
  private readonly activePromptSignal = signal<TutorialPrompt | null>(null);
  private readonly tourIndex = signal<number>(0);
  private readonly manualVisitInProgressSignal = signal(false);
  private readonly TOUR_TOTAL_STEPS = 5;

  readonly currentProgress = this.progress.asReadonly();
  readonly activePrompt = this.activePromptSignal.asReadonly();
  readonly isTutorialActive = computed(() => this.activePromptSignal() !== null);
  readonly isTutorialEnabled = computed(() => this.settingsService.tutorialEnabled());
  readonly manualVisitInProgress = this.manualVisitInProgressSignal.asReadonly();
  readonly requiresFieldManualAction = computed(
    () => this.activePromptSignal()?.requiresTargetAction === true
  );

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

    if (this.dialog && this.dialog.openDialogs.length > 0) {
      await firstValueFrom(this.dialog.afterAllClosed);
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
    if (current.requiresTargetAction) return;

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

  /** Pause the orientation overlay while the player explores the real Field Manual. */
  fieldManualOpened(): void {
    const current = this.activePromptSignal();
    if (
      current?.step !== TutorialStep.FIRST_TURN ||
      !current.requiresTargetAction
    ) {
      return;
    }
    this.activePromptSignal.set(null);
    this.manualVisitInProgressSignal.set(true);
  }

  /** Resume orientation with its final command after the Manual returns to the table. */
  fieldManualClosed(): void {
    if (!this.manualVisitInProgressSignal()) return;
    this.manualVisitInProgressSignal.set(false);
    this.tourIndex.set(this.TOUR_TOTAL_STEPS - 1);
    this.activePromptSignal.set(this.getTourPrompt(this.tourIndex()));
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
    this.manualVisitInProgressSignal.set(false);
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
    this.manualVisitInProgressSignal.set(false);
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
          eyebrow: 'TABLE ORIENTATION (1/5)',
          title: 'Welcome Commander',
          message: 'Exhaust the enemy army before it exhausts yours. A quick briefing first.',
          highlightSelector: '.playfield',
          actionText: 'Next',
          canSkip: true,
          tourStepIndex: 0,
          tourTotalSteps: this.TOUR_TOTAL_STEPS,
          hasPrev: false
        };
      case 1:
        return {
          step: TutorialStep.FIRST_TURN,
          eyebrow: 'TABLE ORIENTATION (2/5)',
          title: 'Enemy Vanguard',
          message: 'Your opponent sits at the top. Their card count and any cards at stake show here.',
          highlightSelector: '.seat.is-top',
          actionText: 'Next',
          canSkip: true,
          tourStepIndex: 1,
          tourTotalSteps: this.TOUR_TOTAL_STEPS,
          hasPrev: true
        };
      case 2:
        return {
          step: TutorialStep.FIRST_TURN,
          eyebrow: 'TABLE ORIENTATION (3/5)',
          title: 'Your Command Deck',
          message: 'Your deck sits at the bottom. Tap it each turn to play your top card.',
          highlightSelector: '.seat.is-bottom .deck',
          actionText: 'Next',
          canSkip: true,
          tourStepIndex: 2,
          tourTotalSteps: this.TOUR_TOTAL_STEPS,
          hasPrev: true
        };
      case 3:
        return {
          step: TutorialStep.FIRST_TURN,
          eyebrow: 'TABLE ORIENTATION (4/5)',
          title: 'The Boneyard & Field Manual',
          message: 'Defeated cards go to the Boneyard for the rest of the War. Now tap the highlighted Field Manual button.',
          highlightSelector: '.story-turn-btn',
          canSkip: true,
          tourStepIndex: 3,
          tourTotalSteps: this.TOUR_TOTAL_STEPS,
          hasPrev: true,
          requiresTargetAction: true
        };
      case 4:
      default:
        return {
          step: TutorialStep.FIRST_TURN,
          eyebrow: 'TABLE ORIENTATION (5/5)',
          title: 'Ready for Command',
          message: 'The Field Manual stays beside the turn counter: the Chronicle, rules, Hall of Valor and dossiers, any time.',
          highlightSelector: '.playfield',
          actionText: 'Commence Battle ⚔️',
          canSkip: true,
          tourStepIndex: 4,
          tourTotalSteps: this.TOUR_TOTAL_STEPS,
          hasPrev: false
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
          message: 'Higher rank wins. The winning card returns to its deck; the beaten card goes to the Boneyard unless its owner challenges.',
          highlightSelector: '.playfield .stakes',
          actionText: 'Understood',
          canSkip: true
        };

      case TutorialStep.ACE_ASSASSINATION:
        return {
          step,
          eyebrow: 'SPECIAL TACTICAL RULE',
          title: 'Assassination: 2 Conquers Ace',
          message: 'A 2 slays an Ace, and the kill is final: no Challenge can save the Ace.',
          highlightSelector: '.playfield .stakes',
          actionText: 'Understood',
          canSkip: true
        };

      case TutorialStep.FIRST_BONEYARD:
        return {
          step,
          eyebrow: 'CASUALTY REPORT',
          title: 'The Boneyard',
          message: 'Conceded cards and Battle losses go to the public Boneyard, out of play for the rest of the War.',
          highlightSelector: '.table-utility-hub .boneyard',
          actionText: 'Understood',
          canSkip: true
        };

      case TutorialStep.FIRST_BATTLE:
        return {
          step,
          eyebrow: 'CRITICAL ENGAGEMENT',
          title: 'A Tie Triggers Battle!',
          message: 'Equal ranks trigger a Battle. Each side lays 3 cards face-down. You pick the enemy’s champion from their 3; they pick yours. The champions decide every card at stake.',
          highlightSelector: '.playfield .stakes',
          actionText: 'Prepare for Battle',
          canSkip: true
        };

      case TutorialStep.FIRST_REINFORCEMENT:
        return {
          step,
          eyebrow: 'TACTICAL REINFORCEMENT',
          title: 'Challenge Opportunity',
          message: 'You lost the clash, but you can send 1 reinforcement. Win and both your cards are saved. Tie and a Battle begins. Lose and both go to the Boneyard.',
          highlightSelector: '.decision-callout',
          actionText: 'I Understand the Risk',
          canSkip: true
        };

      case TutorialStep.FIRST_BATTLE_RESOLUTION:
        return {
          step,
          eyebrow: 'BATTLE RESOLUTION',
          title: 'Casualties & Spoils',
          message: 'The champions settle it. The winner’s cards return face-down; the loser’s go to the Boneyard.',
          highlightSelector: '.playfield .stakes',
          actionText: 'Continue War',
          canSkip: true
        };

      case TutorialStep.FIRST_GAME_CONCLUSION:
        return {
          step,
          eyebrow: 'WAR RESOLUTION',
          title: 'Victory or Defeat',
          message: 'The War ends when a commander runs out of cards. Career stats live in your profile; the rules live in the Field Manual.',
          highlightSelector: '.game-over',
          actionText: 'Finish Tutorial',
          canSkip: true
        };
    }
  }

  private loadProgress(): TutorialProgress {
    try {
      const stored = localStorage.getItem(APP_LOCAL_STORAGE_KEYS.tutorialProgress);
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
      localStorage.setItem(APP_LOCAL_STORAGE_KEYS.tutorialProgress, JSON.stringify(prog));
    } catch (e) {
      console.warn('Failed to save tutorial progress to localStorage:', e);
    }
  }
}

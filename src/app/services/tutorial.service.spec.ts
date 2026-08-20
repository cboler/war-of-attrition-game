import { TestBed } from '@angular/core/testing';
import { TutorialService } from './tutorial.service';
import { SettingsService } from '../core/services/settings.service';
import { TutorialStep, DEFAULT_TUTORIAL_PROGRESS } from '../core/models/tutorial.model';

describe('TutorialService', () => {
  let service: TutorialService;
  let settingsService: SettingsService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [TutorialService, SettingsService]
    });
    service = TestBed.inject(TutorialService);
    settingsService = TestBed.inject(SettingsService);
    service.resetTutorialProgress();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with default tutorial progress', () => {
    expect(service.isTutorialEnabled()).toBeTrue();
    expect(service.isTutorialActive()).toBeFalse();
    expect(service.currentProgress()).toEqual(DEFAULT_TUTORIAL_PROGRESS);
  });

  it('should guide player through multi-step initial UI tour with Back and Next', async () => {
    let resolved = false;
    const promise = service.triggerStep(TutorialStep.FIRST_TURN).then(res => {
      resolved = true;
      return res;
    });

    expect(service.isTutorialActive()).toBeTrue();
    expect(service.activePrompt()?.step).toBe(TutorialStep.FIRST_TURN);
    expect(service.activePrompt()?.tourStepIndex).toBe(0);
    expect(service.activePrompt()?.hasPrev).toBeFalse();
    expect(resolved).toBeFalse();

    // Step 1 -> Step 2
    service.acknowledgePrompt();
    expect(service.activePrompt()?.tourStepIndex).toBe(1);
    expect(service.activePrompt()?.hasPrev).toBeTrue();
    expect(resolved).toBeFalse();

    // Step 2 -> Back to Step 1
    service.prevTourStep();
    expect(service.activePrompt()?.tourStepIndex).toBe(0);
    expect(service.activePrompt()?.hasPrev).toBeFalse();

    // Step 1 -> Step 2 -> Step 3 -> Step 4
    service.acknowledgePrompt(); // to Step 2
    service.acknowledgePrompt(); // to Step 3
    service.acknowledgePrompt(); // to Step 4
    expect(service.activePrompt()?.tourStepIndex).toBe(3);
    expect(resolved).toBeFalse();

    // Finish Tour
    service.acknowledgePrompt();
    const result = await promise;
    expect(result).toBeTrue();
    expect(resolved).toBeTrue();
    expect(service.isTutorialActive()).toBeFalse();
    expect(service.hasSeenStep(TutorialStep.FIRST_TURN)).toBeTrue();
    expect(service.hasSeenStep(TutorialStep.FIRST_BONEYARD)).toBeTrue();
  });

  it('should trigger Ace vs Two assassination step and resolve upon acknowledgment', async () => {
    let resolved = false;
    const promise = service.triggerStep(TutorialStep.ACE_ASSASSINATION).then(res => {
      resolved = true;
      return res;
    });

    expect(service.isTutorialActive()).toBeTrue();
    expect(service.activePrompt()?.step).toBe(TutorialStep.ACE_ASSASSINATION);
    expect(service.activePrompt()?.title).toContain('Assassination');
    expect(resolved).toBeFalse();

    service.acknowledgePrompt();
    const result = await promise;
    expect(result).toBeTrue();
    expect(resolved).toBeTrue();
    expect(service.hasSeenStep(TutorialStep.ACE_ASSASSINATION)).toBeTrue();
  });

  it('should not re-trigger a step once marked as seen', async () => {
    void service.triggerStep(TutorialStep.FIRST_COMPARISON);
    service.acknowledgePrompt();

    expect(service.isTutorialActive()).toBeFalse();
    expect(service.hasSeenStep(TutorialStep.FIRST_COMPARISON)).toBeTrue();

    const retriggered = await service.triggerStep(TutorialStep.FIRST_COMPARISON);
    expect(retriggered).toBeFalse();
  });

  it('should not trigger any step when tutorial is disabled in settings', async () => {
    settingsService.setTutorialEnabled(false);
    expect(service.isTutorialEnabled()).toBeFalse();

    const triggered = await service.triggerStep(TutorialStep.FIRST_COMPARISON);
    expect(triggered).toBeFalse();
    expect(service.isTutorialActive()).toBeFalse();
  });

  it('should skip tutorial and disable it in settings on skipTutorial()', async () => {
    let resolved = false;
    const promise = service.triggerStep(TutorialStep.FIRST_COMPARISON).then(() => {
      resolved = true;
    });
    expect(service.isTutorialActive()).toBeTrue();

    service.skipTutorial();
    await promise;
    expect(resolved).toBeTrue();
    expect(service.isTutorialActive()).toBeFalse();
    expect(settingsService.tutorialEnabled()).toBeFalse();
  });

  it('should reset tutorial progress independently of application settings', () => {
    service.markStepSeen(TutorialStep.FIRST_TURN);
    service.markStepSeen(TutorialStep.FIRST_BATTLE);
    expect(service.hasSeenStep(TutorialStep.FIRST_TURN)).toBeTrue();
    expect(service.hasSeenStep(TutorialStep.FIRST_BATTLE)).toBeTrue();

    service.resetTutorialProgress();
    expect(service.hasSeenStep(TutorialStep.FIRST_TURN)).toBeFalse();
    expect(service.hasSeenStep(TutorialStep.FIRST_BATTLE)).toBeFalse();
    expect(service.currentProgress()).toEqual(DEFAULT_TUTORIAL_PROGRESS);
  });

  it('should trigger granular steps individually', async () => {
    const steps = [
      TutorialStep.FIRST_COMPARISON,
      TutorialStep.ACE_ASSASSINATION,
      TutorialStep.FIRST_BATTLE,
      TutorialStep.FIRST_REINFORCEMENT,
      TutorialStep.FIRST_BATTLE_RESOLUTION,
      TutorialStep.FIRST_GAME_CONCLUSION
    ];

    for (const step of steps) {
      expect(service.hasSeenStep(step)).toBeFalse();
      const promise = service.triggerStep(step);
      expect(service.isTutorialActive()).toBeTrue();
      service.acknowledgePrompt();
      const result = await promise;
      expect(result).toBeTrue();
      expect(service.hasSeenStep(step)).toBeTrue();
    }
  });
});

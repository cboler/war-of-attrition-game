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

  it('should trigger first turn step when enabled and unseen', () => {
    const triggered = service.triggerStep(TutorialStep.FIRST_TURN);
    expect(triggered).toBeTrue();
    expect(service.isTutorialActive()).toBeTrue();
    expect(service.activePrompt()?.step).toBe(TutorialStep.FIRST_TURN);
  });

  it('should not re-trigger a step once marked as seen', () => {
    service.triggerStep(TutorialStep.FIRST_TURN);
    service.acknowledgePrompt();

    expect(service.isTutorialActive()).toBeFalse();
    expect(service.hasSeenStep(TutorialStep.FIRST_TURN)).toBeTrue();

    const retriggered = service.triggerStep(TutorialStep.FIRST_TURN);
    expect(retriggered).toBeFalse();
  });

  it('should not trigger any step when tutorial is disabled in settings', () => {
    settingsService.setTutorialEnabled(false);
    expect(service.isTutorialEnabled()).toBeFalse();

    const triggered = service.triggerStep(TutorialStep.FIRST_TURN);
    expect(triggered).toBeFalse();
    expect(service.isTutorialActive()).toBeFalse();
  });

  it('should skip tutorial and disable it in settings on skipTutorial()', () => {
    service.triggerStep(TutorialStep.FIRST_COMPARISON);
    expect(service.isTutorialActive()).toBeTrue();

    service.skipTutorial();
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

  it('should trigger granular steps individually', () => {
    const steps = [
      TutorialStep.FIRST_TURN,
      TutorialStep.FIRST_COMPARISON,
      TutorialStep.FIRST_BONEYARD,
      TutorialStep.FIRST_BATTLE,
      TutorialStep.FIRST_REINFORCEMENT,
      TutorialStep.FIRST_BATTLE_RESOLUTION,
      TutorialStep.FIRST_GAME_CONCLUSION
    ];

    for (const step of steps) {
      expect(service.hasSeenStep(step)).toBeFalse();
      expect(service.triggerStep(step)).toBeTrue();
      service.acknowledgePrompt();
      expect(service.hasSeenStep(step)).toBeTrue();
    }
  });
});

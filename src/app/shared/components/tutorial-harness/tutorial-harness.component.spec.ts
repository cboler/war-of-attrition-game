import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TutorialHarnessComponent } from './tutorial-harness.component';
import { TutorialService } from '../../../services/tutorial.service';
import { TutorialStep } from '../../../core/models/tutorial.model';

describe('TutorialHarnessComponent', () => {
  let component: TutorialHarnessComponent;
  let fixture: ComponentFixture<TutorialHarnessComponent>;
  let tutorialService: TutorialService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [TutorialHarnessComponent],
      providers: [TutorialService, provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(TutorialHarnessComponent);
    component = fixture.componentInstance;
    tutorialService = TestBed.inject(TutorialService);
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create TutorialHarnessComponent and default to FIRST_TURN', () => {
    expect(component).toBeTruthy();
    expect(tutorialService.activePrompt()?.step).toBe(TutorialStep.FIRST_TURN);
  });

  it('should switch between tutorial states via selectStep()', () => {
    component.selectStep(TutorialStep.FIRST_BATTLE);
    fixture.detectChanges();
    expect(tutorialService.activePrompt()?.step).toBe(TutorialStep.FIRST_BATTLE);

    component.selectStep(TutorialStep.FIRST_REINFORCEMENT);
    fixture.detectChanges();
    expect(tutorialService.activePrompt()?.step).toBe(TutorialStep.FIRST_REINFORCEMENT);
  });

  it('should switch viewport modes', () => {
    component.setViewport('compact');
    fixture.detectChanges();
    const stageFrame = fixture.nativeElement.querySelector('.stage-frame');
    expect(stageFrame.classList.contains('frame-compact')).toBeTrue();
  });
});

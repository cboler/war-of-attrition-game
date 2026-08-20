import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TutorialOverlayComponent } from './tutorial-overlay.component';
import { TutorialService } from '../../../services/tutorial.service';
import { TutorialStep } from '../../../core/models/tutorial.model';

describe('TutorialOverlayComponent', () => {
  let component: TutorialOverlayComponent;
  let fixture: ComponentFixture<TutorialOverlayComponent>;
  let tutorialService: TutorialService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [TutorialOverlayComponent],
      providers: [TutorialService]
    }).compileComponents();

    fixture = TestBed.createComponent(TutorialOverlayComponent);
    component = fixture.componentInstance;
    tutorialService = TestBed.inject(TutorialService);
    tutorialService.resetTutorialProgress();
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should not render anything when no active tutorial prompt exists', () => {
    expect(fixture.nativeElement.querySelector('.tutorial-overlay')).toBeNull();
  });

  it('should render overlay dialog when tutorial step is triggered', () => {
    tutorialService.forceStep(TutorialStep.FIRST_TURN);
    fixture.detectChanges();

    const overlay = fixture.nativeElement.querySelector('.tutorial-overlay');
    expect(overlay).toBeTruthy();
    expect(fixture.nativeElement.querySelector('#tutorial-title')?.textContent).toContain('Welcome Commander');
  });

  it('should acknowledge prompt when action button is clicked', () => {
    tutorialService.forceStep(TutorialStep.FIRST_TURN);
    fixture.detectChanges();

    spyOn(component.acknowledged, 'emit');
    const actionBtn = fixture.nativeElement.querySelector('.btn-action') as HTMLButtonElement;
    actionBtn.click();
    fixture.detectChanges();

    expect(component.acknowledged.emit).toHaveBeenCalled();
    expect(tutorialService.isTutorialActive()).toBeFalse();
  });

  it('should skip remaining tutorial when skip button is clicked', () => {
    tutorialService.forceStep(TutorialStep.FIRST_TURN);
    fixture.detectChanges();

    spyOn(component.skipped, 'emit');
    const skipBtn = fixture.nativeElement.querySelector('.btn-skip') as HTMLButtonElement;
    skipBtn.click();
    fixture.detectChanges();

    expect(component.skipped.emit).toHaveBeenCalled();
    expect(tutorialService.isTutorialActive()).toBeFalse();
    expect(tutorialService.isTutorialEnabled()).toBeFalse();
  });
});

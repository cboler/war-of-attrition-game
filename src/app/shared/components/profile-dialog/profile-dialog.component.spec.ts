import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { ProfileDialogComponent } from './profile-dialog.component';
import { AuthService } from '../../../core/services/auth.service';
import { SettingsService } from '../../../core/services/settings.service';
import { GameControllerService } from '../../../services/game-controller.service';
import { TutorialService } from '../../../services/tutorial.service';

describe('ProfileDialogComponent', () => {
  let component: ProfileDialogComponent;
  let fixture: ComponentFixture<ProfileDialogComponent>;
  let authService: AuthService;
  let settingsService: SettingsService;
  let gameController: GameControllerService;
  let tutorialService: TutorialService;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<ProfileDialogComponent>>;

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [ProfileDialogComponent, NoopAnimationsModule],
      providers: [
        AuthService,
        SettingsService,
        GameControllerService,
        TutorialService,
        provideRouter([]),
        { provide: MatDialogRef, useValue: dialogRefSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileDialogComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    settingsService = TestBed.inject(SettingsService);
    gameController = TestBed.inject(GameControllerService);
    tutorialService = TestBed.inject(TutorialService);
    fixture.detectChanges();
  });

  it('should create ProfileDialogComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should switch between stats, achievements, and settings tabs', () => {
    expect(component.activeTab()).toBe('stats');

    component.activeTab.set('achievements');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.achievements-tab')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.achievements-summary-card')).toBeTruthy();

    component.activeTab.set('settings');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.settings-tab')).toBeTruthy();
  });

  it('should calculate unlocked achievements percentage correctly', () => {
    expect(component.unlockedPercentage()).toBeGreaterThanOrEqual(0);
    expect(component.unlockedPercentage()).toBeLessThanOrEqual(100);
  });

  it('should reset tutorial progress on onResetTutorial()', () => {
    spyOn(tutorialService, 'resetTutorialProgress');
    spyOn(window, 'alert');
    component.onResetTutorial();
    expect(tutorialService.resetTutorialProgress).toHaveBeenCalled();
  });

  it('should allow commander name editing', () => {
    component.toggleEditName();
    expect(component.isEditingName).toBeTrue();
    component.editingName = 'General Caesar';

    spyOn(authService, 'updateProfileName');
    component.saveName();
    expect(authService.updateProfileName).toHaveBeenCalledWith('General Caesar');
    expect(component.isEditingName).toBeFalse();
  });
});

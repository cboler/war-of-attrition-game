import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
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
  let dialog: MatDialog;
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
    dialog = TestBed.inject(MatDialog);
    fixture.detectChanges();
  });

  afterEach(() => dialog.closeAll());

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

  it('keeps account and destructive controls inside Settings only', () => {
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.account-actions')).toBeFalsy();
    expect(root.querySelector('.reset-stats-btn')).toBeFalsy();
    expect(root.querySelector('.reset-settings-btn')).toBeFalsy();

    component.activeTab.set('achievements');
    fixture.detectChanges();
    expect(root.querySelector('.account-actions')).toBeFalsy();
    expect(root.querySelector('.reset-stats-btn')).toBeFalsy();

    component.activeTab.set('settings');
    fixture.detectChanges();
    expect(root.querySelector('.account-actions')).toBeTruthy();
    expect(root.querySelector('.reset-stats-btn')).toBeTruthy();
    expect(root.querySelector('.reset-settings-btn')).toBeTruthy();
    expect(root.querySelector('.reset-tutorial-btn')).toBeTruthy();
  });

  it('provides semantic, keyboard-operable tabs', fakeAsync(() => {
    const root = fixture.nativeElement as HTMLElement;
    const statsTab = root.querySelector('#profile-tab-stats') as HTMLButtonElement;
    expect(statsTab.getAttribute('role')).toBe('tab');
    expect(statsTab.getAttribute('aria-selected')).toBe('true');

    statsTab.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();
    tick();

    const achievementsTab = root.querySelector('#profile-tab-achievements') as HTMLButtonElement;
    expect(component.activeTab()).toBe('achievements');
    expect(achievementsTab.getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(achievementsTab);
  }));

  it('should calculate unlocked achievements percentage correctly', () => {
    expect(component.unlockedPercentage()).toBeGreaterThanOrEqual(0);
    expect(component.unlockedPercentage()).toBeLessThanOrEqual(100);
  });

  it('resets tutorial progress only after explicit confirmation', fakeAsync(() => {
    spyOn(tutorialService, 'resetTutorialProgress');
    component.onResetTutorial();
    fixture.detectChanges();

    const confirm = document.body.querySelector('.profile-confirm-action') as HTMLButtonElement;
    expect(confirm).toBeTruthy();
    expect(tutorialService.resetTutorialProgress).not.toHaveBeenCalled();
    confirm.click();
    tick();

    expect(tutorialService.resetTutorialProgress).toHaveBeenCalled();
    expect(component.settingsStatus()).toContain('Tutorial guidance has been reset');
  }));

  it('does not reset Career Records when confirmation is cancelled', fakeAsync(() => {
    const resetSpy = spyOn(authService, 'resetActiveUserStats');
    component.resetStats();
    fixture.detectChanges();

    const cancel = document.body.querySelector('mat-dialog-actions button') as HTMLButtonElement;
    cancel.click();
    tick();

    expect(resetSpy).not.toHaveBeenCalled();
  }));

  it('resets Career Records and Hall of Valor when confirmed', fakeAsync(() => {
    const resetSpy = spyOn(authService, 'resetActiveUserStats');
    component.resetStats();
    fixture.detectChanges();

    const confirm = document.body.querySelector('.profile-confirm-action') as HTMLButtonElement;
    expect(confirm).toBeTruthy();
    confirm.click();
    tick();

    expect(resetSpy).toHaveBeenCalled();
    expect(component.settingsStatus()).toContain('Career Records and Hall of Valor have been reset');
  }));

  it('shows Campaign progress and token-backed Requisitions', () => {
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.campaign-overview')?.textContent).toContain('CURRENT CAMPAIGN');
    expect(root.querySelector('.campaign-overview')?.textContent).toContain('of 3');

    component.activeTab.set('settings');
    fixture.detectChanges();
    expect(root.querySelector('.requisitions-section')?.textContent).toContain('Campaign tokens');
    expect(root.querySelectorAll('.backing-option').length).toBe(settingsService.cardBackingOptions().length);
  });

  it('uses a handedness switch and animation-speed radio group in settings', () => {
    component.activeTab.set('settings');
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.settings-toggles')?.textContent).toContain('Left-handed layout');
    expect(root.querySelector('.animation-speed-setting')?.tagName).toBe('FIELDSET');
    expect(root.querySelector('.animation-speed-setting legend')?.textContent).toContain('Animation speed');
    expect(root.querySelectorAll('.animation-speed-setting mat-radio-button').length).toBe(3);
  });

  it('surfaces the new rescue, Battle-streak, and Juggernaut career records', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Battle streaks');
    expect(text).toContain('2s / Aces Rescued');
    expect(text).toContain('Aces That Rescued a 2');
    expect(text).toContain('Juggernaut Cards');
  });

  it('offers explicit analytics opt-in and immediate opt-out in Data & Privacy', () => {
    component.activeTab.set('settings');
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const allow = root.querySelector('.analytics-allow-btn') as HTMLButtonElement;
    const deny = root.querySelector('.analytics-deny-btn') as HTMLButtonElement;

    allow.click();
    fixture.detectChanges();
    expect(component.analyticsConsent()).toBe('granted');
    expect(component.settingsStatus()).toContain('next War');
    expect(allow.getAttribute('aria-pressed')).toBe('true');

    deny.click();
    fixture.detectChanges();
    expect(component.analyticsConsent()).toBe('denied');
    expect(component.settingsStatus()).toContain('off');
    expect(deny.getAttribute('aria-pressed')).toBe('true');
  });

  it('guards profile switching while a War is active', () => {
    spyOn(gameController, 'hasMeaningfulUnresolvedGame').and.returnValue(true);
    const signInSpy = spyOn(authService, 'promptGoogleSignIn');
    const signOutSpy = spyOn(authService, 'signOut');

    component.signInGoogle();
    component.signOut();
    expect(signInSpy).not.toHaveBeenCalled();
    expect(signOutSpy).not.toHaveBeenCalled();
    expect(component.settingsStatus()).toContain('Finish the current War');

    component.activeTab.set('settings');
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.account-war-guard')?.textContent).toContain('Profile switching is paused');
    expect((root.querySelector('.account-actions button') as HTMLButtonElement).disabled).toBeTrue();
  });

  it('records the explicit Abandon War decision after confirmation with accurate copy', fakeAsync(() => {
    const startSpy = spyOn(gameController, 'startNewGame');

    component.onAbandonMatch();
    fixture.detectChanges();
    const dialogContent = document.body.querySelector('mat-dialog-content');
    expect(dialogContent?.textContent).toContain('spent Limited Reserves remain unchanged');

    (document.body.querySelector('.profile-confirm-action') as HTMLButtonElement).click();
    tick();

    expect(startSpy).toHaveBeenCalledOnceWith('abandon');
    expect(dialogRefSpy.close).toHaveBeenCalled();
  }));

  it('records the explicit Restart War decision after confirmation with accurate copy', fakeAsync(() => {
    const startSpy = spyOn(gameController, 'startNewGame');

    component.onRestartMatch();
    fixture.detectChanges();
    const dialogContent = document.body.querySelector('mat-dialog-content');
    expect(dialogContent?.textContent).toContain('spent Limited Reserves are unchanged');

    (document.body.querySelector('.profile-confirm-action') as HTMLButtonElement).click();
    tick();

    expect(startSpy).toHaveBeenCalledOnceWith('restart');
    expect(dialogRefSpy.close).toHaveBeenCalled();
  }));

  it('renders the authoritative environment application version in settings footer', () => {
    component.activeTab.set('settings');
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const versionCopy = root.querySelector('.version-copy');
    expect(versionCopy?.textContent).toBe(`War of Attrition · Version ${component.appVersion}`);
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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DataDeletionComponent } from './data-deletion.component';
import { AuthService } from '../../core/services/auth.service';
import { SettingsService } from '../../core/services/settings.service';
import { TelemetryConsentService } from '../../services/telemetry-consent.service';

describe('DataDeletionComponent', () => {
  let component: DataDeletionComponent;
  let fixture: ComponentFixture<DataDeletionComponent>;
  let authService: AuthService;
  let settingsService: SettingsService;
  let telemetryConsent: TelemetryConsentService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [DataDeletionComponent],
      providers: [
        AuthService,
        SettingsService,
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DataDeletionComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    settingsService = TestBed.inject(SettingsService);
    telemetryConsent = TestBed.inject(TelemetryConsentService);
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('should create Data Deletion component and render deletion instructions without auth', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('mat-card-title')?.textContent).toContain('Account & Data Deletion');
    expect(compiled.textContent).toContain('local player profiles');
  });

  it('should perform immediate local data deletion and update success state', () => {
    spyOn(authService, 'deleteAllLocalProfilesAndCreateFreshGuest').and.callThrough();
    spyOn(settingsService, 'resetSettings');

    component.performLocalDataDeletion();

    expect(authService.deleteAllLocalProfilesAndCreateFreshGuest).toHaveBeenCalled();
    expect(settingsService.resetSettings).toHaveBeenCalled();
    expect(component.deletionSuccess()).toBe(true);
  });

  it('removes only app-owned data and never re-persists an old profile', () => {
    authService.signInWithGoogle({
      name: 'Delete Me',
      email: 'delete-me@example.com',
      googleId: 'delete-me-id'
    });
    telemetryConsent.setAnalyticsConsent('granted');
    localStorage.setItem('unrelated-same-origin-key', 'preserve-me');
    sessionStorage.setItem('unrelated-session-key', 'preserve-me-too');

    component.performLocalDataDeletion();

    const profiles = localStorage.getItem('war-of-attrition-profiles') || '';
    expect(profiles).not.toContain('delete-me@example.com');
    expect(JSON.parse(profiles).length).toBe(1);
    expect(authService.activeProfile().provider).toBe('guest');
    expect(localStorage.getItem('war-of-attrition-telemetry-consent')).toBeNull();
    expect(localStorage.getItem('unrelated-same-origin-key')).toBe('preserve-me');
    expect(sessionStorage.getItem('unrelated-session-key')).toBe('preserve-me-too');
  });
});

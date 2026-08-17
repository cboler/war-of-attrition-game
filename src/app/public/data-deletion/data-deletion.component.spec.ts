import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DataDeletionComponent } from './data-deletion.component';
import { AuthService } from '../../core/services/auth.service';
import { SettingsService } from '../../core/services/settings.service';

describe('DataDeletionComponent', () => {
  let component: DataDeletionComponent;
  let fixture: ComponentFixture<DataDeletionComponent>;
  let authService: AuthService;
  let settingsService: SettingsService;

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
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create Data Deletion component and render deletion instructions without auth', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('mat-card-title')?.textContent).toContain('Account & Data Deletion');
    expect(compiled.textContent).toContain('local player profiles');
  });

  it('should perform immediate local data deletion and update success state', () => {
    spyOn(authService, 'signOut');
    spyOn(authService, 'resetActiveUserStats');
    spyOn(settingsService, 'resetSettings');

    component.performLocalDataDeletion();

    expect(authService.signOut).toHaveBeenCalled();
    expect(authService.resetActiveUserStats).toHaveBeenCalled();
    expect(settingsService.resetSettings).toHaveBeenCalled();
    expect(component.deletionSuccess()).toBe(true);
  });
});

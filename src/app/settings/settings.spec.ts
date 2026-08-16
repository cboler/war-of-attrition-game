import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Settings } from './settings';
import { SettingsService } from '../core/services/settings.service';
import { AuthService } from '../core/services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';

describe('SettingsComponent', () => {
  let component: Settings;
  let fixture: ComponentFixture<Settings>;
  let settingsService: SettingsService;
  let authService: AuthService;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    dialogSpy.open.and.returnValue({
      afterClosed: () => of(true)
    } as any);

    await TestBed.configureTestingModule({
      imports: [Settings, NoopAnimationsModule],
      providers: [
        SettingsService,
        AuthService,
        provideRouter([]),
        { provide: MatDialog, useValue: dialogSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Settings);
    component = fixture.componentInstance;
    settingsService = TestBed.inject(SettingsService);
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();
  });

  it('should create Settings component', () => {
    expect(component).toBeTruthy();
  });

  it('should format duration correctly', () => {
    const formatted = component.formatDuration(125000);
    expect(formatted).toBe('2m 5s');
  });

  it('should format last played date correctly', () => {
    const formatted = component.formatLastPlayed(new Date('2026-01-01'));
    expect(formatted).not.toBe('Never');
  });

  it('should reset settings when confirmed', () => {
    spyOn(settingsService, 'resetSettings');
    component.onResetSettings();
    expect(dialogSpy.open).toHaveBeenCalled();
    expect(settingsService.resetSettings).toHaveBeenCalled();
  });

  it('should reset active profile stats when confirmed', () => {
    spyOn(authService, 'resetActiveUserStats');
    component.onResetStatistics();
    expect(dialogSpy.open).toHaveBeenCalled();
    expect(authService.resetActiveUserStats).toHaveBeenCalled();
  });
});

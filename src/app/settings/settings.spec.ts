import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Settings } from './settings';
import { SettingsService } from '../core/services/settings.service';
import { AuthService } from '../core/services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';

describe('SettingsComponent', () => {
  let component: Settings;
  let fixture: ComponentFixture<Settings>;
  let settingsService: SettingsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Settings, NoopAnimationsModule],
      providers: [
        SettingsService,
        AuthService,
        provideRouter([]),
        { provide: MatDialog, useValue: { open: () => ({ afterClosed: () => ({ subscribe: (fn: any) => fn(true) }) }) } },
        { provide: MatSnackBar, useValue: { open: () => {} } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Settings);
    component = fixture.componentInstance;
    settingsService = TestBed.inject(SettingsService);
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

  it('should export settings as JSON file download', () => {
    spyOn(settingsService, 'exportSettings').and.returnValue('{}');
    spyOn(URL, 'createObjectURL').and.returnValue('blob:url');
    spyOn(URL, 'revokeObjectURL');

    component.onExportSettings();
    expect(settingsService.exportSettings).toHaveBeenCalled();
  });
});

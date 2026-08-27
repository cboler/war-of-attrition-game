import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Settings } from './settings';
import { SettingsService } from '../core/services/settings.service';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';

describe('SettingsComponent', () => {
  let component: Settings;
  let fixture: ComponentFixture<Settings>;
  let settingsService: SettingsService;
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
        provideRouter([]),
        { provide: MatDialog, useValue: dialogSpy }
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

  it('should reset settings when confirmed', () => {
    spyOn(settingsService, 'resetSettings');
    component.onResetSettings();
    expect(dialogSpy.open).toHaveBeenCalled();
    expect(settingsService.resetSettings).toHaveBeenCalled();
  });

  it('does not duplicate Career Records with a Statistics tab', () => {
    const labels = [...fixture.nativeElement.querySelectorAll('.mdc-tab__text-label')]
      .map((label: Element) => label.textContent?.trim());
    expect(labels).not.toContain('Statistics');
  });

  it('offers the persisted Battle Animations preference', () => {
    const labels = [...fixture.nativeElement.querySelectorAll('mat-slide-toggle')].map(
      (toggle: Element) => toggle.textContent?.trim()
    );

    expect(labels).toContain('Battle Animations');
    settingsService.setBattleAnimationsEnabled(false);
    expect(settingsService.battleAnimationsEnabled()).toBeFalse();
  });
});

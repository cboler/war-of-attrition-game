import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { SettingsService } from './core/services/settings.service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('mat-toolbar span')?.textContent).toContain('ATTRITION');
  });

  it('renders one clean, meaningfully labelled Profile control', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const profileButton = compiled.querySelector('.profile-toolbar-btn') as HTMLButtonElement;
    expect(profileButton).toBeTruthy();
    expect(profileButton.getAttribute('aria-label')).toContain('career records, achievements, and settings');
    expect(profileButton.querySelector('.profile-settings-icon')).toBeFalsy();
    expect(profileButton.querySelector('.provider-indicator')).toBeFalsy();
    expect(profileButton.querySelector('img')?.alt).toBe('');
  });

  it('moves the Profile control to the selected mobile-hand side without changing content', () => {
    const fixture = TestBed.createComponent(App);
    const settings = TestBed.inject(SettingsService);
    settings.setDeckHand('left');
    fixture.detectChanges();

    const toolbar = fixture.nativeElement.querySelector('.app-toolbar') as HTMLElement;
    expect(toolbar.classList).toContain('profile-hand-left');
    expect(toolbar.querySelector('.profile-toolbar-btn')).toBeTruthy();
    expect(toolbar.querySelector('.app-title-text')?.textContent).toContain('ATTRITION');
    settings.setDeckHand('right');
  });
});

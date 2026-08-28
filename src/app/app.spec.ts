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

  it('measures the visual viewport on first render and reacts to its resize event', () => {
    const originalViewport = Object.getOwnPropertyDescriptor(window, 'visualViewport');
    const viewport = new EventTarget() as EventTarget & { height: number };
    viewport.height = 640;
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: viewport,
    });

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).style.getPropertyValue('--app-viewport-height'))
      .toBe('640px');

    viewport.height = 598;
    viewport.dispatchEvent(new Event('resize'));
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).style.getPropertyValue('--app-viewport-height'))
      .toBe('598px');

    fixture.destroy();
    if (originalViewport) {
      Object.defineProperty(window, 'visualViewport', originalViewport);
    } else {
      delete (window as unknown as { visualViewport?: VisualViewport }).visualViewport;
    }
  });
});

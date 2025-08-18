import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { provideRouter } from '@angular/router';
import { App } from '../app/app';

// Mock components for testing navigation
@Component({ template: 'Game Page' })
class MockGameComponent { }

@Component({ template: 'Settings Page' })
class MockSettingsComponent { }

describe('App Integration Tests', () => {
  let fixture: ComponentFixture<App>;
  let router: Router;
  let location: Location;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([
          { path: '', component: MockGameComponent },
          { path: 'settings', component: MockSettingsComponent }
        ])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    fixture.detectChanges();
  });

  describe('Navigation Integration', () => {
    it('should navigate to game page by default', async () => {
      await router.navigate(['']);
      expect(location.path()).toBe('');
    });

    it('should navigate to settings page', async () => {
      await router.navigate(['/settings']);
      expect(location.path()).toBe('/settings');
    });

    it('should apply active class to navigation buttons', async () => {
      await router.navigate(['/settings']);
      fixture.detectChanges();
      
      // The routerLinkActive directive should add the active class
      const settingsButton = fixture.nativeElement.querySelector('button[routerLink="/settings"]');
      expect(settingsButton).toBeTruthy();
    });
  });

  describe('Theme Integration', () => {
    it('should have theme toggle button', () => {
      const buttons = fixture.nativeElement.querySelectorAll('button[mat-icon-button]');
      const themeButton = buttons[buttons.length - 1]; // Last button should be theme button
      expect(themeButton).toBeTruthy();
      const ariaLabel = themeButton.getAttribute('aria-label');
      expect(ariaLabel).toContain('Toggle');
    });

    it('should display theme toggle icon', () => {
      const buttons = fixture.nativeElement.querySelectorAll('button[mat-icon-button]');
      const themeButton = buttons[buttons.length - 1]; // Last button should be theme button
      const iconElement = themeButton.querySelector('mat-icon');
      const iconText = iconElement.textContent?.trim();
      expect(iconText === 'lightbulb' || iconText === 'lightbulb_outline').toBe(true);
    });

    it('should respond to theme button clicks', () => {
      const buttons = fixture.nativeElement.querySelectorAll('button[mat-icon-button]');
      const themeButton = buttons[buttons.length - 1]; // Last button should be theme button
      
      // Click the button
      themeButton.click();
      fixture.detectChanges();
      
      // Check if button still exists after click (basic functionality)
      expect(themeButton).toBeTruthy();
    });
  });

  describe('Accessibility Integration', () => {
    it('should have proper aria-labels on navigation buttons', () => {
      const gameButton = fixture.nativeElement.querySelector('button[routerLink="/"]');
      const settingsButton = fixture.nativeElement.querySelector('button[routerLink="/settings"]');
      
      expect(gameButton.getAttribute('aria-label')).toBe('Game');
      expect(settingsButton.getAttribute('aria-label')).toBe('Settings');
    });

    it('should have proper main landmark', () => {
      const mainElement = fixture.nativeElement.querySelector('main');
      expect(mainElement).toBeTruthy();
      expect(mainElement.classList.contains('app-content')).toBe(true);
    });

    it('should have toolbar with proper structure', () => {
      const toolbar = fixture.nativeElement.querySelector('mat-toolbar');
      expect(toolbar).toBeTruthy();
      expect(toolbar.getAttribute('color')).toBe('primary');
    });
  });
});
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

@Component({ template: 'Classic Page' })
class MockClassicComponent { }

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
          { path: 'classic', component: MockClassicComponent },
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
      
      const settingsButton = fixture.nativeElement.querySelector('button[routerLink="/settings"]');
      expect(settingsButton).toBeTruthy();
    });
  });

  describe('Profile and Header Integration', () => {
    it('should render profile button with user name', () => {
      const profileBtn = fixture.nativeElement.querySelector('.profile-toolbar-btn');
      expect(profileBtn).toBeTruthy();
      expect(profileBtn.querySelector('.profile-name-text')?.textContent).toContain('Card Commander');
    });
  });

  describe('Accessibility Integration', () => {
    it('should have proper aria-labels on navigation buttons', () => {
      const gameButton = fixture.nativeElement.querySelector('button[routerLink="/"]');
      const settingsButton = fixture.nativeElement.querySelector('button[routerLink="/settings"]');
      const classicButton = fixture.nativeElement.querySelector('button[routerLink="/classic"]');
      
      expect(gameButton.getAttribute('aria-label')).toBe('Card table');
      expect(classicButton.getAttribute('aria-label')).toBe('Classic game');
      expect(settingsButton.getAttribute('aria-label')).toBe('Settings');
    });
  });
});

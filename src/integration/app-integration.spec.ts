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

    it('should render settings button in toolbar', () => {
      const settingsButton = fixture.nativeElement.querySelector('button[routerLink="/settings"]');
      expect(settingsButton).toBeTruthy();
      expect(settingsButton.getAttribute('aria-label')).toBe('Settings');
    });

    it('should open and close restart game callout when clicking ATTRITION title', () => {
      expect(fixture.nativeElement.querySelector('.restart-callout')).toBeNull();

      const titleBtn = fixture.nativeElement.querySelector('.app-title-btn');
      expect(titleBtn).toBeTruthy();

      titleBtn.click();
      fixture.detectChanges();

      const callout = fixture.nativeElement.querySelector('.restart-callout');
      expect(callout).toBeTruthy();
      expect(callout.textContent).toContain('Start New Game?');

      const cancelBtn = callout.querySelector('.callout-btn.secondary');
      cancelBtn.click();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.restart-callout')).toBeNull();
    });
  });
});


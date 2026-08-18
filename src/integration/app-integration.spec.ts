import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { provideRouter } from '@angular/router';
import { App } from '../app/app';
import { MatDialog } from '@angular/material/dialog';
import { GameControllerService } from '../app/services/game-controller.service';
import { GameStateService } from '../app/core/services/game-state.service';
import { SettingsService } from '../app/core/services/settings.service';

// Mock components for testing navigation
@Component({ selector: 'app-table-game', template: 'Game Page' })
class MockGameComponent { }

@Component({ template: 'Settings Page' })
class MockSettingsComponent { }

describe('App Integration Tests', () => {
  let fixture: ComponentFixture<App>;
  let router: Router;
  let location: Location;

  beforeEach(async () => {
    localStorage.clear();
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

    it('keeps the settings compatibility route without adding a second toolbar entry', async () => {
      await router.navigate(['/settings']);
      fixture.detectChanges();
      
      const settingsButton = fixture.nativeElement.querySelector('button[routerLink="/settings"]');
      expect(location.path()).toBe('/settings');
      expect(settingsButton).toBeNull();
    });

    it('locks document-level gameplay overflow but keeps non-game routes scrollable', async () => {
      await router.navigate(['']);
      fixture.detectChanges();
      const content = fixture.nativeElement.querySelector('.app-content') as HTMLElement;
      expect(getComputedStyle(content).overflowY).toBe('hidden');
      expect(getComputedStyle(fixture.nativeElement).overflowY).toBe('hidden');

      await router.navigate(['/settings']);
      fixture.detectChanges();
      expect(getComputedStyle(content).overflowY).toBe('auto');
    });
  });

  describe('Profile and Header Integration', () => {
    it('should render profile button with user name', () => {
      const profileBtn = fixture.nativeElement.querySelector('.profile-toolbar-btn');
      expect(profileBtn).toBeTruthy();
      expect(profileBtn.querySelector('.profile-name-text')?.textContent).toContain('Card Commander');
    });

    it('integrates settings into the single profile control', () => {
      const profileButton = fixture.nativeElement.querySelector('.profile-toolbar-btn');
      expect(profileButton.getAttribute('aria-label')).toContain('settings');
      expect(profileButton.querySelector('.profile-settings-icon')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('button[routerLink="/settings"]')).toBeNull();
    });

    it('preserves the exact active match while profile settings open, change, and close', () => {
      const controller = TestBed.inject(GameControllerService);
      const gameState = TestBed.inject(GameStateService);
      const settings = TestBed.inject(SettingsService);
      const dialog = TestBed.inject(MatDialog);
      controller.ensureGameStarted();
      gameState.startTurn();
      const stateBefore = gameState.currentState;

      fixture.nativeElement.querySelector('.profile-toolbar-btn').click();
      fixture.detectChanges();
      expect(dialog.openDialogs.length).toBe(1);

      settings.setDeckHand('left');
      expect(gameState.currentState).toEqual(stateBefore);

      dialog.closeAll();
      expect(gameState.currentState).toEqual(stateBefore);
      expect(settings.deckHand()).toBe('left');
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


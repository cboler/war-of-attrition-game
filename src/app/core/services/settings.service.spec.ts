import { TestBed } from '@angular/core/testing';
import { SettingsService } from './settings.service';
import { DEFAULT_SETTINGS, CARD_BACKING_OPTIONS } from '../models/settings.model';

describe('SettingsService', () => {
  let service: SettingsService;
  let localStorageSpy: jasmine.Spy;

  beforeEach(() => {
    // Mock localStorage
    localStorageSpy = jasmine.createSpy('localStorage');
    spyOn(localStorage, 'getItem').and.returnValue(null);
    spyOn(localStorage, 'setItem');

    TestBed.configureTestingModule({});
    service = TestBed.inject(SettingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with default settings', () => {
    expect(service.currentSettings()).toEqual(DEFAULT_SETTINGS);
  });

  describe('Theme management', () => {
    it('should update theme', () => {
      service.setTheme('dark');
      expect(service.theme()).toBe('dark');
    });

    it('should update theme to light', () => {
      service.setTheme('light');
      expect(service.theme()).toBe('light');
    });

    it('should update theme to auto', () => {
      service.setTheme('auto');
      expect(service.theme()).toBe('auto');
    });
  });

  describe('Card backing management', () => {
    it('should update card backing', () => {
      const newBacking = 'classic-red';
      service.setCardBacking(newBacking);
      expect(service.selectedCardBacking()).toBe(newBacking);
    });

    it('should not update to invalid card backing', () => {
      const originalBacking = service.selectedCardBacking();
      service.setCardBacking('invalid-backing');
      expect(service.selectedCardBacking()).toBe(originalBacking);
    });

    it('should return correct selected card backing option', () => {
      service.setCardBacking('royal-purple');
      const selectedOption = service.selectedCardBackingOption();
      expect(selectedOption.id).toBe('royal-purple');
      expect(selectedOption.name).toBe('Royal Purple');
    });

    it('should return all card backing options', () => {
      expect(service.cardBackingOptions()).toEqual(CARD_BACKING_OPTIONS);
    });
  });

  describe('Game preferences', () => {
    it('should update animation speed', () => {
      service.setAnimationSpeed('fast');
      expect(service.animationSpeed()).toBe('fast');
    });

    it('should update sound enabled', () => {
      service.setSoundEnabled(false);
      expect(service.soundEnabled()).toBe(false);
    });

    it('should update show turn counter', () => {
      service.setShowTurnCounter(false);
      expect(service.showTurnCounter()).toBe(false);
    });

    it('should update confirm challenges', () => {
      service.setConfirmChallenges(true);
      expect(service.confirmChallenges()).toBe(true);
    });

    it('should update auto play animations', () => {
      service.setAutoPlayAnimations(false);
      expect(service.autoPlayAnimations()).toBe(false);
    });

    it('should update show card details', () => {
      service.setShowCardDetails(false);
      expect(service.showCardDetails()).toBe(false);
    });
  });

  describe('Statistics management', () => {
    it('should record game start', () => {
      const initialGamesPlayed = service.statistics().gamesPlayed;
      service.recordGameStart();
      expect(service.statistics().gamesPlayed).toBe(initialGamesPlayed + 1);
      expect(service.statistics().lastPlayed).toBeInstanceOf(Date);
    });

    it('should record game win', () => {
      const turns = 10;
      const duration = 60000; // 1 minute
      
      service.recordGameEnd(true, turns, duration);
      
      const stats = service.statistics();
      expect(stats.gamesWon).toBe(1);
      expect(stats.gamesLost).toBe(0);
      expect(stats.totalTurns).toBe(turns);
      expect(stats.totalPlayTime).toBe(duration);
    });

    it('should record game loss', () => {
      const turns = 15;
      const duration = 90000; // 1.5 minutes
      
      service.recordGameEnd(false, turns, duration);
      
      const stats = service.statistics();
      expect(stats.gamesWon).toBe(0);
      expect(stats.gamesLost).toBe(1);
      expect(stats.totalTurns).toBe(turns);
      expect(stats.totalPlayTime).toBe(duration);
    });

    it('should calculate averages correctly', () => {
      // Simulate 2 games
      service.recordGameStart();
      service.recordGameEnd(true, 10, 60000);
      service.recordGameStart();
      service.recordGameEnd(false, 20, 120000);
      
      const stats = service.statistics();
      expect(stats.gamesPlayed).toBe(2);
      expect(stats.averageTurnsPerGame).toBe(15); // (10 + 20) / 2
      expect(stats.averageGameDuration).toBe(90000); // (60000 + 120000) / 2
    });

    it('should reset statistics', () => {
      // Set some statistics first
      service.recordGameStart();
      service.recordGameEnd(true, 10, 60000);
      
      service.resetStatistics();
      
      const stats = service.statistics();
      expect(stats.gamesPlayed).toBe(0);
      expect(stats.gamesWon).toBe(0);
      expect(stats.gamesLost).toBe(0);
      expect(stats.totalTurns).toBe(0);
      expect(stats.totalPlayTime).toBe(0);
    });
  });

  describe('Settings management', () => {
    it('should update partial settings', () => {
      service.updateSettings({ 
        theme: 'dark', 
        soundEnabled: false 
      });
      
      expect(service.theme()).toBe('dark');
      expect(service.soundEnabled()).toBe(false);
      // Other settings should remain unchanged
      expect(service.selectedCardBacking()).toBe(DEFAULT_SETTINGS.selectedCardBacking);
    });

    it('should reset all settings', () => {
      // Change some settings first
      service.setTheme('dark');
      service.setSoundEnabled(false);
      service.setCardBacking('classic-red');
      
      service.resetSettings();
      
      expect(service.currentSettings()).toEqual(DEFAULT_SETTINGS);
    });
  });

  describe('Import/Export functionality', () => {
    it('should export settings as JSON string', () => {
      const exported = service.exportSettings();
      const parsed = JSON.parse(exported);
      expect(parsed).toEqual(service.currentSettings());
    });

    it('should import valid settings', () => {
      const customSettings = {
        theme: 'dark' as const,
        selectedCardBacking: 'classic-red',
        soundEnabled: false
      };
      
      const result = service.importSettings(JSON.stringify(customSettings));
      
      expect(result).toBe(true);
      expect(service.theme()).toBe('dark');
      expect(service.selectedCardBacking()).toBe('classic-red');
      expect(service.soundEnabled()).toBe(false);
    });

    it('should reject invalid JSON', () => {
      const result = service.importSettings('invalid json');
      expect(result).toBe(false);
    });

    it('should reject non-object data', () => {
      const result = service.importSettings('"just a string"');
      expect(result).toBe(false);
    });
  });
});
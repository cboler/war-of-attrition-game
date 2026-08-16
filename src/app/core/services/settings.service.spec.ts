import { TestBed } from '@angular/core/testing';
import { SettingsService } from './settings.service';
import { DEFAULT_SETTINGS, CARD_BACKING_OPTIONS } from '../models/settings.model';

describe('SettingsService', () => {
  let service: SettingsService;

  beforeEach(() => {
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
    expect(service.theme()).toBe('auto');
    expect(service.deckHand()).toBe('right');
  });

  describe('Theme management', () => {
    it('should update theme to dark', () => {
      service.setTheme('dark');
      expect(service.theme()).toBe('dark');
    });

    it('should update theme to light', () => {
      service.setTheme('light');
      expect(service.theme()).toBe('light');
    });
  });

  describe('Handedness management', () => {
    it('should default to right-handed', () => {
      expect(service.deckHand()).toBe('right');
    });

    it('should update deck hand to left', () => {
      service.setDeckHand('left');
      expect(service.deckHand()).toBe('left');
    });

    it('should update deck hand to right', () => {
      service.setDeckHand('left');
      service.setDeckHand('right');
      expect(service.deckHand()).toBe('right');
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

  describe('Settings management', () => {
    it('should update partial settings', () => {
      service.updateSettings({
        theme: 'dark',
        deckHand: 'left',
        soundEnabled: false
      });

      expect(service.theme()).toBe('dark');
      expect(service.deckHand()).toBe('left');
      expect(service.soundEnabled()).toBe(false);
      expect(service.selectedCardBacking()).toBe(DEFAULT_SETTINGS.selectedCardBacking);
    });

    it('should reset all settings', () => {
      service.setTheme('dark');
      service.setDeckHand('left');
      service.setSoundEnabled(false);
      service.setCardBacking('classic-red');

      service.resetSettings();

      expect(service.currentSettings()).toEqual(DEFAULT_SETTINGS);
    });

    it('should have export/import and redundant statistics removed from SettingsService', () => {
      const anyService = service as any;
      expect(anyService.exportSettings).toBeUndefined();
      expect(anyService.importSettings).toBeUndefined();
      expect(anyService.statistics).toBeUndefined();
      expect(anyService.updateStatistics).toBeUndefined();
      expect(anyService.resetStatistics).toBeUndefined();
    });
  });
});
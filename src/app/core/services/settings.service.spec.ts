import { TestBed } from '@angular/core/testing';
import { SettingsService } from './settings.service';
import { DEFAULT_SETTINGS, CARD_BACKING_OPTIONS } from '../models/settings.model';
import { CampaignProgressionService } from './campaign-progression.service';
import { APP_LOCAL_STORAGE_KEYS } from '../models/app-storage.model';

describe('SettingsService', () => {
  let service: SettingsService;
  let progression: CampaignProgressionService;

  beforeEach(() => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    spyOn(localStorage, 'setItem');

    TestBed.configureTestingModule({});
    service = TestBed.inject(SettingsService);
    progression = TestBed.inject(CampaignProgressionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with default settings', () => {
    expect(service.currentSettings()).toEqual(DEFAULT_SETTINGS);
    expect(service.deckHand()).toBe('right');
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
      progression.unlockCardBacking(newBacking, 'achievement');
      service.setCardBacking(newBacking);
      expect(service.selectedCardBacking()).toBe(newBacking);
    });

    it('should not update to invalid card backing', () => {
      const originalBacking = service.selectedCardBacking();
      service.setCardBacking('invalid-backing');
      expect(service.selectedCardBacking()).toBe(originalBacking);
    });

    it('should return correct selected card backing option', () => {
      progression.unlockCardBacking('royal-purple', 'achievement');
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

    it('uses the global animation preference without persisting a feature-specific toggle', () => {
      service.setAutoPlayAnimations(false);
      TestBed.tick();

      expect(service.autoPlayAnimations()).toBeFalse();
      const persistedSettings = (localStorage.setItem as jasmine.Spy).calls
        .allArgs()
        .filter(([key]) => key === APP_LOCAL_STORAGE_KEYS.settings)
        .map(([, value]) => JSON.parse(value) as Record<string, unknown>);
      expect(persistedSettings.some((settings) => settings['autoPlayAnimations'] === false))
        .toBeTrue();
      expect(persistedSettings.every((settings) => !('battleAnimationsEnabled' in settings)))
        .toBeTrue();
    });

    it('drops the retired Battle animation key when loading existing stored settings', () => {
      (localStorage.getItem as jasmine.Spy).and.returnValue(JSON.stringify({
        ...DEFAULT_SETTINGS,
        battleAnimationsEnabled: false,
      }));

      const loaded = (service as unknown as { loadSettings(): Record<string, unknown> })
        .loadSettings();

      expect(loaded['autoPlayAnimations']).toBeTrue();
      expect('battleAnimationsEnabled' in loaded).toBeFalse();
    });

    it('should update show card details', () => {
      service.setShowCardDetails(false);
      expect(service.showCardDetails()).toBe(false);
    });
  });

  describe('Settings management', () => {
    it('should update partial settings', () => {
      service.updateSettings({
        deckHand: 'left',
        soundEnabled: false
      });

      expect(service.deckHand()).toBe('left');
      expect(service.soundEnabled()).toBe(false);
      expect(service.selectedCardBacking()).toBe(DEFAULT_SETTINGS.selectedCardBacking);
    });

    it('should reset all settings', () => {
      service.setDeckHand('left');
      service.setSoundEnabled(false);
      progression.unlockCardBacking('classic-red', 'achievement');
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

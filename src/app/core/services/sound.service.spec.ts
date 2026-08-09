import { TestBed } from '@angular/core/testing';
import { SoundService } from './sound.service';
import { SettingsService } from './settings.service';

describe('SoundService', () => {
  let service: SoundService;
  let settingsService: SettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SoundService, SettingsService]
    });
    service = TestBed.inject(SoundService);
    settingsService = TestBed.inject(SettingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should play sound effects without error when sound is enabled', () => {
    settingsService.setSoundEnabled(true);

    expect(() => {
      service.playCardDraw();
      service.playCardFlip();
      service.playClash();
      service.playVictory();
      service.playDefeat();
    }).not.toThrow();
  });

  it('should silently skip audio when sound is disabled', () => {
    settingsService.setSoundEnabled(false);

    expect(() => {
      service.playCardDraw();
      service.playCardFlip();
      service.playClash();
      service.playVictory();
      service.playDefeat();
    }).not.toThrow();
  });
});

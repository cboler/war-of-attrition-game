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
      service.playPositiveResolution();
      service.playNegativeResolution();
      service.playBattleVictory();
      service.playBattleDefeat();
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
      service.playPositiveResolution();
      service.playNegativeResolution();
      service.playBattleVictory();
      service.playBattleDefeat();
      service.playVictory();
      service.playDefeat();
    }).not.toThrow();
  });

  it('uses distinct rising and falling sweeps for ordinary and Battle resolutions', () => {
    const resolutionSweep = spyOn<any>(service, 'playResolutionSweep');

    service.playPositiveResolution();
    service.playNegativeResolution();
    service.playBattleVictory();
    service.playBattleDefeat();

    expect(resolutionSweep.calls.allArgs()).toEqual([
      [440, 660, 0.15, 0.14, 'triangle'],
      [240, 160, 0.17, 0.11, 'sawtooth'],
      [360, 880, 0.24, 0.2, 'triangle'],
      [320, 110, 0.26, 0.17, 'sawtooth'],
    ]);
  });

  it('does not create an audio context for resolution cues when sound is disabled', () => {
    settingsService.setSoundEnabled(false);
    const getAudioContext = spyOn<any>(service, 'getAudioContext');

    service.playPositiveResolution();
    service.playNegativeResolution();
    service.playBattleVictory();
    service.playBattleDefeat();

    expect(getAudioContext).not.toHaveBeenCalled();
  });
});

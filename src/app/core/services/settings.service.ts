import { Injectable, signal, computed, effect, inject } from '@angular/core';
import {
  AppSettings,
  DEFAULT_SETTINGS,
  CardBackingOption,
  CARD_BACKING_OPTIONS
} from '../models/settings.model';
import { APP_LOCAL_STORAGE_KEYS } from '../models/app-storage.model';
import { CampaignProgressionService } from './campaign-progression.service';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly progressionService = inject(CampaignProgressionService);

  // Private signals for reactive state
  private settings = signal<AppSettings>(this.loadSettings());

  // Public readonly signals
  readonly currentSettings = this.settings.asReadonly();
  readonly deckHand = computed(() => this.currentSettings().deckHand);
  readonly selectedCardBacking = this.progressionService.selectedCardBackingId;
  readonly animationSpeed = computed(() => this.currentSettings().animationSpeed);
  readonly soundEnabled = computed(() => this.currentSettings().soundEnabled);
  readonly showTurnCounter = computed(() => this.currentSettings().showTurnCounter);
  readonly tutorialEnabled = computed(() => this.currentSettings().tutorialEnabled ?? true);
  readonly confirmChallenges = computed(() => this.currentSettings().confirmChallenges);
  readonly autoPlayAnimations = computed(() => this.currentSettings().autoPlayAnimations);
  readonly showCardDetails = computed(() => this.currentSettings().showCardDetails);

  // Card backing options
  readonly cardBackingOptions = signal<CardBackingOption[]>(CARD_BACKING_OPTIONS);
  readonly selectedCardBackingOption = computed(() =>
    this.cardBackingOptions().find(option => option.id === this.selectedCardBacking()) || CARD_BACKING_OPTIONS[0]
  );

  constructor() {
    // Auto-save settings when they change
    effect(() => {
      this.saveSettings(this.currentSettings());
    });
    effect(() => {
      const selectedCardBacking = this.selectedCardBacking();
      this.settings.update(current => current.selectedCardBacking === selectedCardBacking
        ? current
        : { ...current, selectedCardBacking });
    });
  }

  // Settings management methods
  updateSettings(partialSettings: Partial<AppSettings>): void {
    const { selectedCardBacking, ...preferences } = partialSettings;
    this.settings.update(current => ({ ...current, ...preferences }));
    if (selectedCardBacking !== undefined) {
      this.setCardBacking(selectedCardBacking);
    }
  }

  resetSettings(): void {
    this.progressionService.selectCardBacking(DEFAULT_SETTINGS.selectedCardBacking);
    this.settings.set({ ...DEFAULT_SETTINGS });
  }

  // Handedness management
  setDeckHand(hand: 'right' | 'left'): void {
    this.updateSettings({ deckHand: hand });
  }

  // Card backing management
  setCardBacking(backingId: string): void {
    if (
      this.cardBackingOptions().some(option => option.id === backingId) &&
      this.progressionService.selectCardBacking(backingId)
    ) {
      this.settings.update(current => ({ ...current, selectedCardBacking: backingId }));
    }
  }

  // Game preferences
  setAnimationSpeed(speed: 'slow' | 'normal' | 'fast'): void {
    this.updateSettings({ animationSpeed: speed });
  }

  setSoundEnabled(enabled: boolean): void {
    this.updateSettings({ soundEnabled: enabled });
  }

  setShowTurnCounter(show: boolean): void {
    this.updateSettings({ showTurnCounter: show });
  }

  setTutorialEnabled(enabled: boolean): void {
    this.updateSettings({ tutorialEnabled: enabled });
  }

  setConfirmChallenges(confirm: boolean): void {
    this.updateSettings({ confirmChallenges: confirm });
  }

  setAutoPlayAnimations(autoPlay: boolean): void {
    this.updateSettings({ autoPlayAnimations: autoPlay });
  }

  setShowCardDetails(show: boolean): void {
    this.updateSettings({ showCardDetails: show });
  }

  // Persistence methods
  private loadSettings(): AppSettings {
    try {
      const stored = localStorage.getItem(APP_LOCAL_STORAGE_KEYS.settings);
      if (stored) {
        const {
          theme: _legacyTheme,
          battleAnimationsEnabled: _legacyBattleAnimations,
          ...storedSettings
        } = JSON.parse(stored) as Partial<AppSettings> & {
          theme?: unknown;
          battleAnimationsEnabled?: unknown;
        };
        return { ...DEFAULT_SETTINGS, ...storedSettings };
      }
    } catch (error) {
      console.warn('Failed to load settings from localStorage:', error);
    }
    return { ...DEFAULT_SETTINGS };
  }

  private saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(APP_LOCAL_STORAGE_KEYS.settings, JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to save settings to localStorage:', error);
    }
  }
}

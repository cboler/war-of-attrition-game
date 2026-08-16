import { Injectable, signal, computed, effect } from '@angular/core';
import {
  AppSettings,
  DEFAULT_SETTINGS,
  DEFAULT_STATISTICS,
  GameStatistics,
  CardBackingOption,
  CARD_BACKING_OPTIONS
} from '../models/settings.model';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly STORAGE_KEY = 'war-of-attrition-settings';

  // Private signals for reactive state
  private settings = signal<AppSettings>(this.loadSettings());

  // Public readonly signals
  readonly currentSettings = this.settings.asReadonly();
  readonly deckHand = computed(() => this.currentSettings().deckHand);
  readonly selectedCardBacking = computed(() => this.currentSettings().selectedCardBacking);
  readonly animationSpeed = computed(() => this.currentSettings().animationSpeed);
  readonly soundEnabled = computed(() => this.currentSettings().soundEnabled);
  readonly showTurnCounter = computed(() => this.currentSettings().showTurnCounter);
  readonly statistics = computed(() => this.currentSettings().statistics);
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
  }

  // Settings management methods
  updateSettings(partialSettings: Partial<AppSettings>): void {
    this.settings.update(current => ({ ...current, ...partialSettings }));
  }

  resetSettings(): void {
    this.settings.set({ ...DEFAULT_SETTINGS });
  }

  // Handedness management
  setDeckHand(hand: 'right' | 'left'): void {
    this.updateSettings({ deckHand: hand });
  }

  // Card backing management
  setCardBacking(backingId: string): void {
    if (this.cardBackingOptions().some(option => option.id === backingId)) {
      this.updateSettings({ selectedCardBacking: backingId });
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

  setConfirmChallenges(confirm: boolean): void {
    this.updateSettings({ confirmChallenges: confirm });
  }

  setAutoPlayAnimations(autoPlay: boolean): void {
    this.updateSettings({ autoPlayAnimations: autoPlay });
  }

  setShowCardDetails(show: boolean): void {
    this.updateSettings({ showCardDetails: show });
  }

  // Statistics management
  updateStatistics(stats: Partial<GameStatistics>): void {
    const currentStats = this.statistics();
    const updatedStats = { ...currentStats, ...stats };

    if (updatedStats.gamesPlayed > 0) {
      updatedStats.averageTurnsPerGame = Math.round(updatedStats.totalTurns / updatedStats.gamesPlayed);
      updatedStats.averageGameDuration = Math.round(updatedStats.totalPlayTime / updatedStats.gamesPlayed);
    }

    this.updateSettings({ statistics: updatedStats });
  }

  resetStatistics(): void {
    this.updateSettings({
      statistics: { ...DEFAULT_STATISTICS }
    });
  }

  // Persistence methods
  private loadSettings(): AppSettings {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (error) {
      console.warn('Failed to load settings from localStorage:', error);
    }
    return { ...DEFAULT_SETTINGS };
  }

  private saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to save settings to localStorage:', error);
    }
  }

  // Utility methods
  exportSettings(): string {
    return JSON.stringify(this.currentSettings(), null, 2);
  }

  importSettings(settingsJson: string): boolean {
    try {
      const imported = JSON.parse(settingsJson);
      if (imported && typeof imported === 'object') {
        const merged = { ...DEFAULT_SETTINGS, ...imported };
        this.settings.set(merged);
        return true;
      }
    } catch (error) {
      if (typeof window !== 'undefined' && (window as any).console) {
        console.warn('Failed to import settings:', error);
      }
    }
    return false;
  }
}
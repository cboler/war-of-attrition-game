import { TestBed } from '@angular/core/testing';
import { AuthService } from '../core/services/auth.service';
import { CampaignProgressionService } from '../core/services/campaign-progression.service';
import { GameOutcome } from '../core/models/game-state.model';
import {
  CHAPTER_ONE_DIALOGUE,
  CHAPTER_ONE_DOSSIERS,
  CHAPTER_ONE_TRANSITIONS
} from './chapter-one-narrative.data';
import { NarrativeResolverService } from './narrative-resolver.service';

describe('NarrativeResolverService & Chapter-I Data Foundation', () => {
  let resolver: NarrativeResolverService;
  let progression: CampaignProgressionService;
  let authService: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [AuthService, CampaignProgressionService, NarrativeResolverService]
    });
    authService = TestBed.inject(AuthService);
    progression = TestBed.inject(CampaignProgressionService);
    resolver = TestBed.inject(NarrativeResolverService);
  });

  afterEach(() => localStorage.clear());

  describe('Chapter-I Data Integrity & Uniqueness', () => {
    it('contains unique IDs across all dialogue, transition, and dossier records', () => {
      const dialogueIds = CHAPTER_ONE_DIALOGUE.map(d => d.id);
      expect(new Set(dialogueIds).size).toBe(dialogueIds.length);

      const transitionIds = CHAPTER_ONE_TRANSITIONS.map(t => t.id);
      expect(new Set(transitionIds).size).toBe(transitionIds.length);

      const dossierIds = CHAPTER_ONE_DOSSIERS.map(d => d.id);
      expect(new Set(dossierIds).size).toBe(dossierIds.length);
    });

    it('attaches valid reveal IDs to narrative data', () => {
      const introMarcel = CHAPTER_ONE_DIALOGUE.find(d => d.id === 'C1W1-MAR-01');
      expect(introMarcel?.revealIds).toEqual(['R01', 'R05']);

      const contextMarcel = CHAPTER_ONE_DIALOGUE.find(d => d.id === 'C1W1-MAR-02');
      expect(contextMarcel?.revealIds).toEqual(['R02', 'R06', 'R07', 'R08', 'R09']);

      const transition1 = CHAPTER_ONE_TRANSITIONS.find(t => t.id === 'TR-C1-01');
      expect(transition1?.revealIds).toEqual(['R01', 'R02', 'R06']);
    });
  });

  describe('Authored Encounter Alignment for Chapter I', () => {
    it('resolves Marcel dialogue only for Standard War 1', () => {
      const valid = resolver.dialogueFor({
        commanderId: 'quartermaster',
        mode: 'standard',
        warIndex: 1,
        event: 'introduction',
        chapterCompleted: false
      });
      expect(valid).not.toBeNull();
      expect(valid?.id).toBe('C1W1-MAR-01');
      expect(valid?.text).toContain('Mont-Rouge');

      // Marcel queried in War 2 or in another mode returns null
      const wrongWar = resolver.dialogueFor({
        commanderId: 'quartermaster',
        mode: 'standard',
        warIndex: 2,
        event: 'introduction',
        chapterCompleted: false
      });
      expect(wrongWar).toBeNull();

      const wrongMode = resolver.dialogueFor({
        commanderId: 'quartermaster',
        mode: 'limited_reserves',
        warIndex: 1,
        event: 'introduction',
        chapterCompleted: false
      });
      expect(wrongMode).toBeNull();
    });

    it('resolves Matthias dialogue only for Standard War 2', () => {
      const valid = resolver.dialogueFor({
        commanderId: 'analyst',
        mode: 'standard',
        warIndex: 2,
        event: 'introduction',
        chapterCompleted: false
      });
      expect(valid).not.toBeNull();
      expect(valid?.id).toBe('C1W2-MAT-01');
      expect(valid?.text).toContain('Correction one');

      const wrongWar = resolver.dialogueFor({
        commanderId: 'analyst',
        mode: 'standard',
        warIndex: 1,
        event: 'introduction',
        chapterCompleted: false
      });
      expect(wrongWar).toBeNull();
    });

    it('resolves Bastien dialogue only for Standard War 3', () => {
      const valid = resolver.dialogueFor({
        commanderId: 'attritionist',
        mode: 'standard',
        warIndex: 3,
        event: 'introduction',
        chapterCompleted: false
      });
      expect(valid).not.toBeNull();
      expect(valid?.id).toBe('C1W3-BAS-01');
      expect(valid?.text).toContain('blind wheel opened seven eyes');

      const wrongWar = resolver.dialogueFor({
        commanderId: 'attritionist',
        mode: 'standard',
        warIndex: 2,
        event: 'introduction',
        chapterCompleted: false
      });
      expect(wrongWar).toBeNull();
    });
  });

  describe('Availability & Replay Filtering', () => {
    it('returns first_play dialogue on first playthrough and replay dialogue on replay', () => {
      // First play: C1W1-MAR-01 is first_play
      const firstPlayIntro = resolver.dialogueFor({
        commanderId: 'quartermaster',
        mode: 'standard',
        warIndex: 1,
        event: 'introduction',
        chapterCompleted: false
      });
      expect(firstPlayIntro?.id).toBe('C1W1-MAR-01');

      // Replay: introduction was first_play only -> returns null
      const replayIntro = resolver.dialogueFor({
        commanderId: 'quartermaster',
        mode: 'standard',
        warIndex: 1,
        event: 'introduction',
        chapterCompleted: true
      });
      expect(replayIntro).toBeNull();

      // Special clash: C1W1-MAR-03 has availability: 'replay'
      const firstPlaySpecialClash = resolver.dialogueFor({
        commanderId: 'quartermaster',
        mode: 'standard',
        warIndex: 1,
        event: 'special_clash',
        chapterCompleted: false
      });
      expect(firstPlaySpecialClash).toBeNull();

      const replaySpecialClash = resolver.dialogueFor({
        commanderId: 'quartermaster',
        mode: 'standard',
        warIndex: 1,
        event: 'special_clash',
        chapterCompleted: true
      });
      expect(replaySpecialClash?.id).toBe('C1W1-MAR-03');

      // Any availability: narrow_clash is 'any'
      const firstPlayNarrow = resolver.dialogueFor({
        commanderId: 'quartermaster',
        mode: 'standard',
        warIndex: 1,
        event: 'narrow_clash',
        chapterCompleted: false
      });
      const replayNarrow = resolver.dialogueFor({
        commanderId: 'quartermaster',
        mode: 'standard',
        warIndex: 1,
        event: 'narrow_clash',
        chapterCompleted: true
      });
      expect(firstPlayNarrow?.id).toBe('C1W1-MAR-04');
      expect(replayNarrow?.id).toBe('C1W1-MAR-04');
    });

    it('respects excludeIds to omit recently spoken line IDs', () => {
      const excluded = resolver.dialogueFor({
        commanderId: 'quartermaster',
        mode: 'standard',
        warIndex: 1,
        event: 'narrow_clash',
        chapterCompleted: false,
        excludeIds: ['C1W1-MAR-04']
      });
      expect(excluded).toBeNull();
    });
  });

  describe('Current Context Derivation', () => {
    it('dynamically looks up dialogue based on live progression signal', () => {
      // Fresh profile: War 1 against Marcel
      const intro = resolver.currentDialogue('introduction');
      expect(intro?.id).toBe('C1W1-MAR-01');

      // Resolve War 1 -> Live context becomes War 2 against Matthias
      progression.recordResolvedWar({
        warId: 'live-w1',
        outcome: GameOutcome.PLAYER_WIN,
        playerCardsRemaining: 4,
        opponentCardsRemaining: 0
      });
      const matthiasIntro = resolver.currentDialogue('introduction');
      expect(matthiasIntro?.id).toBe('C1W2-MAT-01');

      // Resolve War 2 -> Live context becomes War 3 against Bastien
      progression.recordResolvedWar({
        warId: 'live-w2',
        outcome: GameOutcome.PLAYER_WIN,
        playerCardsRemaining: 2,
        opponentCardsRemaining: 0
      });
      const bastienIntro = resolver.currentDialogue('introduction');
      expect(bastienIntro?.id).toBe('C1W3-BAS-01');
    });
  });

  describe('Narrative Transitions', () => {
    it('retrieves transitions for all standard campaign placements', () => {
      const orders = resolver.transitionFor('standard', 'orders');
      expect(orders?.id).toBe('TR-C1-01');
      expect(orders?.title).toBe('The Accord');

      const afterWar1 = resolver.transitionFor('standard', 'after_war_1');
      expect(afterWar1?.id).toBe('TR-C1-02');
      expect(afterWar1?.title).toContain('Sealed Swiss Correction');

      const afterWar2 = resolver.transitionFor('standard', 'after_war_2');
      expect(afterWar2?.id).toBe('TR-C1-03');
      expect(afterWar2?.title).toContain('Belgian Field Note');

      const complete = resolver.transitionFor('standard', 'campaign_complete');
      expect(complete?.id).toBe('TR-C1-04');
      expect(complete?.title).toBe('Campaign Dispatch');
    });
  });

  describe('Progressive Dossier Firewall and Unlocks', () => {
    it('unlocks dossier entries strictly as the player reaches and completes Wars in Chapter I', () => {
      // 0 Wars completed
      const marcel0 = resolver.dossierFor('quartermaster');
      expect(marcel0.map(d => d.id)).toEqual(['DOS-MAR-01']); // Overview only
      expect(resolver.dossierFor('analyst')).toEqual([]);
      expect(resolver.dossierFor('attritionist')).toEqual([]);

      // Resolve War 1 (Marcel defeated)
      progression.recordResolvedWar({
        warId: 'dossier-w1',
        outcome: GameOutcome.PLAYER_WIN,
        playerCardsRemaining: 3,
        opponentCardsRemaining: 0
      });

      const marcel1 = resolver.dossierFor('quartermaster');
      expect(marcel1.map(d => d.id)).toEqual(['DOS-MAR-01', 'DOS-MAR-02']); // Overview + Mont-Rouge Record
      const matthias1 = resolver.dossierFor('analyst');
      expect(matthias1.map(d => d.id)).toEqual(['DOS-MAT-01']); // Matthias overview unlocked
      expect(resolver.dossierFor('attritionist')).toEqual([]);

      // Resolve War 2 (Matthias defeated)
      progression.recordResolvedWar({
        warId: 'dossier-w2',
        outcome: GameOutcome.PLAYER_WIN,
        playerCardsRemaining: 2,
        opponentCardsRemaining: 0
      });

      const matthias2 = resolver.dossierFor('analyst');
      expect(matthias2.map(d => d.id)).toEqual(['DOS-MAT-01', 'DOS-MAT-02']);
      const bastien2 = resolver.dossierFor('attritionist');
      expect(bastien2.map(d => d.id)).toEqual(['DOS-BAS-01']); // Bastien overview unlocked

      // Resolve War 3 (Campaign Completed)
      progression.recordResolvedWar({
        warId: 'dossier-w3',
        outcome: GameOutcome.PLAYER_WIN,
        playerCardsRemaining: 5,
        opponentCardsRemaining: 0
      });

      const bastienComplete = resolver.dossierFor('attritionist');
      expect(bastienComplete.map(d => d.id)).toEqual(['DOS-BAS-01', 'DOS-BAS-02']); // Archived statement unlocked
    });

    it('prevents future-chapter content leaks and protects unreached dossiers on new campaigns', () => {
      // In a fresh unstarted campaign, Edmund and Lorenzo (who have no Chapter 1 dossiers) return empty lists
      expect(resolver.dossierFor('gambler')).toEqual([]);
      expect(resolver.dossierFor('cornered-general')).toEqual([]);
    });
  });
});

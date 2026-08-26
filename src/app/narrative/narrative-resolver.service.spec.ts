import { TestBed } from '@angular/core/testing';
import { AuthService } from '../core/services/auth.service';
import { CampaignProgressionService } from '../core/services/campaign-progression.service';
import { GameOutcome } from '../core/models/game-state.model';
import {
  CHAPTER_ONE_DIALOGUE,
  CHAPTER_ONE_DOSSIERS,
  CHAPTER_ONE_TRANSITIONS
} from './chapter-one-narrative.data';
import {
  CHAPTER_TWO_DIALOGUE,
  CHAPTER_TWO_DOSSIERS,
  CHAPTER_TWO_TRANSITIONS
} from './chapter-two-narrative.data';
import {
  CHAPTER_THREE_DIALOGUE,
  CHAPTER_THREE_DOSSIERS,
  CHAPTER_THREE_TRANSITIONS
} from './chapter-three-narrative.data';
import {
  CHAPTER_FOUR_DIALOGUE,
  CHAPTER_FOUR_DOSSIERS,
  CHAPTER_FOUR_TRANSITIONS
} from './chapter-four-narrative.data';
import {
  ALL_AUTHORED_DIALOGUE,
  ALL_COMMANDER_DOSSIERS,
  ALL_EVERGREEN_DIALOGUE,
  ALL_NARRATIVE_TRANSITIONS,
  NarrativeResolverService
} from './narrative-resolver.service';
import { EVERGREEN_DIALOGUE } from './evergreen-narrative.data';

describe('NarrativeResolverService & Four-Chapter Data Architecture', () => {
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

  describe('Four-Chapter Data Integrity, Exact Counts & Uniqueness', () => {
    it('contains exact authored record counts across all chapters and evergreen pool', () => {
      // Exactly 16 records per encounter, 48 per chapter, 192 encounter total
      expect(CHAPTER_ONE_DIALOGUE.length).toBe(48);
      expect(CHAPTER_TWO_DIALOGUE.length).toBe(48);
      expect(CHAPTER_THREE_DIALOGUE.length).toBe(48);
      expect(CHAPTER_FOUR_DIALOGUE.length).toBe(48);

      // Exactly 35 evergreen reserve records (7 per commander)
      expect(EVERGREEN_DIALOGUE.length).toBe(35);
      expect(ALL_EVERGREEN_DIALOGUE.length).toBe(35);
      const commanders = ['quartermaster', 'analyst', 'gambler', 'cornered-general', 'attritionist'] as const;
      for (const cmd of commanders) {
        expect(EVERGREEN_DIALOGUE.filter(d => d.commanderId === cmd).length).toBe(7);
      }

      // Total authored dialogue records = 192 + 35 = 227
      expect(ALL_AUTHORED_DIALOGUE.length).toBe(227);

      // Exactly 4 transitions per chapter (Orders, War 1->2, War 2->3, Campaign Complete), 16 total
      expect(CHAPTER_ONE_TRANSITIONS.length).toBe(4);
      expect(CHAPTER_TWO_TRANSITIONS.length).toBe(4);
      expect(CHAPTER_THREE_TRANSITIONS.length).toBe(4);
      expect(CHAPTER_FOUR_TRANSITIONS.length).toBe(4);
      expect(ALL_NARRATIVE_TRANSITIONS.length).toBe(16);

      // Dossiers: 6 (Ch I) + 6 (Ch II) + 7 (Ch III) + 5 (Ch IV) = 24 total
      expect(CHAPTER_ONE_DOSSIERS.length).toBe(6);
      expect(CHAPTER_TWO_DOSSIERS.length).toBe(6);
      expect(CHAPTER_THREE_DOSSIERS.length).toBe(7);
      expect(CHAPTER_FOUR_DOSSIERS.length).toBe(5);
      expect(ALL_COMMANDER_DOSSIERS.length).toBe(24);
    });

    it('contains strictly unique IDs across all dialogue, transition, and dossier records', () => {
      const dialogueIds = ALL_AUTHORED_DIALOGUE.map(d => d.id);
      expect(new Set(dialogueIds).size).toBe(227);

      const transitionIds = ALL_NARRATIVE_TRANSITIONS.map(t => t.id);
      expect(new Set(transitionIds).size).toBe(16);

      const dossierIds = ALL_COMMANDER_DOSSIERS.map(d => d.id);
      expect(new Set(dossierIds).size).toBe(24);
    });


    it('attaches valid reveal IDs to narrative data across all chapters', () => {
      // Chapter I sample
      const c1IntroMarcel = ALL_AUTHORED_DIALOGUE.find(d => d.id === 'C1W1-MAR-01');
      expect(c1IntroMarcel?.revealIds).toEqual(['R01', 'R05']);

      // Chapter II sample
      const c2IntroEdmund = ALL_AUTHORED_DIALOGUE.find(d => d.id === 'C2W1-EDM-01');
      expect(c2IntroEdmund?.revealIds).toEqual(['R10']);
      const c2Transition4 = ALL_NARRATIVE_TRANSITIONS.find(t => t.id === 'TR-C2-04');
      expect(c2Transition4?.revealIds).toEqual(['R18', 'R19']);

      // Chapter III sample
      const c3IntroMatthias = ALL_AUTHORED_DIALOGUE.find(d => d.id === 'C3W1-MAT-01');
      expect(c3IntroMatthias?.revealIds).toEqual(['R20']);
      const c3Transition2 = ALL_NARRATIVE_TRANSITIONS.find(t => t.id === 'TR-C3-02');
      expect(c3Transition2?.revealIds).toEqual(['R20', 'R22', 'R23', 'R24']);

      // Chapter IV sample
      const c4IntroEdmund = ALL_AUTHORED_DIALOGUE.find(d => d.id === 'C4W1-EDM-01');
      expect(c4IntroEdmund?.revealIds).toEqual(['R27']);
      const c4Transition4 = ALL_NARRATIVE_TRANSITIONS.find(t => t.id === 'TR-C4-04');
      expect(c4Transition4?.revealIds).toEqual(['R29', 'R30', 'R37']);
    });
  });

  describe('Authored Encounter Alignment Across All 12 Canonical Wars', () => {
    const canonicalSchedule = [
      { mode: 'standard' as const, warIndex: 1 as const, commanderId: 'quartermaster' as const, introId: 'C1W1-MAR-01' },
      { mode: 'standard' as const, warIndex: 2 as const, commanderId: 'analyst' as const, introId: 'C1W2-MAT-01' },
      { mode: 'standard' as const, warIndex: 3 as const, commanderId: 'attritionist' as const, introId: 'C1W3-BAS-01' },

      { mode: 'limited_reserves' as const, warIndex: 1 as const, commanderId: 'gambler' as const, introId: 'C2W1-EDM-01' },
      { mode: 'limited_reserves' as const, warIndex: 2 as const, commanderId: 'cornered-general' as const, introId: 'C2W2-LOR-01' },
      { mode: 'limited_reserves' as const, warIndex: 3 as const, commanderId: 'quartermaster' as const, introId: 'C2W3-MAR-01' },

      { mode: 'fog_of_war' as const, warIndex: 1 as const, commanderId: 'analyst' as const, introId: 'C3W1-MAT-01' },
      { mode: 'fog_of_war' as const, warIndex: 2 as const, commanderId: 'quartermaster' as const, introId: 'C3W2-MAR-01' },
      { mode: 'fog_of_war' as const, warIndex: 3 as const, commanderId: 'attritionist' as const, introId: 'C3W3-BAS-01' },

      { mode: 'total_war' as const, warIndex: 1 as const, commanderId: 'gambler' as const, introId: 'C4W1-EDM-01' },
      { mode: 'total_war' as const, warIndex: 2 as const, commanderId: 'cornered-general' as const, introId: 'C4W2-LOR-01' },
      { mode: 'total_war' as const, warIndex: 3 as const, commanderId: 'analyst' as const, introId: 'C4W3-MAT-01' }
    ];

    it('resolves the exact authored introduction for every encounter', () => {
      for (const enc of canonicalSchedule) {
        const line = resolver.dialogueFor({
          commanderId: enc.commanderId,
          mode: enc.mode,
          warIndex: enc.warIndex,
          event: 'introduction',
          chapterCompleted: false
        });
        expect(line).not.toBeNull();
        expect(line?.id).toBe(enc.introId);
      }
    });

    it('returns null when querying an unassigned commander for a mode and warIndex', () => {
      // In Chapter II War 1, opponent is Edmund ('gambler'). Querying Marcel ('quartermaster') must return null.
      const wrong = resolver.dialogueFor({
        commanderId: 'quartermaster',
        mode: 'limited_reserves',
        warIndex: 1,
        event: 'introduction',
        chapterCompleted: false
      });
      expect(wrong).toBeNull();
    });
  });

  describe('Availability & Replay Filtering', () => {
    it('returns first_play on first playthrough and replay lines on replay', () => {
      // Chapter II War 1: C2W1-EDM-01 is first_play introduction
      const firstPlayIntro = resolver.dialogueFor({
        commanderId: 'gambler',
        mode: 'limited_reserves',
        warIndex: 1,
        event: 'introduction',
        chapterCompleted: false
      });
      expect(firstPlayIntro?.id).toBe('C2W1-EDM-01');

      const replayIntro = resolver.dialogueFor({
        commanderId: 'gambler',
        mode: 'limited_reserves',
        warIndex: 1,
        event: 'introduction',
        chapterCompleted: true
      });
      expect(replayIntro).toBeNull();

      // C2W1-EDM-13 is first_play, C2W1-EDM-14 is replay
      const firstPlayContextual = resolver.dialogueFor({
        commanderId: 'gambler',
        mode: 'limited_reserves',
        warIndex: 1,
        event: 'contextual',
        chapterCompleted: false
      });
      expect(firstPlayContextual?.id).toBe('C2W1-EDM-13');

      const replayContextual = resolver.dialogueFor({
        commanderId: 'gambler',
        mode: 'limited_reserves',
        warIndex: 1,
        event: 'contextual',
        chapterCompleted: true
      });
      expect(replayContextual?.id).toBe('C2W1-EDM-14');
    });




    it('respects excludeIds to omit recently spoken lines', () => {
      const excluded = resolver.dialogueFor({
        commanderId: 'gambler',
        mode: 'limited_reserves',
        warIndex: 1,
        event: 'narrow_clash',
        chapterCompleted: false,
        excludeIds: ['C2W1-EDM-04', 'EV-EDM-02']
      });
      expect(excluded).toBeNull();
    });
  });

  describe('Evergreen Reserve Fallback Resolution', () => {
    it('falls back to evergreen dialogue when no encounter-specific line exists in randomized replay', () => {
      // In Chapter I War 1, Lorenzo has no encounter dialogue.
      // But Lorenzo has evergreen dialogue for 'special_clash' (EV-LOR-01).
      const fallbackSpecial = resolver.dialogueFor({
        commanderId: 'cornered-general',
        mode: 'standard',
        warIndex: 1,
        event: 'special_clash',
        chapterCompleted: true
      });
      expect(fallbackSpecial).not.toBeNull();
      expect(fallbackSpecial?.id).toBe('EV-LOR-01');
      expect(fallbackSpecial?.text).toBe('Even an Ace has an unguarded road.');

      // Lorenzo evergreen 'concession' (EV-LOR-06)
      const fallbackConcession = resolver.dialogueFor({
        commanderId: 'cornered-general',
        mode: 'standard',
        warIndex: 1,
        event: 'concession',
        chapterCompleted: true
      });
      expect(fallbackConcession?.id).toBe('EV-LOR-06');
      expect(fallbackConcession?.text).toBe('Choose the ground. Yield the card.');
    });

    it('prefers encounter-specific line over evergreen line when encounter line exists', () => {
      // Marcel in Chapter I War 1 has encounter line C1W1-MAR-04 for narrow_clash
      const encounterLine = resolver.dialogueFor({
        commanderId: 'quartermaster',
        mode: 'standard',
        warIndex: 1,
        event: 'narrow_clash',
        chapterCompleted: false
      });
      expect(encounterLine?.id).toBe('C1W1-MAR-04');
      expect(encounterLine?.id).not.toBe('EV-MAR-02');
    });


    it('respects excludeIds when selecting evergreen lines', () => {
      const excluded = resolver.dialogueFor({
        commanderId: 'cornered-general',
        mode: 'standard',
        warIndex: 1,
        event: 'special_clash',
        chapterCompleted: true,
        excludeIds: ['EV-LOR-01']
      });
      expect(excluded).toBeNull();
    });
  });


  describe('Narrative Transitions for All Four Chapters', () => {
    it('retrieves all 16 transition records at their correct placements', () => {
      const placements = ['orders', 'after_war_1', 'after_war_2', 'campaign_complete'] as const;
      const modes = ['standard', 'limited_reserves', 'fog_of_war', 'total_war'] as const;

      for (let c = 0; c < modes.length; c++) {
        const mode = modes[c];
        const chapterNum = c + 1;
        for (let p = 0; p < placements.length; p++) {
          const placement = placements[p];
          const trans = resolver.transitionFor(mode, placement);
          expect(trans).toBeTruthy();
          expect(trans?.id).toBe(`TR-C${chapterNum}-0${p + 1}`);
          expect(trans?.mode).toBe(mode);
          expect(trans?.placement).toBe(placement);
        }
      }
    });
  });

  describe('Progressive Dossier Progression', () => {
    it('unlocks dossiers across the entire story without future disclosures', () => {
      // 1. Initial State: Only Marcel has 1 entry (DOS-MAR-01)
      expect(resolver.dossierFor('quartermaster').map(d => d.id)).toEqual(['DOS-MAR-01']);
      expect(resolver.dossierFor('analyst')).toEqual([]);
      expect(resolver.dossierFor('attritionist')).toEqual([]);
      expect(resolver.dossierFor('gambler')).toEqual([]);
      expect(resolver.dossierFor('cornered-general')).toEqual([]);

      // 2. Complete Chapter I
      progression.selectCampaignOrders('standard');
      progression.recordResolvedWar({ warId: 'w1', outcome: GameOutcome.PLAYER_WIN, playerCardsRemaining: 5, opponentCardsRemaining: 0 });
      progression.recordResolvedWar({ warId: 'w2', outcome: GameOutcome.PLAYER_WIN, playerCardsRemaining: 5, opponentCardsRemaining: 0 });
      progression.recordResolvedWar({ warId: 'w3', outcome: GameOutcome.PLAYER_WIN, playerCardsRemaining: 5, opponentCardsRemaining: 0 });

      expect(resolver.dossierFor('quartermaster').map(d => d.id)).toEqual(['DOS-MAR-01', 'DOS-MAR-02']);
      expect(resolver.dossierFor('analyst').map(d => d.id)).toEqual(['DOS-MAT-01', 'DOS-MAT-02']);
      expect(resolver.dossierFor('attritionist').map(d => d.id)).toEqual(['DOS-BAS-01', 'DOS-BAS-02']);
      expect(resolver.dossierFor('gambler')).toEqual([]);
      expect(resolver.dossierFor('cornered-general')).toEqual([]);

      // 3. Start Chapter II: War 1 against Edmund (0 wars completed in Ch2)
      progression.selectCampaignOrders('limited_reserves');
      expect(resolver.dossierFor('gambler').map(d => d.id)).toEqual(['DOS-EDM-01']); // Overview unlocked on first encounter
      expect(resolver.dossierFor('cornered-general')).toEqual([]);

      // Complete War 1 in Ch2
      progression.recordResolvedWar({ warId: 'c2w1', outcome: GameOutcome.PLAYER_WIN, playerCardsRemaining: 4, opponentCardsRemaining: 0 });
      expect(resolver.dossierFor('gambler').map(d => d.id)).toEqual(['DOS-EDM-01', 'DOS-EDM-02']);
      expect(resolver.dossierFor('cornered-general').map(d => d.id)).toEqual(['DOS-LOR-01']); // Lorenzo overview unlocked

      // Complete War 2 in Ch2
      progression.recordResolvedWar({ warId: 'c2w2', outcome: GameOutcome.PLAYER_WIN, playerCardsRemaining: 3, opponentCardsRemaining: 0 });
      expect(resolver.dossierFor('cornered-general').map(d => d.id)).toEqual(['DOS-LOR-01', 'DOS-LOR-02']);

      // Complete War 3 in Ch2 (Chapter II complete)
      progression.recordResolvedWar({ warId: 'c2w3', outcome: GameOutcome.PLAYER_WIN, playerCardsRemaining: 3, opponentCardsRemaining: 0 });
      expect(resolver.dossierFor('quartermaster').map(d => d.id)).toEqual(['DOS-MAR-01', 'DOS-MAR-02', 'DOS-MAR-03']);
      expect(resolver.dossierFor('attritionist').map(d => d.id)).toEqual(['DOS-BAS-01', 'DOS-BAS-02', 'DOS-BAS-03']);

      // 4. Complete Chapter III
      progression.selectCampaignOrders('fog_of_war');
      progression.recordResolvedWar({ warId: 'c3w1', outcome: GameOutcome.PLAYER_WIN, playerCardsRemaining: 4, opponentCardsRemaining: 0 });
      progression.recordResolvedWar({ warId: 'c3w2', outcome: GameOutcome.PLAYER_WIN, playerCardsRemaining: 4, opponentCardsRemaining: 0 });
      progression.recordResolvedWar({ warId: 'c3w3', outcome: GameOutcome.PLAYER_WIN, playerCardsRemaining: 4, opponentCardsRemaining: 0 });

      expect(resolver.dossierFor('analyst').map(d => d.id)).toEqual(['DOS-MAT-01', 'DOS-MAT-02', 'DOS-MAT-03', 'DOS-MAT-04']);
      expect(resolver.dossierFor('quartermaster').map(d => d.id)).toEqual(['DOS-MAR-01', 'DOS-MAR-02', 'DOS-MAR-03', 'DOS-MAR-04']);
      expect(resolver.dossierFor('gambler').map(d => d.id)).toEqual(['DOS-EDM-01', 'DOS-EDM-02', 'DOS-EDM-03']);
      expect(resolver.dossierFor('cornered-general').map(d => d.id)).toEqual(['DOS-LOR-01', 'DOS-LOR-02', 'DOS-LOR-03']);
      expect(resolver.dossierFor('attritionist').map(d => d.id)).toEqual(['DOS-BAS-01', 'DOS-BAS-02', 'DOS-BAS-03', 'DOS-BAS-04', 'DOS-BAS-05']);

      // 5. Complete Chapter IV
      progression.selectCampaignOrders('total_war');
      progression.recordResolvedWar({ warId: 'c4w1', outcome: GameOutcome.PLAYER_WIN, playerCardsRemaining: 4, opponentCardsRemaining: 0 });
      progression.recordResolvedWar({ warId: 'c4w2', outcome: GameOutcome.PLAYER_WIN, playerCardsRemaining: 4, opponentCardsRemaining: 0 });
      progression.recordResolvedWar({ warId: 'c4w3', outcome: GameOutcome.PLAYER_WIN, playerCardsRemaining: 4, opponentCardsRemaining: 0 });

      // Final complete state across all 5 commanders
      expect(resolver.dossierFor('quartermaster').map(d => d.id)).toEqual(['DOS-MAR-01', 'DOS-MAR-02', 'DOS-MAR-03', 'DOS-MAR-04', 'DOS-MAR-05']);
      expect(resolver.dossierFor('analyst').map(d => d.id)).toEqual(['DOS-MAT-01', 'DOS-MAT-02', 'DOS-MAT-03', 'DOS-MAT-04', 'DOS-MAT-05']);
      expect(resolver.dossierFor('gambler').map(d => d.id)).toEqual(['DOS-EDM-01', 'DOS-EDM-02', 'DOS-EDM-03', 'DOS-EDM-04']);
      expect(resolver.dossierFor('cornered-general').map(d => d.id)).toEqual(['DOS-LOR-01', 'DOS-LOR-02', 'DOS-LOR-03', 'DOS-LOR-04']);
      expect(resolver.dossierFor('attritionist').map(d => d.id)).toEqual(['DOS-BAS-01', 'DOS-BAS-02', 'DOS-BAS-03', 'DOS-BAS-04', 'DOS-BAS-05', 'DOS-BAS-06']);
    });
  });
});

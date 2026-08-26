import { TestBed } from '@angular/core/testing';
import { CampaignProgressionService } from '../core/services/campaign-progression.service';
import { AuthService } from '../core/services/auth.service';
import { NarrativeResolverService } from './narrative-resolver.service';
import { TableReactionService } from '../services/table-reaction.service';
import { GameOutcome } from '../core/models/game-state.model';
import { OpponentCommanderId } from '../core/models/commander.model';

describe('Twelve-War Narrative Traversal & Spoiler Firewall', () => {
  let progression: CampaignProgressionService;
  let authService: AuthService;
  let narrative: NarrativeResolverService;
  let reactionService: TableReactionService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [AuthService, CampaignProgressionService, NarrativeResolverService, TableReactionService]
    });
    progression = TestBed.inject(CampaignProgressionService);
    authService = TestBed.inject(AuthService);
    narrative = TestBed.inject(NarrativeResolverService);
    reactionService = TestBed.inject(TableReactionService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('runs complete 12-War sequential narrative traversal across Chapters I through IV', () => {
    const expectedSchedule: {
      chapter: number;
      mode: 'standard' | 'limited_reserves' | 'fog_of_war' | 'total_war';
      warIndex: 1 | 2 | 3;
      expectedCommander: OpponentCommanderId;
      expectedName: string;
      introTextSubstring: string;
      resolutionTextSubstring: string;
    }[] = [
      // Chapter I — Standard — “The Accord”
      { chapter: 1, mode: 'standard', warIndex: 1, expectedCommander: 'quartermaster', expectedName: 'Marcel de Brie', introTextSubstring: 'Mont-Rouge', resolutionTextSubstring: 'stand beside me' },
      { chapter: 1, mode: 'standard', warIndex: 2, expectedCommander: 'analyst', expectedName: 'Matthias von Greyerz', introTextSubstring: 'Swiss wheel', resolutionTextSubstring: 'abandonment' },
      { chapter: 1, mode: 'standard', warIndex: 3, expectedCommander: 'attritionist', expectedName: 'Bastien de Herve', introTextSubstring: 'seven eyes', resolutionTextSubstring: 'traitor who was never born' },

      // Chapter II — Limited Reserves — “The Closing Passes”
      { chapter: 2, mode: 'limited_reserves', warIndex: 1, expectedCommander: 'gambler', expectedName: 'Sir Edmund Gloucester', introTextSubstring: 'asked for time', resolutionTextSubstring: 'bluff' },
      { chapter: 2, mode: 'limited_reserves', warIndex: 2, expectedCommander: 'cornered-general', expectedName: 'Lorenzo di Taleggio', introTextSubstring: 'sealed wagon', resolutionTextSubstring: 'restriction' },
      { chapter: 2, mode: 'limited_reserves', warIndex: 3, expectedCommander: 'quartermaster', expectedName: 'Marcel de Brie', introTextSubstring: 'expensive paper', resolutionTextSubstring: 'first blade' },

      // Chapter III — Fog of War — “The Blind Wheel”
      { chapter: 3, mode: 'fog_of_war', warIndex: 1, expectedCommander: 'analyst', expectedName: 'Matthias von Greyerz', introTextSubstring: 'steward’s deposition', resolutionTextSubstring: 'does not establish' },
      { chapter: 3, mode: 'fog_of_war', warIndex: 2, expectedCommander: 'quartermaster', expectedName: 'Marcel de Brie', introTextSubstring: 'cellar ledger', resolutionTextSubstring: 'matured the rest in anger' },
      { chapter: 3, mode: 'fog_of_war', warIndex: 3, expectedCommander: 'attritionist', expectedName: 'Bastien de Herve', introTextSubstring: 'open the wheel again', resolutionTextSubstring: 'traitor remains absent' },

      // Chapter IV — Total War — “The War of Attrition”
      { chapter: 4, mode: 'total_war', warIndex: 1, expectedCommander: 'gambler', expectedName: 'Sir Edmund Gloucester', introTextSubstring: 'waiting bored me', resolutionTextSubstring: 'stillness feel like shame' },
      { chapter: 4, mode: 'total_war', warIndex: 2, expectedCommander: 'cornered-general', expectedName: 'Lorenzo di Taleggio', introTextSubstring: 'heard the key turn', resolutionTextSubstring: 'Urgency made it real' },
      { chapter: 4, mode: 'total_war', warIndex: 3, expectedCommander: 'analyst', expectedName: 'Matthias von Greyerz', introTextSubstring: 'called the sequence proof', resolutionTextSubstring: 'I never proved it.' }
    ];

    let currentWarGlobalIndex = 0;

    for (let c = 1; c <= 4; c++) {
      const mode = c === 1 ? 'standard' : c === 2 ? 'limited_reserves' : c === 3 ? 'fog_of_war' : 'total_war';

      // Verify Chapter unlocked
      expect(progression.isChapterUnlocked(mode)).toBeTrue();

      // Verify Orders framing transition
      const ordersFraming = narrative.transitionFor(mode, 'orders');
      expect(ordersFraming).toBeTruthy();
      expect(ordersFraming?.placement).toBe('orders');

      // Select orders
      expect(progression.selectCampaignOrders(mode)).toBeTrue();

      for (let w = 1; w <= 3; w++) {
        const step = expectedSchedule[currentWarGlobalIndex];
        expect(progression.campaignWarIndex()).toBe(w as 1 | 2 | 3);
        expect(progression.activeCampaignMode()).toBe(mode);

        const currentIdentity = progression.currentCommanderIdentity();
        expect(currentIdentity.commanderId).toBe(step.expectedCommander);
        expect(currentIdentity.name).toBe(step.expectedName);

        // Verify Introduction Line
        const intro = reactionService.forIntroduction(currentIdentity.commanderId);
        expect(intro).toBeTruthy();
        expect(intro?.message).toContain(step.introTextSubstring);

        // Verify Resolution Line
        const resolution = narrative.dialogueFor({
          commanderId: currentIdentity.commanderId,
          mode,
          warIndex: w as 1 | 2 | 3,
          event: 'resolution',
          chapterCompleted: false
        });
        expect(resolution).toBeTruthy();
        expect(resolution?.text).toContain(step.resolutionTextSubstring);

        // Resolve War
        const result = progression.recordResolvedWar({
          warId: `war-${c}-${w}`,
          outcome: GameOutcome.PLAYER_WIN,
          playerCardsRemaining: 5,
          opponentCardsRemaining: 0
        });

        // Verify between-war or campaign-complete transition
        if (w === 1) {
          const trans1 = narrative.transitionFor(mode, 'after_war_1');
          expect(trans1).toBeTruthy();
        } else if (w === 2) {
          const trans2 = narrative.transitionFor(mode, 'after_war_2');
          expect(trans2).toBeTruthy();
        } else if (w === 3) {
          const transComp = narrative.transitionFor(mode, 'campaign_complete');
          expect(transComp).toBeTruthy();
          expect(result.completedCampaign).toBeTruthy();
          expect(progression.isChapterCompleted(mode)).toBeTrue();
        }

        currentWarGlobalIndex++;
      }
    }

    // All 12 Wars complete: All four chapters completed
    expect(progression.isChapterCompleted('standard')).toBeTrue();
    expect(progression.isChapterCompleted('limited_reserves')).toBeTrue();
    expect(progression.isChapterCompleted('fog_of_war')).toBeTrue();
    expect(progression.isChapterCompleted('total_war')).toBeTrue();
  });

  describe('Spoiler Firewall Verification', () => {
    it('enforces strict firewall on brand-new profile', () => {
      expect(progression.isChapterUnlocked('standard')).toBeTrue();
      expect(progression.isChapterUnlocked('limited_reserves')).toBeFalse();
      expect(progression.isChapterUnlocked('fog_of_war')).toBeFalse();
      expect(progression.isChapterUnlocked('total_war')).toBeFalse();

      // Only Marcel Overview is unlocked
      expect(narrative.dossierFor('quartermaster').map(d => d.id)).toEqual(['DOS-MAR-01']);
      expect(narrative.dossierFor('analyst')).toEqual([]);
      expect(narrative.dossierFor('attritionist')).toEqual([]);
      expect(narrative.dossierFor('gambler')).toEqual([]);
      expect(narrative.dossierFor('cornered-general')).toEqual([]);
    });

    it('enforces strict firewall after Chapter I', () => {
      progression.selectCampaignOrders('standard');
      progression.recordResolvedWar({ warId: 'w1', outcome: GameOutcome.PLAYER_WIN, playerCardsRemaining: 5, opponentCardsRemaining: 0 });
      progression.recordResolvedWar({ warId: 'w2', outcome: GameOutcome.PLAYER_WIN, playerCardsRemaining: 5, opponentCardsRemaining: 0 });
      progression.recordResolvedWar({ warId: 'w3', outcome: GameOutcome.PLAYER_WIN, playerCardsRemaining: 5, opponentCardsRemaining: 0 });

      expect(progression.isChapterCompleted('standard')).toBeTrue();
      expect(progression.isChapterUnlocked('limited_reserves')).toBeTrue();
      expect(progression.isChapterUnlocked('fog_of_war')).toBeFalse();
      expect(progression.isChapterUnlocked('total_war')).toBeFalse();

      // Edmund and Lorenzo are still not unlocked (0 entries)
      expect(narrative.dossierFor('gambler')).toEqual([]);
      expect(narrative.dossierFor('cornered-general')).toEqual([]);

      // Marcel, Matthias, Bastien have only Chapter I entries
      expect(narrative.dossierFor('quartermaster').map(d => d.id)).toEqual(['DOS-MAR-01', 'DOS-MAR-02']);
      expect(narrative.dossierFor('analyst').map(d => d.id)).toEqual(['DOS-MAT-01', 'DOS-MAT-02']);
      expect(narrative.dossierFor('attritionist').map(d => d.id)).toEqual(['DOS-BAS-01', 'DOS-BAS-02']);
    });

    it('enforces strict firewall midway through Chapter II', () => {
      progression.selectCampaignOrders('standard');
      progression.recordResolvedWar({ warId: 'w1', outcome: GameOutcome.PLAYER_WIN, playerCardsRemaining: 5, opponentCardsRemaining: 0 });
      progression.recordResolvedWar({ warId: 'w2', outcome: GameOutcome.PLAYER_WIN, playerCardsRemaining: 5, opponentCardsRemaining: 0 });
      progression.recordResolvedWar({ warId: 'w3', outcome: GameOutcome.PLAYER_WIN, playerCardsRemaining: 5, opponentCardsRemaining: 0 });

      // Start Chapter II and finish War 1
      progression.selectCampaignOrders('limited_reserves');
      progression.recordResolvedWar({ warId: 'c2w1', outcome: GameOutcome.PLAYER_WIN, playerCardsRemaining: 4, opponentCardsRemaining: 0 });

      // Edmund has DOS-EDM-01 & DOS-EDM-02; Lorenzo has DOS-LOR-01 (encountered War 2)
      expect(narrative.dossierFor('gambler').map(d => d.id)).toEqual(['DOS-EDM-01', 'DOS-EDM-02']);
      expect(narrative.dossierFor('cornered-general').map(d => d.id)).toEqual(['DOS-LOR-01']);

      // No Chapter III or IV entries
      expect(narrative.dossierFor('quartermaster').map(d => d.id)).toEqual(['DOS-MAR-01', 'DOS-MAR-02']);
      expect(narrative.dossierFor('analyst').map(d => d.id)).toEqual(['DOS-MAT-01', 'DOS-MAT-02']);
      expect(narrative.dossierFor('attritionist').map(d => d.id)).toEqual(['DOS-BAS-01', 'DOS-BAS-02']);
    });

    it('ensures private Mont-Rouge mechanism is never stated as direct player-facing fact', () => {
      // Test all dialogue and transition texts
      const allTexts = [
        ...narrative.dossierFor('quartermaster').map(d => d.text),
        ...narrative.dossierFor('analyst').map(d => d.text),
        ...narrative.dossierFor('gambler').map(d => d.text),
        ...narrative.dossierFor('cornered-general').map(d => d.text),
        ...narrative.dossierFor('attritionist').map(d => d.text)
      ];

      for (const text of allTexts) {
        expect(text.toLowerCase()).not.toContain('the mouse caused');
        expect(text.toLowerCase()).not.toContain('a mouse caused');
        expect(text.toLowerCase()).not.toContain('the culprit was a mouse');
      }
    });
  });

  describe('Chapter IV Ending & Total War Mechanical Co-existence', () => {
    it('presents Chapter IV completion transition TR-C4-04 without an extra Bastien punchline', () => {
      const c4CompleteTransition = narrative.transitionFor('total_war', 'campaign_complete');
      expect(c4CompleteTransition).toBeTruthy();
      expect(c4CompleteTransition?.id).toBe('TR-C4-04');
      expect(c4CompleteTransition?.title).toBe('Campaign Resolution');
      expect(c4CompleteTransition?.text).toContain('Matthias: “I never proved it.”');
      expect(c4CompleteTransition?.text).toContain('Marcel: “Non. Neither did I.”');

      // Ensure no Bastien commentary is attached to the final completion text
      expect(c4CompleteTransition?.text).not.toContain('Bastien:');
      expect(c4CompleteTransition?.text).not.toContain('the cheese says');
    });
  });
});

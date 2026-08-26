import { TestBed } from '@angular/core/testing';
import { CampaignProgressionService } from '../core/services/campaign-progression.service';
import { AuthService } from '../core/services/auth.service';
import { NarrativeResolverService } from './narrative-resolver.service';
import { TableReactionService } from '../services/table-reaction.service';
import { GameOutcome } from '../core/models/game-state.model';

describe('Chapter I Narrative Flow Integration', () => {
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

  it('runs complete Chapter I narrative progression end-to-end', () => {
    // 1. Initial State: Chapter I unlocked, others locked
    expect(progression.isChapterUnlocked('standard')).toBeTrue();
    expect(progression.isChapterUnlocked('limited_reserves')).toBeFalse();
    expect(progression.isChapterUnlocked('fog_of_war')).toBeFalse();
    expect(progression.isChapterUnlocked('total_war')).toBeFalse();

    // 2. Campaign Orders Framing (TR-C1-01: The Accord)
    const framing = narrative.transitionFor('standard', 'orders');
    expect(framing).toBeTruthy();
    expect(framing?.id).toBe('TR-C1-01');
    expect(framing?.title).toBe('The Accord');
    expect(framing?.text).toContain('Two traditions brought two Witness Wheels');

    // Confirm orders for Chapter I
    expect(progression.selectCampaignOrders('standard')).toBeTrue();
    expect(progression.currentCampaign().commanderSchedule).toEqual([
      'quartermaster',
      'analyst',
      'attritionist'
    ]);

    // 3. War 1: Marcel de Brie
    expect(progression.campaignWarIndex()).toBe(1);
    const war1Commander = progression.currentCommanderIdentity();
    expect(war1Commander.name).toBe('Marcel de Brie');
    expect(war1Commander.title).toBe('French Master Affineur');
    expect(war1Commander.faction).toBe('French Delegation');

    // War 1 introduction line
    const marcelIntro = reactionService.forIntroduction(war1Commander.commanderId);
    expect(marcelIntro).toBeTruthy();
    expect(marcelIntro?.message).toContain('Mont-Rouge');

    // War 1 initial dossier: Marcel Overview unlocked
    const marcelDossier0 = narrative.dossierFor('quartermaster');
    expect(marcelDossier0.length).toBe(1);
    expect(marcelDossier0[0].section).toBe('Overview');
    expect(marcelDossier0[0].evidence).toBe('documented');
    expect(marcelDossier0[0].source?.url).toBe('https://www.gruyere-france.fr/notre-histoire/');

    // War 1 resolution line
    const marcelResult = reactionService.forResult(war1Commander.commanderId);
    expect(marcelResult).toBeTruthy();
    expect(marcelResult?.message).toContain('verdict');

    // War 1 Transition Dispatch (TR-C1-02: Sealed Swiss Correction)
    const war1Transition = narrative.transitionFor('standard', 'after_war_1');
    expect(war1Transition?.id).toBe('TR-C1-02');
    expect(war1Transition?.title).toBe('Sealed Swiss Correction');
    expect(war1Transition?.text).toContain('Matthias von Greyerz');

    // Record War 1 result (Player wins)
    progression.recordResolvedWar({
      warId: 'war-1',
      outcome: GameOutcome.PLAYER_WIN,
      playerCardsRemaining: 6,
      opponentCardsRemaining: 0
    });
    expect(progression.campaignWarIndex()).toBe(2);

    // 4. War 2: Matthias von Greyerz
    const war2Commander = progression.currentCommanderIdentity();
    expect(war2Commander.name).toBe('Matthias von Greyerz');
    expect(war2Commander.title).toBe('Swiss Standards Analyst');
    expect(war2Commander.faction).toBe('Swiss Delegation');

    // War 2 intro line
    const matthiasIntro = reactionService.forIntroduction(war2Commander.commanderId);
    expect(matthiasIntro).toBeTruthy();
    expect(matthiasIntro?.message).toContain('Swiss wheel');

    // Progressive dossier after War 1: Marcel has 2 entries (Overview + Mont-Rouge), Matthias has 1 entry (Overview)
    const marcelDossier1 = narrative.dossierFor('quartermaster');
    expect(marcelDossier1.length).toBe(2);
    expect(marcelDossier1[1].section).toBe('Mont-Rouge Record');

    const matthiasDossier1 = narrative.dossierFor('analyst');
    expect(matthiasDossier1.length).toBe(1);
    expect(matthiasDossier1[0].section).toBe('Overview');

    // War 2 Transition Dispatch (TR-C1-03: Belgian Field Note)
    const war2Transition = narrative.transitionFor('standard', 'after_war_2');
    expect(war2Transition?.id).toBe('TR-C1-03');
    expect(war2Transition?.title).toContain('Belgian Field Note');

    // Record War 2 result (Player wins)
    progression.recordResolvedWar({
      warId: 'war-2',
      outcome: GameOutcome.PLAYER_WIN,
      playerCardsRemaining: 5,
      opponentCardsRemaining: 0
    });
    expect(progression.campaignWarIndex()).toBe(3);

    // 5. War 3: Bastien de Herve
    const war3Commander = progression.currentCommanderIdentity();
    expect(war3Commander.name).toBe('Bastien de Herve');
    expect(war3Commander.title).toBe('Belgian Tyromancer');
    expect(war3Commander.faction).toBe('No Reliable Affiliation');

    // War 3 intro line
    const bastienIntro = reactionService.forIntroduction(war3Commander.commanderId);
    expect(bastienIntro).toBeTruthy();
    expect(bastienIntro?.message).toBe('The blind wheel opened seven eyes. Four men closed eight.');

    // Progressive dossier after War 2: Matthias has 2 entries (Overview + Mont-Rouge), Bastien has 1 entry (Overview)
    const matthiasDossier2 = narrative.dossierFor('analyst');
    expect(matthiasDossier2.length).toBe(2);
    expect(matthiasDossier2[1].section).toBe('Mont-Rouge Record');

    const bastienDossier2 = narrative.dossierFor('attritionist');
    expect(bastienDossier2.length).toBe(1);
    expect(bastienDossier2[0].section).toBe('Overview');

    // Record War 3 result (Player wins Chapter I Campaign)
    const war3Result = progression.recordResolvedWar({
      warId: 'war-3',
      outcome: GameOutcome.PLAYER_WIN,
      playerCardsRemaining: 6,
      opponentCardsRemaining: 0
    });
    expect(war3Result.completedCampaign).toBeTruthy();
    expect(war3Result.completedCampaign?.outcome).toBe('victory');

    // 6. Campaign Complete Transition (TR-C1-04: Campaign Dispatch)
    const completionTransition = narrative.transitionFor('standard', 'campaign_complete');
    expect(completionTransition?.id).toBe('TR-C1-04');
    expect(completionTransition?.title).toBe('Campaign Dispatch');
    expect(completionTransition?.text).toContain('Mont-Rouge remains unresolved');

    // 7. Post-Campaign Unlocks
    expect(progression.isChapterCompleted('standard')).toBeTrue();
    expect(progression.isChapterUnlocked('limited_reserves')).toBeTrue();

    // Progressive dossier after Chapter I complete: Bastien has 2 entries (Overview + Archived Statement)
    const bastienDossier3 = narrative.dossierFor('attritionist');
    expect(bastienDossier3.length).toBe(2);
    expect(bastienDossier3[1].section).toBe('Archived Statement');
  });
});

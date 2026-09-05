import { TestBed } from '@angular/core/testing';
import { CardImpl, Rank, Suit } from '../core/models/card.model';
import { GameOutcome, PlayerType } from '../core/models/game-state.model';
import { REACTION_RANDOM, TableReactionService } from './table-reaction.service';
import { NarrativeResolverService } from '../narrative/narrative-resolver.service';
import { CampaignProgressionService } from '../core/services/campaign-progression.service';
import { AuthService } from '../core/services/auth.service';

describe('TableReactionService', () => {
  let randomValues: number[];
  let service: TableReactionService;
  let progression: CampaignProgressionService;
  let auth: AuthService;

  beforeEach(() => {
    localStorage.clear();
    randomValues = [];
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        CampaignProgressionService,
        NarrativeResolverService,
        {
          provide: REACTION_RANDOM,
          useFactory: () => () => randomValues.shift() ?? 0.99
        }
      ]
    });
    service = TestBed.inject(TableReactionService);
    progression = TestBed.inject(CampaignProgressionService);
    auth = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  const card = (rank: Rank) => new CardImpl(Suit.HEARTS, rank);

  const resolveCurrentWar = (warId: string) => progression.recordResolvedWar({
    warId,
    outcome: GameOutcome.PLAYER_WIN,
    playerCardsRemaining: 8,
    opponentCardsRemaining: 0,
  });

  it('keeps silence as the normal response to an ordinary Battle loss', () => {
    expect(service.forBattleLoss(PlayerType.PLAYER, [card(Rank.SEVEN), card(Rank.FOUR)]))
      .toBeNull();
  });

  it('usually stays silent even when a notable card is lost', () => {
    randomValues = [0.9];
    expect(service.forBattleLoss(PlayerType.OPPONENT, [card(Rank.ACE)]))
      .toBeNull();
  });

  it('can produce a short, spatially attributable quip after an earned loss', () => {
    randomValues = [0.1, 0];
    const reaction = service.forBattleLoss(
      PlayerType.PLAYER,
      [card(Rank.ACE), card(Rank.TWO), ...Array.from({ length: 6 }, () => card(Rank.FIVE))]
    );

    expect(reaction?.speaker).toBe(PlayerType.PLAYER);
    expect(reaction?.message).toBe('That was catastrophic.');
    expect(reaction?.category).toBe('battle');
  });

  it('stays silent for an ordinary clash but may react to a public 2-over-Ace result', () => {
    expect(service.forClash({
      playerCard: card(Rank.NINE),
      opponentCard: card(Rank.SEVEN),
      winner: PlayerType.PLAYER,
      specialRule: false,
    })).toBeNull();

    randomValues = [0.1, 0];
    const reaction = service.forClash({
      playerCard: card(Rank.TWO),
      opponentCard: card(Rank.ACE),
      winner: PlayerType.PLAYER,
      specialRule: true,
    });
    expect(reaction).toEqual({
      speaker: PlayerType.OPPONENT,
      message: 'An exception is not anarchy, monsieur. It is a rule with dramatic tailoring.',
      category: 'special_clash',
      authored: true,
      expression: 'surprised',
    });
  });

  it('recognizes the narrow Jack-over-10 result from revealed cards only', () => {
    randomValues = [0.1, 0];
    const reaction = service.forClash({
      playerCard: card(Rank.TEN),
      opponentCard: card(Rank.JACK),
      winner: PlayerType.OPPONENT,
      specialRule: false,
    });

    expect(reaction?.speaker).toBe(PlayerType.PLAYER);
    expect(reaction?.message).toBe('Too close.');
    expect(reaction?.category).toBe('narrow_clash');
  });

  it('guarantees the first eligible authored tactical line during the scripted run', () => {
    randomValues = [0.99];
    const reaction = service.forChallengeResolution({
      challenger: PlayerType.PLAYER,
      originalBeatenCard: card(Rank.TWO),
      reinforcementCard: card(Rank.ACE),
      originalWinnerCard: card(Rank.KING),
      challengerWon: true,
    });

    expect(reaction).toEqual({
      speaker: PlayerType.OPPONENT,
      message: 'There. Proper stock returns to the cellar.',
      category: 'rescue',
      authored: true,
      expression: 'surprised',
    });
  });

  it('may react to a costly failed reinforcement only after its card is supplied', () => {
    randomValues = [0.1, 0];
    const reaction = service.forChallengeResolution({
      challenger: PlayerType.PLAYER,
      originalBeatenCard: card(Rank.QUEEN),
      reinforcementCard: card(Rank.ACE),
      originalWinnerCard: card(Rank.TWO),
      challengerWon: false,
    });

    expect(reaction?.speaker).toBe(PlayerType.PLAYER);
    expect(reaction?.message).toBe('That reinforcement cost dearly.');
    expect(reaction?.category).toBe('failed_rescue');
    expect(reaction?.expression).toBe('angry');
  });

  it('can narrate a deep Battle while keeping silence probabilistic', () => {
    randomValues = [0.1, 0];
    const reaction = service.forBattleLoss(
      PlayerType.OPPONENT,
      [card(Rank.SEVEN), card(Rank.FOUR)],
      { battleDepth: 3 },
      'quartermaster'
    );

    expect(reaction?.message).toBe('Layer upon layer. Even a rind knows when thickness has become stubbornness.');
  });

  describe('Commander Dialogue Personality Customization', () => {
    it('delivers an exact first-play tactical record despite replay-level random silence', () => {
      progression.selectCampaignOrders('standard');
      resolveCurrentWar('dense-first-play-1');
      resolveCurrentWar('dense-first-play-2');
      expect(progression.campaignWarIndex()).toBe(3);

      randomValues = [0.99];
      const reaction = service.forBattleLoss(
        PlayerType.OPPONENT,
        [card(Rank.ACE)],
        {},
        'attritionist',
      );

      expect(reaction?.message).toBe(
        'A great head falls. Somewhere, a very small guest remains uninvited.',
      );
      expect(reaction?.authored).toBeTrue();
    });

    it('keeps completed-chapter replay reactions sparse and does not consume a line on silence', () => {
      progression.selectCampaignOrders('standard');
      resolveCurrentWar('sparse-replay-1');
      resolveCurrentWar('sparse-replay-2');
      resolveCurrentWar('sparse-replay-3');
      expect(progression.isChapterCompleted('standard')).toBeTrue();
      auth.updateActiveProfileProgression(previous => ({
        ...previous,
        unlockedChapterModes: ['standard', 'limited_reserves', 'fog_of_war', 'total_war'],
        completedChapterModes: ['standard', 'limited_reserves', 'fog_of_war', 'total_war'],
        currentCampaign: {
          ...previous.currentCampaign,
          mode: 'standard',
          modifiers: [],
          ordersSelected: false,
          wars: [],
        },
      }));
      expect(progression.selectCampaignOrders('standard')).toBeTrue();

      const specialClash = {
        playerCard: card(Rank.TWO),
        opponentCard: card(Rank.ACE),
        winner: PlayerType.PLAYER,
        specialRule: true,
      };
      randomValues = [0.99];
      expect(service.forClash(specialClash, 'quartermaster')).toBeNull();

      randomValues = [0.1];
      expect(service.forClash(specialClash, 'quartermaster')?.message).toBe(
        'A card without pedigree fells an Ace. Barbaric. Lawful. I dislike it twice.',
      );
    });

    it('uses Gambler-specific fallback lines when Gambler loses to 2 vs Ace', () => {
      randomValues = [0.1, 0];
      const reaction = service.forClash({
        playerCard: card(Rank.TWO),
        opponentCard: card(Rank.ACE),
        winner: PlayerType.PLAYER,
        specialRule: true,
      }, 'gambler');

      expect(reaction?.speaker).toBe(PlayerType.OPPONENT);
      expect(reaction?.message).toBe('The rule keeps one excellent surprise in its sleeve.');
    });

    it('uses Analyst-specific lines when Analyst loses to 2 vs Ace', () => {
      randomValues = [0.1, 0];
      const reaction = service.forClash({
        playerCard: card(Rank.TWO),
        opponentCard: card(Rank.ACE),
        winner: PlayerType.PLAYER,
        specialRule: true,
      }, 'analyst');

      expect(reaction?.speaker).toBe(PlayerType.OPPONENT);
      expect(reaction?.message).toBe('Categorical exception. Valid result.');
    });

    it('uses Attritionist-specific lines when Attritionist suffers battle casualty', () => {
      randomValues = [0.1, 0];
      const reaction = service.forBattleLoss(
        PlayerType.OPPONENT,
        [card(Rank.ACE)],
        {},
        'attritionist'
      );

      expect(reaction?.speaker).toBe(PlayerType.OPPONENT);
      expect(reaction?.message).toBe('A great head falls. Somewhere, a very small guest remains uninvited.');
    });

    it('provides authored introduction and result lines for Chapter I commanders', () => {
      const intro = service.forIntroduction('quartermaster');
      expect(intro?.speaker).toBe(PlayerType.OPPONENT);
      expect(intro?.category).toBe('introduction');
      expect(intro?.authored).toBeTrue();
      expect(intro?.expression).toBe('calm');
      expect(intro?.message).toBe('At Mont-Rouge, monsieur, we placed two ancient traditions at one table. Only one of them arrived with the dignity to remain seated.');

      const result = service.forResult('quartermaster', GameOutcome.OPPONENT_WIN);
      expect(result?.speaker).toBe(PlayerType.OPPONENT);
      expect(result?.category).toBe('result');
      expect(result?.message).toBe('The cards have rendered a verdict. Naturally, history will appeal.');
      expect(result?.expression).toBe('smug');
      service.clearUsedDialogue();
      expect(service.forResult('quartermaster', GameOutcome.PLAYER_WIN)?.expression).toBe('sad');
    });

    it('provides guaranteed context lines for active commanders', () => {
      const context = service.forContext('quartermaster');
      expect(context?.speaker).toBe(PlayerType.OPPONENT);
      expect(context?.category).toBe('introduction');
      expect(context?.message).toBe('The French Witness Wheel opened as promised. The Swiss wheel opened eyes it was never asked to possess. Matthias then closed the Accord.');
    });

    it('provides concession and desperate rescue reaction hooks', () => {
      randomValues = [0.1, 0];
      const concession = service.forConcession('quartermaster');
      expect(concession?.speaker).toBe(PlayerType.OPPONENT);
      expect(concession?.category).toBe('concession');
      expect(concession?.message).toBeTruthy();

      const desperate = service.forDesperateRescue('quartermaster');
      expect(desperate?.speaker).toBe(PlayerType.OPPONENT);
      expect(desperate?.category).toBe('desperate_rescue');
      expect(desperate?.message).toBeTruthy();
    });

    it('provides optional contextual lines when available', () => {
      const contextual = service.forContextual('quartermaster');
      expect(contextual?.speaker).toBe(PlayerType.OPPONENT);
      expect(contextual?.category).toBe('contextual');
      expect(contextual?.message).toBe('I had his word. Whatever else the Swiss preserve, they did not preserve that.');
    });


    it('prevents immediate duplicate dialogue within a single war', () => {
      service.clearUsedDialogue();
      const first = service.forIntroduction('attritionist');
      expect(first?.message).toBe('The blind wheel opened seven eyes. Four men closed eight.');

      // Second request in same war deduplicates used IDs
      const second = service.forIntroduction('attritionist');
      expect(second === null || second.message !== first?.message).toBeTrue();
    });
  });
});

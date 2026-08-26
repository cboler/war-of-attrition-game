import { TestBed } from '@angular/core/testing';
import { CardImpl, Rank, Suit } from '../core/models/card.model';
import { PlayerType } from '../core/models/game-state.model';
import { REACTION_RANDOM, TableReactionService } from './table-reaction.service';
import { NarrativeResolverService } from '../narrative/narrative-resolver.service';
import { CampaignProgressionService } from '../core/services/campaign-progression.service';
import { AuthService } from '../core/services/auth.service';

describe('TableReactionService', () => {
  let randomValues: number[];
  let service: TableReactionService;

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
  });

  afterEach(() => {
    localStorage.clear();
  });

  const card = (rank: Rank) => new CardImpl(Suit.HEARTS, rank);

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
      message: 'An irregular casualty. We adjust the ledger.',
      category: 'special_clash',
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

  it('reacts to an Ace revealed as the successful reinforcement for a 2', () => {
    randomValues = [0.1, 0];
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
    it('uses Gambler-specific fallback lines when Gambler loses to 2 vs Ace', () => {
      randomValues = [0.1, 0];
      const reaction = service.forClash({
        playerCard: card(Rank.TWO),
        opponentCard: card(Rank.ACE),
        winner: PlayerType.PLAYER,
        specialRule: true,
      }, 'gambler');

      expect(reaction?.speaker).toBe(PlayerType.OPPONENT);
      expect(reaction?.message).toBe('Now that is a lucky pull.');
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
      expect(reaction?.message).toBe('The probability of that exception was documented.');
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
      expect(intro?.message).toBe('At Mont-Rouge, monsieur, we placed two ancient traditions at one table. Only one of them arrived with the dignity to remain seated.');

      const result = service.forResult('quartermaster');
      expect(result?.speaker).toBe(PlayerType.OPPONENT);
      expect(result?.category).toBe('result');
      expect(result?.message).toBe('The cards have rendered a verdict. Naturally, history will appeal.');
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

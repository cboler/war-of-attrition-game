import { TestBed } from '@angular/core/testing';
import { CardImpl, Rank, Suit } from '../core/models/card.model';
import { PlayerType } from '../core/models/game-state.model';
import { REACTION_RANDOM, TableReactionService } from './table-reaction.service';

describe('TableReactionService', () => {
  let randomValues: number[];
  let service: TableReactionService;

  beforeEach(() => {
    randomValues = [];
    TestBed.configureTestingModule({
      providers: [{
        provide: REACTION_RANDOM,
        useFactory: () => () => randomValues.shift() ?? 0.99
      }]
    });
    service = TestBed.inject(TableReactionService);
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
  });
});

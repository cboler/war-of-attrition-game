import { TestBed } from '@angular/core/testing';
import { GamePhase, PlayerType } from '../models/game-state.model';
import { COMMANDER_IDS } from '../models/commander.model';
import { GameStateService } from './game-state.service';
import { TurnResolutionService } from './turn-resolution.service';

describe('deterministic engine simulation harness', () => {
  let gameState: GameStateService;
  let resolver: TurnResolutionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    gameState = TestBed.inject(GameStateService);
    resolver = TestBed.inject(TurnResolutionService);
  });

  it('plays complete games against all 5 commander archetypes without duplicating or destroying a card', () => {
    for (let index = 0; index < COMMANDER_IDS.length; index++) {
      const commanderId = COMMANDER_IDS[index];
      gameState.initializeGame();
      let hands = 0;

      while (gameState.currentPhase !== GamePhase.GAME_OVER && hands < 1200) {
        hands += 1;
        const { playerCard, opponentCard } = gameState.startTurn();
        if (!playerCard || !opponentCard) break;
        let result = resolver.resolveTurn(playerCard, opponentCard, commanderId);

        if (result.canChallenge) {
          const defend = playerCard.value >= 10 && gameState.playerCardCount() > 0;
          if (defend) {
            gameState.beginChallenge(PlayerType.PLAYER);
            result = resolver.resolveChallenge(PlayerType.PLAYER);
          } else {
            result = resolver.resolveChallengeConcession(PlayerType.PLAYER);
          }
        } else if (result.opponentChallenge) {
          gameState.beginChallenge(PlayerType.OPPONENT);
          result = resolver.resolveChallenge(PlayerType.OPPONENT);
        } else if (result.opponentConsidered) {
          result = resolver.resolveChallengeConcession(PlayerType.OPPONENT);
        }

        while (result.nextPhase === GamePhase.BATTLE) {
          const layer = gameState.dealBattleLayer();
          if (!layer) {
            gameState.settleAttrition();
            break;
          }
          result = resolver.resolveBattleSelection(
            layer.opponentCards[(hands + index) % 3].id,
            layer.playerCards[(hands + index + 1) % 3].id,
          );
          if (result.pendingBattleSettlement && result.battleOutcome) {
            resolver.finalizeBattle(result.battleOutcome, result.nextPhase === GamePhase.GAME_OVER);
          }
        }

        const report = gameState.cardConservationReport();
        expect(report.valid)
          .withContext(`commander ${commanderId}, hand ${hands}: ${JSON.stringify(report)}`)
          .toBeTrue();
      }

      expect(gameState.currentPhase)
        .withContext(`commander ${commanderId} exceeded hand limit`)
        .toBe(GamePhase.GAME_OVER);
      expect(gameState.cardConservationReport().valid).toBeTrue();
    }
  });
});

import { TestBed } from '@angular/core/testing';
import { GameStateService } from './game-state.service';
import { TurnResolutionService } from './turn-resolution.service';
import { CardComparisonService } from './card-comparison.service';
import { OpponentAIService } from './opponent-ai.service';
import { GamePhase, PlayerType } from '../models/game-state.model';
import { Card } from '../models/card.model';

describe('Play 5 Games Simulation Analysis', () => {
  let gameStateService: GameStateService;
  let turnResolutionService: TurnResolutionService;
  let opponentAIService: OpponentAIService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GameStateService,
        TurnResolutionService,
        CardComparisonService,
        OpponentAIService
      ]
    });

    gameStateService = TestBed.inject(GameStateService);
    turnResolutionService = TestBed.inject(TurnResolutionService);
    opponentAIService = TestBed.inject(OpponentAIService);
  });

  it('should play through 5 complete games and analyze gameplay flow', () => {
    const gameLogs: string[] = [];

    for (let gameIndex = 1; gameIndex <= 5; gameIndex++) {
      gameLogs.push(`==================================================`);
      gameLogs.push(`🎮 SIMULATION GAME ${gameIndex} START`);
      gameLogs.push(`==================================================`);

      gameStateService.initializeGame();
      let turnCount = 0;
      let totalChallenges = 0;
      let totalBattles = 0;
      let recursiveBattles = 0;

      while (!gameStateService.currentState.winner && turnCount < 1000) {
        turnCount++;
        
        // Check deck draw condition
        if (gameStateService.currentPlayerDeck.isEmpty || gameStateService.currentOpponentDeck.isEmpty) {
          gameStateService.endGame();
          break;
        }

        const { playerCard, opponentCard } = gameStateService.startTurn();
        if (!playerCard || !opponentCard) {
          gameStateService.endGame();
          break;
        }

        let result = turnResolutionService.resolveTurn(playerCard, opponentCard);

        // Handle Challenge Phase if applicable
        if (result.nextPhase === GamePhase.CHALLENGE) {
          totalChallenges++;
          if (result.canChallenge) {
            // Player challenge decision strategy: Challenge if card lost was 10 or higher
            const shouldPlayerChallenge = ['10', 'J', 'Q', 'K', 'A'].includes(playerCard.rank);
            if (shouldPlayerChallenge && !gameStateService.currentPlayerDeck.isEmpty) {
              const challengeCard = gameStateService.drawPlayerCard();
              if (challengeCard) {
                gameLogs.push(`   [Turn ${turnCount}] Player challenges with ${challengeCard.toString()} vs Opponent ${opponentCard.toString()}`);
                result = turnResolutionService.resolveChallenge(playerCard, opponentCard, challengeCard);
              }
            } else {
              // Player declines challenge - cards are already resolved from initial turn
              gameLogs.push(`   [Turn ${turnCount}] Player declines challenge`);
            }
          } else if (result.opponentChallenge) {
            // Opponent challenges automatically
            const opponentChallengeCard = gameStateService.drawOpponentCard();
            if (opponentChallengeCard) {
              gameLogs.push(`   [Turn ${turnCount}] Opponent AI challenges with ${opponentChallengeCard.toString()} vs Player ${playerCard.toString()}`);
              result = turnResolutionService.resolveOpponentChallenge(playerCard, opponentCard, opponentChallengeCard);
            }
          }
        }

        // Handle Battle Phase if applicable
        if (result.nextPhase === GamePhase.BATTLE) {
          totalBattles++;
          let currentStakedPlayerCards: Card[] = result.cardsKept.filter(c => c.isRed);
          let currentStakedOpponentCards: Card[] = result.cardsKept.filter(c => !c.isRed);
          let inBattle = true;
          let battleRound = 0;

          while (inBattle && !gameStateService.currentState.winner) {
            battleRound++;
            if (battleRound > 1) recursiveBattles++;

            // Check if both have minimum 3 cards for battle
            if (!gameStateService.currentPlayerDeck.hasMinimumForBattle || !gameStateService.currentOpponentDeck.hasMinimumForBattle) {
              gameLogs.push(`   [Turn ${turnCount}] Attrition Loss in Battle! Player Deck: ${gameStateService.playerCardCount()}, Opponent Deck: ${gameStateService.opponentCardCount()}`);
              gameStateService.endGame();
              inBattle = false;
              break;
            }

            const pBattle3 = gameStateService.currentPlayerDeck.drawMultiple(3);
            const oBattle3 = gameStateService.currentOpponentDeck.drawMultiple(3);

            // Select 1 card randomly from opponent's 3 cards
            const selectedP = pBattle3[Math.floor(Math.random() * pBattle3.length)];
            const selectedO = oBattle3[Math.floor(Math.random() * oBattle3.length)];

            const battleResult = turnResolutionService.resolveBattle(
              playerCard, opponentCard, pBattle3, oBattle3, selectedP, selectedO
            );

            if (battleResult.nextPhase === GamePhase.NORMAL) {
              inBattle = false;
              result = battleResult;
            } else if (battleResult.nextPhase === GamePhase.GAME_OVER) {
              inBattle = false;
              gameStateService.endGame();
            }
          }
        }

        // Check overall end condition
        if (gameStateService.checkGameEndConditions()) {
          break;
        }
      }

      gameLogs.push(`🏁 GAME ${gameIndex} OVER:`);
      gameLogs.push(`   Winner: ${gameStateService.currentState.winner}`);
      gameLogs.push(`   Total Turns: ${turnCount}`);
      gameLogs.push(`   Challenges Attempted: ${totalChallenges}`);
      gameLogs.push(`   Battles Conducted: ${totalBattles}`);
      gameLogs.push(`   Recursive Battle Rounds: ${recursiveBattles}`);
      gameLogs.push(`   Final Cards - Player: ${gameStateService.playerCardCount()}, Opponent: ${gameStateService.opponentCardCount()}, Discard: ${gameStateService.discardedCardCount()}`);
      gameLogs.push(``);
    }

    console.log(gameLogs.join('\n'));
    expect(gameLogs.length).toBeGreaterThan(0);
  });
});

import { WritableSignal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Card, Rank, Suit } from '../models/card.model';
import { DeckColor, GameOutcome, GamePhase, PlayerType } from '../models/game-state.model';
import { GameStateService } from './game-state.service';
import { SettingsService } from './settings.service';
import { AuthService } from './auth.service';
import {
  GameControllerService,
  PresentationState
} from '../../services/game-controller.service';
import { StoryBookService } from '../../services/story-book.service';
import { ProfileDialogComponent } from '../../shared/components/profile-dialog/profile-dialog.component';

export type ScreenshotSceneId =
  | 'clash'
  | 'challenge'
  | 'battle'
  | 'boneyard'
  | 'manual'
  | 'profile'
  | 'victory';

function card(suit: Suit, rank: Rank, value: number, id?: string): Card {
  return {
    id: id ?? `${suit}-${rank}`,
    suit,
    rank,
    value,
    isRed: suit === Suit.HEARTS || suit === Suit.DIAMONDS
  };
}

function generateStandardDeck(color: DeckColor): Card[] {
  const suits = color === DeckColor.RED ? [Suit.HEARTS, Suit.DIAMONDS] : [Suit.SPADES, Suit.CLUBS];
  const ranks: { rank: Rank; value: number }[] = [
    { rank: Rank.TWO, value: 2 },
    { rank: Rank.THREE, value: 3 },
    { rank: Rank.FOUR, value: 4 },
    { rank: Rank.FIVE, value: 5 },
    { rank: Rank.SIX, value: 6 },
    { rank: Rank.SEVEN, value: 7 },
    { rank: Rank.EIGHT, value: 8 },
    { rank: Rank.NINE, value: 9 },
    { rank: Rank.TEN, value: 10 },
    { rank: Rank.JACK, value: 11 },
    { rank: Rank.QUEEN, value: 12 },
    { rank: Rank.KING, value: 13 },
    { rank: Rank.ACE, value: 14 }
  ];

  const result: Card[] = [];
  for (const suit of suits) {
    for (const { rank, value } of ranks) {
      result.push(card(suit, rank, value));
    }
  }
  return result;
}

function findFixtureCard(cards: readonly Card[], suit: Suit, rank: Rank): Card {
  const found = cards.find((candidate) => candidate.suit === suit && candidate.rank === rank);
  if (!found) throw new Error(`Fixture card not found: ${rank} of ${suit}`);
  return found;
}

function withoutFixtureCards(cards: readonly Card[], excluded: readonly Card[]): Card[] {
  const excludedIds = new Set(excluded.map((candidate) => candidate.id));
  return cards.filter((candidate) => !excludedIds.has(candidate.id));
}

function assertFixtureTurnHistory(gameState: GameStateService): void {
  const turnNumber = gameState.currentStats.turnNumber;
  const completedTurns = gameState.currentState.activeTurn
    ? Math.max(0, turnNumber - 1)
    : turnNumber;
  if (gameState.currentDiscardPile.length < completedTurns) {
    throw new Error(
      `Screenshot fixture cannot reach turn ${turnNumber} with only ` +
        `${gameState.currentDiscardPile.length} settled casualties`,
    );
  }
}

export class ScreenshotStateLoader {
  static loadScene(
    sceneId: string,
    context: {
      controller: GameControllerService;
      gameState: GameStateService;
      settings: SettingsService;
      auth: AuthService;
      storyBook: StoryBookService;
      dialog: MatDialog;
      boneyardOpen: WritableSignal<boolean>;
      storyBookOpen: WritableSignal<boolean>;
      manualReferenceCard: WritableSignal<Card | null>;
    }
  ): void {
    // 1. Enforce screenshot-safe environment (motion disabled for crisp raster, sound muted, tutorial inactive)
    context.settings.setSoundEnabled(false);
    context.settings.setTutorialEnabled(false);
    context.settings.setShowTurnCounter(true);
    context.boneyardOpen.set(false);
    context.storyBookOpen.set(false);
    context.manualReferenceCard.set(null);

    const redCards = generateStandardDeck(DeckColor.RED);
    const blackCards = generateStandardDeck(DeckColor.BLACK);

    switch (sceneId as ScreenshotSceneId) {
      case 'clash': {
        const playerCard = findFixtureCard(redCards, Suit.HEARTS, Rank.KING);
        const opponentCard = findFixtureCard(blackCards, Suit.CLUBS, Rank.TEN);
        const casualties = [
          findFixtureCard(redCards, Suit.HEARTS, Rank.FOUR),
          findFixtureCard(blackCards, Suit.CLUBS, Rank.FIVE),
          findFixtureCard(redCards, Suit.DIAMONDS, Rank.SIX),
          findFixtureCard(blackCards, Suit.SPADES, Rank.THREE),
          findFixtureCard(redCards, Suit.HEARTS, Rank.EIGHT),
        ];
        const remainingPlayer = withoutFixtureCards(
          redCards,
          [playerCard, ...casualties.filter((candidate) => candidate.isRed)],
        );
        const remainingOpponent = withoutFixtureCards(
          blackCards,
          [opponentCard, ...casualties.filter((candidate) => !candidate.isRed)],
        );

        context.gameState.loadFixtureState({
          playerDeckCards: remainingPlayer,
          opponentDeckCards: remainingOpponent,
          playerDeckColor: DeckColor.RED,
          discardCards: casualties,
          turnNumber: 6,
          phase: GamePhase.NORMAL,
          activeTurn: {
            playerCard,
            opponentCard,
            phase: GamePhase.NORMAL,
            playerChallengeCard: null,
            opponentChallengeCard: null,
            battleLayers: [],
            publicCardIds: [playerCard.id, opponentCard.id]
          }
        });

        context.controller.loadFixtureState({
          commander: 'quartermaster',
          phase: PresentationState.CLASH_RESOLUTION,
          message: 'King of Hearts defeats 10 of Clubs (+3).',
          battlefieldMessages: [
            { id: 1, text: 'King of Hearts defeats 10 of Clubs (+3).' }
          ],
          presentedTurn: {
            playerCard,
            opponentCard,
            phase: GamePhase.NORMAL,
            playerChallengeCard: null,
            opponentChallengeCard: null,
            battleLayers: [],
            publicCardIds: [playerCard.id, opponentCard.id]
          },
          comparisonPresentation: {
            player: {
              cardId: playerCard.id,
              base: 13,
              current: 3,
              damage: 0,
              state: 'winner',
              specialOverride: false,
              opposingBase: 10,
              opposingRank: '10'
            },
            opponent: {
              cardId: opponentCard.id,
              base: 10,
              current: 0,
              damage: -3,
              state: 'defeated',
              specialOverride: false,
              opposingBase: 13,
              opposingRank: 'K'
            },
            resolved: true
          },
          turnsPlayed: 6,
          reaction: {
            speaker: PlayerType.OPPONENT,
            message: 'Acceptable losses. The reserve holds.',
            category: 'narrow_clash'
          }
        });
        break;
      }

      case 'challenge': {
        const playerCard = findFixtureCard(redCards, Suit.DIAMONDS, Rank.FIVE);
        const opponentCard = findFixtureCard(blackCards, Suit.SPADES, Rank.TEN);
        const casualties = [
          findFixtureCard(redCards, Suit.HEARTS, Rank.THREE),
          findFixtureCard(blackCards, Suit.CLUBS, Rank.FOUR),
          findFixtureCard(redCards, Suit.DIAMONDS, Rank.EIGHT),
          findFixtureCard(blackCards, Suit.SPADES, Rank.NINE),
          findFixtureCard(redCards, Suit.HEARTS, Rank.SIX),
          findFixtureCard(blackCards, Suit.CLUBS, Rank.SEVEN),
          findFixtureCard(redCards, Suit.DIAMONDS, Rank.TWO),
        ];
        const remainingPlayer = withoutFixtureCards(
          redCards,
          [playerCard, ...casualties.filter((candidate) => candidate.isRed)],
        );
        const remainingOpponent = withoutFixtureCards(
          blackCards,
          [opponentCard, ...casualties.filter((candidate) => !candidate.isRed)],
        );

        context.gameState.loadFixtureState({
          playerDeckCards: remainingPlayer,
          opponentDeckCards: remainingOpponent,
          playerDeckColor: DeckColor.RED,
          discardCards: casualties,
          turnNumber: 8,
          phase: GamePhase.NORMAL,
          activeTurn: {
            playerCard,
            opponentCard,
            phase: GamePhase.NORMAL,
            playerChallengeCard: null,
            opponentChallengeCard: null,
            battleLayers: [],
            publicCardIds: [playerCard.id, opponentCard.id]
          }
        });

        context.controller.loadFixtureState({
          commander: 'gambler',
          phase: PresentationState.PLAYER_CHALLENGE_DECISION,
          message: 'Your 5 is beaten by 10. Send reinforcement?',
          battlefieldMessages: [
            { id: 1, text: '10 of Spades outranks 5 of Diamonds.' },
            { id: 2, text: 'Send a reinforcement?' }
          ],
          presentedTurn: {
            playerCard,
            opponentCard,
            phase: GamePhase.NORMAL,
            playerChallengeCard: null,
            opponentChallengeCard: null,
            battleLayers: [],
            publicCardIds: [playerCard.id, opponentCard.id]
          },
          comparisonPresentation: {
            player: {
              cardId: playerCard.id,
              base: 5,
              current: 0,
              damage: -5,
              state: 'defeated',
              specialOverride: false,
              opposingBase: 10,
              opposingRank: '10'
            },
            opponent: {
              cardId: opponentCard.id,
              base: 10,
              current: 5,
              damage: 0,
              state: 'winner',
              specialOverride: false,
              opposingBase: 5,
              opposingRank: '5'
            },
            resolved: false
          },
          turnsPlayed: 8
        });
        break;
      }

      case 'battle': {
        const playerClash = findFixtureCard(redCards, Suit.DIAMONDS, Rank.SEVEN);
        const opponentClash = findFixtureCard(blackCards, Suit.CLUBS, Rank.SEVEN);

        const playerBattleCards = [
          findFixtureCard(redCards, Suit.HEARTS, Rank.NINE),
          findFixtureCard(redCards, Suit.DIAMONDS, Rank.JACK),
          findFixtureCard(redCards, Suit.HEARTS, Rank.FOUR)
        ];

        const opponentBattleCards = [
          findFixtureCard(blackCards, Suit.SPADES, Rank.SIX),
          findFixtureCard(blackCards, Suit.CLUBS, Rank.ACE),
          findFixtureCard(blackCards, Suit.SPADES, Rank.THREE)
        ];

        const casualties = [
          findFixtureCard(redCards, Suit.HEARTS, Rank.TWO),
          findFixtureCard(blackCards, Suit.CLUBS, Rank.EIGHT),
          findFixtureCard(redCards, Suit.HEARTS, Rank.THREE),
          findFixtureCard(redCards, Suit.DIAMONDS, Rank.FIVE),
          findFixtureCard(redCards, Suit.HEARTS, Rank.SIX),
          findFixtureCard(redCards, Suit.DIAMONDS, Rank.EIGHT),
          findFixtureCard(blackCards, Suit.SPADES, Rank.TWO),
          findFixtureCard(blackCards, Suit.CLUBS, Rank.FOUR),
          findFixtureCard(blackCards, Suit.SPADES, Rank.FIVE),
          findFixtureCard(blackCards, Suit.CLUBS, Rank.NINE),
          findFixtureCard(blackCards, Suit.SPADES, Rank.QUEEN),
        ];
        const tableCardIds = new Set([
          playerClash.id,
          opponentClash.id,
          ...playerBattleCards.map((battleCard) => battleCard.id),
          ...opponentBattleCards.map((battleCard) => battleCard.id),
          ...casualties.map((casualty) => casualty.id)
        ]);
        const remainingPlayer = redCards.filter(
          (battleCard) => !tableCardIds.has(battleCard.id)
        );
        const remainingOpponent = blackCards.filter(
          (battleCard) => !tableCardIds.has(battleCard.id)
        );

        const turn = {
          playerCard: playerClash,
          opponentCard: opponentClash,
          phase: GamePhase.BATTLE,
          playerChallengeCard: null,
          opponentChallengeCard: null,
          battleLayers: [
            {
              round: 1,
              playerCards: playerBattleCards,
              opponentCards: opponentBattleCards,
              selectedPlayerCardId: null,
              selectedOpponentCardId: null
            }
          ],
          publicCardIds: [playerClash.id, opponentClash.id]
        };

        context.gameState.loadFixtureState({
          playerDeckCards: remainingPlayer,
          opponentDeckCards: remainingOpponent,
          playerDeckColor: DeckColor.RED,
          discardCards: casualties,
          turnNumber: 12,
          phase: GamePhase.BATTLE,
          activeTurn: turn
        });

        context.controller.loadFixtureState({
          commander: 'analyst',
          phase: PresentationState.PLAYER_TARGET_SELECTION,
          message: 'Choose a foe champion to reveal.',
          battlefieldMessages: [
            { id: 1, text: 'Battle! 7 ties 7.' },
            { id: 2, text: 'Choose a foe champion to reveal.' }
          ],
          presentedTurn: turn,
          turnsPlayed: 12
        });
        break;
      }

      case 'boneyard': {
        const casualties: Card[] = [
          findFixtureCard(redCards, Suit.HEARTS, Rank.ACE),
          findFixtureCard(blackCards, Suit.CLUBS, Rank.TWO),
          findFixtureCard(redCards, Suit.DIAMONDS, Rank.KING),
          findFixtureCard(blackCards, Suit.SPADES, Rank.QUEEN),
          findFixtureCard(redCards, Suit.HEARTS, Rank.JACK),
          findFixtureCard(blackCards, Suit.CLUBS, Rank.TEN),
          findFixtureCard(redCards, Suit.DIAMONDS, Rank.NINE),
          findFixtureCard(blackCards, Suit.SPADES, Rank.EIGHT),
          findFixtureCard(redCards, Suit.HEARTS, Rank.SEVEN),
          findFixtureCard(blackCards, Suit.CLUBS, Rank.SIX),
          findFixtureCard(redCards, Suit.DIAMONDS, Rank.FIVE),
          findFixtureCard(blackCards, Suit.SPADES, Rank.FOUR),
          findFixtureCard(redCards, Suit.HEARTS, Rank.THREE),
          findFixtureCard(blackCards, Suit.CLUBS, Rank.ACE),
          findFixtureCard(redCards, Suit.DIAMONDS, Rank.TWO),
        ];
        const remainingPlayer = withoutFixtureCards(
          redCards,
          casualties.filter((candidate) => candidate.isRed),
        );
        const remainingOpponent = withoutFixtureCards(
          blackCards,
          casualties.filter((candidate) => !candidate.isRed),
        );

        context.gameState.loadFixtureState({
          playerDeckCards: remainingPlayer,
          opponentDeckCards: remainingOpponent,
          playerDeckColor: DeckColor.RED,
          discardCards: casualties,
          turnNumber: 15,
          phase: GamePhase.NORMAL,
          activeTurn: null
        });

        context.controller.loadFixtureState({
          commander: 'attritionist',
          phase: PresentationState.READY,
          message: 'Your deck is ready.',
          turnsPlayed: 15
        });

        context.boneyardOpen.set(true);
        break;
      }

      case 'manual': {
        const casualties = [
          findFixtureCard(redCards, Suit.HEARTS, Rank.EIGHT),
          findFixtureCard(blackCards, Suit.CLUBS, Rank.SEVEN),
          findFixtureCard(redCards, Suit.DIAMONDS, Rank.THREE),
          findFixtureCard(blackCards, Suit.SPADES, Rank.FOUR),
          findFixtureCard(redCards, Suit.HEARTS, Rank.SIX),
        ];
        const remainingPlayer = withoutFixtureCards(
          redCards,
          casualties.filter((candidate) => candidate.isRed),
        );
        const remainingOpponent = withoutFixtureCards(
          blackCards,
          casualties.filter((candidate) => !candidate.isRed),
        );

        context.auth.updateActiveProfileProgression(previous => ({
          ...previous,
          unlockedChapterModes: ['standard', 'limited_reserves', 'fog_of_war', 'total_war'],
          completedChapterModes: ['standard', 'limited_reserves', 'fog_of_war', 'total_war']
        }));

        context.gameState.loadFixtureState({
          playerDeckCards: remainingPlayer,
          opponentDeckCards: remainingOpponent,
          playerDeckColor: DeckColor.RED,
          discardCards: casualties,
          turnNumber: 5,
          phase: GamePhase.NORMAL,
          activeTurn: null
        });

        context.controller.loadFixtureState({
          commander: 'quartermaster',
          phase: PresentationState.READY,
          message: 'Your deck is ready.',
          turnsPlayed: 5
        });

        context.storyBook.clear();
        context.storyBook.addEntry({
          turnNumber: 3,
          type: 'clash',
          eyebrow: 'TURN 3 · CLASH',
          title: 'Decisive Strike',
          text: 'King of Hearts overpowered 10 of Clubs (+3 Power differential).',
          actor: PlayerType.PLAYER,
          badge: 'victory'
        });
        context.storyBook.addEntry({
          turnNumber: 4,
          type: 'battle_header',
          eyebrow: 'TURN 4 · DEADLOCK',
          title: 'Battle Declared',
          text: 'Equal rank 7 vs 7 initiated a 3-card deadlock engagement.',
          badge: 'battle'
        });

        context.storyBookOpen.set(true);
        break;
      }

      case 'profile': {
        context.gameState.loadFixtureState({
          playerDeckCards: redCards,
          opponentDeckCards: blackCards,
          playerDeckColor: DeckColor.RED,
          discardCards: [],
          turnNumber: 0,
          phase: GamePhase.NORMAL,
          activeTurn: null
        });

        context.auth.updateStatistics({
          gamesPlayed: 50,
          gamesWon: 36,
          gamesLost: 14,
          gamesTied: 0,
          winRatePercentage: 72,
          currentWinStreak: 4,
          bestWinStreak: 8,
          totalTurns: 840,
          averageTurnsPerGame: 16.8,
          totalBattles: 112,
          mostBattlesInGame: 6,
          deepestRecursiveBattle: 3,
          mostCardsAtStake: 14,
          mostCardsLostInBattle: 7,
          mostOpponentCardsDefeatedInBattle: 7,
          currentBattleWinStreak: 2,
          bestBattleWinStreak: 7,
          currentBattleLossStreak: 0,
          bestBattleLossStreak: 4,
          totalChallenges: 65,
          successfulChallenges: 42,
          challengeSuccessRate: 65,
          mostChallengesInGame: 4,
          mostSuccessfulChallengesInGame: 3,
          acesDefeatedByTwo: 14,
          twosSavedByChallenge: 9,
          acesRescuedByChallenge: 8,
          acesRescuingTwos: 5,
          acesLostInBattles: 6,
          aceAndTwoLostInSameBattle: 2,
          juggernautOccurrences: 3,
          juggernautCardIds: ['hearts-A', 'diamonds-K', 'hearts-2'],
          campaignsCompleted: 16,
          campaignsWon: 11,
          campaignsLost: 4,
          campaignsDrawn: 1,
          totalCampaignDifferential: 84,
          bestCampaignDifferential: 22,
          worstCampaignDifferential: -12,
          highestCardsRemainingAtVictory: 23,
          lowestCardsRemainingAtVictory: 1,
          winsWithOneCardRemaining: 1,
          comebackWins: 8,
          largestComebackDeficit: 10,
          unlockedAchievements: [
            'first_victory',
            'ace_slayer',
            'comeback_king',
            'battle_veteran',
            'tactical_genius',
            'iron_will',
            'grand_campaigner'
          ]
        });

        // Open profile dialog with modal panel class
        context.dialog.open(ProfileDialogComponent, {
          panelClass: 'glass-dialog-panel',
          autoFocus: false
        });
        break;
      }

      case 'victory': {
        const playerCasualties = [
          findFixtureCard(redCards, Suit.HEARTS, Rank.TWO),
          findFixtureCard(redCards, Suit.HEARTS, Rank.FOUR),
          findFixtureCard(redCards, Suit.DIAMONDS, Rank.SIX),
          findFixtureCard(redCards, Suit.DIAMONDS, Rank.NINE),
        ];
        const remainingPlayer = withoutFixtureCards(redCards, playerCasualties);
        const casualties = [...blackCards, ...playerCasualties];
        context.gameState.loadFixtureState({
          playerDeckCards: remainingPlayer,
          opponentDeckCards: [],
          playerDeckColor: DeckColor.RED,
          discardCards: casualties,
          turnNumber: 18,
          phase: GamePhase.GAME_OVER,
          winner: PlayerType.PLAYER,
          outcome: GameOutcome.PLAYER_WIN
        });

        context.controller.loadFixtureState({
          commander: 'cornered-general',
          phase: PresentationState.GAME_OVER,
          message: 'VICTORY! The opponent deck is exhausted.',
          battlefieldMessages: [
            { id: 1, text: 'VICTORY! The opponent deck is exhausted.' }
          ],
          gameSummary: {
            outcome: GameOutcome.PLAYER_WIN,
            turns: 18,
            battlesCount: 3,
            deepestBattleLayer: 2,
            maxCardsAtStake: 8,
            largestBattleVictory: 8,
            largestBattleLoss: 0,
            playerChallengesCount: 3,
            playerChallengesWon: 2,
            playerCardsRemaining: remainingPlayer.length,
            opponentCardsRemaining: 0,
            isComeback: true,
            maxDeficit: 4
          },
          turnsPlayed: 18
        });
        break;
      }

      default:
        console.warn(`Unknown screenshot scene: ${sceneId}`);
        return;
    }

    context.gameState.assertCardConservation();
    assertFixtureTurnHistory(context.gameState);
  }
}

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
        const playerCard = card(Suit.HEARTS, Rank.KING, 13, 'hearts-king');
        const opponentCard = card(Suit.CLUBS, Rank.TEN, 10, 'clubs-ten');
        const remainingPlayer = redCards.slice(0, 23);
        const remainingOpponent = blackCards.slice(0, 21);
        const casualties = [
          card(Suit.HEARTS, Rank.FOUR, 4, 'cas-1'),
          card(Suit.CLUBS, Rank.FIVE, 5, 'cas-2'),
          card(Suit.DIAMONDS, Rank.SIX, 6, 'cas-3')
        ];

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
        const playerCard = card(Suit.DIAMONDS, Rank.FIVE, 5, 'diamonds-five');
        const opponentCard = card(Suit.SPADES, Rank.TEN, 10, 'spades-ten');
        const remainingPlayer = redCards.slice(0, 21);
        const remainingOpponent = blackCards.slice(0, 23);
        const casualties = [
          card(Suit.HEARTS, Rank.THREE, 3, 'cas-1'),
          card(Suit.CLUBS, Rank.FOUR, 4, 'cas-2'),
          card(Suit.DIAMONDS, Rank.EIGHT, 8, 'cas-3'),
          card(Suit.SPADES, Rank.NINE, 9, 'cas-4')
        ];

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
          findFixtureCard(blackCards, Suit.CLUBS, Rank.EIGHT)
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
        const remainingPlayer = redCards.slice(0, 17);
        const remainingOpponent = blackCards.slice(0, 19);
        const casualties: Card[] = [
          card(Suit.HEARTS, Rank.ACE, 14, 'boneyard-1'),
          card(Suit.CLUBS, Rank.TWO, 2, 'boneyard-2'),
          card(Suit.DIAMONDS, Rank.KING, 13, 'boneyard-3'),
          card(Suit.SPADES, Rank.QUEEN, 12, 'boneyard-4'),
          card(Suit.HEARTS, Rank.JACK, 11, 'boneyard-5'),
          card(Suit.CLUBS, Rank.TEN, 10, 'boneyard-6'),
          card(Suit.DIAMONDS, Rank.NINE, 9, 'boneyard-7'),
          card(Suit.SPADES, Rank.EIGHT, 8, 'boneyard-8'),
          card(Suit.HEARTS, Rank.SEVEN, 7, 'boneyard-9'),
          card(Suit.CLUBS, Rank.SIX, 6, 'boneyard-10'),
          card(Suit.DIAMONDS, Rank.FIVE, 5, 'boneyard-11'),
          card(Suit.SPADES, Rank.FOUR, 4, 'boneyard-12'),
          card(Suit.HEARTS, Rank.THREE, 3, 'boneyard-13'),
          card(Suit.CLUBS, Rank.ACE, 14, 'boneyard-14')
        ];

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
        const remainingPlayer = redCards.slice(0, 24);
        const remainingOpponent = blackCards.slice(0, 24);

        context.gameState.loadFixtureState({
          playerDeckCards: remainingPlayer,
          opponentDeckCards: remainingOpponent,
          playerDeckColor: DeckColor.RED,
          discardCards: [
            card(Suit.HEARTS, Rank.EIGHT, 8, 'cas-1'),
            card(Suit.CLUBS, Rank.SEVEN, 7, 'cas-2')
          ],
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
        const remainingPlayer = redCards.slice(0, 20);
        const remainingOpponent = blackCards.slice(0, 20);

        context.gameState.loadFixtureState({
          playerDeckCards: remainingPlayer,
          opponentDeckCards: remainingOpponent,
          playerDeckColor: DeckColor.RED,
          discardCards: [],
          turnNumber: 1,
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
          deepestRecursiveBattle: 3,
          mostCardsAtStake: 14,
          totalChallenges: 65,
          successfulChallenges: 42,
          challengeSuccessRate: 65,
          acesDefeatedByTwo: 14,
          twosSavedByChallenge: 9,
          acesRescuedByChallenge: 8,
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
        const casualties = generateStandardDeck(DeckColor.BLACK);
        context.gameState.loadFixtureState({
          playerDeckCards: redCards,
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
            playerCardsRemaining: 26,
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
    }
  }
}

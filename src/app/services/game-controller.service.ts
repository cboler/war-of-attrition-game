import { Injectable, signal, NgZone } from '@angular/core';
import { GameStateService } from '../core/services/game-state.service';
import { TurnResolutionService, TurnResult } from '../core/services/turn-resolution.service';
import { SoundService } from '../core/services/sound.service';
import { GamePhase, PlayerType } from '../core/models/game-state.model';
import { Card } from '../core/models/card.model';

@Injectable({
  providedIn: 'root'
})
export class GameControllerService {
  // Game state signals
  private gameMessage = signal<string>('Click your deck to begin!');
  private challengeAvailable = signal<boolean>(false);
  private showChallenge = signal<boolean>(false);
  private challengeCard = signal<Card | null>(null);
  private showChallengeCard = signal<boolean>(false);
  private battleCards = signal<Card[]>([]);
  private opponentBattleCards = signal<Card[]>([]);
  private battlePhase = signal<'setup' | 'selection' | 'revealing' | 'resolution'>('setup');
  private selectedOpponentCard = signal<Card | null>(null);
  private selectedPlayerCard = signal<Card | null>(null);
  private revealAllBattleCards = signal<boolean>(false);
  private battleStep = signal<'none' | 'selection' | 'revealing_player' | 'revealing_opponent' | 'revealing_all'>('none');
  private canPlayerAct = signal<boolean>(false);

  // Readonly getters
  get message() { return this.gameMessage(); }
  get canChallenge() { return this.challengeAvailable(); }
  get showChallengePrompt() { return this.showChallenge(); }
  get currentChallengeCard() { return this.challengeCard(); }
  get showChallengeCardDisplay() { return this.showChallengeCard(); }
  get playerCanAct() { return this.canPlayerAct(); }
  get currentBattleCards() { return this.battleCards(); }
  get currentOpponentBattleCards() { return this.opponentBattleCards(); }
  get currentBattlePhase() { return this.battlePhase(); }
  get currentBattleStep() { return this.battleStep(); }
  get playerPickedCard() { return this.selectedOpponentCard(); }
  get opponentPickedCard() { return this.selectedPlayerCard(); }
  get isRevealAll() { return this.revealAllBattleCards(); }

  constructor(
    private gameStateService: GameStateService,
    private turnResolutionService: TurnResolutionService,
    private soundService: SoundService,
    private ngZone: NgZone
  ) {}

  /**
   * Initialize a new game
   */
  startNewGame(): void {
    this.gameStateService.initializeGame();
    this.gameMessage.set('Click your deck to begin!');
    this.challengeAvailable.set(false);
    this.showChallenge.set(false);
    this.challengeCard.set(null);
    this.showChallengeCard.set(false);
    this.battleCards.set([]);
    this.opponentBattleCards.set([]);
    this.battlePhase.set('setup');
    this.canPlayerAct.set(true);
  }

  /**
   * Handle player clicking their deck to start a turn
   */
  playerDrawCard(): boolean {
    if (!this.canPlayerAct() || this.gameStateService.currentPhase !== GamePhase.NORMAL) {
      return false;
    }

    this.soundService.playCardDraw();

    try {
      const { playerCard, opponentCard } = this.gameStateService.startTurn();
      
      if (!playerCard || !opponentCard) {
        return false;
      }

      // Process the turn
      const result = this.turnResolutionService.resolveTurn(playerCard, opponentCard);
      this.handleTurnResult(result);
      
      return true;
    } catch (error) {
      console.error('Error during turn:', error);
      return false;
    }
  }

  /**
   * Handle challenge decision
   */
  handleChallenge(acceptChallenge: boolean): void {
    if (!this.challengeAvailable()) {
      return;
    }

    if (!acceptChallenge) {
      // Player declines challenge, accept the loss.
      // Card movements (returning opponent's card and moving player's card to discard)
      // were already processed during initial turn resolution in TurnResolutionService.
      this.gameMessage.set('You declined the challenge. Your card is discarded.');
      this.showChallenge.set(false);
      this.challengeAvailable.set(false);
      this.canPlayerAct.set(true);
      return;
    }

    // Player accepts challenge - draw the challenge card and show it to them
    try {
      const playerChallengeCard = this.gameStateService.drawPlayerCard();
      if (!playerChallengeCard) {
        this.gameMessage.set('Cannot draw card for challenge!');
        return;
      }

      // Store the challenge card and show it to the user
      this.challengeCard.set(playerChallengeCard);
      this.showChallenge.set(false); // Hide the challenge prompt
      this.showChallengeCard.set(true); // Show the challenge card
      this.gameMessage.set('Your challenge card is revealed! Proceed with the challenge?');
      this.canPlayerAct.set(false); // Disable player actions during challenge card display
      
      // Store the challenge card in the active turn
      const activeTurn = this.gameStateService.currentState.activeTurn;
      if (activeTurn) {
        activeTurn.challengeCard = playerChallengeCard;
        this.gameStateService.setActiveTurn(activeTurn);
      }
      
    } catch (error) {
      console.error('Error during challenge:', error);
      this.gameMessage.set('Error during challenge!');
    }
  }

  /**
   * Confirm the challenge with the revealed card
   */
  confirmChallenge(): void {
    if (!this.challengeCard()) {
      return;
    }

    try {
      const activeTurn = this.gameStateService.currentState.activeTurn;
      if (!activeTurn || !activeTurn.playerCard || !activeTurn.opponentCard) {
        this.gameMessage.set('No active turn for challenge!');
        return;
      }

      const result = this.turnResolutionService.resolveChallenge(
        activeTurn.playerCard,
        activeTurn.opponentCard,
        this.challengeCard()!
      );

      // Reset challenge card state
      this.challengeCard.set(null);
      this.showChallengeCard.set(false);
      this.challengeAvailable.set(false);

      this.handleTurnResult(result);
    } catch (error) {
      console.error('Error during challenge resolution:', error);
      this.gameMessage.set('Error during challenge resolution!');
    }
  }

  /**
   * Handle battle card selection
   */
  selectBattleCard(selectedCard: Card): void {
    if (this.battlePhase() !== 'selection') {
      return;
    }

    try {
      const activeTurn = this.gameStateService.currentState.activeTurn;
      if (!activeTurn || !activeTurn.playerCard || !activeTurn.opponentCard) {
        return;
      }

      const playerCard = activeTurn.playerCard;
      const opponentCard = activeTurn.opponentCard;
      const opponentSelection = this.battleCards()[Math.floor(Math.random() * this.battleCards().length)];

      this.selectedOpponentCard.set(selectedCard);
      this.selectedPlayerCard.set(opponentSelection);
      this.battlePhase.set('revealing');
      this.battleStep.set('revealing_player');
      this.gameMessage.set('Revealing your selected card from opponent...');
      this.soundService.playCardFlip();

      setTimeout(() => {
        this.battleStep.set('revealing_opponent');
        this.gameMessage.set('Revealing opponent selected card from your deck...');
        this.soundService.playCardFlip();
      }, 700);

      setTimeout(() => {
        this.revealAllBattleCards.set(true);
        this.battleStep.set('revealing_all');
        this.gameMessage.set('Revealing all battle cards...');
        this.soundService.playClash();
      }, 1400);

      setTimeout(() => {
        const result = this.turnResolutionService.resolveBattle(
          playerCard,
          opponentCard,
          this.battleCards(),
          this.opponentBattleCards(),
          selectedCard,
          opponentSelection
        );

        this.selectedOpponentCard.set(null);
        this.selectedPlayerCard.set(null);
        this.revealAllBattleCards.set(false);
        this.battleStep.set('none');

        this.handleTurnResult(result);
      }, 2600);
    } catch (error) {
      console.error('Error during battle:', error);
      this.gameMessage.set('Error during battle!');
      this.battlePhase.set('setup');
      this.battleStep.set('none');
    }
  }

  /**
   * Handle the result of a turn/challenge/battle
   */
  private handleTurnResult(result: TurnResult): void {
    this.gameMessage.set(result.message);

    // Set the last result for clash animations
    this.gameStateService.setLastResult(result.result);

    if (result.nextPhase === GamePhase.GAME_OVER) {
      if (this.gameStateService.currentState.winner === PlayerType.PLAYER) {
        this.soundService.playVictory();
      } else {
        this.soundService.playDefeat();
      }
    } else if (result.nextPhase === GamePhase.BATTLE) {
      this.soundService.playClash();
    }

    // Handle opponent challenge
    if (result.opponentChallenge) {
      this.handleOpponentChallenge();
      return;
    }

    switch (result.nextPhase) {
      case GamePhase.NORMAL:
        this.canPlayerAct.set(true);
        this.challengeAvailable.set(false);
        this.showChallenge.set(false);
        this.battleCards.set([]);
        this.opponentBattleCards.set([]);
        this.battlePhase.set('setup');
        break;

      case GamePhase.CHALLENGE:
        this.canPlayerAct.set(false);
        this.challengeAvailable.set(result.canChallenge);
        this.showChallenge.set(result.canChallenge);
        break;

      case GamePhase.BATTLE:
        this.setupBattle();
        break;

      case GamePhase.GAME_OVER:
        this.canPlayerAct.set(false);
        this.challengeAvailable.set(false);
        this.showChallenge.set(false);
        break;
    }
  }

  /**
   * Setup battle phase
   */
  private setupBattle(): void {
    this.canPlayerAct.set(false);
    this.battlePhase.set('setup');
    
    // Draw 3 cards for each player for battle
    const playerCards: Card[] = [];
    const opponentCards: Card[] = [];

    for (let i = 0; i < 3; i++) {
      const playerCard = this.gameStateService.drawPlayerCard();
      const opponentCard = this.gameStateService.drawOpponentCard();
      
      if (playerCard) playerCards.push(playerCard);
      if (opponentCard) opponentCards.push(opponentCard);
    }

    this.battleCards.set(playerCards);
    this.opponentBattleCards.set(opponentCards);
    this.battlePhase.set('selection');
    this.gameMessage.set('Battle! Select one of the opponent\'s face-down cards.');
  }

  /**
   * Get current game stats for UI
   */
  getGameStats() {
    return this.gameStateService.currentStats;
  }

  /**
   * Get current game state
   */
  getGameState() {
    return this.gameStateService.currentState;
  }

  /**
   * Handle opponent challenge automatically
   */
  private handleOpponentChallenge(): void {
    try {
      const activeTurn = this.gameStateService.currentState.activeTurn;
      if (!activeTurn || !activeTurn.playerCard || !activeTurn.opponentCard) {
        this.gameMessage.set('Error: No active turn for opponent challenge!');
        return;
      }

      // Draw challenge card for opponent
      const opponentChallengeCard = this.gameStateService.drawOpponentCard();
      if (!opponentChallengeCard) {
        this.gameMessage.set('Opponent cannot draw card for challenge!');
        // Process as if opponent declined challenge
        this.gameStateService.returnCardsToPlayerDeck([activeTurn.playerCard]);
        this.gameStateService.addToDiscardPile([activeTurn.opponentCard]);
        this.gameMessage.set('Opponent cannot challenge. You win the turn!');
        this.canPlayerAct.set(true);
        return;
      }

      // Slight delay to show challenge message, then resolve automatically
      setTimeout(() => {
        this.ngZone.run(() => {
          try {
            const result = this.turnResolutionService.resolveOpponentChallenge(
              activeTurn.playerCard!,
              activeTurn.opponentCard!,
              opponentChallengeCard
            );
            
            this.handleTurnResult(result);
          } catch (error) {
            console.error('Error in opponent challenge setTimeout:', error);
            this.gameMessage.set('Error during opponent challenge resolution!');
            this.canPlayerAct.set(true);
          }
        });
      }, 1500); // 1.5 second delay to let player see the challenge message

      this.canPlayerAct.set(false);
      this.gameMessage.set('Opponent is challenging your win...');
      
    } catch (error) {
      console.error('Error during opponent challenge:', error);
      this.gameMessage.set('Error during opponent challenge!');
      this.canPlayerAct.set(true);
    }
  }
}
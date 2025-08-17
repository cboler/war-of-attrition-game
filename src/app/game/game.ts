import { Component, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { GameDemoService } from '../services/game-demo.service';
import { GameBoardComponent } from '../shared/components/game-board/game-board.component';
import { ActionIndicatorComponent } from '../shared/components/action-indicator/action-indicator.component';
import { CardImpl, Suit, Rank } from '../core/models/card.model';
import { ProgressService } from '../services/progress.service';

@Component({
  selector: 'app-game',
  imports: [
    MatCardModule, 
    MatButtonModule, 
    RouterLink, 
    GameBoardComponent,
    ActionIndicatorComponent
  ],
  templateUrl: './game.html',
  styleUrl: './game.scss'
})
export class Game implements OnInit {
  protected demoLog = signal<string[]>([]);
  // Demo UI state
  protected showOldDemo = signal<boolean>(false);
  protected showGameBoard = signal<boolean>(true);
  // Game board demo state
  protected playerCardCount = signal<number>(26);
  protected opponentCardCount = signal<number>(26);
  protected playerActiveCard = signal(new CardImpl(Suit.HEARTS, Rank.KING));
  protected opponentActiveCard = signal(new CardImpl(Suit.SPADES, Rank.QUEEN));
  protected playerCardGlow = signal<'green' | 'red' | 'blue' | null>('green');
  protected opponentCardGlow = signal<'green' | 'red' | 'blue' | null>('red');
  protected gameMessage = signal<string>('You win this round! King beats Queen.');
  protected challengeAvailable = signal<boolean>(false);
  protected canPlayerAct = signal<boolean>(true);
  protected showActionIndicator = signal<boolean>(false);
  protected progressData: ProgressData;
  protected currentMilestone: ProgressData['currentMilestone'];
  protected progressData: ProgressData;
  protected currentMilestone: ProgressData['milestone'];
  protected completedMilestone: ProgressData['milestone'];

  constructor(
    private gameDemoService: GameDemoService,
    private progressService: ProgressService
  ) {
    this.progressData = this.progressService.getProgressData();
    this.currentMilestone = this.progressService.getCurrentMilestone();
    this.completedMilestone = this.progressService.getCompletedMilestone(2);
  }

  ngOnInit(): void {
    if (this.showOldDemo()) {
      this.runDemo();
    }
  }

  runDemo(): void {
    const log = this.gameDemoService.runGameDemo();
    this.demoLog.set(log);
  }

  toggleDemo(): void {
    this.showOldDemo.update(v => !v);
    this.showGameBoard.update(v => !v);
  }

  onPlayerDeckClick(): void {
    console.log('Player deck clicked!');
    // Demo: simulate a new turn
    this.simulateNewTurn();
  }

  simulateChallenge(): void {
    this.challengeAvailable.set(true);
    this.gameMessage.set('You lost this round. Challenge available!');
    this.playerCardGlow.set('red');
    this.opponentCardGlow.set('green');
  }

  simulateBattle(): void {
    this.gameMessage.set('Cards tie! Battle initiated.');
    this.playerCardGlow.set('blue');
    this.opponentCardGlow.set('blue');
    this.challengeAvailable.set(false);
  }

  private simulateNewTurn(): void {
    // Create random cards for demo
    const suits = [Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS, Suit.SPADES];
    const ranks = [Rank.ACE, Rank.KING, Rank.QUEEN, Rank.JACK, Rank.TEN, Rank.NINE, Rank.EIGHT];
    
    const playerCard = new CardImpl(
      suits[Math.floor(Math.random() * suits.length)],
      ranks[Math.floor(Math.random() * ranks.length)]
    );
    
    const opponentCard = new CardImpl(
      suits[Math.floor(Math.random() * suits.length)],
      ranks[Math.floor(Math.random() * ranks.length)]
    );

    this.playerActiveCard.set(playerCard);
    this.opponentActiveCard.set(opponentCard);

    // Simulate comparison
    if (playerCard.value > opponentCard.value) {
      this.playerCardGlow.set('green');
      this.opponentCardGlow.set('red');
      this.gameMessage.set(`You win! ${playerCard.rank} beats ${opponentCard.rank}.`);
      this.challengeAvailable.set(false);
    } else if (playerCard.value < opponentCard.value) {
      this.playerCardGlow.set('red');
      this.opponentCardGlow.set('green');
      this.gameMessage.set(`You lose! ${opponentCard.rank} beats ${playerCard.rank}.`);
      this.challengeAvailable.set(true);
    } else {
      this.playerCardGlow.set('blue');
      this.opponentCardGlow.set('blue');
      this.gameMessage.set('Cards tie! Battle time!');
      this.challengeAvailable.set(false);
    }

    // Update card counts
    this.playerCardCount.update(count => Math.max(1, count - 1));
    this.opponentCardCount.update(count => Math.max(1, count - 1));
  }
}

import { Component, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { GameDemoService } from '../services/game-demo.service';
import { ProgressService } from '../services/progress.service';

@Component({
  selector: 'app-game',
  imports: [MatCardModule, MatButtonModule, RouterLink],
  templateUrl: './game.html',
  styleUrl: './game.scss'
})
export class Game implements OnInit {
  protected demoLog = signal<string[]>([]);
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
    this.runDemo();
  }

  runDemo(): void {
    const log = this.gameDemoService.runGameDemo();
    this.demoLog.set(log);
  }
}

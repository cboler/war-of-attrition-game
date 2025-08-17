import { Component, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { GameDemoService } from '../services/game-demo.service';

@Component({
  selector: 'app-game',
  imports: [MatCardModule, MatButtonModule, RouterLink],
  templateUrl: './game.html',
  styleUrl: './game.scss'
})
export class Game implements OnInit {
  protected demoLog = signal<string[]>([]);

  constructor(private gameDemoService: GameDemoService) {}

  ngOnInit(): void {
    this.runDemo();
  }

  runDemo(): void {
    const log = this.gameDemoService.runGameDemo();
    this.demoLog.set(log);
  }
}

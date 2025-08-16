import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-game',
  imports: [MatCardModule, MatButtonModule],
  templateUrl: './game.html',
  styleUrl: './game.scss'
})
export class Game {

}

import { Routes } from '@angular/router';
import { Game } from './game/game';

export const routes: Routes = [
  { path: '', component: Game },
  { path: '**', redirectTo: '' }
];

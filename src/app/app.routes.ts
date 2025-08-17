import { Routes } from '@angular/router';
import { Game } from './game/game';
import { Settings } from './settings/settings';

export const routes: Routes = [
  { path: '', component: Game },
  { path: 'settings', component: Settings },
  { path: '**', redirectTo: '' }
];

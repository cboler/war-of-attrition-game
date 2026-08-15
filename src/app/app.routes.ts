import { Routes } from '@angular/router';
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./table-game/table-game').then(m => m.TableGame)
  },
  {
    path: 'classic',
    loadComponent: () => import('./game/game').then(m => m.Game)
  },
  { 
    path: 'settings', 
    loadComponent: () => import('./settings/settings').then(m => m.Settings)
  },
  { path: '**', redirectTo: '' }
];

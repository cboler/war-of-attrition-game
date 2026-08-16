import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./table-game/table-game').then(m => m.TableGame)
  },
  { 
    path: 'settings', 
    loadComponent: () => import('./settings/settings').then(m => m.Settings)
  },
  { path: '**', redirectTo: '' }
];


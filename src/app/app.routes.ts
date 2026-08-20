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
  {
    path: 'tutorial-harness',
    loadComponent: () => import('./shared/components/tutorial-harness/tutorial-harness.component').then(m => m.TutorialHarnessComponent)
  },
  {
    path: 'privacy',
    loadComponent: () => import('./public/privacy/privacy.component').then(m => m.PrivacyComponent)
  },
  {
    path: 'support',
    loadComponent: () => import('./public/support/support.component').then(m => m.SupportComponent)
  },
  {
    path: 'delete-account',
    loadComponent: () => import('./public/data-deletion/data-deletion.component').then(m => m.DataDeletionComponent)
  },
  {
    path: 'data-deletion',
    loadComponent: () => import('./public/data-deletion/data-deletion.component').then(m => m.DataDeletionComponent)
  },
  { path: '**', redirectTo: '' }
];



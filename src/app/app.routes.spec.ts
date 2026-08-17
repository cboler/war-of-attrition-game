import { routes } from './app.routes';
import { TableGame } from './table-game/table-game';
import { PrivacyComponent } from './public/privacy/privacy.component';
import { SupportComponent } from './public/support/support.component';
import { DataDeletionComponent } from './public/data-deletion/data-deletion.component';

describe('application routes', () => {
  it('makes the card table primary', async () => {
    const primary = routes.find(route => route.path === '');
    expect(primary?.loadComponent).toBeDefined();
    expect(await primary!.loadComponent!()).toBe(TableGame);
  });

  it('loads public privacy route without authentication', async () => {
    const privacyRoute = routes.find(route => route.path === 'privacy');
    expect(privacyRoute?.loadComponent).toBeDefined();
    expect(await privacyRoute!.loadComponent!()).toBe(PrivacyComponent);
  });

  it('loads public support route without authentication', async () => {
    const supportRoute = routes.find(route => route.path === 'support');
    expect(supportRoute?.loadComponent).toBeDefined();
    expect(await supportRoute!.loadComponent!()).toBe(SupportComponent);
  });

  it('loads public delete-account and data-deletion routes without authentication', async () => {
    const delRoute = routes.find(route => route.path === 'delete-account');
    const dataDelRoute = routes.find(route => route.path === 'data-deletion');
    expect(delRoute?.loadComponent).toBeDefined();
    expect(dataDelRoute?.loadComponent).toBeDefined();
    expect(await delRoute!.loadComponent!()).toBe(DataDeletionComponent);
    expect(await dataDelRoute!.loadComponent!()).toBe(DataDeletionComponent);
  });

  it('redirects unknown routes to primary card table', () => {
    const wildCard = routes.find(route => route.path === '**');
    expect(wildCard?.redirectTo).toBe('');
  });
});



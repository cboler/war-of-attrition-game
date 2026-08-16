import { routes } from './app.routes';
import { TableGame } from './table-game/table-game';

describe('application routes', () => {
  it('makes the card table primary', async () => {
    const primary = routes.find(route => route.path === '');
    expect(primary?.loadComponent).toBeDefined();
    expect(await primary!.loadComponent!()).toBe(TableGame);
  });

  it('redirects unknown routes to primary card table', () => {
    const wildCard = routes.find(route => route.path === '**');
    expect(wildCard?.redirectTo).toBe('');
  });
});


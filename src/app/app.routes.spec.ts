import { routes } from './app.routes';
import { TableGame } from './table-game/table-game';
import { Game } from './game/game';

describe('application routes', () => {
  it('makes the redesigned card table primary and retains the classic route for review', async () => {
    const primary = routes.find(route => route.path === '');
    const classic = routes.find(route => route.path === 'classic');
    expect(primary?.loadComponent).toBeDefined();
    expect(classic?.loadComponent).toBeDefined();
    expect(await primary!.loadComponent!()).toBe(TableGame);
    expect(await classic!.loadComponent!()).toBe(Game);
  });
});

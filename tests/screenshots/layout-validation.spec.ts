import { expect, Page, test } from '@playwright/test';
import { loadScreenshotScene } from './screenshot-helpers';

interface Bounds {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}

async function bounds(page: Page, selector: string): Promise<Bounds | null> {
  const locator = page.locator(selector).first();
  if ((await locator.count()) === 0) return null;
  return locator.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden') return null;
    return { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom };
  });
}

function intersects(first: Bounds | null, second: Bounds | null): boolean {
  if (!first || !second) return false;
  return !(
    first.right <= second.left ||
    first.left >= second.right ||
    first.bottom <= second.top ||
    first.top >= second.bottom
  );
}

async function assertFixedTableFits(page: Page, width: number, height: number): Promise<void> {
  await page.setViewportSize({ width, height });
  await loadScreenshotScene(page, 'clash');

  const viewport = await page.evaluate(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
    scrollWidth: document.documentElement.scrollWidth,
    scrollHeight: document.documentElement.scrollHeight,
    measuredHeight: getComputedStyle(document.querySelector('app-root')!).getPropertyValue(
      '--app-viewport-height',
    ),
  }));

  expect(viewport.width).toBe(width);
  expect(viewport.height).toBe(height);
  expect(viewport.scrollWidth).toBeLessThanOrEqual(width);
  expect(viewport.scrollHeight).toBeLessThanOrEqual(height);
  expect(Number.parseFloat(viewport.measuredHeight)).toBeCloseTo(height, 0);

  for (const selector of [
    '.rail-top app-player-seat .seat',
    '.playfield',
    '.rail-bottom app-player-seat .seat',
    '.rail-bottom app-player-seat .deck',
  ]) {
    const rect = await bounds(page, selector);
    expect(rect, `${selector} should be rendered`).not.toBeNull();
    expect(rect!.left, `${selector} should not escape left`).toBeGreaterThanOrEqual(0);
    expect(rect!.right, `${selector} should not escape right`).toBeLessThanOrEqual(width + 1);
    expect(rect!.top, `${selector} should not escape top`).toBeGreaterThanOrEqual(0);
    expect(rect!.bottom, `${selector} should not escape bottom`).toBeLessThanOrEqual(height + 1);
  }
}

test.describe('Table first-render layout and message composition', () => {
  test('fits compact phone 360 x 740 on first render', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'store-phone');
    await assertFixedTableFits(page, 360, 740);
  });

  test('fits 540 x 960 on first render', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'store-phone');
    await assertFixedTableFits(page, 540, 960);
  });

  test('fits desktop tabletop 1280 x 800 on first render', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'store-tablet-10in');
    await assertFixedTableFits(page, 1280, 800);
  });

  test('keeps compact clash copy, math, reactions, and actions compositionally separate', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'store-phone');
    await page.setViewportSize({ width: 360, height: 740 });
    await loadScreenshotScene(page, 'clash');

    const announcement = await bounds(page, '.announcement .message-stack');
    const reaction = await bounds(page, '.rail-top .quip');
    const actions = await bounds(page, '.thumb-action-region');
    const strengthBadges = await page.locator('app-comparison-strength').all();

    expect(intersects(announcement, reaction)).toBeFalsy();
    for (const badge of strengthBadges) {
      const rect = await badge.evaluate((element) => {
        const box = element.getBoundingClientRect();
        return { left: box.left, top: box.top, right: box.right, bottom: box.bottom };
      });
      expect(intersects(announcement, rect), 'combat math should not cover result copy').toBeFalsy();
      expect(intersects(actions, rect), 'actions should not cover combat math').toBeFalsy();
    }
  });

  test('keeps compact Challenge callout and controls clear of cards', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'store-phone');
    await page.setViewportSize({ width: 360, height: 740 });
    await loadScreenshotScene(page, 'challenge');

    const callout = await bounds(page, '.player-callout');
    const actions = await bounds(page, '.thumb-action-region');
    const announcement = await bounds(page, '.announcement');
    const playerCard = await bounds(page, '.player-stake > .active-card-shell');
    const opponentCard = await bounds(page, '.opponent-stake > .active-card-shell');

    expect(intersects(callout, actions)).toBeFalsy();
    expect(intersects(announcement, callout)).toBeFalsy();
    expect(intersects(actions, playerCard), 'Challenge controls should not obscure the player card').toBeFalsy();
    expect(intersects(actions, opponentCard), 'Challenge controls should not obscure the opponent card').toBeFalsy();
  });

  test('visually stages all six Battle commitments in the Field Manual drill', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'store-phone');
    await page.setViewportSize({ width: 540, height: 960 });
    await loadScreenshotScene(page, 'manual');

    await page.getByRole('tab', { name: 'Rules of Engagement' }).click();
    await page.locator('[data-rule-demo-id="battle"]').click();
    await expect(page.locator('app-rule-demo')).toBeVisible();
    const skip = page.getByRole('button', { name: 'Skip to result' });
    if (await skip.isEnabled()) await skip.click();

    await expect(page.locator('.committed-card')).toHaveCount(6);
    await expect(page.locator('.opponent-commitment .committed-card')).toHaveCount(3);
    await expect(page.locator('.player-commitment .committed-card')).toHaveCount(3);
    await expect(page.locator('.committed-card.revealed')).toHaveCount(2);
    await expect(page.getByRole('button', { name: 'Replay' })).toBeVisible();

    const screenshot = await page.screenshot({
      path: testInfo.outputPath('battle-rule-demo.png'),
      animations: 'disabled',
    });
    await testInfo.attach('Battle rule demo', { body: screenshot, contentType: 'image/png' });
  });

  test('renders the commander dossier portrait and accessible crest switcher', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'store-phone');
    await page.setViewportSize({ width: 540, height: 960 });
    await loadScreenshotScene(page, 'manual');

    await page.getByRole('tab', { name: 'Dossiers' }).click();
    const portrait = page.locator('.dossier-portrait');
    await expect(portrait).toBeVisible();
    await expect(portrait).toHaveAttribute('src', /(?:^|\/)assets\/commanders\/.+\/calm\.jpg$/);
    await expect(portrait).toHaveAttribute('alt', '');

    const commanderTabs = page.getByRole('tablist', { name: 'Select commander dossier' });
    await expect(commanderTabs).toBeVisible();
    await expect(commanderTabs.getByRole('tab')).toHaveCount(5);
    await expect(commanderTabs.locator('.commander-crest')).toHaveCount(5);
    for (const tab of await commanderTabs.getByRole('tab').all()) {
      const labelFits = await tab.evaluate((element) => {
        const tabRect = element.getBoundingClientRect();
        const labelRect = element.querySelector('.chip-name')!.getBoundingClientRect();
        return labelRect.left >= tabRect.left && labelRect.right <= tabRect.right;
      });
      expect(labelFits, 'commander names should remain inside their crest buttons').toBeTruthy();
    }

    const screenshot = await page.screenshot({
      path: testInfo.outputPath('commander-dossier.png'),
      animations: 'disabled',
    });
    await testInfo.attach('Commander dossier', { body: screenshot, contentType: 'image/png' });
  });
});

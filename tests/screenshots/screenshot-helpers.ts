import { Page, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { ScreenshotTarget, SCREENSHOT_TARGETS } from './screenshot-matrix';

export interface SceneLoadOptions {
  readonly scene: string;
}

export async function setupPageEnvironment(page: Page): Promise<void> {
  // Capture unhandled page errors and console errors
  page.on('pageerror', (error) => {
    console.error(`[Browser PageError]: ${error.message}`);
  });

  // Inject privacy and test-safe defaults before DOM loads
  await page.addInitScript(() => {
    try {
      localStorage.setItem('war-of-attrition-telemetry-consent', 'denied');
      localStorage.setItem(
        'war-of-attrition-settings',
        JSON.stringify({
          deckHand: 'right',
          selectedCardBacking: 'classic-blue',
          animationSpeed: 'normal',
          soundEnabled: false,
          showTurnCounter: true,
          tutorialEnabled: false,
          confirmChallenges: false,
          autoPlayAnimations: false,
          showCardDetails: true,
        })
      );
    } catch {
      // Ignore if localStorage unavailable during early init
    }
  });
}

export async function loadScreenshotScene(page: Page, scene: string): Promise<void> {
  await setupPageEnvironment(page);

  // Navigate directly with query parameter seam
  const response = await page.goto(`/?scene=${encodeURIComponent(scene)}`, {
    waitUntil: 'domcontentloaded',
  });

  expect(response?.status()).toBeLessThan(400);

  // Wait for Angular app container to be ready
  await expect(page.locator('app-table-game')).toBeVisible({ timeout: 15_000 });

  // Wait for web fonts to finish loading for crisp rendering
  await page.evaluate(async () => {
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }
  });

  // Brief stabilization delay to ensure CSS transitions finish settling
  await page.waitForTimeout(250);
}

export async function captureStoreScreenshot(
  page: Page,
  target: ScreenshotTarget,
  baseOutputDir: string
): Promise<string> {
  // Verify all expected scene selectors are visible
  for (const selector of target.expectedSelectors) {
    const element = page.locator(selector).first();
    await expect(element).toBeVisible({ timeout: 10_000 });
  }

  const categoryDir = path.join(baseOutputDir, target.deviceCategory);
  if (!fs.existsSync(categoryDir)) {
    fs.mkdirSync(categoryDir, { recursive: true });
  }

  const outputPath = path.join(categoryDir, target.filename);

  // Capture viewport screenshot
  await page.screenshot({
    path: outputPath,
    fullPage: false,
    animations: 'disabled',
  });

  // Basic sanity assertion: file exists and has non-zero size
  expect(fs.existsSync(outputPath)).toBe(true);
  const stats = fs.statSync(outputPath);
  expect(stats.size).toBeGreaterThan(10_000); // Store-quality PNGs should be at least 10KB

  return outputPath;
}

export function writeManifestAndReadme(outputDir: string): void {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 1. Generate manifest.json
  const manifestPath = path.join(outputDir, 'manifest.json');
  const manifestData = {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    totalScreenshots: SCREENSHOT_TARGETS.length,
    targets: SCREENSHOT_TARGETS.map((t) => ({
      id: t.id,
      filename: `${t.deviceCategory}/${t.filename}`,
      scene: t.scene,
      deviceCategory: t.deviceCategory,
      layoutDescription: t.layoutDescription,
      sceneDescription: t.sceneDescription,
      responsiveBreakpoint: t.responsiveBreakpoint,
      cssViewport: `${t.cssViewport.width}x${t.cssViewport.height}`,
      deviceScaleFactor: t.deviceScaleFactor,
      outputDimensions: `${t.outputDimensions.width}x${t.outputDimensions.height}`,
      recommendedOrder: t.recommendedOrder,
      suggestedAltText: t.suggestedAltText,
    })),
  };

  fs.writeFileSync(manifestPath, JSON.stringify(manifestData, null, 2), 'utf-8');

  // 2. Generate README.md
  const readmePath = path.join(outputDir, 'README.md');
  const phoneTargets = SCREENSHOT_TARGETS.filter((t) => t.deviceCategory === 'phone');
  const tablet7Targets = SCREENSHOT_TARGETS.filter((t) => t.deviceCategory === 'tablet-7in');
  const tablet10Targets = SCREENSHOT_TARGETS.filter((t) => t.deviceCategory === 'tablet-10in');

  const formatTargetRows = (targets: readonly ScreenshotTarget[]) =>
    targets
      .map(
        (t) =>
          `| \`${t.filename}\` | **${t.recommendedOrder}** | ${t.outputDimensions.width}×${t.outputDimensions.height} | ${t.sceneDescription} | *${t.suggestedAltText}* |`
      )
      .join('\n');

  const readmeContent = `# Google Play Store Screenshots: War of Attrition

Automated, deterministic Google Play Store listing screenshot package for **War of Attrition**.

Generated at: \`${new Date().toISOString()}\`  
Total Screenshots: **${SCREENSHOT_TARGETS.length}**

---

## Google Play Console Upload Guide

When uploading to **Google Play Console** under **Store presence > Main store listing > Phone / 7-inch tablet / 10-inch tablet screenshots**, upload the files in the recommended order shown below:

### 1. Phone Screenshots (\`store-assets/screenshots/phone/\`)
*Target Resolution: 1080×1920 (9:16 Portrait)*

| File | Order | Resolution | Scene | Suggested Alt Text (max 140 chars) |
|---|---|---|---|---|
${formatTargetRows(phoneTargets)}

---

### 2. 7-Inch Tablet Screenshots (\`store-assets/screenshots/tablet-7in/\`)
*Target Resolution: 1200×1920 (10:16 Portrait)*

| File | Order | Resolution | Scene | Suggested Alt Text (max 140 chars) |
|---|---|---|---|---|
${formatTargetRows(tablet7Targets)}

---

### 3. 10-Inch Tablet / Chromebook Screenshots (\`store-assets/screenshots/tablet-10in/\`)
*Target Resolution: 2560×1600 (16:10 Tabletop Landscape)*

| File | Order | Resolution | Scene | Suggested Alt Text (max 140 chars) |
|---|---|---|---|---|
${formatTargetRows(tablet10Targets)}

---

## How to Regenerate Locally

1. Install Playwright Chromium:
   \`\`\`bash
   npx playwright install chromium
   \`\`\`
   *(On Linux with dependencies: \`npx playwright install --with-deps chromium\`)*

2. Run screenshot generation:
   \`\`\`bash
   npm run screenshots:store
   \`\`\`

3. Validate generated screenshot dimensions and manifest:
   \`\`\`bash
   npm run screenshots:validate
   \`\`\`

---

## How to Run in GitHub Actions

1. Navigate to the **Actions** tab in GitHub.
2. Select **Generate Google Play Store Screenshots**.
3. Click **Run workflow** (\`workflow_dispatch\`).
4. Download the resulting artifact: **\`google-play-store-screenshots\`**.

---

## Diagnostic Traces

If screenshot generation fails, Playwright traces and failure screenshots are recorded in \`test-results/\` and published as the **\`playwright-diagnostics\`** workflow artifact.

To view a trace locally:
\`\`\`bash
npx playwright show-trace test-results/<test-dir>/trace.zip
\`\`\`
`;

  fs.writeFileSync(readmePath, readmeContent, 'utf-8');
}

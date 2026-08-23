import { test } from '@playwright/test';
import * as path from 'path';
import { SCREENSHOT_TARGETS, DeviceCategory } from './screenshot-matrix';
import {
  loadScreenshotScene,
  captureStoreScreenshot,
  writeManifestAndReadme,
} from './screenshot-helpers';

const OUTPUT_DIR = path.resolve(process.cwd(), 'store-assets', 'screenshots');

test.describe('Google Play Store Screenshot Suite', () => {
  test.afterAll(() => {
    writeManifestAndReadme(OUTPUT_DIR);
  });

  const projectCategoryMap: Record<string, DeviceCategory> = {
    'store-phone': 'phone',
    'store-tablet-7in': 'tablet-7in',
    'store-tablet-10in': 'tablet-10in',
  };

  for (const target of SCREENSHOT_TARGETS) {
    test(`[${target.deviceCategory}] ${target.filename} - ${target.sceneDescription}`, async ({
      page,
    }, testInfo) => {
      const expectedCategory = projectCategoryMap[testInfo.project.name];

      // Skip targets that do not match the current project layout category
      test.skip(
        target.deviceCategory !== expectedCategory,
        `Target ${target.id} belongs to category ${target.deviceCategory}, skipping on ${testInfo.project.name}`
      );

      // Load deterministic scene in Angular app
      await loadScreenshotScene(page, target.scene);

      // Assert readiness and capture screenshot
      await captureStoreScreenshot(page, target, OUTPUT_DIR);
    });
  }
});

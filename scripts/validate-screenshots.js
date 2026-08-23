const fs = require('fs');
const path = require('path');

/**
 * Validates Google Play Store screenshot artifacts:
 * - Checks existence and minimum file size
 * - Reads PNG IHDR header for exact width, height, and bit depth
 * - Validates manifest.json and README.md
 */

const BASE_DIR = path.resolve(__dirname, '..', 'store-assets', 'screenshots');

const EXPECTED_FILES = [
  // Phone (1080 x 1920)
  { relativePath: 'phone/01-active-clash.png', expectedWidth: 1080, expectedHeight: 1920 },
  { relativePath: 'phone/02-tactical-challenge.png', expectedWidth: 1080, expectedHeight: 1920 },
  { relativePath: 'phone/03-deadlock-battle.png', expectedWidth: 1080, expectedHeight: 1920 },
  { relativePath: 'phone/04-field-manual.png', expectedWidth: 1080, expectedHeight: 1920 },
  { relativePath: 'phone/05-commander-profile.png', expectedWidth: 1080, expectedHeight: 1920 },

  // 7-inch Tablet (1200 x 1920)
  { relativePath: 'tablet-7in/01-deadlock-battle.png', expectedWidth: 1200, expectedHeight: 1920 },
  { relativePath: 'tablet-7in/02-boneyard-casualties.png', expectedWidth: 1200, expectedHeight: 1920 },
  { relativePath: 'tablet-7in/03-war-victory.png', expectedWidth: 1200, expectedHeight: 1920 },

  // 10-inch Tablet (2560 x 1600)
  { relativePath: 'tablet-10in/01-tabletop-clash.png', expectedWidth: 2560, expectedHeight: 1600 },
  { relativePath: 'tablet-10in/02-multi-layer-battle.png', expectedWidth: 2560, expectedHeight: 1600 },
  { relativePath: 'tablet-10in/03-field-manual.png', expectedWidth: 2560, expectedHeight: 1600 },
];

function readPngDimensions(filePath) {
  const buffer = fs.readFileSync(filePath);
  
  // Verify PNG header signature: 89 50 4E 47 0D 0A 1A 0A
  const isPng =
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a;

  if (!isPng) {
    throw new Error(`File is not a valid PNG: ${filePath}`);
  }

  // IHDR chunk starts at byte 12
  const chunkType = buffer.toString('ascii', 12, 16);
  if (chunkType !== 'IHDR') {
    throw new Error(`Invalid PNG chunk format (expected IHDR): ${filePath}`);
  }

  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  const bitDepth = buffer[24];
  const colorType = buffer[25];

  return { width, height, bitDepth, colorType, sizeBytes: buffer.length };
}

function validate() {
  console.log('======================================================');
  console.log('Validating Google Play Store Screenshot Artifacts');
  console.log('Base Directory:', BASE_DIR);
  console.log('======================================================\n');

  let errors = 0;
  let validatedCount = 0;

  // 1. Verify Manifest
  const manifestPath = path.join(BASE_DIR, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    console.error('❌ Missing manifest.json at', manifestPath);
    errors++;
  } else {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      if (!Array.isArray(manifest.targets) || manifest.targets.length !== EXPECTED_FILES.length) {
        console.error(`❌ manifest.json has invalid targets count: expected ${EXPECTED_FILES.length}, got ${manifest.targets?.length}`);
        errors++;
      } else {
        console.log(`✓ manifest.json is valid (${manifest.targets.length} targets documented)`);
      }
    } catch (err) {
      console.error('❌ Failed to parse manifest.json:', err.message);
      errors++;
    }
  }

  // 2. Verify README.md
  const readmePath = path.join(BASE_DIR, 'README.md');
  if (!fs.existsSync(readmePath)) {
    console.error('❌ Missing README.md at', readmePath);
    errors++;
  } else {
    console.log('✓ README.md is present');
  }

  // 3. Verify each image file
  console.log('\nVerifying Screenshot Images:');
  for (const item of EXPECTED_FILES) {
    const fullPath = path.join(BASE_DIR, item.relativePath);
    if (!fs.existsSync(fullPath)) {
      console.error(`❌ Missing screenshot: ${item.relativePath}`);
      errors++;
      continue;
    }

    try {
      const meta = readPngDimensions(fullPath);
      const sizeKb = (meta.sizeBytes / 1024).toFixed(1);

      if (meta.sizeBytes < 10000) {
        console.error(`❌ File suspiciously small (${sizeKb} KB): ${item.relativePath}`);
        errors++;
        continue;
      }

      if (meta.width !== item.expectedWidth || meta.height !== item.expectedHeight) {
        console.error(
          `❌ Dimension mismatch for ${item.relativePath}: expected ${item.expectedWidth}x${item.expectedHeight}, got ${meta.width}x${meta.height}`
        );
        errors++;
        continue;
      }

      console.log(
        `✓ [${meta.width}x${meta.height}, ${sizeKb} KB] ${item.relativePath}`
      );
      validatedCount++;
    } catch (err) {
      console.error(`❌ Error verifying ${item.relativePath}:`, err.message);
      errors++;
    }
  }

  console.log('\n======================================================');
  if (errors > 0) {
    console.error(`FAILED: ${errors} error(s) encountered during screenshot validation.`);
    process.exit(1);
  } else {
    console.log(`SUCCESS: All ${validatedCount} screenshots validated successfully!`);
    console.log('======================================================');
  }
}

validate();

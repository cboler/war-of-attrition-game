import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

const here = path.dirname(decodeURIComponent(new URL(import.meta.url).pathname).replace(/^\/(.:)/, '$1'));
const outputDir = path.join(here, 'achievements');
const templatePath = path.join(here, 'achievement-crest-template.png');
const sourceIndex = process.argv.indexOf('--template-source');
const sourcePath = sourceIndex >= 0 ? process.argv[sourceIndex + 1] : templatePath;

if (!sourcePath || !fs.existsSync(sourcePath)) {
  throw new Error('Missing crest template. Pass --template-source <png> for the first build.');
}

const achievements = [
  ['war.first_casualty', 'style', 'milestone'],
  ['war.first_battle', 'sports_martial_arts', 'milestone'],
  ['war.first_win', 'emoji_events', 'milestone'],
  ['war.first_defeat', 'school', 'milestone'],
  ['war.first_rescue', 'health_and_safety', 'milestone'],
  ['war.first_battle_win', 'flag', 'milestone'],
  ['war.assassin', 'flare', 'distinction'],
  ['war.not_today', 'shield', 'distinction'],
  ['war.battle_layer_3', 'layers', 'distinction'],
  ['war.battle_layer_4', 'filter_drama', 'prestige'],
  ['war.deep_battle_win', 'shield', 'prestige'],
  ['war.royal_disaster', 'sentiment_very_dissatisfied', 'distinction'],
  ['war.massacre', 'bolt', 'prestige'],
  ['war.no_reinforcements_win', 'front_hand', 'distinction'],
  ['war.five_battles_game', 'military_tech', 'distinction'],
  ['war.pyrrhic_victory', 'emergency', 'prestige'],
  ['war.untouchable', 'workspace_premium', 'prestige'],
  ['war.comeback_15', 'trending_up', 'prestige'],
  ['war.marathon', 'timer', 'prestige'],
  ['profile.campaigner', 'route', 'milestone'],
  ['profile.veteran', 'military_tech', 'milestone'],
  ['profile.centurion', 'workspace_premium', 'milestone'],
  ['war.juggernaut', 'local_fire_department', 'distinction'],
  ['war.expert_strategist', 'psychology', 'distinction'],
  ['war.poor_strategy', 'wrong_location', 'distinction'],
  ['war.grave_intelligence', 'visibility', 'distinction'],
  ['war.cavalry_came', 'shield', 'distinction']
];

const fontPath = path.resolve(here, '../../../docs/media/material-icons-round-WEHMTW23.woff2');
const fontData = fs.readFileSync(fontPath).toString('base64');
const sourceData = fs.readFileSync(sourcePath).toString('base64');
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 512, height: 512 } });

await page.setContent('<canvas id="canvas" width="512" height="512"></canvas>');
const cleanedTemplate = await page.evaluate(async (data) => {
  const image = new Image();
  image.src = `data:image/png;base64,${data}`;
  await image.decode();
  const canvas = document.querySelector('#canvas');
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, 512, 512);
  context.drawImage(image, 0, 0, 512, 512);

  const pixels = context.getImageData(0, 0, 512, 512);
  const data32 = pixels.data;
  const seen = new Uint8Array(512 * 512);
  const queue = [];
  for (let x = 0; x < 512; x += 1) queue.push(x, (511 * 512) + x);
  for (let y = 1; y < 511; y += 1) queue.push(y * 512, (y * 512) + 511);
  let head = 0;
  while (head < queue.length) {
    const offset = queue[head++];
    if (seen[offset]) continue;
    seen[offset] = 1;
    const pixel = offset * 4;
    const r = data32[pixel];
    const g = data32[pixel + 1];
    const b = data32[pixel + 2];
    const average = (r + g + b) / 3;
    if (Math.max(r, g, b) - Math.min(r, g, b) > 18 || average < 150) continue;
    data32[pixel + 3] = 0;
    const x = offset % 512;
    const y = Math.floor(offset / 512);
    if (x > 0) queue.push(offset - 1);
    if (x < 511) queue.push(offset + 1);
    if (y > 0) queue.push(offset - 512);
    if (y < 511) queue.push(offset + 512);
  }
  context.putImageData(pixels, 0, 0);
  return canvas.toDataURL('image/png');
}, sourceData);

if (sourcePath !== templatePath) {
  const cleanedBytes = Buffer.from(cleanedTemplate.split(',')[1], 'base64');
  fs.writeFileSync(templatePath, cleanedBytes);
}

fs.mkdirSync(outputDir, { recursive: true });
for (const [internalId, glyph, classification] of achievements) {
  const accents = {
    milestone: ['#fff5c2', '#c9912f', '#6d4310'],
    distinction: ['#fff0a8', '#e3a72f', '#6e3608'],
    prestige: ['#fff1a0', '#efb83c', '#8c160f']
  }[classification];
  await page.setContent(`
    <style>
      @font-face { font-family: 'Material Icons Round'; src: url(data:font/woff2;base64,${fontData}); }
      html, body { margin: 0; width: 512px; height: 512px; background: transparent; overflow: hidden; }
      .crest { position: relative; width: 512px; height: 512px; }
      .base { position: absolute; inset: 0; width: 512px; height: 512px; }
      .seal {
        position: absolute; left: 152px; top: 137px; width: 208px; height: 208px;
        border-radius: 50%;
        background: radial-gradient(circle at 42% 35%, #164f3a 0%, #073b2b 58%, #03251d 100%);
        border: 10px double ${accents[1]};
        box-shadow: 0 0 0 4px #281507, inset 0 0 22px #000b, 0 10px 18px #0008;
        display: grid; place-items: center;
      }
      .glyph {
        font-family: 'Material Icons Round'; font-size: 142px; line-height: 1;
        font-feature-settings: 'liga';
        background: linear-gradient(150deg, ${accents[0]} 12%, ${accents[1]} 55%, ${accents[2]} 100%);
        -webkit-background-clip: text; background-clip: text; color: transparent;
        -webkit-text-stroke: 2px #2c1604;
        filter: drop-shadow(0 5px 2px #0009) drop-shadow(0 -1px 0 #fff8);
      }
    </style>
    <div class="crest">
      <img class="base" src="${cleanedTemplate}" />
      <div class="seal"><span class="glyph">${glyph}</span></div>
    </div>
  `);
  await page.evaluate(() => document.fonts.ready);
  const fileName = `${internalId.replaceAll('.', '-')}.png`;
  await page.locator('.crest').screenshot({ path: path.join(outputDir, fileName), omitBackground: true });
}

await browser.close();
console.log(`Built ${achievements.length} achievement icons in ${outputDir}`);

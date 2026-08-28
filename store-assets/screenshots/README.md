# Google Play Store Screenshots: War of Attrition

Automated, deterministic Google Play Store listing screenshot package for **War of Attrition**.

Generated at: `2026-08-28T05:06:26.633Z`
Total Screenshots: **11**

---

## Google Play Console Upload Guide

When uploading to **Google Play Console** under **Store presence > Main store listing > Phone / 7-inch tablet / 10-inch tablet screenshots**, upload the files in the recommended order shown below:

### 1. Phone Screenshots (`store-assets/screenshots/phone/`)
*Target Resolution: 1080×1920 (9:16 Portrait)*

| File | Order | Resolution | Scene | Suggested Alt Text (max 140 chars) |
|---|---|---|---|---|
| `01-active-clash.png` | **1** | 1080×1920 | Active card clash duel with comparison power badges and tactical feedback | *War of Attrition mobile clash showing high-card comparison and power badges.* |
| `02-tactical-challenge.png` | **2** | 1080×1920 | Tactical reinforcement decision with Challenge and Concede action buttons | *Tactical challenge decision prompt with Challenge and Concede thumb actions.* |
| `03-deadlock-battle.png` | **3** | 1080×1920 | Multi-layer deadlock Battle with 3 committed cards per side and foe targeting | *Multi-layer deadlock battle with 3 committed cards and champion selector.* |
| `04-field-manual.png` | **4** | 1080×1920 | Field Manual drawer open displaying tactical Rules of Engagement and battle chronicle | *Field Manual drawer with Rules of Engagement and tactical battle chronicle.* |
| `05-commander-profile.png` | **5** | 1080×1920 | Commander profile modal displaying career statistics and unlocked achievements | *Commander profile dialog with career win rate, stats, and achievements.* |

---

### 2. 7-Inch Tablet Screenshots (`store-assets/screenshots/tablet-7in/`)
*Target Resolution: 1200×1920 (10:16 Portrait)*

| File | Order | Resolution | Scene | Suggested Alt Text (max 140 chars) |
|---|---|---|---|---|
| `01-deadlock-battle.png` | **1** | 1200×1920 | Intermediate tablet battle layout with expanded side stakes and utility hub | *7-inch tablet layout displaying multi-layer battle and cards at stake.* |
| `02-boneyard-casualties.png` | **2** | 1200×1920 | Boneyard casualty drawer open showing public discard grid and fan stack | *Public Boneyard casualty drawer on a 7-inch tablet display.* |
| `03-war-victory.png` | **3** | 1200×1920 | War victory summary card with match metrics and rematch actions | *Victory resolution screen showing battle metrics and rematch action.* |

---

### 3. 10-Inch Tablet / Chromebook Screenshots (`store-assets/screenshots/tablet-10in/`)
*Target Resolution: 2560×1600 (16:10 Tabletop Landscape)*

| File | Order | Resolution | Scene | Suggested Alt Text (max 140 chars) |
|---|---|---|---|---|
| `01-tabletop-clash.png` | **1** | 2560×1600 | Spacious tabletop grid layout with active clash, quip, and utility hub | *10-inch widescreen tabletop view of War of Attrition card combat.* |
| `02-multi-layer-battle.png` | **2** | 2560×1600 | Widescreen multi-layer deadlock battle with full cards at stake and target pointer | *Tabletop multi-layer battle deadlock on a large tablet display.* |
| `03-field-manual.png` | **3** | 2560×1600 | Tabletop Field Manual drawer open alongside the active game table | *Widescreen Field Manual tactical guide open on the card tabletop.* |

---

## How to Regenerate Locally

1. Install Playwright Chromium:
   ```bash
   npx playwright install chromium
   ```
   *(On Linux with dependencies: `npx playwright install --with-deps chromium`)*

2. Run screenshot generation:
   ```bash
   npm run screenshots:store
   ```

3. Validate generated screenshot dimensions and manifest:
   ```bash
   npm run screenshots:validate
   ```

---

## How to Run in GitHub Actions

1. Navigate to the **Actions** tab in GitHub.
2. Select **Generate Google Play Store Screenshots**.
3. Click **Run workflow** (`workflow_dispatch`).
4. Download the resulting artifact: **`google-play-store-screenshots`**.

---

## Diagnostic Traces

If screenshot generation fails, Playwright traces and failure screenshots are recorded in `test-results/` and published as the **`playwright-diagnostics`** workflow artifact.

To view a trace locally:
```bash
npx playwright show-trace test-results/<test-dir>/trace.zip
```

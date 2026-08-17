# Google Play Games Achievements Manifest

This manifest documents all 12 canonical achievements defined in `war-of-attrition-game`. 
Stable internal IDs are the source of truth for the game engine and profile statistics.

> [!IMPORTANT]
> Once published in Google Play Console, achievement properties (especially standard vs. incremental and total steps) cannot be casually altered without risking player progression errors.

---

## Achievement Catalog

| Internal ID | Display Name | Description | Type | Initial State | Total Steps | Suggested XP | Play Games ID |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `war.assassin` | **Assassin** | Defeat an Ace with a 2 in a direct clash. | Standard | Revealed | — | 500 XP | `CgkI_PLACEHOLDER_ASSASSIN` |
| `war.pyrrhic_victory` | **Pyrrhic Victory** | Win the war with exactly 1 card remaining in your deck. | Standard | Revealed | — | 1,000 XP | `CgkI_PLACEHOLDER_PYRRHIC_VICTORY` |
| `war.massacre` | **Massacre** | Defeat at least 10 opponent cards in a single Battle. | Standard | Revealed | — | 1,000 XP | `CgkI_PLACEHOLDER_MASSACRE` |
| `war.battle_layer_3` | **Down the Rabbit Hole** | Reach Battle Layer 3 in a recursive stalemate. | Standard | Revealed | — | 500 XP | `CgkI_PLACEHOLDER_BATTLE_LAYER_3` |
| `war.battle_layer_4` | **How Deep Does This Go?** | Reach Battle Layer 4 in a recursive stalemate. | Standard | Revealed | — | 1,500 XP | `CgkI_PLACEHOLDER_BATTLE_LAYER_4` |
| `war.not_today` | **Not Today** | Successfully challenge a lost clash to save a 2. | Standard | Revealed | — | 500 XP | `CgkI_PLACEHOLDER_NOT_TODAY` |
| `war.royal_disaster` | **Royal Disaster** | Lose both an Ace and a 2 in the same Battle. | Standard | Revealed | — | 500 XP | `CgkI_PLACEHOLDER_ROYAL_DISASTER` |
| `war.untouchable` | **Untouchable** | Win the war with at least 20 cards remaining. | Standard | Revealed | — | 1,000 XP | `CgkI_PLACEHOLDER_UNTOUCHABLE` |
| `war.marathon` | **Marathon** | Resolve a game lasting at least 100 turns. | Standard | Revealed | — | 1,000 XP | `CgkI_PLACEHOLDER_MARATHON` |
| `war.comeback_15` | **Never Tell Me the Odds** | Win the war after trailing by at least 15 cards. | Standard | Revealed | — | 2,000 XP | `CgkI_PLACEHOLDER_COMEBACK_15` |
| `profile.veteran` | **Veteran** | Complete 25 resolved matches. | Incremental | Revealed | 25 | 1,500 XP | `CgkI_PLACEHOLDER_VETERAN` |
| `profile.centurion` | **Centurion** | Complete 100 resolved matches. | Incremental | Revealed | 100 | 3,000 XP | `CgkI_PLACEHOLDER_CENTURION` |

---

## Play Console Entry Instructions

1. Open **Google Play Console** → Select **War of Attrition** → Under **Grow**, go to **Play Games Services** → **Setup and management** → **Achievements**.
2. Click **Add achievement**.
3. For each row in the table above:
   - Paste the **Name** and **Description**.
   - Upload an achievement icon (512x512 PNG, square, transparent background).
   - Set **Type**: *Standard* or *Incremental* (with corresponding Steps).
   - Set **XP Points** as suggested.
4. Click **Save draft**.
5. Copy the generated Google Play Achievement ID (starts with `CgkI...`) and replace the placeholder in [`src/app/core/models/play-achievements-map.ts`](file:///c:/Users/lacyv/Documents/GitHub/war-of-attrition-game/src/app/core/models/play-achievements-map.ts).

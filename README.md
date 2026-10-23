# War of Attrition

A two-player card game played against AI commanders, built as an Angular PWA, hosted on GitHub Pages at <https://cboler.github.io/war-of-attrition-game/>, and packaged for Google Play as a Trusted Web Activity (`android/`).

## Development

Requires Node 22 or 24 LTS (CI uses 24).

```bash
npm ci
npm start
```

Open `http://localhost:4200/`. `npm start` runs `scripts/set-env.js` first, which writes the environment files from `GOOGLE_CLIENT_ID` and `GA4_MEASUREMENT_ID` when they are set.

| Task | Command |
| --- | --- |
| Unit tests (watch) | `npm test` |
| Unit tests (single headless run, as CI) | `npm run test:ci` |
| Version-sync tests | `npm run test:version` |
| Production build into `docs/` | `npm run build:prod` |
| Play Store screenshots | `npm run screenshots:store` (see [`store-assets/screenshots/README.md`](store-assets/screenshots/README.md)) |
| Android unit tests | `cd android && ./gradlew testDebugUnitTest` |
| Android release bundle | `cd android && ./gradlew bundleRelease` (see [`developer-docs/play-store/README.md`](developer-docs/play-store/README.md)) |

Version numbers live in eleven files that must move together; use the `bump-version` skill in `.agents/skills/`.

## CI pipelines (`.github/workflows/`)

| Workflow | Runs on | What it does |
| --- | --- | --- |
| `deploy.yml` | Push and PR to `main` | Runs version-sync and Angular unit tests, then builds production and deploys to GitHub Pages (deploy only from `main`). |
| `android-checks.yml` | Push and PR touching `android/` | Android unit tests and release lint; no signing secrets needed. |
| `build-android-bundle.yml` | Manual run, or a published release tagged `v<package.json version>` | Checks the version matches `package.json`, runs Android unit tests, builds the signed release AAB, and uploads it with the R8 mapping. |
| `generate-store-screenshots.yml` | Manual run | Serves the production build and captures validated phone and tablet Play Store screenshots with Playwright. |
| `secret-scanning.yml` | Push, PR, weekly, manual | Gitleaks scan of the full history. |
| `copilot-setup-steps.yml` | Changes to itself, manual | Environment setup for the GitHub Copilot coding agent. |

## Attrition Game Flow

```mermaid
flowchart TD
    START["Start Attrition"] --> SETUP["Split standard deck by color<br/>Player: Red · Opponent: Black"]
    SETUP --> SHUFFLE["Shuffle both decks independently"]
    SHUFFLE --> READY["Ready for next turn"]

    READY --> CAN_DRAW{"Can both players draw?"}
    CAN_DRAW -- No --> DRAW_END{"Compare remaining cards"}
    DRAW_END -- Player has more --> PLAYER_GAME_WIN["Player wins the war"]
    DRAW_END -- Opponent has more --> OPP_GAME_WIN["Opponent wins the war"]
    DRAW_END -- Equal --> GAME_TIE["Game ends in a true tie"]

    CAN_DRAW -- Yes --> DRAW["Each player draws 1 active card<br/>Cards become table stakes"]
    DRAW --> COMPARE{"Compare active cards"}

    COMPARE -- "2 vs Ace" --> SPECIAL["2 defeats Ace<br/>No challenge"]
    SPECIAL --> NORMAL_RESOLVE

    COMPARE -- Equal --> BATTLE_CHECK
    COMPARE -- Player wins --> OPP_CHOICE{"Opponent sends reinforcement?"}
    COMPARE -- Opponent wins --> PLAYER_CHOICE{"Player sends reinforcement?"}

    OPP_CHOICE -- No --> NORMAL_RESOLVE["Loser's card → Boneyard<br/>Winner's card → deck"]
    PLAYER_CHOICE -- No --> NORMAL_RESOLVE

    OPP_CHOICE -- Yes --> OPP_REINFORCE["Opponent draws 1 reinforcement"]
    PLAYER_CHOICE -- Yes --> PLAYER_REINFORCE["Player draws 1 reinforcement"]

    OPP_REINFORCE --> OPP_COMPARE{"Reinforcement vs<br/>original winning card"}
    PLAYER_REINFORCE --> PLAYER_COMPARE{"Reinforcement vs<br/>original winning card"}

    OPP_COMPARE -- Challenger wins --> CHALLENGE_RESOLVE
    OPP_COMPARE -- Original card wins --> CHALLENGE_RESOLVE
    OPP_COMPARE -- Equal --> BATTLE_CHECK

    PLAYER_COMPARE -- Challenger wins --> CHALLENGE_RESOLVE["Winner's owned stakes → deck<br/>Loser's owned stakes → Boneyard"]
    PLAYER_COMPARE -- Original card wins --> CHALLENGE_RESOLVE
    PLAYER_COMPARE -- Equal --> BATTLE_CHECK

    NORMAL_RESOLVE --> READY
    CHALLENGE_RESOLVE --> READY

    BATTLE_CHECK{"Can BOTH players add<br/>3 new Battle cards?"}

    BATTLE_CHECK -- Yes --> DEAL_BATTLE["Each player adds 3 NEW<br/>face-down cards to the stake"]
    DEAL_BATTLE --> SELECT["Player blindly selects 1 of opponent's NEW cards<br/>Opponent blindly selects 1 of player's NEW cards"]
    SELECT --> REVEAL["Reveal ONLY the 2 selected cards"]
    REVEAL --> BATTLE_COMPARE{"Compare selected cards"}

    BATTLE_COMPARE -- Player wins --> PLAYER_BATTLE_WIN
    BATTLE_COMPARE -- Opponent wins --> OPP_BATTLE_WIN
    BATTLE_COMPARE -- Equal --> RECURSE["Battle continues<br/>Previous layer remains staked and locked"]
    RECURSE --> BATTLE_CHECK

    BATTLE_CHECK -- No --> CAN_EITHER{"Can exactly one player<br/>add 3 cards?"}
    CAN_EITHER -- Player only --> PLAYER_BATTLE_WIN
    CAN_EITHER -- Opponent only --> OPP_BATTLE_WIN
    CAN_EITHER -- Neither --> ATTRITION_COUNT{"Compare remaining<br/>deck counts"}
    ATTRITION_COUNT -- Player has more --> PLAYER_BATTLE_WIN
    ATTRITION_COUNT -- Opponent has more --> OPP_BATTLE_WIN
    ATTRITION_COUNT -- Equal --> GAME_TIE

    PLAYER_BATTLE_WIN["Player wins Battle"]
    OPP_BATTLE_WIN["Opponent wins Battle"]

    PLAYER_BATTLE_WIN --> PLAYER_PRIVACY["Return player's hidden stakes FACE-DOWN<br/>Reveal opponent's remaining hidden casualties"]
    OPP_BATTLE_WIN --> OPP_PRIVACY["Return opponent's hidden stakes FACE-DOWN<br/>Reveal player's remaining hidden casualties"]

    PLAYER_PRIVACY --> PLAYER_SETTLE["Opponent casualties → Boneyard<br/>Player stakes → deck"]
    OPP_PRIVACY --> OPP_SETTLE["Player casualties → Boneyard<br/>Opponent stakes → deck"]

    PLAYER_SETTLE --> READY
    OPP_SETTLE --> READY

    PLAYER_GAME_WIN --> END["Game Over"]
    OPP_GAME_WIN --> END
    GAME_TIE --> END
```

## Development Status & Documentation

War of Attrition has a feature-complete core and production initial passes for **Progressive Narrative Unveiling** and **Clash Visualizations / Battlefield Animations**. Every decisive card comparison currently summons a brief infantry skirmish while physical cards remain authoritative; this frequency is being evaluated in deployed play. Final release polish, closed-testing follow-up, and device validation remain.

- **Current Implementation Status**: [`.github/instructions/current-development-status.md`](.github/instructions/current-development-status.md) — Live status, active systems, and release priorities.
- **Rules & Specification**: [`.github/instructions/war-of-attrition-requirements.md`](.github/instructions/war-of-attrition-requirements.md) — Authoritative physical game rules and requirements.
- **Documentation Index**: [`.github/instructions/README.md`](.github/instructions/README.md) — Complete documentation hierarchy and development guides.
- **Private Narrative Canon**: [`developer-docs/narrative-canon.md`](developer-docs/narrative-canon.md) — Mont-Rouge chronology, commander dossiers, chapter disclosure, and source plan.
- **Narrative Disclosure Matrix**: [`developer-docs/narrative-disclosure-matrix.md`](developer-docs/narrative-disclosure-matrix.md) — Authored twelve-War sequence, Reveal Ledger, progressive dossier plan, transitions, callbacks, sources, audits, and Sprint 1 handoff.
- **Commander Voice Bible**: [`developer-docs/commander-voice-bible.md`](developer-docs/commander-voice-bible.md) — Final voice guidance and curated implementation-ready dialogue bank.
- **Play Store Release**: [`developer-docs/play-store/README.md`](developer-docs/play-store/README.md) — Android build, Play Console setup, Play Games bridge diagnostics; [`production-access-plan.md`](developer-docs/play-store/production-access-plan.md) — closed testing to production access.
- **Completed Sprints & Backlog**: [`developer-docs/future-gameplay-ideas.md`](developer-docs/future-gameplay-ideas.md) — implemented Narrative Sprint 1 and Clash Visualization V1 boundaries, release polish, and later candidates.

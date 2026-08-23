# War of Attrition — Current Development Status

## 1. Project State: Production Readiness / Final Polish

**War of Attrition** is a feature-complete digital implementation of the physical head-to-head card game. The project is an Angular Progressive Web Application (PWA) packaged for Android via a Trusted Web Activity (TWA) and is currently in the **Production Readiness / Final Polish** phase, undergoing Google Play closed testing, device compatibility validation, and store presence preparation.

---

## 2. Completed Major Systems

The core game and meta-progression architectures are fully implemented, tested, and active:

### Core Game Engine & Rules
- **Physical Deck Model**: Standard 52-card deck divided by suit color (Red for Player, Black for Opponent) with immutable card definitions and independent shuffling.
- **Card Comparison & Special Rule**: Truthful rank comparison logic with strict enforcement of the core rule: **2 defeats Ace** (the sole exception, non-challengeable).
- **Turn Resolution Engine**: Complete lifecycle for normal clash draws, card awards, and deck exhaustion end conditions.
- **Challenge / Reinforcement System**: Tactical decision flow allowing the losing side of a clash to commit one reinforcement card from their deck to counter the winning card.
- **Recursive Battle System**: Multi-layer deadlock resolution for equal-rank clashes:
  - Both players stake 3 new face-down cards per battle round.
  - Blind cross-selection of the opposing champion.
  - Layer recursion if champions tie.
  - Privacy preservation: Winner recovers their own hidden battle cards face-down; defeated casualties are turned face-up into the public Boneyard.

### User Interface & Responsive Presentation
- **Active Table UI (`TableGame`)**: The primary game view featuring a responsive tabletop layout with card playfield, stakes visualization, player seats with deck counters, and thumb action regions.
- **Responsive Layout Engine**: Fully tailored viewports across three distinct responsive form factors:
  - **Handheld Mobile Phone** (`<= 620px`): Single-column portrait stack optimized for one-thumb reachability.
  - **Intermediate 7-Inch Tablet** (`620px - 820px`): Expanded portrait layout with side stakes, utility hub, and persistent telemetry affordances.
  - **Widescreen 10-Inch Tablet & Desktop** (`>= 1100px`): Spacious multi-column tabletop grid.
- **Visual Feedback & Power Badges**: Comparison power badges with explicit math breakdowns (`Base - Opposing = Remainder`), interactive combat tooltips, battlefield announcements, and situational quip reactions.
- **Field Manual & Interactive Rule Demos**: In-game drawer (`StoryBookDrawerComponent`) containing a live match chronicle and interactive animated rule demonstrations (`RuleDemoComponent`).
- **Boneyard Casualty Viewer**: Public casualty inspector displaying discard counts, deck thickness cues, and full discarded card inspection.

### Progression, Personalization & Telemetry
- **Opponent Commanders & AI Personalities**: Parameterized decision engine in `OpponentAIService` powering five distinct fair-play archetypes (The Quartermaster, The Gambler, The Analyst, The Attritionist, The Cornered General) with contextual dialogue in `TableReactionService`, persistent campaign-level assignment, rotation without immediate repeat, table seat presentation, and telemetry integration. See [`developer-docs/opponent-commanders.md`](../../developer-docs/opponent-commanders.md).
- **Commander Profile & Statistics**: Persistent local statistics tracking win rate, game durations, battle records, challenge success rates, and memorable card events (e.g. Ace assassinations, Juggernauts).
- **Achievements System**: 15 tiered achievements with local persistence and scaffolded Play Games Services synchronization.
- **Three-War Campaign & Alternate Rules**: Multi-war campaign progression tracking match scores, cumulative card differentials, opposing commander records, and career distinctions. Includes the **Campaign Orders** briefing interface before War 1 and the **Limited Reserves** alternate campaign ruleset (5 cross-war reinforcements, table reserves badge, zero-reserve auto-concession, and safe legacy progression migration). See [`developer-docs/alternate-rules-campaigns.md`](../../developer-docs/alternate-rules-campaigns.md).
- **Cosmetic Card Backings**: Token wallet and card-backing customization unlockable via campaign progression.
- **Privacy-Compliant Telemetry**: Google Analytics 4 integration with explicit user consent prompts (`TelemetryConsentService`), denying tracking by default until granted, with zero analytics collected in test/screenshot modes.

### Platform Packaging & Tooling
- **Android TWA Wrapper**: Native Android application wrapper built with Google ChromeOS / Android Browser Helper, targeting Android 14+ (API 36).
- **Automated Store Screenshots**: Deterministic Playwright Chromium test matrix capturing store-ready PNG screenshots across Phone (1080×1920), 7" Tablet (1200×1920), and 10" Tablet (2560×1600) with binary header validation.
- **Automated CI/CD Workflows**: GitHub Actions for GitHub Pages deployment (`deploy.yml`), Android App Bundle generation (`build-android-bundle.yml`), and opt-in Store Screenshot generation (`generate-store-screenshots.yml`).

---

## 3. Current Release-Readiness Priorities

Remaining work is concentrated in validation, UX refinement, and store compliance:

1. **Google Play Closed Testing Feedback**: Monitor closed-testing telemetry, crash reports, and player feedback.
2. **Real-Device Form Factor Validation**: Test on physical Android devices ranging from compact phones to foldables and large tablets.
3. **Animation Pacing & Touch Refinement**: Fine-tune transition timings and touch targets for rapid one-handed play.
4. **Store Presence & Marketing Assets**: Maintain store screenshot packages, feature graphics, and localized store listing copy.
5. **Accessibility (a11y) Verification**: Ensure full screen-reader announcements (ARIA live regions) and high-contrast compliance across dialogs.
6. **Monetization Architecture Review**: Monetization remains intentionally deferred (`ADS_ENABLED=false`). Any future ad integration will require a dedicated UX evaluation.

---

## 4. Architectural & Design Decisions

### Fixed Dark / Felt Tabletop Presentation
The application deliberately uses a **fixed dark green felt presentation**. In War of Attrition, the visual world is the card table itself. Conventional light/dark theme toggling does not fit this aesthetic and was intentionally removed.

### Fidelity to Physical Card Play
War of Attrition is designed to be fully playable with an ordinary, physical 52-card deck. Digital additions (animations, power badges, quip dialogue, campaign scoring, statistics, opponent commanders) enhance presentation and progression, but do **not** alter standard card ranks, manipulate hidden deck orders, or introduce fantasy card abilities.

---

## 5. Future Candidates (Post-Release Backlog)

The following concepts are preserved for post-release development and are documented in [`developer-docs/future-gameplay-ideas.md`](../../developer-docs/future-gameplay-ideas.md):

- **Hall of Valor (Card Service Records)**: Persistent historical service records for individual physical-card identities (`hearts-Q`, `diamonds-2`, etc.) across multiple Wars.
- **Alternate Rules Campaigns**: Campaign variants that adjust constraints without breaking standard physical card rules (Limited Reserves, Fog of War, No Retreat, Total War, Escalation).
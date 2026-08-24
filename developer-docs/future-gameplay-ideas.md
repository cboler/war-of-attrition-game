# War of Attrition — Future Gameplay & Backlog Design Concepts

This document catalogs future design concepts, post-release candidates, and UX backlog observations for **War of Attrition**.

> [!TIP]
> **Authoritative Creative & Visual Direction**
> For the game's creative direction, world identity (The War of Cheesemakers), visual grammar (JRPG-inspired battle staging), suit-specific armies, and cosmetic principles, refer to the authoritative document:
> 
> 👉 [`developer-docs/north-star.md`](./north-star.md)

---

## 🧭 Core Design Guardrail for Future Additions

> **Guiding Principle**:
> War of Attrition is literally playable with an ordinary physical deck of 52 cards. Digital features should strictly preserve and honor that physical identity.
>
> Future modes, visual enhancements, and backlog additions may introduce campaign-level resource constraints, statistical progression, thematic presentation, enhanced scoring metrics, or specialized opponent behaviors. However, they must **avoid** turning standard playing cards into collectible card superpowers, arbitrary fantasy abilities, or deck-building pieces, unless the project deliberately decides to become a fundamentally different game.

---

## 1. Graduated Systems & Their Evolution

The following systems were originally proposed as backlog concepts and are now fully implemented in production code:

### A. Opponent Commanders & AI Personalities (Implemented)
- **Technical Status**: Fully implemented in `OpponentAIService`, `commander.model.ts`, and `CampaignProgressionService`. See [`developer-docs/opponent-commanders.md`](./opponent-commanders.md).
- **Creative Evolution**: The 5 implemented strategy archetypes (*The Quartermaster*, *The Gambler*, *The Analyst*, *The Attritionist*, *The Cornered General*) represent the underlying AI behavioral architecture. Future character passes will map named cheesemaker personalities and expressive portraits directly onto these models as outlined in [`developer-docs/north-star.md`](./north-star.md).

### B. Hall of Valor / Persistent Card Service Records (Implemented)
- **Technical Status**: Fully implemented in `HallOfValorService` and the Field Manual drawer. See [`developer-docs/hall-of-valor.md`](./hall-of-valor.md).
- **Core Distinctions**: Tracks Confirmed Casualties, Ace Assassinations (2-vs-Ace), Reinforcement Rescues, Times Rescued, Battle Layers Survived, Victorious Wars Survived, Juggernaut Citations, and Notable Rivalries with zero gameplay stat buffs.

### C. Alternate Rules Campaigns (First Three Variants Implemented)
- **Technical Status**: Fully implemented with the Campaign Orders briefing modal. See [`developer-docs/alternate-rules-campaigns.md`](./alternate-rules-campaigns.md).
- **Active Modes**: *Standard Campaign*, *Limited Reserves* (5 cross-war reinforcements), *Total War* (cumulative signed card differential scoring), and *Fog of War* (sealed Boneyard and casualty ledgers during active fighting).

---

## 2. Creative & Visual Presentation Backlog (Tier 2 & 3 Candidates)

As detailed in [`developer-docs/north-star.md`](./north-star.md), the digital layer will progressively stage the dramatic battles summoned by physical cards:

1. **Visualized Card Clashes & Battle Staging**:
   - Small sprite formations meeting and clashing on the battlefield to dramatize card resolution.
   - Distinct rank-to-unit visual archetypes (Infantry formations, Cavalry Jacks, Caster Queens, Champion Kings, General Aces).
   - Signature **2-defeats-Ace assassination sequence** where humble infiltrators strike down the opposing general.
2. **Suit-Specific Default Armies**:
   - Distinct battlefield identities for each card suit (Spades = Disciplined Steel Legion, Hearts = Chivalric Vanguard, Diamonds = Gilded Mercenaries, Clubs = Rugged Highland Force).
3. **Character Portraits & Emotional Dialogue**:
   - Expressive 2D character portraits (Neutral, Smug/Confident, Alarmed/Furious, Defeated) paired with contextual situational quips.
4. **Cosmetic Progression & Unlockable Card Backs**:
   - Token-based cosmetic customization including cheese-themed card backs (Aged Rind, Blue Vein, Waxed Wheel, Cheese Board, Artisan Cracker).

---

## 3. Alternate Rules Campaign Candidates

Additional campaign variants reserved for future evaluation:

#### 1. No Retreat (Future Candidate)
- The War must be fought to the bitter end.
- Abandoning, conceding, or resetting an unresolved War immediately forfeits the entire Campaign with maximum penalty to career differential.

#### 2. Escalation (Future Candidate)
- Each successful reinforcement or multi-layer battle in a War increases the stake cost or difficulty of subsequent actions in that Campaign.

---

## 4. Concrete UX & Product Backlog Observations

The following concrete UX, mobile layout, and presentation observations are recorded for future refinement and resolution:

### A. Campaign Abandonment & Restart Flow
- **Current State**: There is currently no obvious, dedicated mechanism in the UI to abandon or reset an active Three-War Campaign and begin another.
- **Future UX Requirement**:
  - Provide a deliberate "Abandon Campaign" or "Reset Campaign Orders" affordance with an explicit confirmation dialog.
  - Abandoning an active Campaign must gracefully record the partial outcome in history if appropriate, but must **never** erase cumulative career statistics, profile history, or unlocked achievements.

### B. Mobile Initial-Layout & Viewport Reflow Defect
- **Observation**: On mobile devices (PWA / Android TWA), the player's deck and table seat information can initially render partially below the visible viewport upon first load.
- **Behavioral Clue**: Leaving and re-entering the application or otherwise forcing a layout recalculation/redraw corrects the presentation.
- **Investigation Guidance**:
  - This indicates an initial viewport measurement or reflow timing defect rather than a static CSS breakpoint limitation.
  - Future investigation should analyze:
    - Dynamic viewport units (`dvh` vs `vh` vs `svh`)
    - Android safe-area insets (`env(safe-area-inset-*)`)
    - Android TWA browser chrome initialization timing
    - Angular layout measurements occurring before the mobile visual viewport stabilizes.
  - *Do not assert a single root cause until verified on physical Android devices.*

### C. Missing Field Manual & Profile Icons
- **Rules of Engagement Item 3 (*Deadlocks & Battles*)**: The icon for this entry (`swords`) does not render correctly in standard Material Icons web font and requires replacement with a verified icon identifier (e.g. `sports_kabaddi`, `layers`, or custom SVG).
- **Profile / Achievements Missing Icons**: The first two achievement definitions in `ACHIEVEMENTS` (`war.first_casualty` referencing `playing_cards` and `war.first_battle` referencing `swords`) use icon names not supported by the font set.
- **Action**: Audit all icon references across `story-book-drawer.component.ts` and `achievement.model.ts` against supported Material Icon identifiers.

### D. Combat-Math & Callout Overlay Layering
- **Observation**: During active turns, combat-math callouts, power badges, and explanatory banners can visually overlap or obscure one another.
- **Architectural Principle**: Treat this as a visual composition, spatial positioning, and timing problem rather than simply escalating `z-index` values.
- **Long-Term Alignment**: Future visual clash animations will naturally communicate combat power and outcomes, reducing the need for dense simultaneous textual overlays.

### E. Card Backs & Cosmetic Progression Guardrails
- **Design Focus**: Advance tasteful cheese-themed unlockable and purchasable card backings (Aged Rind, Blue Vein, Waxed Wheel, Artisan Cracker).
- **Brand Protection Guardrail**: Strictly prohibit unauthorized third-party trademarks, logos, or commercial trade dress (e.g., Cheez-It, Kraft). Branded crossovers remain deferred partnership concepts only.

---

## 5. Implementation Status Summary

All items in Sections 2, 3, and 4 are tracked backlog items. Core gameplay, 5 AI strategy archetypes, Hall of Valor, and the first 3 Alternate Rules Campaign modes remain fully operational in production code.

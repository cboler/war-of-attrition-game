# War of Attrition — Creative North Star & Visual Direction

This document establishes the durable creative direction, tonal identity, visual grammar, character philosophy, and cosmetic boundaries for **War of Attrition**.

It serves as the authoritative guide for future feature development, writing, character design, visual asset creation, UI evolution, and product positioning.

---

## 1. Core Identity & Physical Deck Fidelity

*War of Attrition* is a digital card game born from an original, strategic evolution of the classic physical game *War*. At every stage of growth, the project must honor and preserve the physical card game beneath the digital screen.

### Non-Negotiable Guardrails

1. **Physical 52-Card Integrity**:
   - The standard game is fundamentally representable and fully playable with an ordinary physical deck of 52 cards (26 Red cards vs. 26 Black cards).
   - Digital systems must **never** silently turn cards into collectible stat blocks, arbitrary superpowers, deck-building pieces, or pay-to-win objects.
2. **Strict Fair Play & Hidden Information**:
   - Opponent AI operates under the exact same game rules and hidden-information constraints as the human player. AI never inspects hidden deck order, peeks at face-down battle cards, or manipulates draws.
3. **Cosmetics & Spectacle Are Pure Presentation**:
   - Cosmetics, storytelling, sprite animation, audio, and characterization enrich the digital experience without altering card values, probabilities, or mechanics.

### The Guiding Axiom

> **"The cards do not merely represent the battle. They summon the battle."**

The physical cards remain the authoritative, deterministic ground truth of the game state. The digital layer gives those physical clashes personality, spectacle, tactical drama, narrative weight, and consequence.

---

## 2. Tone: Deadly Serious About Something Ridiculous

The visual presentation of *War of Attrition* must **not** be discarded in favor of a cartoonish, goofy, or kitschy cheese-themed interface.

### Preserve What Works
The game's established tabletop aesthetic is intentional and foundational:
- **Dark green felt** playing surface
- **Elegant, tactile card rendering**
- **Gold accents and restrained, clean typography**
- **Dignified military terminology**: *Field Manual*, *Boneyard*, *Rules of Engagement*, *Battles*, *Reinforcements*, *Campaign Orders*, *Casualty Ledgers*
- **Formal statistical presentation and polished UI**

### The Core Tonal Rule

> **"The interface takes the war seriously. The world supplies the absurdity."**

The characters and world lore treat the stakes of international cheesemaking rivalries with total, uncompromising military gravity.

- **Do not** turn every button, menu heading, rule description, or system name into a cheese pun.
- **The joke is the contrast**: Dignified, formal military framing applied with absolute commitment to passionate cheesemakers, affineurs, and dairy aristocrats waging war over tradition and craft.

---

## 3. The World: An International War of Cheesemakers

Opponent commanders should evolve away from generic archetype labels (*The Quartermaster*, *The Gambler*, *The Analyst*, *The Attritionist*, *The Cornered General*) into vivid, memorable individuals whose personalities embody those playstyles.

### Mechanical Foundation vs. Fictional Identity
The parameterized AI strategy architecture implemented in `src/app/core/models/commander.model.ts` (weights for card valuation, win rate thresholds, reserve preservation, battle appetite, and desperation) is a permanent technical asset. Future fictional characters map directly onto these established strategy archetypes without replacing the fair-play engine.

### Exploratory Character Concepts *(Directional, Not Finalized Canon)*
The following concepts illustrate the intended flavor and variety. They are design starting points subject to a deliberate creative pass:

- **Marcel de Brie** *(matches Quartermaster strategy)*: A spectacularly self-important French master affineur who treats high-value cards like irreplaceable vintage wheels of cheese, husbanding reserves with aristocratic disdain.
- **The Furious Belgian** *(matches Attritionist strategy)*: A fiercely proud artisan who grows incandescent with rage whenever mistaken for or compared with the French, waging a relentless war of exhaustion.
- **The English Artisan** *(matches Gambler strategy)*: A dry, eccentric cheesemaker with Monty-Python-adjacent energy (without copying Monty Python dialogue or characters), cheerfully embracing wild gambles and chaotic Battles.
- **The Swiss Precisionist** *(matches Analyst strategy)*: A meticulous, hyper-rational affineur who evaluates every clash with mathematical precision, obsessed with exact curd moisture, rind thickness, and card probabilities.
- **The Operatic Italian** *(matches Cornered General strategy)*: A passionate, theatrical rival who begins with operatic grandiosity and shifts into dramatic, high-stakes desperation as deck reserves dwindle.
- **The Tyromancer**: An enigmatic cheese mystic who claims to read destiny, military fortunes, and opponent draws directly from rinds, curd formations, wheel holes, and mold veining.

### Guidelines on Cultural & National Characterization
Humor may incorporate strong accents (including deliberately phonetic written dialogue), regional rivalries, theatrical mannerisms, and affectionate European culinary traditions:

- **Focus on**: Cheesemaking pride, competing definitions of quality, historical culinary disputes, artisanal snobbery, etiquette, craft rivalry, and individual personality quirks.
- **Avoid**: Malice, hostility toward any real-world ethnicity, or reducing a character to a lazy cultural slight.
- **The Character Litmus Test**: A well-crafted commander must remain funny, distinct, and compelling even if their nationality is removed from the script.

---

## 4. Story Direction — Intentionally Light

*War of Attrition* will eventually feature a simple Campaign narrative connecting its commanders, but it must never become a slow, dialogue-heavy visual novel.

### Narrative Design Principles
1. **Momentum First**: Narrative provides motivation and flavor without interrupting the rhythm of card play.
2. **Where Story Lives**:
   - Opponent introductions and pre-war briefings
   - Character portraits and contextual situational quips
   - Brief campaign interstitials between Wars in a Three-War series
   - Post-match victory and defeat reactions
   - Lore snippets in the *Field Manual* and *Chronicle*
3. **Quick Onboarding**: A new player should understand the premise within seconds.
4. **Historical Inspiration Deferred**: Real-world historical cheesemaking disputes, guild rivalries, and folklore provide rich inspiration, but deep historical research and the specific inciting incident are explicitly deferred to a dedicated narrative milestone.

---

## 5. Visual North Star

The future visual identity draws inspiration from the **visual grammar of late-16-bit and early-32-bit tactical JRPGs** (such as *Suikoden II* and 2D *Final Fantasy* titles).

### Homage in Design Language
This is an homage to readability, charm, and economy of presentation—**not** a reproduction of copyrighted art, characters, sprites, or user interfaces:

- **High Readability at Phone Scale**: Clean, bold silhouettes that remain legible on compact mobile screens (`<= 620px`).
- **Expressive 2D Portraits**: Stylized character portraits that convey strong emotion and personality in a compact frame.
- **Economical Sprite Animation**: Characterful, limited-frame sprite animations that suggest large-scale clashes without demanding ballooning asset production.
- **Stylization Over Realism**: Visual charm, crisp pixel staging, and strong silhouette design prioritized over graphical complexity.

### Two-Layer Visual Hierarchy
- **Layer 1 (The Card Table)**: The top-level interface remains the dark green felt table—tactile, clean, and elegant.
- **Layer 2 (The Battlefield Clash)**: Pixel/sprite animations represent the dramatic clashes *summoned* by the physical cards.

---

## 6. Character Portraits & Dialogue

Opponent dialogue in the table UI will eventually be paired with an expressive 2D character portrait.

### Portrait Specifications
- **Distinct Silhouette**: Each commander must have an instantly recognizable shape, headwear, posture, or accessory.
- **Small Expression Palette**: A tight set of emotional states that react to match events:
  1. *Neutral / Composed* (default stance)
  2. *Confident / Smug* (after winning major clashes or successful reinforcements)
  3. *Alarmed / Furious* (after suffering an Ace assassination, deep Battle defeat, or critical loss)
  4. *Defeated / Melodramatic* (at match conclusion)
- **Co-Designed Voice & Visuals**: Dialogue and visual design must develop together. The portrait conveys the demeanor; the dialogue delivers the tone; the AI strategy delivers the behavior.

---

## 7. Visualized Card Clashes & Battle Staging

A key visual ambition is the dramatization of card clashes through small battlefield unit encounters.

### Presentation, Not Simulation
- The underlying card engine deterministically resolves all comparisons, reinforcements, and recursive Battles.
- The visual clash is **presentation only**: tiny formations advance, meet in the center of the field, strike, and resolve according to the card outcome.

### Animation Guardrails
- **Short & Snappy**: Clashes must resolve briskly (under 1–2 seconds).
- **Non-Blocking & Acceleratable**: Respect player animation speed settings (`instant`, `fast`, `normal`, `relaxed`) and touch-to-skip interactions.
- **No Input Latency**: Clashes must never recreate the defect of delaying player input or freezing the table controls.
- **Clutter Reduction**: Visual unit clashes naturally communicate outcomes, reducing the need for overlapping combat-math banners and stacked badges.

---

## 8. Rank-to-Unit Visual Language

To make card clashes intuitive, card ranks map to consistent military unit archetypes:

```
┌─────────────────────────────────────────────────────────────────────────┐
│ RANK-TO-UNIT ARCHETYPES                                                 │
├───────────────────┬─────────────────────────────────────────────────────┤
│ Card Rank         │ Battlefield Unit Representation                     │
├───────────────────┼─────────────────────────────────────────────────────┤
│ Number Cards (3-10)│ Infantry Formations (visually scaled by rank)       │
│ Jack              │ Cavalry / Mounted Knight                            │
│ Queen             │ Caster / Mage / Witch / Tactical Ranged Figure      │
│ King              │ Regal Swordsman / Champion Commander                │
│ Ace               │ Supreme General / Army Commander                    │
│ 2 (The Assassin)  │ Humble Scouts / Lethal Infiltrators                 │
└───────────────────┴─────────────────────────────────────────────────────┘
```

### Number Cards (3 through 10)
Represent line infantry formations. Rather than rendering 10 individual sprites for a 10, sprite counts are visually compressed into distinct formation tiers (small, medium, large formation) to maintain readability on mobile screens.

### Face Cards & Aces
- **Jack**: Rapid cavalry charging into the fray.
- **Queen**: Arcane or ranged power casting battlefield effects.
- **King**: Imposing armored champion wielding heavy weapons.
- **Ace**: The unmistakable general and field commander of the army.

### The 2-defeats-Ace Signature Moment
The core rule where a **2 defeats an Ace** receives special visual treatment:
- Against ordinary cards (3 through King), the 2 appears as a small, weak scout or two humble conscripts.
- When facing an **Ace**, the two figures discard their disguise, reveal hidden assassin weapons, slip behind the opposing formation, and strike down the Ace/General.
- The opposing force breaks in panic.
- This creates an iconic visual signature that teaches the core rule without explanatory exposition, provides memorable social/marketing clips, and reinforces the identity of the physical card.

---

## 9. Suit-Specific Armies (Canonical Long-Term Direction)

In the default visual theme, each of the four card suits represents a distinctive faction with its own visual flair, color palette, and cultural military tradition.

### The Suit Mapping Formula

$$\text{Army Theme} + \text{Suit} + \text{Rank Archetype} \longrightarrow \text{Battlefield Sprite Visual}$$

### Default Suit Factions *(Directional Starting Points)*
- **Spades (♠)**: Disciplined, steel-clad, professional imperial legion; dark iron armor, precise formations.
- **Hearts (♥)**: Chivalric, romantic heraldic vanguard; polished steel, flowing banners, classic high fantasy flair.
- **Diamonds (♦)**: Ornate, gilded Renaissance mercenaries; feathered plumes, opulent velvet accents, rapier/duelist aesthetics.
- **Clubs (♣)**: Rugged, earthy, heavy highland force; furs, warhammers, heavy shields, raw physical presence.

*Note: Suit identity is purely cosmetic and operates independently of the player's per-war Red vs. Black deck color assignment.*

---

## 10. Alternate Army Themes & Cosmetics

The visual architecture will eventually support interchangeable cosmetic army themes that reskin the default suit armies.

### Potential Themed Sets *(Exploratory)*
- **Default Medieval/JRPG**: Classic suit factions described above.
- **Cheese War / Guild Militias**: Cheesemakers, milkmaids, curd-stirrers, and affineur knights.
- **Undead / Gothic**: Skeletal infantry, vampiric cavalry, necromancer Queens, lich Kings.
- **Clockwork / Steampunk**: Brass automatons, steam knights, alchemical Queens.
- **Seasonal & Sci-Fi**: Winter solstice, neon retro-future, or cosmic factions.

### Strict Cosmetic Principle
Cosmetic themes **never** alter card values, combat odds, AI logic, or gameplay mechanics. They are purely visual expressions of personal style.

---

## 11. Card Backs & Cosmetic Progression

Card backs represent an accessible, highly visible cosmetic category earned or unlocked through non-pay-to-win gameplay tokens.

### Cheese-Themed Card Backs
Tasteful, elegant patterns celebrating the world's cheese obsession:
- **Aged Rind**: Natural textured wheel crust with embossed military crest.
- **Blue Vein**: Elegant marble-like blue cheese mold veining on dark felt.
- **Waxed Wheel**: Crimson or black polished cheese wax with gold seal.
- **Cheese Board**: Parquet woodwork pattern with heraldic cutlery.
- **Artisan Cracker**: Original geometric biscuit/cracker patterns (strictly generic, non-infringing).

### Third-Party Trademarks & Partnerships
- **Zero Infringement**: No third-party logos, trademarked names, or proprietary trade dress (e.g., Cheez-It, Kraft, Laughing Cow) without explicit legal licensing.
- **Partnerships as Deferred Ideas**: Branded crossover card backs remain exploratory partnership concepts for a future stage of commercial maturity.

---

## 12. Multiplayer as a Long-Term Horizon

Multiplayer is a long-term design horizon rather than immediate release scope. However, all visual and cosmetic systems must remain compatible with future head-to-head human play:

- Players showcase personal identity via **Commander Avatar**, **Unlocked Card Back**, and **Chosen Army Theme**.
- Strict competitive integrity: Cosmetics provide zero in-game advantage.

---

## 13. Scope Discipline & Roadmap Tiers

To protect time-to-release, design ambitions are structured into clear developmental tiers:

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ROADMAP TIERS & SCOPE DISCIPLINE                                        │
├─────────────────────────────────────────────────────────────────────────┤
│ TIER 1: PRESERVE & REFINE NOW (Immediate / Current Milestone)           │
│ • Solidify cheese-war thematic identity and tonal contrast              │
│ • Retain established 5 fair-play AI strategy archetypes in code         │
│ • Maintain dark green felt table, gold trim, and serious military UI    │
│ • Enforce strict 52-card physical deck fidelity                         │
│ • Lay groundwork for portrait specs and character dialogue             │
│ • Resolve active UI layout, icon, and layering defects                  │
├─────────────────────────────────────────────────────────────────────────┤
│ TIER 2: PROGRESSIVE ARRIVAL (Post-Release Candidate Milestones)         │
│ • Named cheesemaker characters mapped to existing strategy models       │
│ • Expressive 2D character portraits with emotional states               │
│ • Animated pixel/sprite clash staging and 2-vs-Ace signature moment     │
│ • Four distinct suit-specific default armies                            │
│ • Cheese-themed cosmetic card backs unlockable via tokens               │
│ • Lightweight campaign narrative interstitials                          │
├─────────────────────────────────────────────────────────────────────────┤
│ TIER 3: LONG-TERM HORIZON (Future Strategic Expansions)                 │
│ • Full alternate cosmetic army themes (Gothic, Steampunk, etc.)         │
│ • Head-to-head multiplayer cosmetic showcase                            │
│ • Licensed promotional brand partnerships                               │
└─────────────────────────────────────────────────────────────────────────┘
```

### Prototyping & Iteration
Placeholder and first-pass assets may be simple or AI-assisted during rapid prototyping. All visual assets must be evaluated by how cleanly they read at actual mobile gameplay scale (`<= 620px`) on physical devices.

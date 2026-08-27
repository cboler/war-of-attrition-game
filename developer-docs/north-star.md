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

### Wordplay, Puns & Layered Humor
Cheese-related puns, culinary wordplay, linguistic jokes, double meanings, historical allusions, absurd technical terminology, and deliberately groan-inducing jokes are a core, intentional part of *War of Attrition's* voice. Cheese humor should **not** be rationed or treated as a scarce commodity.

The crucial design distinction is **where** that humor appears:

1. **The Formal Interaction Layer (Straight-Faced UI)**:
   - Core controls, interactive buttons, rules reference headings, and mechanics must remain clear, dignified, and legible:
     - `Challenge`
     - `Reinforcement`
     - `Battle`
     - `Boneyard`
     - `Field Manual`
     - `Campaign`
     - `Rules of Engagement`
   - *Do not* compromise usability by renaming primary game controls into cheese gags.

2. **The Writing Layer (Playful, Layered & Sharp)**:
   - Writing across all narrative surfaces may be abundant with wit, puns, and wordplay:
     - Opponent dialogue and contextual situational quips
     - Character biographies and rivalry descriptions
     - Campaign dispatches and pre-war briefings
     - *Chronicle* combat entries and *Field Manual* lore snippets
     - Achievement names and unlock descriptions
     - Cosmetic titles and item descriptions
     - Loading copy, interstitial notices, and victory/defeat reactions

### The Layered Humor Principle
The game appreciates humor that functions on multiple levels—dead-serious treatment of ridiculous institutions, verbal wit, and rich worldbuilding hidden directly inside comedic dialogue.

A well-crafted joke should ideally perform more than one job at once:
- Provoke a laugh or a good-natured groan;
- Deepen the characterization of the speaker (their ego, pedantry, or obsession);
- Establish or explain an intense historical rivalry;
- Imply broader political or culinary lore in the setting;
- Reward players who possess real-world cheese or historical knowledge;
- Foreshadow upcoming campaign events;
- Reinforce the absurdly committed gravity of the world.

### The Operational Maxims

> **"The UI does not wink. The writers may."**

> **"Use as many cheese puns as we can Muenster—without letting them curdle usability."**

---

## 3. The World: An International War of Cheesemakers

Opponent commanders are five vivid fictional individuals whose personalities embody the five implemented strategy archetypes. Production code still uses generic player-facing labels until Narrative Sprint 1, but the creative identities are settled.

### Mechanical Foundation vs. Fictional Identity
The parameterized AI strategy architecture implemented in `src/app/core/models/commander.model.ts` (weights for card valuation, win rate thresholds, reserve preservation, battle appetite, and desperation) is a permanent technical asset. Future fictional characters map directly onto these established strategy archetypes without replacing the fair-play engine.

### Canonical Commander Roster

| Character | Permanent strategy ID | Faction | Dramatic role |
| --- | --- | --- | --- |
| **Marcel de Brie** | `quartermaster` | French | Master affineur and principal French negotiator of the Mont-Rouge Accord |
| **Sir Edmund Gloucester** | `gambler` | English | Eccentric artisan-adventurer and Marcel's confidant |
| **Matthias von Greyerz** | `analyst` | Swiss | Master cheesemaker and principal Swiss negotiator of the Accord |
| **Bastien de Herve** | `attritionist` | Belgian | Apolitical tyromancer, itinerant rind-seer, and apparently mad prophet |
| **Lorenzo di Taleggio** | `cornered-general` | Italian | Alpine merchant-prince, cheesemaker, and Matthias's political confidant |

Bastien is intentionally both the Belgian commander and the Tyromancer. Do not create a sixth commander to split those concepts. The exact private dossiers, relationships, and knowledge/belief boundaries are authoritative in [`narrative-canon.md`](./narrative-canon.md).

### Guidelines on Cultural & National Characterization
Humor may incorporate strong accents (including deliberately phonetic written dialogue), regional rivalries, theatrical mannerisms, and affectionate European culinary traditions:

- **Focus on**: Cheesemaking pride, competing definitions of quality, historical culinary disputes, artisanal snobbery, etiquette, craft rivalry, and individual personality quirks.
- **Avoid**: Malice, hostility toward any real-world ethnicity, or reducing a character to a lazy cultural slight.
- **The Character Litmus Test**: A well-crafted commander must remain funny, distinct, and compelling even if their nationality is removed from the script.

---

## 4. Story & Worldbuilding — The Mont-Rouge Affair

*War of Attrition* uses progressive, fractured storytelling to connect its commanders, campaign modes, lore surfaces, and repeated play. It must never become a slow, dialogue-heavy visual novel.

### Narrative Design Principles
1. **Momentum First**: Narrative provides motivation and flavor without interrupting the crisp rhythm of card play.
2. **Where Story Lives**:
   - Opponent introductions and pre-war briefings
   - Character portraits and contextual situational quips
   - Brief campaign framing and optional interstitials
   - Post-match victory and defeat reactions
   - Lore snippets in the *Field Manual*, *Chronicle*, achievements, and cosmetic descriptions
3. **Incomplete Testimony**: Characters speak sincerely but incompletely, often rationalizing their own choices. Later fragments should change the meaning of earlier lines.
4. **Quick Onboarding**: A new player should understand the premise within seconds without receiving the complete history.

### Fictional Pseudo-History in a Medieval / Early-Modern Fantasy World
The canonical world is a **fictional medieval / early-modern European-flavored fantasy setting**, presented through the visual grammar of late-16-bit / early-32-bit JRPGs (drawing inspiration from the design language of early *Suikoden* and 2D *Final Fantasy*, without copying copyrighted settings, characters, plots, sprites, or dialogue).

The game's history should be **fictional pseudo-history assembled from the shapes of real cheesemaking absurdities**, rather than a literal retelling of a single historical war. This gives the game freedom to invent its own nations, guilds, treaties, charters, feuds, cheese fairs, monasteries, appellations, dynasties, and catastrophes while allowing knowledgeable players to recognize affectionate historical echoes.

### Primary Story Inspiration: French & Swiss Gruyère-Style Disputes
The historical inspiration for the inciting conflict is the rich class of real-world disputes surrounding **French and Swiss Gruyère traditions, naming, provenance, standards, and protected identity**.

The dramatic and comedic core to draw from:
- Two neighboring cheesemaking traditions, both claiming ancient legitimacy and ancestral rights;
- Bitter arguments over who may rightfully claim an ancient protected name;
- Provenance and geographical origin treated as matters of sovereign national pride;
- Minute differences in production methods and specifications elevated to diplomatic crises;
- Regulatory standards treated with the zeal of sacred religious dogma;
- The inherent comedy of characters who are technically precise, historically aggrieved, completely justified in their own eyes, and monumentally petty all at once.

> **Key Real-World Technical Echo for Inspiration**:
> In protected specifications, French Gruyère (IGP) explicitly calls for characteristic eye/hole formation (*"ouvertures de la taille d'un pois à une cerise"*), whereas Swiss Le Gruyère (AOP) has a much more closed or blind visual tradition. Its official characteristics allow a few small openings but do not require them.
>
> This exact type of minute, technically rigorous, yet deeply consequential distinction is what the fictional setting can exaggerate into centuries of international grievance.

### Settled Inciting History

Marcel de Brie and Matthias von Greyerz, honorable professional rivals representing French and Swiss interests, negotiate the **Mont-Rouge Accord**. At ratification, the ceremonial Swiss Witness Wheel unexpectedly contains eyes. Matthias suspends ratification to investigate; Marcel proceeds unilaterally under the framework they negotiated. Each experiences the other's defensible but prideful action as betrayal. Edmund pushes Marcel toward decisive action, Lorenzo pushes Matthias toward pre-emption, a restricted Alpine pass and disputed shipments lead to bloodshed, and retaliation turns suspicion into certainty.

In objective private canon, no sabotage or betrayal occurred. Months earlier, a field mouse disturbed hay or similar plant material associated with the Swiss dairy; microscopic structural material entered the cheesemaking environment and supplied natural eye nuclei. This fictional sequence is inspired by real eye-formation research in Swiss-type cheeses, not asserted as a documented Gruyère event.

> [!CAUTION]
> The mouse/hay cause is private writer knowledge. It should be inferable from Chapter III fragments and optional sources, not stated as an ordinary early-game explanation.

The four narrative chapters are **Standard: “The Accord” → Limited Reserves: “The Closing Passes” → Fog of War: “The Blind Wheel” → Total War: “The War of Attrition.”** Completion rather than victory unlocks the next chapter. The first-play opponents are deliberately authored per War—Marcel/Matthias/Bastien; Edmund/Lorenzo/Marcel; Matthias/Marcel/Bastien; Edmund/Lorenzo/Matthias—rather than randomized or held constant for an entire Campaign. Detailed chronology and disclosure limits live in [`narrative-canon.md`](./narrative-canon.md); implementation-ready routing and copy live in [`narrative-disclosure-matrix.md`](./narrative-disclosure-matrix.md) and [`commander-voice-bible.md`](./commander-voice-bible.md).

### Secondary Cultural Inspiration: Cheese-Rolling Rituals (Cooper's Hill Echoes)
The famous English tradition of the **Cooper's Hill Cheese-Rolling** in Gloucestershire—where competitors hurdle down a perilous gradient in pursuit of an eight-pound wheel of Double Gloucester—serves as a secondary cultural touchstone.

Rather than serving as the main war trigger, this tradition illustrates how real cheese customs can inspire:
- A martial coming-of-age ritual or regional athletic tournament;
- An eccentric English-region cultural festival;
- An opponent's proud battle anecdote or boast;
- Campaign interstitial color, *Field Manual* lore, or achievement references;
- The comedic effect of characters treating an obviously reckless cheese-rolling contest as an ancient, dignified, and solemn institution.

### Bastien and the Tyromancy Bridge
**Tyromancy**—the divination of the future through the coagulation, curds, holes, sweating, patterns, and mold of cheese—is a genuine historical divination practice recorded from antiquity through medieval Europe.

**Bastien de Herve**, the Belgian Attritionist and apolitical Tyromancer, embodies the overarching worldbuilding formula for *War of Attrition*:

> **"Take something genuinely present in cheese history, folklore, trade, law, ritual, or craft, then push it one step sideways into sincere fantasy worldbuilding."**

Bastien operates as an earnest mystic whose curd readings and rind portents are treated with tactical gravity or exasperation by commanders. He tells the truth about Mont-Rouge through absurd riddles, but prophecy never gives his AI hidden-card knowledge or magical gameplay power.

### Rejection of Modern 20th-Century Settings
The core narrative and visual identity explicitly **reject** 20th-century industrial conflicts (such as the 1960s Tillamook dairy cooperative disputes) as canonical story direction. Mid-century American corporate/commercial aesthetics clash with the established medieval/early-modern JRPG fantasy visual direction and are not part of the game's foundation.

---

## 5. Contextual Links, Sources & Trivia-Layer Humor

*War of Attrition* freely incorporates real cheesemaking terminology, historical parallels, folklore, legal oddities, culinary traditions, and obscure references where they strengthen character or worldbuilding.

When useful, the game may provide optional links to reputable contextual sources, including Wikipedia for broad reference material and more authoritative primary or institutional sources where appropriate.

### The Context Principle

> **"Provide context, not punchline annotations."**

The goal is **not** to explain the joke. The goal is to give curious players an effortless path to discover that the joke, terminology, or absurd historical premise has a real-world basis.

- The surface-level writing must always remain funny and enjoyable without following any link.
- Optional source links reward player curiosity with historical context, obscure cheesemaking terminology, regional traditions, legal/appellation disputes, folklore, strange real events, etymology, or useful trivia.

### The Three-Layer Joke Architecture
Whenever possible, references should create layered humor:
1. **Layer 1 (The Surface)**: The line works on its own as character dialogue, banter, or narrative flavor.
2. **Layer 2 (The In-Joke)**: Knowledgeable players recognize the historical or culinary allusion immediately.
3. **Layer 3 (The Discovery)**: Curious players follow the optional source link and discover that the most ridiculous, bizarre detail is actually historically true.

This turns research itself into an extension of the joke.

### Suitable Linked Concepts & Terminology *(Examples)*
- **Tyromancy**: Ancient and medieval divination by cheese.
- **Affineur**: The specialized craft and philosophy of cheese aging and maturation.
- **Protected Designation / Appellation Systems**: AOP, AOC, IGP, and PDO regulatory frameworks.
- **Gruyère Naming & Production Disputes**: Cross-border specification feuds (holes vs. blind texture).
- **Cooper's Hill Cheese-Rolling**: Perilous historical downhill races in Gloucestershire.
- **Washed-Rind Cheeses & Bacterial Culturing**: Brevibacterium linens and pungent monastery traditions.
- **Morbier**: The historical vegetable ash dividing line between morning and evening curds.
- **Rennet & Coagulation**: Chymosin enzymes, cardoon thistles, and milk-clotting biochemistry.
- **Regional Customs & Historical Cheese Riots**: Nottingham Cheese Riots (1766), trade disputes, and tax revolts.

### Where Links Belong (and Where They Do Not)
- **Do NOT** interrupt core gameplay with mandatory educational popups or intrusive dialogs.
- **Do NOT** link ordinary or common words.
- **Where Links Naturally Belong**:
  - *Field Manual* entries and lore appendices
  - *Chronicle* event details and historical notes
  - Commander biographies and rivalry descriptions
  - Glossary-style term popovers in the lore viewer
  - Campaign historical dispatches and interstitial briefings
  - Cosmetic item names and unlock lore
  - Optional, subtle info affordances adjacent to specialized terminology

### Source Philosophy & Scholarly Framing
The project prefers citing sources with dignity:
- **Wikipedia**: For approachable, broad reference and discovery.
- **Official Records, Museums, Universities & Historical Societies**: When legal or historical precision matters (e.g., official protected-designation specifications).
- **Primary / Institutional Documents**: For specific technical or historical claims.

The UI should not feel like citation clutter. Rather, it should feel like **discovering footnotes in a very serious military history written about an extremely unserious cheese war**.

### The Desired Outcome

> **"The player learns something that might actually help on trivia night, without the game ever stopping to explain why the joke was funny."**

---

## 6. Visual North Star

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

## 7. Character Portraits & Dialogue

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

## 8. Visualized Card Clashes & Battle Staging

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

## 9. Rank-to-Unit Visual Language

To make card clashes intuitive, card ranks map to consistent military unit archetypes:

```
┌─────────────────────────────────────────────────────────────────────────┐
│ RANK-TO-UNIT ARCHETYPES                                                 │
├───────────────────┬─────────────────────────────────────────────────────┤
│ Card Rank         │ Battlefield Unit Representation                     │
├───────────────────┼─────────────────────────────────────────────────────┤
│ Number Cards (2-10)│ Ordinary soldiers / infantry scaled by rank         │
│ Jack              │ Cavalry / Mounted Knight                            │
│ Queen             │ Caster / Mage / Witch / Tactical Ranged Figure      │
│ King              │ Regal Swordsman / Champion Commander                │
│ Ace               │ Supreme General / Army Commander                    │
│ 2 (special case)  │ Humble soldiers/scouts capable of lethal infiltration│
└───────────────────┴─────────────────────────────────────────────────────┘
```

### Number Cards (2 through 10)
Represent ordinary soldiers or line infantry formations, with the Two retaining its special visual role described below. Rather than rendering one sprite per pip, counts are visually compressed into formation tiers to maintain readability on mobile screens.

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

## 10. Suit-Specific Armies (Canonical Long-Term Direction)

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

## 11. Alternate Army Themes & Cosmetics

The visual architecture will eventually support interchangeable cosmetic army themes that reskin the default suit armies.

### Potential Themed Sets *(Exploratory)*
- **Default Medieval/JRPG**: Classic suit factions described above.
- **Cheese War / Guild Militias**: Cheesemakers, milkmaids, curd-stirrers, and affineur knights.
- **Undead / Gothic**: Skeletal infantry, vampiric cavalry, necromancer Queens, lich Kings.
- **Clockwork / Steampunk**: Brass automatons, steam knights, alchemical Queens.
- **Seasonal & Sci-Fi**: Winter solstice, neon retro-future, or cosmic factions.
- **Speculative Distant Themes**: Highly speculative, non-priority visual skins (such as a mid-century dairy cooperative motif) remain distant cosmetic possibilities only and do not alter the canonical medieval/early-modern fantasy setting.

### Strict Cosmetic Principle
Cosmetic themes **never** alter card values, combat odds, AI logic, or gameplay mechanics. They are purely visual expressions of personal style.

---

## 12. Card Backs & Cosmetic Progression

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

## 13. Multiplayer as a Long-Term Horizon

Multiplayer is a long-term design horizon rather than immediate release scope. However, all visual and cosmetic systems must remain compatible with future head-to-head human play:

- Players showcase personal identity via **Commander Avatar**, **Unlocked Card Back**, and **Chosen Army Theme**.
- Strict competitive integrity: Cosmetics provide zero in-game advantage.

---

## 14. Scope Discipline & Canon Categorization

### Settled Creative Principles *(Authoritative and Binding)*
- **Tonal Contrast**: Straight-faced military UI framing an absurdly serious international cheese war.
- **Humor Philosophy**: Abundant layered puns, linguistic wit, and multi-level jokes (*"The UI does not wink. The writers may."* / *"Use as many cheese puns as we can Muenster—without letting them curdle usability."*).
- **Contextual Sourcing & Footnotes**: Real cheesemaking terminology and history linked unobtrusively (*"Provide context, not punchline annotations"*); jokes never paused for explanations.
- **Physical Deck Fidelity**: Strict 52-card physical integrity; zero pay-to-win, stat modifiers, or superpowers.
- **Visual Grammar**: 16/32-bit tactical JRPG-inspired pixel/portrait staging; readable at mobile scale (`<= 620px`).
- **Mechanical Separation**: 5 parameterized AI strategy models in code remain immutable; fictional personalities map onto them.
- **Canonical Cast**: Marcel, Edmund, Matthias, Bastien, and Lorenzo map respectively to `quartermaster`, `gambler`, `analyst`, `attritionist`, and `cornered-general`. Bastien is both Belgian and Tyromancer.
- **Mont-Rouge Canon**: No sabotage or betrayal occurred. The mouse/hay cause is private canon to be inferred rather than announced.
- **Chapter Order**: Standard → Limited Reserves → Fog of War → Total War, unlocked by completion rather than victory and never by monetization.
- **Narrative Form**: Fractured, environmental disclosure through existing or low-cost surfaces; no visual-novel conversion.
- **Authored Encounter Form**: Canonical first play uses the settled twelve-War commander schedule; randomized replay is deferred until after the four chapters are complete.
- **Progressive Dossiers**: The table identity area deep-links into compact Field Manual records that improve their historiography as evidence unlocks; no RPG character sheets.
- **Rank Archetypes**: Consistent military formations (Infantry, Cavalry Jacks, Caster Queens, Swordsman Kings, General Aces, and the signature 2-vs-Ace assassination sequence).
- **Clash Visualizations**: The implemented V1 lets visible physical cards summon brief presentation-only infantry encounters; the settled rank archetypes remain future refinements.
- **Cosmetics Policy**: Purely visual presentation (card backs, army themes, portraits); strict prohibition against unauthorized third-party trade dress.

### Settled Thematic Framework
- **Fictional Setting**: A fictional medieval / early-modern European fantasy world (drawing JRPG aesthetic cues, not documentary realism).
- **Primary Narrative Anchor**: French and Swiss Gruyère-style provenance, standards, and naming disputes as the dramatic blueprint for the central war.
- **Cultural Folklore Echoes**: Real cheese traditions (such as Cooper's Hill cheese rolling) used as flavor for festivals, rituals, and anecdotes.
- **Tyromancy**: Real historical cheese divination used as a sincere bridge between cheese lore and fantasy worldbuilding.
- **Default Suit Armies**: Four distinct suit-based military traditions (Disciplined Spades, Chivalric Hearts, Gilded Diamonds, Rugged Clubs).

### Still Exploratory Unless Later Settled
- Specific names of fictional countries, borders, or dynasties;
- Final player-facing wording, individual dialogue lines, and exact fragment placement;
- Exact commander portrait designs and animation asset technique;
- Additional suit-army costume details and distant alternate cosmetic themes;
- Long-term multiplayer and licensed partnership execution.

---

## 15. Remaining Roadmap

Barring newly discovered release-blocking defects, both substantial creative sprints now have production initial passes. Final-pass polish comes next; richer battlefield variants remain later refinements.

### Sprint 1 — Progressive Narrative Unveiling

- Replace generic presentation labels with the five canonical identities while retaining strategy IDs and math.
- Move opponent identity to the authored War encounter and preserve all three opponents in Campaign history.
- Implement chapter completion/unlocks, replay access, legacy migration, and minimal narrative state.
- Add chapter/War-aware reactions, compact Campaign/War framing, progressive commander dossiers, lore fragments, and contextual historical/scientific links.
- Use the Field Manual, Chronicle, Campaign Orders, resolution surfaces, achievements, and cosmetics without building a visual novel.

### Sprint 2 — Clash Visualizations / Battlefield Animations (V1 Implemented)

- Implemented: symbolic five-unit infantry formations charge horizontally, bonk, and resolve with a much larger losing-side knockback while physical cards remain authoritative.
- Implemented: inline SVG/CSS presentation reuses sequencing, speed, Continue/skip, persistent settings, and reduced-motion seams.
- Deferred: number/Jack/Queen/King/Ace classes, suit identities, the Two's signature Ace-defeating sequence, and recursive spectacle escalation.
- Continue to keep silhouettes readable at phone scale and avoid copyrighted source material or an excessive asset/runtime budget.

### Then — Final-Pass Polish

- Resolve verified responsive layout/redraw gremlins, icon and overlay defects, pacing, accessibility, real-device compatibility, and store-readiness concerns.
- Do not fold deferred battlefield expansion into generic polish without a separately scoped later pass.
- Long-term multiplayer, alternate army themes, and licensed partnerships remain beyond these two sprints.

### Prototyping & Iteration
Placeholder and first-pass assets may be simple or AI-assisted during rapid prototyping. All visual assets must be evaluated by how cleanly they read at actual mobile gameplay scale (`<= 620px`) on physical devices.

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

## 4. Story & Worldbuilding — Historical & Pseudo-Historical Inspiration

*War of Attrition* will eventually feature a simple Campaign narrative connecting its commanders, but it must never become a slow, dialogue-heavy visual novel.

### Narrative Design Principles
1. **Momentum First**: Narrative provides motivation and flavor without interrupting the crisp rhythm of card play.
2. **Where Story Lives**:
   - Opponent introductions and pre-war briefings
   - Character portraits and contextual situational quips
   - Brief campaign interstitials between Wars in a Three-War series
   - Post-match victory and defeat reactions
   - Lore snippets in the *Field Manual* and *Chronicle*
3. **Quick Onboarding**: A new player should understand the premise within seconds.

### Fictional Pseudo-History in a Medieval / Early-Modern Fantasy World
The canonical world is a **fictional medieval / early-modern European-flavored fantasy setting**, presented through the visual grammar of late-16-bit / early-32-bit JRPGs (drawing inspiration from the design language of early *Suikoden* and 2D *Final Fantasy*, without copying copyrighted settings, characters, plots, sprites, or dialogue).

The game's history should be **fictional pseudo-history assembled from the shapes of real cheesemaking absurdities**, rather than a literal retelling of a single historical war. This gives the game freedom to invent its own nations, guilds, treaties, charters, feuds, cheese fairs, monasteries, appellations, dynasties, and catastrophes while allowing knowledgeable players to recognize affectionate historical echoes.

### Primary Story Inspiration: French & Swiss Gruyère-Style Disputes
The strongest current inspiration for the eventual inciting conflict is the rich class of real-world disputes surrounding **French and Swiss Gruyère traditions, naming, provenance, standards, and protected identity**.

The dramatic and comedic core to draw from:
- Two neighboring cheesemaking traditions, both claiming ancient legitimacy and ancestral rights;
- Bitter arguments over who may rightfully claim an ancient protected name;
- Provenance and geographical origin treated as matters of sovereign national pride;
- Minute differences in production methods and specifications elevated to diplomatic crises;
- Regulatory standards treated with the zeal of sacred religious dogma;
- The inherent comedy of characters who are technically precise, historically aggrieved, completely justified in their own eyes, and monumentally petty all at once.

> **Key Real-World Technical Echo for Inspiration**:
> In protected specifications, French Gruyère (IGP) explicitly calls for characteristic eye/hole formation (*"ouvertures de la taille d'un pois à une cerise"*), whereas Swiss Le Gruyère (AOP) maintains a distinct tradition with a blind, closed texture without holes.
> 
> This exact type of minute, technically rigorous, yet deeply consequential distinction is what the fictional setting can exaggerate into centuries of international grievance.

#### Exploratory Story Ingredients *(Not Settled Plot Points)*:
- An ancient royal appellation or protected guild name granted by a long-dead emperor;
- Rival factions interpreting opposing clauses of a centuries-old monastic charter;
- Disputed alpine pasture borders and transhumance grazing routes;
- Accusations of counterfeit rinds or illicit milk blending;
- A diplomatic insult delivered at a prestigious grand cheese fair;
- A controversial judging decision by a corrupt or partisan tasting tribunal;
- Incompatible definitions of correct rind mold, hole formation, curd temperature, or maturation cellars;
- A minor dispute that no reasonable ruler would escalate into a war—and which therefore sparks an all-out international conflict.

### Secondary Cultural Inspiration: Cheese-Rolling Rituals (Cooper's Hill Echoes)
The famous English tradition of the **Cooper's Hill Cheese-Rolling** in Gloucestershire—where competitors hurdle down a perilous gradient in pursuit of an eight-pound wheel of Double Gloucester—serves as a secondary cultural touchstone.

Rather than serving as the main war trigger, this tradition illustrates how real cheese customs can inspire:
- A martial coming-of-age ritual or regional athletic tournament;
- An eccentric English-region cultural festival;
- An opponent's proud battle anecdote or boast;
- Campaign interstitial color, *Field Manual* lore, or achievement references;
- The comedic effect of characters treating an obviously reckless cheese-rolling contest as an ancient, dignified, and solemn institution.

### The Tyromancy Bridge: Historical Divination to Fantasy Reality
**Tyromancy**—the divination of the future through the coagulation, curds, holes, sweating, patterns, and mold of cheese—is a genuine historical divination practice recorded from antiquity through medieval Europe.

The Tyromancer embodies the overarching worldbuilding formula for *War of Attrition*:

> **"Take something genuinely present in cheese history, folklore, trade, law, ritual, or craft, then push it one step sideways into sincere fantasy worldbuilding."**

The Tyromancer operates as an earnest mystic whose curd readings and rind portents are taken with utmost tactical gravity by commanders.

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

To maintain creative clarity and protect time-to-release, all creative decisions are explicitly categorized into three distinct levels of certainty:

### 1. Settled Creative Principles *(Authoritative & Binding)*
- **Tonal Contrast**: Straight-faced military UI framing an absurdly serious international cheese war.
- **Humor Philosophy**: Abundant layered puns, linguistic wit, and multi-level jokes (*"The UI does not wink. The writers may."* / *"Use as many cheese puns as we can Muenster—without letting them curdle usability."*).
- **Contextual Sourcing & Footnotes**: Real cheesemaking terminology and history linked unobtrusively (*"Provide context, not punchline annotations"*); jokes never paused for explanations.
- **Physical Deck Fidelity**: Strict 52-card physical integrity; zero pay-to-win, stat modifiers, or superpowers.
- **Visual Grammar**: 16/32-bit tactical JRPG-inspired pixel/portrait staging; readable at mobile scale (`<= 620px`).
- **Mechanical Separation**: 5 parameterized AI strategy models in code remain immutable; fictional personalities map onto them.
- **Rank Archetypes**: Consistent military formations (Infantry, Cavalry Jacks, Caster Queens, Swordsman Kings, General Aces, and the signature 2-vs-Ace assassination sequence).
- **Cosmetics Policy**: Purely visual presentation (card backs, army themes, portraits); strict prohibition against unauthorized third-party trade dress.

### 2. Strong Current Direction *(Settled Thematic Framework)*
- **Fictional Setting**: A fictional medieval / early-modern European fantasy world (drawing JRPG aesthetic cues, not documentary realism).
- **Primary Narrative Anchor**: French and Swiss Gruyère-style provenance, standards, and naming disputes as the dramatic blueprint for the central war.
- **Cultural Folklore Echoes**: Real cheese traditions (such as Cooper's Hill cheese rolling) used as flavor for festivals, rituals, and anecdotes.
- **Tyromancy**: Real historical cheese divination used as a sincere bridge between cheese lore and fantasy worldbuilding.
- **Default Suit Armies**: Four distinct suit-based military traditions (Disciplined Spades, Chivalric Hearts, Gilded Diamonds, Rugged Clubs).

### 3. Exploratory Ingredients *(Subject to Future Creative Pass; Not Final Canon)*
- Specific names of fictional countries, borders, or dynasties;
- Specific names of charters, treaties, or the inciting prize cheese wheel;
- Specific commander roster names (e.g., *Marcel de Brie* remains a directional concept);
- Specific campaign plot beats, cutscene scripts, or dialogue lines;
- The final official title of the cheese conflict.

---

## 15. Roadmap Tiers & Milestones

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

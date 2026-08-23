# War of Attrition — Future Gameplay & Backlog Design Concepts

This document catalogs future design concepts and backlog ideas for **War of Attrition**. These concepts are intentionally deferred post-release candidates and do **not** form part of the initial production release scope.

---

## 🧭 Core Design Guardrail for Future Additions

> **Guiding Principle**:
> War of Attrition is literally playable with an ordinary physical deck of 52 cards. Digital features should strictly preserve and honor that physical identity.
>
> Future modes and enhancements may introduce campaign-level resource constraints, statistical progression, thematic presentation, enhanced scoring metrics, or specialized opponent behaviors. However, they must **avoid** turning standard playing cards into collectible card superpowers, arbitrary fantasy abilities, or deck-building pieces, unless the project deliberately decides to become a fundamentally different game.

---

## 1. Nearer-Term Post-Release Candidates
 
### A. Opponent Commanders & AI Personalities (Graduated to Implemented System)

> **Status**: Fully implemented. See [`developer-docs/opponent-commanders.md`](./opponent-commanders.md) for the active architecture, strategy weights, campaign rotation, dialogue pools, and telemetry integration.

**Core Principles Maintained**:
- **Strict Fair Play & No Cheating**: Opponent commanders strictly obey standard physical card rules and never inspect hidden cards or manipulate deck order.
- **5 Canonical Archetypes**: The Quartermaster, The Gambler, The Analyst, The Attritionist, and The Cornered General.
- **Campaign Persistence & Rotation**: Continuous multi-war opponent identity per Campaign with rotation preventing immediate repeat.

---

### B. Hall of Valor / Persistent Card Service Records

**Concept**:
Because standard playing cards have stable suit/rank identities (`hearts-K`, `diamonds-2`, `spades-A`), the game can track persistent historical service records for individual cards across all career Wars.

**Tracked Career Distinctions**:
- **Confirmed Casualties**: Total enemy cards sent to the Boneyard by this specific card.
- **Ace Assassinations**: For Two cards (`hearts-2`, `diamonds-2`), total Aces slain under the special rule.
- **Reinforcement Rescues**: Times this card entered as a reinforcement to turn a defeat into victory.
- **Times Rescued**: Times this card was facing defeat but was saved by an incoming reinforcement.
- **Deadlock Battles Survived**: Number of recursive Battle layers this card participated in.
- **Wars Survived**: Number of victorious Wars where this card remained in the player's deck at game end.
- **Juggernaut Citations**: Awarded when a card wins 3+ consecutive clashes or battles in a single match.
- **Notable Losses**: Memorable defeats suffered against specific rival cards.

**Player Experience**:
Card service records create organic emotional attachment to individual physical card identities, giving players "veteran champions" and memorable grudges without altering the deterministic card values.

---

## 2. Rainy-Day Expansion: Alternate Rules Campaigns

**Concept**:
Unlike achievements (which observe rare events under standard rules), **Alternate Rules Campaigns** introduce strategic modifiers, altered information states, or campaign-level resource constraints across a Three-War series.

### Campaign Variants:

#### 1. Limited Reserves
- The player is allocated a fixed quota of reinforcements (e.g., 5 total challenges) for the entire Three-War Campaign.
- Using a reinforcement consumes one reserve point.
- Unlocks deep cross-war resource management: "Do I challenge this King in War 1, or save my reserves for War 3?"

#### 2. Fog of War
- Information in the Boneyard is restricted during active play.
- Casualties are placed face-down into the discard stack and cannot be freely inspected until the War concludes.
- Forces players to rely on memory and intuition rather than precise casualty counting.

#### 3. No Retreat
- The War must be fought to the bitter end.
- Abandoning, conceding, or resetting an unresolved War immediately forfeits the entire Campaign with maximum penalty to career differential.

#### 4. Total War
- Campaign victory is determined strictly by **cumulative card differential** across all three Wars, rather than simple 2-out-of-3 match wins.
- A crushing 26–0 sweep in War 1 provides a massive buffer that can withstand a narrow 12–14 defeat in War 2.

#### 5. Escalation
- Each successful reinforcement or multi-layer battle in a War increases the stake cost or difficulty of subsequent actions in that Campaign.

---

## 3. Implementation Status
These concepts remain exploratory design specifications and are maintained in this document for future product roadmapping.

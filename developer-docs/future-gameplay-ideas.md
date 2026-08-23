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

### B. Hall of Valor / Persistent Card Service Records (Graduated to Implemented System)

> **Status**: Fully implemented. See [`developer-docs/hall-of-valor.md`](./hall-of-valor.md) for the active architecture, distinction semantics, event attribution flow, profile scoping, and Field Manual UI integration.

**Core Principles Maintained**:
- **Strict Physical Deck Fidelity**: Meta-game history and presentation only. Decorated cards retain standard physical ranks, values, and probabilities.
- **Authoritative Event-Driven Attribution**: Uses real domain settlement attribution rather than visual or DOM heuristics.
- **Hidden-Information Integrity**: Never leaks private Battle layers, unseen returned cards, or hidden deck order.
- **Tracked Career Distinctions**: Confirmed Casualties, Ace Assassinations (2-vs-Ace), Reinforcement Rescues, Times Rescued, Battle Layers Survived, Victorious Wars Survived, Juggernaut Citations (3-streak per War), and Notable Rivalries.

---

## 2. Alternate Rules Campaigns (First Variant Graduated)

> **Status**: **Limited Reserves** is fully implemented and graduated in version 4.1.0. See [`developer-docs/alternate-rules-campaigns.md`](./alternate-rules-campaigns.md) for the active architecture, state models, reserve exhaustion flow, and UI/telemetry integration.

**Concept**:
Unlike achievements (which observe rare events under standard rules), **Alternate Rules Campaigns** introduce strategic modifiers, altered information states, or campaign-level resource constraints across a Three-War series.

### Campaign Variants:

#### 1. Limited Reserves (Graduated to Implemented System)
- The player is allocated a fixed quota of exactly 5 reinforcements for the entire Three-War Campaign.
- Using a reinforcement consumes one reserve point.
- Unlocks deep cross-war resource management: "Do I challenge this King in War 1, or save my reserves for War 3?"
- When reserves reach 0, human challenges are exhausted and beaten clashes are conceded automatically.

#### 2. Fog of War (Future Candidate)
- Information in the Boneyard is restricted during active play.
- Casualties are placed face-down into the discard stack and cannot be freely inspected until the War concludes.
- Forces players to rely on memory and intuition rather than precise casualty counting.

#### 3. No Retreat (Future Candidate)
- The War must be fought to the bitter end.
- Abandoning, conceding, or resetting an unresolved War immediately forfeits the entire Campaign with maximum penalty to career differential.

#### 4. Total War (Future Candidate)
- Campaign victory is determined strictly by **cumulative card differential** across all three Wars, rather than simple 2-out-of-3 match wins.
- A crushing 26–0 sweep in War 1 provides a massive buffer that can withstand a narrow 12–14 defeat in War 2.

#### 5. Escalation (Future Candidate)
- Each successful reinforcement or multi-layer battle in a War increases the stake cost or difficulty of subsequent actions in that Campaign.

---

## 3. Implementation Status
Remaining ungraduated concepts remain exploratory design specifications and are maintained in this document for future product roadmapping.

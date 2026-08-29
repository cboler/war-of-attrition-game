# War of Attrition — Hall of Valor Architecture & Persistent Card Service Records

## 1. Executive Summary & Purpose

The **Hall of Valor** is a persistent meta-game career ledger in **War of Attrition**. Because standard physical playing cards possess permanent canonical identities (`hearts-A`, `diamonds-2`, `clubs-K`, etc.), individual physical cards accumulate historical service records over the course of a commander's career across all fought Wars.

A card such as `diamonds-2` or `hearts-K` gradually becomes memorable based on what it has actually achieved on the battlefield:
- Slaying enemy cards in clashes and Battles
- Assassinating enemy Aces under the special 2-defeats-Ace rule
- Rescuing allied cards by entering as successful reinforcements
- Being rescued from defeat by incoming reinforcements
- Holding the line through deep recursive Battle deadlock layers
- Surviving victorious Wars in the player's active deck
- Earning rare **Juggernaut Citations** through streaks of decisive appearances
- Developing long-standing rivalries against specific opposing cards

This system builds organic, emotional attachment to ordinary physical cards without turning them into collectible-card upgrades or fantasy units.

---

## 2. Core Design Guardrails: Physical Deck Fidelity

> [!IMPORTANT]
> **Strict Physical Deck Fidelity & Zero Gameplay Effect**
> War of Attrition is designed to be fully playable with an ordinary physical deck of 52 cards.
> 
> The Hall of Valor is **meta-game history and presentation only**. It must **never** affect:
> - Card comparison values or ranks
> - Deck composition or card distribution
> - Draw order or shuffling
> - Challenge odds or AI behavior
> - Battle deadlock mechanics or stakes
> - Starting resources or durability
> 
> A decorated Two is physically and mechanically identical to any other Two under the rules of play. The Hall records what happened; it never changes what can happen.

---

## 3. Data & Persistence Model

### A. Canonical Card Identities
Cards use the existing canonical `Card.id` format (`${suit}-${rank}`):
- Suits: `hearts`, `diamonds`, `clubs`, `spades`
- Ranks: `A`, `K`, `Q`, `J`, `10`, `9`, `8`, `7`, `6`, `5`, `4`, `3`, `2`
- Total bounded universe: Exactly 52 canonical card identities.

### B. Service Record Model (`hall-of-valor.model.ts`)
Each individual card's career history is represented by a `CardServiceRecord`:

```typescript
export interface CardServiceRecord {
  readonly cardId: string;
  readonly confirmedCasualties: number;
  readonly aceAssassinations: number;
  readonly reinforcementRescues: number;
  readonly timesRescued: number;
  readonly battleLayersSurvived: number;
  readonly victoriousWarsSurvived: number;
  readonly juggernautCitations: number;
  readonly notableLosses: Readonly<Record<string, number>>;
  readonly lastServedAt?: string;
}

export interface HallOfValorState {
  readonly records: Readonly<Record<string, CardServiceRecord>>;
}
```

### C. Bounded Storage & Normalization
Storage is strictly bounded:
- Counters are aggregate non-negative integers.
- `notableLosses` is a map keyed by opposing canonical card IDs (bounded by the 52 standard cards).
- Unlimited chronological event logs are deliberately avoided.
- All stored profiles are normalized via `normalizeHallOfValor(value: unknown)` on load, ensuring that partial, missing, or malformed data from older versions migrates safely without runtime crashes.

### D. Profile Scoping & Reset Semantics
Hall of Valor data is attached directly to the active local `UserProfile` in `AuthService`:
- **Independent Profiles**: Guest profiles and Google-linked profiles maintain separate Hall of Valor records. Switching profiles switches Hall records cleanly.
- **Profile Deletion**: Clearing local profile data removes associated Hall records cleanly.
- **Career Reset**: Executing "Reset Career Records" in the Profile Dialog permanently clears both career statistics and Hall of Valor records back to default, as communicated in the confirmation dialog.
- **Preference Reset**: Resetting preferences alone does **not** clear Hall of Valor records.

---

## 4. Exact Service Record Distinction Semantics

| Distinction | Semantics & Trigger Condition |
| :--- | :--- |
| **Confirmed Casualties** | When the player wins a settlement (`SettlementAttribution.winner === PlayerType.PLAYER`), credit the player's decisive card with the number of enemy casualty cards sent to the Boneyard. |
| **Ace Assassinations** | When the player's decisive card is a Two (`Rank.TWO`) and the settlement sends one or more Aces to the Boneyard under the special 2-beats-Ace rule, increment the Two's Ace assassination count once per Ace slain. |
| **Reinforcement Rescues** | When the player accepts a challenge and the reinforcement card turns a defeat into victory (`challenge_resolved` with `challengerWon === true`), credit the reinforcement card with +1 rescue. |
| **Times Rescued** | In the same successful player challenge, credit the original beaten player card (`originalBeatenCard`) with +1 times rescued. |
| **Battle Layers Survived** | When a Battle layer resolves its blind selection (`battle_cards_revealed`), credit the player's revealed public champion (`selection.playerCard`) with +1 Battle layer survived. |
| **Victorious Wars Survived** | When the player wins the War (`GameOutcome.PLAYER_WIN` in `game_resolved`), credit every card remaining in the player's deck at game end with +1 victorious War survived. |
| **Juggernaut Citation** | Awarded when a card achieves **5 consecutive decisive appearances in the same War without suffering an intervening defeat**. At most 1 Juggernaut Citation is awarded per card per War. Transient streaks reset on defeat, War end, or match abandonment. |
| **Notable Losses & Rivals** | When a player card becomes a casualty in an opponent victory, record the opposing decisive card responsible and increment the rival's defeat counter in `notableLosses[rivalCardId]`. |

### Per-War Player Ownership
Service credit is awarded only while a card is serving in the **human player's deck** for that War. Because deck colors rotate between Wars (Player can be Red or Black), any of the 52 cards may earn player service credit during its career based on authoritative per-War deck assignment (`playerDeckColor`).

---

## 5. Hidden-Information Integrity & Fair Play

To protect the core game's fair-play integrity:
- **No Private Battle Leaks**: Face-down Battle cards returned unseen to the winner are never revealed or credited.
- **Strict Public Event Attribution**: Only legally revealed public champions (`battle_cards_revealed`), public casualties (`settlement_resolved`), and decisive cards receive attribution during active play.
- **Deferred War Survival**: Surviving player card IDs are only exposed in `game_resolved` after the War is officially concluded and terminal presentation begins. Active in-game deck order is never exposed.

---

## 6. User Interface Architecture

The Hall of Valor is integrated into the in-game **Field Manual** drawer (`StoryBookDrawerComponent`):

### A. Navigation Tabs
1. **Chronicle** (`#tab-chronicle`): Live narrative match event timeline.
2. **Hall of Valor** (`#tab-valor`): Roll of Honor and card service records.
3. **Rules of Engagement** (`#tab-rules`): Interactive rules demonstrations.
4. **Card Reference** (`#tab-reference`): Contextual casualty inspector (opened from Boneyard).

### B. Overview & Detail Presentation
- **Roll of Honor**: Displays all cards with at least one career distinction, ordered by honors priority:
  1. Juggernaut Citations
  2. Ace Assassinations
  3. Confirmed Casualties
  4. Reinforcement Rescues
  5. Victorious Wars Survived
  6. Battle Layers Survived
- **Empty State**: Displays an intentional military roll banner when a fresh profile has not yet recorded card decorations.
- **Card Detail View**: Tapping any decorated card opens its full career ledger, including citation badges, combat statistics, and notable rivalries.
- **Card Reference Integration**: Inspecting a Boneyard casualty that has a Hall of Valor service record displays a commemorative honor summary and a direct "View in Hall of Valor" affordance.

---

## 7. Achievement Integration Boundary

The Hall of Valor itself is fully implemented. `HallOfValorService` emits the public domain event `valor_citation_awarded` when notable milestones such as Juggernaut Citations occur, providing a clean integration seam without UI scraping. No current achievement consumes that event.

# Technical Analysis: Root Cause Investigation

## Bundle Size Analysis (Issue #62)

**Current State:** 849.58 kB (349.58 kB over 500 kB budget)

### Component Breakdown:
- **main-BS3PXDOG.js**: 787.37 kB (92.7% of bundle)
- **polyfills-B6TNHZQ6.js**: 34.58 kB  
- **styles-4QHNILDC.css**: 27.64 kB

### Key Contributors:
1. **Angular Material**: Likely importing entire modules instead of specific components
2. **Component Styles**: Several SCSS files exceed 4kB budget
3. **No Code Splitting**: Everything bundled into main chunk

### Specific Optimizations Required:
```typescript
// Current (inefficient):
import { MatButtonModule } from '@angular/material/button';

// Optimized:
import { MatButton } from '@angular/material/button';

// Or implement lazy loading for settings:
const routes: Routes = [
  { path: 'settings', loadComponent: () => import('./settings/settings').then(m => m.Settings) }
];
```

---

## Critical Bug Analysis

### Issue #64: Card Management Logic Error

**Root Cause Investigation:**
Located in `TurnResolutionService.resolveNormalWin()` and `GameStateService.returnCardsToOpponentDeck()`.

**Current Logic:**
```typescript
// Lines 47-51 in TurnResolutionService
if (winner === PlayerType.PLAYER) {
  this.gameStateService.returnCardsToPlayerDeck([playerCard]);
} else {
  this.gameStateService.returnCardsToOpponentDeck([opponentCard]);
}
```

**Problem:** The logic appears correct at first glance, but the issue may be in the `addCards()` method in `Deck.model.ts`:

```typescript
addCards(cards: Card[]): void {
  this.cards.unshift(...cards); // Add to bottom of deck
}
```

**Hypothesis:** The issue may be that when cards are "returned" to decks, they're being added in addition to existing cards, rather than being properly managed. The game should track:
1. **Original deck size**: 26 cards each
2. **Active cards**: Cards currently in play
3. **Discard pile**: Cards permanently removed

**Fix Required:** 
- Audit all card flow paths
- Ensure cards are only returned to their original owner
- Add validation to prevent deck sizes exceeding 26

### Issue #63: UI State Synchronization

**Root Cause Investigation:**
The `Game` component has hardcoded signals that don't properly track the reactive game state:

```typescript
// Current (problematic):
protected playerCardCount = signal(26);
protected opponentCardCount = signal(26);

// Should be (reactive):
protected playerCardCount = computed(() => this.gameStateService.playerCardCount());
protected opponentCardCount = computed(() => this.gameStateService.opponentCardCount());
```

**Fix:** Update all UI state to use computed values from `GameStateService`.

### Issue #61: Challenge Commitment Logic

**Root Cause:** The `cancelChallenge()` method exists and is accessible after card draw:

```typescript
// In GameControllerService lines 169-192
cancelChallenge(): void {
  // Return the challenge card to the deck
  if (this.challengeCard()) {
    this.gameStateService.returnCardsToPlayerDeck([this.challengeCard()!]);
  }
  // ... rest of cancel logic
}
```

**Fix:** Remove this method entirely and update UI to not provide cancel option post-draw.

---

## Alert/Confirm Usage (Issue #53)

**Found Instances:**
```typescript
// In settings.ts:
Line 33: if (confirm('Are you sure you want to reset all settings...'))
Line 39: if (confirm('Are you sure you want to reset all game statistics...'))
Line 63: alert('Settings imported successfully!');
Line 65: alert('Failed to import settings. Please check the file format.');
```

**Required Replacements:**
1. `confirm()` → `MatDialog` with confirmation component
2. `alert()` → `MatSnackBar` for notifications

---

## CSS Budget Overages

**Files Exceeding 4kB:**
1. `card.component.scss`: 4.57 kB (+566 bytes)
2. `settings.scss`: 4.66 kB (+662 bytes)  
3. `game.scss`: 4.56 kB (+560 bytes)

**Solution:** Optimize CSS, remove unused styles, or adjust budget limits.

---

## Implementation Priority Matrix

| Issue | Impact | Complexity | Priority |
|-------|--------|------------|----------|
| #64   | High   | Medium     | 1        |
| #63   | High   | Low        | 2        |
| #61   | High   | Low        | 3        |
| #53   | Medium | Low        | 4        |
| #47   | Medium | Low        | 5        |
| #39   | Medium | Low        | 6        |
| #62   | Medium | Medium     | 7        |
| #56   | Low    | High       | 8        |

**Rationale:** Focus on high-impact game logic bugs first, followed by easy UX wins, then performance optimization, and finally complex enhancements.
import { PlayerType } from '../core/models/game-state.model';

/** Compact, reusable table language. Accessibility labels stay literal in templates. */
export function battleTargetInstruction(): string {
  return "Choose the foe's champion. The foe chooses yours.";
}

export function casualtyProgress(index: number, total: number): string {
  return `Casualty ${index} of ${total}`;
}

export function cardsToBoneyard(count: number): string {
  return `${count} ${count === 1 ? 'card' : 'cards'} to the Boneyard.`;
}

export function hiddenCardsReturn(count: number): string {
  return `${count} hidden winner ${count === 1 ? 'card returns' : 'cards return'} face-down.`;
}

export function battleCasualtySummary(loser: PlayerType, count: number): string {
  const side = loser === PlayerType.PLAYER ? 'Your' : "The foe's";
  return `${side} ${count === 1 ? 'card falls' : `${count} cards fall`} to the Boneyard.`;
}

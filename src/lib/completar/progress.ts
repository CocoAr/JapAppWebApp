/**
 * Pure helpers for per-(item, level) progress.
 *
 * Levels go 1 (easiest: multiple choice) → 5 (hardest: no hint). Writing a word
 * from scratch (a harder level) implies you could also clear the easier ones, so
 * an `exact` at level L counts as completing every level ≤ L. Badges therefore
 * cascade downward.
 */

export const MAX_LEVEL = 5;

/** Key used to store a per-(item, level) result. */
export function levelKey(itemId: string, level: number): string {
  return `${itemId}:${level}`;
}

/**
 * True when the item is `exact` at `level` or at any harder level (cascade).
 * `levels` maps `${itemId}:${level}` → best result.
 */
export function isExactAtLevel(
  levels: Record<string, string | undefined>,
  itemId: string,
  level: number
): boolean {
  for (let l = level; l <= MAX_LEVEL; l += 1) {
    if (levels[levelKey(itemId, l)] === "exact") return true;
  }
  return false;
}

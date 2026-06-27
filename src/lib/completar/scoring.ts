import type { AnswerCategory, CompletarItem } from "./types";
import { collapseLongVowels, kanaToReading, levenshtein, readingFromRomaji } from "./romaji";

export interface ScoreResult {
  category: AnswerCategory;
  /** Canonical reading of the user input (for debugging / display). */
  inputReading: string;
}

function acceptedReadings(item: CompletarItem): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const a of item.accepted) {
    const r = kanaToReading(a);
    if (r && !seen.has(r)) {
      seen.add(r);
      out.push(r);
    }
  }
  return out;
}

/**
 * Evaluate a romaji answer against an item.
 *
 * Categories:
 *  - `empty`: nothing meaningful typed
 *  - `exact`: matches an accepted reading
 *  - `near`: long-vowel / single small typo (treated as "casi", positive)
 *  - `wrong`: otherwise
 */
export function evaluateAnswer(input: string, item: CompletarItem): ScoreResult {
  const trimmed = input.trim();
  if (!trimmed) return { category: "empty", inputReading: "" };

  const norm = readingFromRomaji(trimmed);
  if (!norm) return { category: "wrong", inputReading: "" };

  const accepted = acceptedReadings(item);
  if (accepted.includes(norm)) return { category: "exact", inputReading: norm };

  // "Casi": off by exactly one character, or only a long-vowel difference.
  const normCollapsed = collapseLongVowels(norm);
  let best = Infinity;
  for (const r of accepted) {
    if (collapseLongVowels(r) === normCollapsed) {
      return { category: "near", inputReading: norm };
    }
    best = Math.min(best, levenshtein(norm, r));
  }
  if (best === 1) {
    return { category: "near", inputReading: norm };
  }

  return { category: "wrong", inputReading: norm };
}

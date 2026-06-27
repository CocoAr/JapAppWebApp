import type { AnswerCategory, CompletarItem } from "./types";
import {
  collapseLongVowels,
  foldSmallKana,
  kanaToReading,
  levenshtein,
  readingFromRomaji,
} from "./romaji";

/** Why an answer landed in `near` (drives the feedback message). */
export type NearReason = "longVowel" | "general";

export interface ScoreResult {
  category: AnswerCategory;
  /** Present only when category === "near". */
  reason?: NearReason;
  /** Canonical reading of the user input (for debugging / display). */
  inputReading: string;
}

function hasHiragana(s: string): boolean {
  return /[\u3041-\u3096]/.test(s);
}
function hasKatakana(s: string): boolean {
  return /[\u30a1-\u30f6]/.test(s);
}

/** Accepted readings, folded so small vs large kana compare equal. */
function acceptedFoldedReadings(item: CompletarItem): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const a of item.accepted) {
    const r = foldSmallKana(kanaToReading(a));
    if (r && !seen.has(r)) {
      seen.add(r);
      out.push(r);
    }
  }
  return out;
}

/**
 * Evaluate a romaji (or kana) answer against an item.
 *
 * - `exact`: reading matches an accepted form (small vs large kana are equivalent).
 * - `near`: only a long-vowel difference (`reason: "longVowel"`), or one extra/missing
 *    character such as っ, a single typo, or right reading in the wrong syllabary
 *    (`reason: "general"`).
 * - `wrong`: otherwise.
 * - `empty`: nothing typed (the caller should not count it as an attempt).
 */
export function evaluateAnswer(input: string, item: CompletarItem): ScoreResult {
  const trimmed = input.trim();
  if (!trimmed) return { category: "empty", inputReading: "" };

  const norm = foldSmallKana(readingFromRomaji(trimmed));
  if (!norm) return { category: "wrong", inputReading: "" };

  const accepted = acceptedFoldedReadings(item);

  if (accepted.includes(norm)) {
    // Right reading. Keep `exact` unless the user typed the wrong syllabary by hand
    // for a single-script item (and it isn't an explicitly accepted variant).
    const rawMatch = item.accepted.some((a) => a.trim() === trimmed);
    if (!rawMatch) {
      if (item.kanaMode === "hiragana" && hasKatakana(trimmed)) {
        return { category: "near", reason: "general", inputReading: norm };
      }
      if (item.kanaMode === "katakana" && hasHiragana(trimmed)) {
        return { category: "near", reason: "general", inputReading: norm };
      }
    }
    return { category: "exact", inputReading: norm };
  }

  // Long-vowel-only difference → friendly "te faltó ー".
  const normCollapsed = collapseLongVowels(norm);
  let best = Infinity;
  for (const r of accepted) {
    if (collapseLongVowels(r) === normCollapsed) {
      return { category: "near", reason: "longVowel", inputReading: norm };
    }
    best = Math.min(best, levenshtein(norm, r));
  }

  // One extra/missing character (っ, single typo, …).
  if (best === 1) {
    return { category: "near", reason: "general", inputReading: norm };
  }

  return { category: "wrong", inputReading: norm };
}

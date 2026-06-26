import type { CompletarItem } from "./types";

/**
 * Progressive hint ladder. Each level adds more help; options and the full
 * answer only appear late.
 */
export const HINT_LEVELS = {
  none: 0,
  context: 1, // contextual note (usage / category)
  firstKana: 2, // first kana + length
  pattern: 3, // partial masked pattern
  options: 4, // multiple choice of real same-theme words
  answer: 5, // full answer revealed
} as const;

export const MAX_HINT_LEVEL = HINT_LEVELS.answer;

const STRUCTURAL = new Set(["〜", "～", " ", "　"]);

function isStructural(ch: string): boolean {
  return STRUCTURAL.has(ch);
}

/** First kana and number of kana "slots" (excluding 〜 and spaces). */
export function firstKanaInfo(answer: string): { first: string; count: number } {
  const chars = [...answer];
  let first = "";
  let count = 0;
  for (const ch of chars) {
    if (isStructural(ch)) continue;
    if (!first) first = ch;
    count += 1;
  }
  return { first, count };
}

/**
 * Partial masked pattern: reveals roughly the first 40% of kana, masks the rest
 * with ○, and keeps structural marks (〜, spaces) visible.
 */
export function maskedPattern(answer: string): string {
  const chars = [...answer];
  const slots = chars.filter((c) => !isStructural(c)).length;
  const reveal = Math.max(1, Math.min(slots - 1, Math.floor(slots * 0.4)));
  let shown = 0;
  let out = "";
  for (const ch of chars) {
    if (isStructural(ch)) {
      out += ch === " " || ch === "　" ? " " : ch;
      continue;
    }
    if (shown < reveal) {
      out += ch;
      shown += 1;
    } else {
      out += "○";
    }
  }
  return out;
}

/** The contextual hint text shown at level 1 (note preferred, else category hint). */
export function contextHint(item: CompletarItem): string {
  return item.promptNote?.trim() || item.hint?.trim() || "Sin pista adicional.";
}

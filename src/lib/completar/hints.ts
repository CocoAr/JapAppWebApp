/**
 * Level-based hints for Completar Vocabulario.
 *
 * Level 1: multiple choice (handled in the session UI, no text hint here).
 * Level 2: first two kana + letter count (only the count if the word has ≤2 letters).
 * Level 3: first kana + letter count (only the count if the word is a single letter).
 * Level 4: only the letter count.
 * Level 5: no hint at all.
 */

export type CompletarLevel = 1 | 2 | 3 | 4 | 5;

export const LEVELS: { level: CompletarLevel; title: string; desc: string }[] = [
  { level: 1, title: "Nivel 1", desc: "Opción múltiple" },
  { level: 2, title: "Nivel 2", desc: "Dos letras y la cantidad" },
  { level: 3, title: "Nivel 3", desc: "Una letra y la cantidad" },
  { level: 4, title: "Nivel 4", desc: "Solo la cantidad de letras" },
  { level: 5, title: "Nivel 5", desc: "Sin pista" },
];

const STRUCTURAL = new Set(["〜", "～", " ", "　", "。", "、", "？", "！", "?", "!", "．", "，", "."]);

function isStructural(ch: string): boolean {
  return STRUCTURAL.has(ch);
}

/** Number of kana "letters" (excludes 〜, spaces and punctuation). */
export function kanaCount(answer: string): number {
  let c = 0;
  for (const ch of answer) if (!isStructural(ch)) c += 1;
  return c;
}

/** Reveal the first `k` kana, mask the rest with ○, keep structural marks visible. */
export function revealPattern(answer: string, k: number): string {
  let shown = 0;
  let out = "";
  for (const ch of answer) {
    if (isStructural(ch)) {
      out += ch === " " || ch === "　" ? " " : ch;
      continue;
    }
    if (shown < k) {
      out += ch;
      shown += 1;
    } else {
      out += "○";
    }
  }
  return out;
}

export interface LevelHint {
  count: number;
  /** Masked pattern with some kana revealed, or null when only the count is shown. */
  pattern: string | null;
}

/** Hint payload for levels 2–4. Returns null for levels 1 and 5 (no text hint). */
export function levelHint(answer: string, level: CompletarLevel): LevelHint | null {
  if (level === 1 || level === 5) return null;
  const count = kanaCount(answer);
  if (level === 4) return { count, pattern: null };
  if (level === 3) {
    const k = count <= 1 ? 0 : 1;
    return { count, pattern: k > 0 ? revealPattern(answer, k) : null };
  }
  // level === 2
  const k = count <= 2 ? 0 : 2;
  return { count, pattern: k > 0 ? revealPattern(answer, k) : null };
}

export function isValidLevel(n: number): n is CompletarLevel {
  return n === 1 || n === 2 || n === 3 || n === 4 || n === 5;
}

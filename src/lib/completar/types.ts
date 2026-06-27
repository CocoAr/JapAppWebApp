export type KanaMode = "hiragana" | "katakana" | "mixed" | "latin" | "other";

export interface CompletarTheme {
  id: string;
  label: string;
  order: number;
  count: number;
}

export interface CompletarItem {
  id: string;
  themeId: string;
  /** Primary expected answer (as written in the source material). */
  japanese: string;
  /** Spanish meaning shown as the prompt. */
  spanish: string;
  /** All accepted written forms (includes `japanese`). */
  accepted: string[];
  /** Kana-only usage example with the target word wrapped in `**` for bolding. */
  example: string;
  /** Association tip id (section 10), or null when the word has no related family. */
  tipId: string | null;
  /** Short category hint (e.g. "verbo en ます"). */
  hint: string;
  kanaMode: KanaMode;
  tags: string;
}

export interface CompletarTip {
  id: string;
  themeId: string;
  /** The root/association chain, e.g. "かいしゃ → かいしゃいん → しゃいん". */
  text: string;
  /** Spanish gloss for the chain. */
  spanish: string;
  /** Explanation of the association. */
  note: string;
  tags: string;
}

export interface CompletarData {
  themes: CompletarTheme[];
  items: CompletarItem[];
  tips: CompletarTip[];
}

/** Result categories for an answered item. */
export type AnswerCategory = "exact" | "near" | "wrong" | "empty";

/** Persisted per-item status (best result so far). `empty` is never stored. */
export type CompletarStatus = "exact" | "near" | "wrong";

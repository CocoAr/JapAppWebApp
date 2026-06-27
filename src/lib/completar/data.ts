import raw from "../../data/completar.json";
import type { CompletarData, CompletarItem, CompletarTheme, CompletarTip } from "./types";
import { shuffle } from "../shuffle";

function stripTilde(s: string): string {
  return s.replace(/[〜～]/g, "").trim();
}

const data = raw as CompletarData;

const itemsByTheme = new Map<string, CompletarItem[]>();
const itemById = new Map<string, CompletarItem>();
for (const it of data.items) {
  itemById.set(it.id, it);
  const list = itemsByTheme.get(it.themeId) ?? [];
  list.push(it);
  itemsByTheme.set(it.themeId, list);
}

export const SPECIAL_THEME_ALL = "all";

export function getThemes(): CompletarTheme[] {
  return data.themes;
}

export function getTheme(themeId: string): CompletarTheme | undefined {
  return data.themes.find((t) => t.id === themeId);
}

export function getThemeLabel(themeId: string): string {
  if (themeId === SPECIAL_THEME_ALL) return "Todas las temáticas";
  return getTheme(themeId)?.label ?? themeId;
}

export function getItemsForTheme(themeId: string): CompletarItem[] {
  if (themeId === SPECIAL_THEME_ALL) return data.items;
  return itemsByTheme.get(themeId) ?? [];
}

export function getItemById(id: string): CompletarItem | undefined {
  return itemById.get(id);
}

export function getAllItems(): CompletarItem[] {
  return data.items;
}

export function getTips(): CompletarTip[] {
  return data.tips;
}

/** Pick a random session of `size` items from a theme (or all). */
export function pickSession(themeId: string, size: number): CompletarItem[] {
  const pool = getItemsForTheme(themeId);
  return shuffle([...pool]).slice(0, Math.min(size, pool.length));
}

/** Number of fixed "parts" a theme is split into for a given session size. */
export function partCount(themeId: string, size: number): number {
  const n = getItemsForTheme(themeId).length;
  if (n === 0 || size <= 0) return 0;
  return Math.ceil(n / size);
}

/**
 * Deterministic slice of a theme's items (source order) for `part` (1-based).
 * Always the same words for the same (theme, size, part).
 */
export function getPartItems(themeId: string, size: number, part: number): CompletarItem[] {
  const all = getItemsForTheme(themeId);
  const start = (part - 1) * size;
  return all.slice(start, start + size);
}

// --- association tips ("Consejo") -----------------------------------------

let tipMap: Map<string, CompletarTip> | null = null;

function buildTipMap(): Map<string, CompletarTip> {
  const map = new Map<string, CompletarTip>();
  // Tokenize each tip chain (split on arrows, slashes, commas, spaces).
  const tipTokens = data.tips.map((tip) => ({
    tip,
    tokens: new Set(
      tip.text
        .split(/[\s→/,、，]+/)
        .map((t) => stripTilde(t))
        .filter((t) => t.length >= 2)
    ),
  }));
  for (const it of data.items) {
    const needle = stripTilde(it.japanese);
    if (needle.length < 2) continue; // single-char words are too ambiguous
    for (const { tip, tokens } of tipTokens) {
      if (tokens.has(needle)) {
        map.set(it.id, tip);
        break;
      }
    }
  }
  return map;
}

/** A brief association tip for an item, if any. */
export function tipForItem(item: CompletarItem): CompletarTip | undefined {
  if (!tipMap) tipMap = buildTipMap();
  return tipMap.get(item.id);
}

/**
 * Real same-theme words used as multiple-choice distractors (never invented or
 * misspelled). Falls back to the global pool if the theme is too small.
 */
export function distractorsForItem(item: CompletarItem, count: number): CompletarItem[] {
  const sameTheme = getItemsForTheme(item.themeId).filter((w) => w.id !== item.id);
  let pool = shuffle(sameTheme);
  if (pool.length < count) {
    const extra = shuffle(data.items.filter((w) => w.id !== item.id && w.themeId !== item.themeId));
    pool = [...pool, ...extra];
  }
  return pool.slice(0, count);
}

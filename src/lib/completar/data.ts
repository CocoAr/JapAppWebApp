import raw from "../../data/completar.json";
import type { CompletarData, CompletarItem, CompletarTheme, CompletarTip } from "./types";
import { shuffle } from "../shuffle";

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

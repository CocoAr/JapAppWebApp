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

// --- level badges / aggregation -------------------------------------------

export const ALL_LEVELS = [1, 2, 3, 4, 5] as const;

/** A part is "green" at a level when every one of its items is exact at that level. */
export function isPartComplete(
  themeId: string,
  size: number,
  part: number,
  isExact: (itemId: string) => boolean
): boolean {
  const items = getPartItems(themeId, size, part);
  return items.length > 0 && items.every((it) => isExact(it.id));
}

/** Count of items in a part that are exact at the given level. */
export function partExactCount(
  themeId: string,
  size: number,
  part: number,
  isExact: (itemId: string) => boolean
): { exact: number; total: number } {
  const items = getPartItems(themeId, size, part);
  let exact = 0;
  for (const it of items) if (isExact(it.id)) exact += 1;
  return { exact, total: items.length };
}

/**
 * A theme is "green" at a level only when all of its parts are green, i.e. every
 * item in the theme is exact at that level (aggregation of the small parts).
 */
export function isThemeComplete(themeId: string, isExact: (itemId: string) => boolean): boolean {
  const items = getItemsForTheme(themeId);
  return items.length > 0 && items.every((it) => isExact(it.id));
}

/** Count of items in a theme that are exact at the given level. */
export function themeExactCount(
  themeId: string,
  isExact: (itemId: string) => boolean
): { exact: number; total: number } {
  const items = getItemsForTheme(themeId);
  let exact = 0;
  for (const it of items) if (isExact(it.id)) exact += 1;
  return { exact, total: items.length };
}

// --- association tips ("Consejo") -----------------------------------------

const tipById = new Map<string, CompletarTip>();
for (const tip of data.tips) tipById.set(tip.id, tip);

/**
 * The curated association tip for an item, if any. Tips are assigned explicitly
 * at build time (`item.tipId`), so only words that belong to a real root/meaning
 * family (section 10) get a consejo.
 */
export function tipForItem(item: CompletarItem): CompletarTip | undefined {
  return item.tipId ? tipById.get(item.tipId) : undefined;
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

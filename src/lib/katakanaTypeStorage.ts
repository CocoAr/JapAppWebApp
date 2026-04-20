import type { KatakanaTypeSettings } from "./katakanaTypeTypes";

const SETTINGS_PREFIX = "jap_katakana_type_settings_v1_";
const MASTERED_PREFIX = "jap_katakana_type_mastered_v1_";

export const DEFAULT_KATAKANA_TYPE_SETTINGS: KatakanaTypeSettings = {
  volumeEnabled: false,
  showLetterCount: true,
  highlightKeyboardLetters: false,
  unlimitedAttempts: false,
};

function settingsKey(userId: number): string {
  return `${SETTINGS_PREFIX}${userId}`;
}

function masteredKey(userId: number): string {
  return `${MASTERED_PREFIX}${userId}`;
}

export function loadKatakanaTypeSettings(userId: number): KatakanaTypeSettings {
  try {
    const raw = localStorage.getItem(settingsKey(userId));
    if (!raw) return { ...DEFAULT_KATAKANA_TYPE_SETTINGS };
    const p = JSON.parse(raw) as Partial<KatakanaTypeSettings>;
    return {
      volumeEnabled: Boolean(p.volumeEnabled),
      showLetterCount: p.showLetterCount !== false,
      highlightKeyboardLetters: Boolean(p.highlightKeyboardLetters),
      unlimitedAttempts: Boolean(p.unlimitedAttempts),
    };
  } catch {
    return { ...DEFAULT_KATAKANA_TYPE_SETTINGS };
  }
}

export function saveKatakanaTypeSettings(userId: number, s: KatakanaTypeSettings): void {
  localStorage.setItem(settingsKey(userId), JSON.stringify(s));
}

export function loadKatakanaTypeMasteredIds(userId: number): Set<string> {
  try {
    const raw = localStorage.getItem(masteredKey(userId));
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.filter((x) => typeof x === "string"));
  } catch {
    return new Set();
  }
}

export function saveKatakanaTypeMasteredIds(userId: number, ids: Set<string>): void {
  localStorage.setItem(masteredKey(userId), JSON.stringify([...ids]));
}

export function addKatakanaTypeMastered(userId: number, wordId: string): void {
  const s = loadKatakanaTypeMasteredIds(userId);
  s.add(wordId);
  saveKatakanaTypeMasteredIds(userId, s);
}

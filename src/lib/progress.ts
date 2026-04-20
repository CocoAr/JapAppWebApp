import type { ProgressPayload } from "./api";
import {
  getWordById,
  getWordsForPage,
  getWordsForTopic,
  getVocabulary,
  type Script,
  type VocabWord,
} from "../data/vocabulary";

/** True when every word in the vocabulary for `script` has status `known` in the given map. */
export function allVocabularyWordsKnown(
  words: Record<string, "known" | "weak">,
  script: Script
): boolean {
  const v = getVocabulary(script);
  return v.words.every((w) => words[w.id] === "known");
}

export function getWordStatus(wordId: string, progress: ProgressPayload | null): "untried" | "known" | "weak" {
  const s = progress?.words[wordId];
  if (s === "known" || s === "weak") return s;
  return "untried";
}

export function masteryPercentForPage(pageId: string, progress: ProgressPayload | null, script: Script): number {
  const list = getWordsForPage(pageId, script);
  if (list.length === 0) return 0;
  const known = list.filter((w) => getWordStatus(w.id, progress) === "known").length;
  return Math.round((known / list.length) * 100);
}

export function masteryPercentForTopic(topicId: string, progress: ProgressPayload | null, script: Script): number {
  const list = getWordsForTopic(topicId, script);
  if (list.length === 0) return 0;
  const known = list.filter((w) => getWordStatus(w.id, progress) === "known").length;
  return Math.round((known / list.length) * 100);
}

export function weakWords(progress: ProgressPayload | null, script: Script): VocabWord[] {
  if (!progress) return [];
  const out: VocabWord[] = [];
  for (const [wid, st] of Object.entries(progress.words)) {
    if (st !== "weak") continue;
    const w = getWordById(wid, script);
    if (w) out.push(w);
  }
  return out;
}

/** Weak words that belong to a given level (page). */
export function weakWordsForPage(pageId: string, progress: ProgressPayload | null, script: Script): VocabWord[] {
  return getWordsForPage(pageId, script).filter((w) => getWordStatus(w.id, progress) === "weak");
}

/** 0–100: higher when fewer weak words remain in that page (same card scale as Por nivel). */
export function weakPageMasteryPercent(pageId: string, progress: ProgressPayload | null, script: Script): number {
  const list = getWordsForPage(pageId, script);
  if (list.length === 0) return 0;
  const weak = weakWordsForPage(pageId, progress, script).length;
  return Math.round((100 * (list.length - weak)) / list.length);
}

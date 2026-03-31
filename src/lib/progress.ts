import type { ProgressPayload } from "./api";
import { getWordById, getWordsForPage, getWordsForTopic, vocabulary, type VocabWord } from "../data/vocabulary";

/** True when every word in the vocabulary has status `known` in the given map. */
export function allVocabularyWordsKnown(words: Record<string, "known" | "weak">): boolean {
  return vocabulary.words.every((w) => words[w.id] === "known");
}

export function getWordStatus(wordId: string, progress: ProgressPayload | null): "untried" | "known" | "weak" {
  const s = progress?.words[wordId];
  if (s === "known" || s === "weak") return s;
  return "untried";
}

export function masteryPercentForPage(pageId: string, progress: ProgressPayload | null): number {
  const list = getWordsForPage(pageId);
  if (list.length === 0) return 0;
  const known = list.filter((w) => getWordStatus(w.id, progress) === "known").length;
  return Math.round((known / list.length) * 100);
}

export function masteryPercentForTopic(topicId: string, progress: ProgressPayload | null): number {
  const list = getWordsForTopic(topicId);
  if (list.length === 0) return 0;
  const known = list.filter((w) => getWordStatus(w.id, progress) === "known").length;
  return Math.round((known / list.length) * 100);
}

export function weakWords(progress: ProgressPayload | null): VocabWord[] {
  if (!progress) return [];
  const out: VocabWord[] = [];
  for (const [wid, st] of Object.entries(progress.words)) {
    if (st !== "weak") continue;
    const w = getWordById(wid);
    if (w) out.push(w);
  }
  return out;
}

/** Weak words that belong to a given level (page). */
export function weakWordsForPage(pageId: string, progress: ProgressPayload | null): VocabWord[] {
  return getWordsForPage(pageId).filter((w) => getWordStatus(w.id, progress) === "weak");
}

/** 0–100: higher when fewer weak words remain in that page (same card scale as Por nivel). */
export function weakPageMasteryPercent(pageId: string, progress: ProgressPayload | null): number {
  const list = getWordsForPage(pageId);
  if (list.length === 0) return 0;
  const weak = weakWordsForPage(pageId, progress).length;
  return Math.round((100 * (list.length - weak)) / list.length);
}

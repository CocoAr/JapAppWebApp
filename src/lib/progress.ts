import type { ProgressPayload } from "./api";
import { getWordById, getWordsForPage, getWordsForTopic, type VocabWord } from "../data/vocabulary";

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

import raw from "./vocabulary.json";

export type WordStatus = "untried" | "known" | "weak";

export interface VocabPage {
  id: string;
  label: string;
}

export interface VocabTopic {
  id: string;
  label: string;
}

export interface VocabWord {
  id: string;
  hiragana: string;
  spanish: string;
  page: string;
  topics: string[];
}

export interface VocabularyData {
  pages: VocabPage[];
  topics: VocabTopic[];
  words: VocabWord[];
}

export const vocabulary = raw as VocabularyData;

const wordsByPage = new Map<string, VocabWord[]>();
const wordsByTopic = new Map<string, VocabWord[]>();

for (const w of vocabulary.words) {
  const pl = wordsByPage.get(w.page) ?? [];
  pl.push(w);
  wordsByPage.set(w.page, pl);
  for (const tid of w.topics) {
    const tl = wordsByTopic.get(tid) ?? [];
    tl.push(w);
    wordsByTopic.set(tid, tl);
  }
}

export function getWordsForPage(pageId: string): VocabWord[] {
  return wordsByPage.get(pageId) ?? [];
}

export function getWordsForTopic(topicId: string): VocabWord[] {
  return wordsByTopic.get(topicId) ?? [];
}

export function getWordById(id: string): VocabWord | undefined {
  return vocabulary.words.find((w) => w.id === id);
}

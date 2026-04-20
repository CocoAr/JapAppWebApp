import hiraganaRaw from "./vocabulary.json";
import katakanaRaw from "./vocabulary-katakana.json";

export type Script = "hiragana" | "katakana";

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
  spanish: string;
  page: string;
  /** Exactly one topic id per word */
  topics: string[];
  hiragana?: string;
  katakana?: string;
}

export interface VocabularyData {
  pages: VocabPage[];
  topics: VocabTopic[];
  words: VocabWord[];
}

const hiraganaData = hiraganaRaw as VocabularyData;
const katakanaData = katakanaRaw as VocabularyData;

type Built = {
  data: VocabularyData;
  wordsByPage: Map<string, VocabWord[]>;
  wordsByTopic: Map<string, VocabWord[]>;
};

function buildIndexes(data: VocabularyData): Built {
  const wordsByPage = new Map<string, VocabWord[]>();
  const wordsByTopic = new Map<string, VocabWord[]>();
  for (const w of data.words) {
    const pl = wordsByPage.get(w.page) ?? [];
    pl.push(w);
    wordsByPage.set(w.page, pl);
    for (const tid of w.topics) {
      const tl = wordsByTopic.get(tid) ?? [];
      tl.push(w);
      wordsByTopic.set(tid, tl);
    }
  }
  return { data, wordsByPage, wordsByTopic };
}

const built = {
  hiragana: buildIndexes(hiraganaData),
  katakana: buildIndexes(katakanaData),
};

export function getVocabulary(script: Script): VocabularyData {
  return built[script].data;
}

/** Hiragana dataset (backward compat for scripts that default to hiragana). */
export const vocabulary = hiraganaData;

export function getWordsForPage(pageId: string, script: Script): VocabWord[] {
  return built[script].wordsByPage.get(pageId) ?? [];
}

export function getWordsForTopic(topicId: string, script: Script): VocabWord[] {
  return built[script].wordsByTopic.get(topicId) ?? [];
}

export function getWordById(id: string, script: Script): VocabWord | undefined {
  return built[script].data.words.find((w) => w.id === id);
}

/** Japanese surface form for study UI and TTS */
export function wordJapanese(w: VocabWord): string {
  return (w.katakana ?? w.hiragana ?? "").trim();
}

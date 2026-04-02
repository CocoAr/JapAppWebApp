/**
 * Rewrites src/data/vocabulary.json so each word has exactly one topic (new taxonomy).
 * Run: node scripts/apply-vocab-taxonomy.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import {
  TOPICS,
  CATEGORY_HIRAGANA,
  HIRAGANA_TOPIC_OVERRIDES,
} from "./vocab-taxonomy-data.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const vocabPath = join(root, "src/data/vocabulary.json");

/** @type {{ pages: unknown[]; topics: unknown[]; words: { id: string; hiragana: string; spanish: string; page: string; topics: string[] }[] }} */
const data = JSON.parse(readFileSync(vocabPath, "utf8"));

const hiraganaToTopic = new Map();
for (const [topicId, list] of Object.entries(CATEGORY_HIRAGANA)) {
  for (const h of list) {
    if (hiraganaToTopic.has(h)) {
      throw new Error(`Duplicate hiragana "${h}" in taxonomy: ${hiraganaToTopic.get(h)} and ${topicId}`);
    }
    hiraganaToTopic.set(h, topicId);
  }
}

for (const [h, tid] of Object.entries(HIRAGANA_TOPIC_OVERRIDES)) {
  if (hiraganaToTopic.has(h)) {
    throw new Error(`Override "${h}" conflicts with CATEGORY_HIRAGANA`);
  }
  hiraganaToTopic.set(h, tid);
}

const topicIds = new Set(TOPICS.map((t) => t.id));
for (const tid of hiraganaToTopic.values()) {
  if (!topicIds.has(tid)) throw new Error(`Unknown topic id: ${tid}`);
}

data.topics = TOPICS;

for (const w of data.words) {
  const tid = hiraganaToTopic.get(w.hiragana);
  if (!tid) {
    throw new Error(`No topic for word ${w.id} hiragana="${w.hiragana}"`);
  }
  w.topics = [tid];
}

writeFileSync(vocabPath, JSON.stringify(data, null, 2) + "\n", "utf8");
console.log(`Updated ${data.words.length} words in vocabulary.json`);

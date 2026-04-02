/**
 * Validates vocabulary.json: single topic per word, full partition, no orphan topics.
 * Exit 1 on failure. Run from npm run validate:vocab
 */
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { TOPICS, CATEGORY_HIRAGANA, HIRAGANA_TOPIC_OVERRIDES } from "./vocab-taxonomy-data.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const vocabPath = join(root, "src/data/vocabulary.json");

const data = JSON.parse(readFileSync(vocabPath, "utf8"));
const topicIds = new Set(TOPICS.map((t) => t.id));

const expectedHiragana = new Set();
for (const list of Object.values(CATEGORY_HIRAGANA)) {
  for (const h of list) {
    if (expectedHiragana.has(h)) throw new Error(`Duplicate in CATEGORY_HIRAGANA: ${h}`);
    expectedHiragana.add(h);
  }
}
for (const h of Object.keys(HIRAGANA_TOPIC_OVERRIDES)) {
  if (expectedHiragana.has(h)) throw new Error(`Override ${h} duplicates CATEGORY_HIRAGANA`);
  expectedHiragana.add(h);
}

const seenWordIds = new Set();
const seenHiragana = new Set();
const topicWordCounts = Object.fromEntries(TOPICS.map((t) => [t.id, 0]));

for (const w of data.words) {
  if (seenWordIds.has(w.id)) throw new Error(`Duplicate word id: ${w.id}`);
  seenWordIds.add(w.id);
  if (seenHiragana.has(w.hiragana)) throw new Error(`Duplicate hiragana in words: ${w.hiragana}`);
  seenHiragana.add(w.hiragana);

  if (!Array.isArray(w.topics) || w.topics.length !== 1) {
    throw new Error(`${w.id}: must have exactly one topic, got ${JSON.stringify(w.topics)}`);
  }
  const tid = w.topics[0];
  if (!topicIds.has(tid)) throw new Error(`${w.id}: unknown topic ${tid}`);
  topicWordCounts[tid]++;
}

if (data.words.length !== seenHiragana.size) throw new Error("Word count mismatch");

for (const w of data.words) {
  const tid = w.topics[0];
  const expected =
    HIRAGANA_TOPIC_OVERRIDES[w.hiragana] ??
    (() => {
      for (const [catId, list] of Object.entries(CATEGORY_HIRAGANA)) {
        if (list.includes(w.hiragana)) return catId;
      }
      return null;
    })();
  if (expected !== tid) {
    throw new Error(`${w.id}: topic ${tid} does not match taxonomy for "${w.hiragana}" (expected ${expected})`);
  }
}

const vocabHiragana = new Set(data.words.map((w) => w.hiragana));
for (const h of expectedHiragana) {
  if (!vocabHiragana.has(h)) {
    console.warn(`Warning: taxonomy lists hiragana "${h}" but no word in vocabulary.json`);
  }
}

console.log("validate-vocabulary: OK", data.words.length, "words");
console.log("Per topic:", topicWordCounts);

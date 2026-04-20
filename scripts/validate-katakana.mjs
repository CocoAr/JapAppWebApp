/**
 * Validates vocabulary-katakana.json: single topic per word, unique ids, page/topic refs.
 */
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const path = join(root, "src/data/vocabulary-katakana.json");

const data = JSON.parse(readFileSync(path, "utf8"));
const pageIds = new Set(data.pages.map((p) => p.id));
const topicIds = new Set(data.topics.map((t) => t.id));

const seenWordIds = new Set();
const seenKatakana = new Set();

for (const w of data.words) {
  if (seenWordIds.has(w.id)) throw new Error(`Duplicate word id: ${w.id}`);
  seenWordIds.add(w.id);
  if (!w.katakana || typeof w.katakana !== "string") throw new Error(`${w.id}: missing katakana`);
  if (seenKatakana.has(w.katakana)) throw new Error(`Duplicate katakana: ${w.katakana}`);
  seenKatakana.add(w.katakana);

  if (!Array.isArray(w.topics) || w.topics.length !== 1) {
    throw new Error(`${w.id}: must have exactly one topic`);
  }
  if (!topicIds.has(w.topics[0])) throw new Error(`${w.id}: unknown topic ${w.topics[0]}`);
  if (!pageIds.has(w.page)) throw new Error(`${w.id}: unknown page ${w.page}`);
}

console.log("validate-katakana: OK", data.words.length, "words");

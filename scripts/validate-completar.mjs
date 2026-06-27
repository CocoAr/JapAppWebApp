/**
 * Validates src/data/completar.json:
 * - unique item ids and tip ids
 * - every item/tip references a known theme
 * - items have spanish prompt, japanese answer and at least one accepted answer
 * - theme counts match the number of items
 * - kana_mode is one of the allowed values
 */
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const path = join(root, "src/data/completar.json");

const KANA_MODES = new Set(["hiragana", "katakana", "mixed", "latin", "other"]);

const data = JSON.parse(readFileSync(path, "utf8"));

if (!Array.isArray(data.themes) || data.themes.length === 0) {
  throw new Error("completar: no themes");
}
if (!Array.isArray(data.items) || data.items.length === 0) {
  throw new Error("completar: no items");
}

const themeIds = new Set(data.themes.map((t) => t.id));
const tipIds = new Set((data.tips ?? []).map((t) => t.id));
const counts = {};
const seenItemIds = new Set();

for (const it of data.items) {
  if (!it.id) throw new Error("completar: item without id");
  if (seenItemIds.has(it.id)) throw new Error(`completar: duplicate item id ${it.id}`);
  seenItemIds.add(it.id);
  if (!themeIds.has(it.themeId)) throw new Error(`${it.id}: unknown theme ${it.themeId}`);
  if (!it.spanish) throw new Error(`${it.id}: missing spanish prompt`);
  if (!it.japanese) throw new Error(`${it.id}: missing japanese answer`);
  if (!Array.isArray(it.accepted) || it.accepted.length === 0) {
    throw new Error(`${it.id}: missing accepted answers`);
  }
  if (!it.accepted.includes(it.japanese)) {
    throw new Error(`${it.id}: accepted must include the primary japanese answer`);
  }
  if (!it.example) throw new Error(`${it.id}: missing example`);
  if ((it.example.match(/\*\*/g) || []).length !== 2) {
    throw new Error(`${it.id}: example must wrap exactly one segment in **bold**`);
  }
  if (it.tipId != null && !tipIds.has(it.tipId)) {
    throw new Error(`${it.id}: tipId references unknown tip ${it.tipId}`);
  }
  if (!KANA_MODES.has(it.kanaMode)) throw new Error(`${it.id}: invalid kanaMode ${it.kanaMode}`);
  counts[it.themeId] = (counts[it.themeId] ?? 0) + 1;
}

for (const t of data.themes) {
  if (!t.label) throw new Error(`theme ${t.id}: missing label`);
  if ((counts[t.id] ?? 0) !== t.count) {
    throw new Error(`theme ${t.id}: count ${t.count} != actual ${counts[t.id] ?? 0}`);
  }
}

const seenTipIds = new Set();
for (const tip of data.tips ?? []) {
  if (!tip.id) throw new Error("completar: tip without id");
  if (seenTipIds.has(tip.id)) throw new Error(`completar: duplicate tip id ${tip.id}`);
  seenTipIds.add(tip.id);
  if (!tip.text) throw new Error(`${tip.id}: missing tip text`);
}

console.log(
  `validate-completar: OK ${data.items.length} items, ${(data.tips ?? []).length} tips, ${data.themes.length} themes`
);

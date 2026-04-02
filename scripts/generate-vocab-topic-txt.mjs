import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const raw = JSON.parse(readFileSync(join(root, "src/data/vocabulary.json"), "utf8"));

const byTopic = {};
for (const t of raw.topics) byTopic[t.id] = [];
for (const w of raw.words) {
  for (const tid of w.topics) {
    if (!byTopic[tid]) byTopic[tid] = [];
    byTopic[tid].push(w);
  }
}
for (const tid of Object.keys(byTopic)) {
  byTopic[tid].sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
}

const lines = [];
lines.push("Jap Vocab — Palabras por categoría (tema)");
lines.push(
  "Cada entrada: hiragana (traducción al español). Una palabra puede aparecer en más de un tema."
);
lines.push("");
for (const t of raw.topics) {
  const words = byTopic[t.id] || [];
  const parts = words.map((w) => `${w.hiragana} (${w.spanish})`);
  lines.push(`${t.label}: ${parts.join(" ")}`);
  lines.push("");
}

const outDir = join(root, "docs");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "vocabulary-by-topic.txt");
writeFileSync(outPath, lines.join("\r\n"), "utf8");
console.log("Wrote", outPath);

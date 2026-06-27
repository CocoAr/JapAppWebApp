/**
 * Builds src/data/completar.json from completar_vocabulario_source.txt (TSV).
 *
 * The TXT is the single source of truth for the "Completar Vocabulario" mode.
 * Sections 1..8 become ITEM exercises; section 10 becomes TIP content.
 * Sections 9 and 11 are intentionally absent from the source and never included.
 *
 * Run: node scripts/build-completar.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const sourcePath = join(root, "completar_vocabulario_source.txt");
const outPath = join(root, "src/data/completar.json");

/** Human-friendly Spanish labels for each theme id present in the source. */
const THEME_LABELS = {
  personas_familia_roles: "Personas, familia y roles",
  lugares_ubicacion: "Lugares y ubicación",
  transporte_movimiento: "Transporte y movimiento",
  objetos_comida_diario: "Objetos, comida y día a día",
  adjetivos: "Adjetivos",
  verbos_patrones: "Verbos y patrones",
  tiempo_fechas: "Tiempo y fechas",
  preguntas: "Preguntas",
  consejos_raices: "Consejos y asociaciones",
};

/**
 * Disambiguating Spanish prompts (shown in the exercise consigna, not only in the hint).
 *
 * Decision: we override the prompt here in the build pipeline instead of editing the TSV,
 * so the source TXT stays a clean canonical dataset and the visible-prompt policy lives in
 * one reviewable place. Used when two items share/confuse the same Spanish by formality,
 * possession, courtesy, common vs polite use, or own vs other-person's family.
 * Note: courtesy variants kept inside `accepted` (e.g. おくに for くに, おてあらい for トイレ)
 * remain valid answers; only the displayed prompt is clarified.
 */
const SPANISH_OVERRIDES = {
  cv1_005: "quién (normal)",
  cv1_006: "quién (más cortés)",
  cv1_017: "profesor / maestro (de otra persona)",
  cv1_018: "profesor / maestro (mi profesión)",
  cv1_025: "padre (mi familia)",
  cv1_026: "madre (mi familia)",
  cv1_027: "abuelo (mi familia)",
  cv1_028: "abuela (mi familia)",
  cv1_029: "hermano mayor (mi familia)",
  cv1_030: "hermana mayor (mi familia)",
  cv1_031: "hermano menor (mi familia)",
  cv1_032: "hermana menor (mi familia)",
  cv1_033: "esposo (mi familia)",
  cv1_034: "esposa (mi familia)",
  cv1_035: "hijo (mi familia)",
  cv1_036: "hija (mi familia)",
  cv1_037: "padres (mi familia)",
  cv1_038: "hermanos (mi familia)",
  cv1_040: "padre / papá (forma cortés)",
  cv1_041: "madre / mamá (forma cortés)",
  cv1_042: "abuelo (forma cortés)",
  cv1_043: "abuela (forma cortés)",
  cv1_044: "hermano mayor (forma cortés)",
  cv1_045: "hermana mayor (forma cortés)",
  cv1_046: "hermano menor (forma cortés)",
  cv1_047: "hermana menor (forma cortés)",
  cv2_016: "baño (forma común)",
  cv2_045: "país",
  cv5_018: "frío (clima)",
  cv5_019: "frío (al tacto)",
};

const COLUMNS = [
  "type",
  "section",
  "theme_id",
  "item_id",
  "japanese",
  "spanish_prompt",
  "accepted_japanese",
  "prompt_note",
  "hint",
  "kana_mode",
  "tags",
];

const KANA_MODES = new Set(["hiragana", "katakana", "mixed", "latin", "other"]);

function parseRow(line) {
  const cells = line.split("\t");
  const row = {};
  COLUMNS.forEach((col, i) => {
    row[col] = (cells[i] ?? "").trim();
  });
  return row;
}

function splitAccepted(primary, acceptedField) {
  const variants = acceptedField
    ? acceptedField
        .split(";")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
  // Always accept the primary answer; keep order, dedupe.
  const all = [primary, ...variants].map((s) => s.trim()).filter(Boolean);
  return [...new Set(all)];
}

function main() {
  const raw = readFileSync(sourcePath, "utf8");
  const lines = raw.split(/\r?\n/);

  const themesOrder = [];
  const themeSeen = new Set();
  const items = [];
  const tips = [];

  for (const line of lines) {
    if (!line.startsWith("ITEM\t") && !line.startsWith("TIP\t")) continue;
    const row = parseRow(line);

    if (!THEME_LABELS[row.theme_id]) {
      throw new Error(`Unknown theme_id "${row.theme_id}" in line: ${line}`);
    }

    if (row.type === "ITEM") {
      if (!themeSeen.has(row.theme_id)) {
        themeSeen.add(row.theme_id);
        themesOrder.push(row.theme_id);
      }
      const kanaMode = KANA_MODES.has(row.kana_mode) ? row.kana_mode : "other";
      const spanish = SPANISH_OVERRIDES[row.item_id] ?? row.spanish_prompt;
      items.push({
        id: row.item_id,
        themeId: row.theme_id,
        japanese: row.japanese,
        spanish,
        accepted: splitAccepted(row.japanese, row.accepted_japanese),
        promptNote: row.prompt_note,
        hint: row.hint,
        kanaMode,
        tags: row.tags,
      });
    } else if (row.type === "TIP") {
      tips.push({
        id: row.item_id,
        themeId: row.theme_id,
        text: row.japanese,
        spanish: row.spanish_prompt,
        note: row.hint,
        tags: row.tags,
      });
    }
  }

  const itemIds = new Set(items.map((it) => it.id));
  for (const key of Object.keys(SPANISH_OVERRIDES)) {
    if (!itemIds.has(key)) {
      throw new Error(`SPANISH_OVERRIDES references unknown item_id "${key}"`);
    }
  }

  const counts = {};
  for (const it of items) counts[it.themeId] = (counts[it.themeId] ?? 0) + 1;

  const themes = themesOrder.map((id, i) => ({
    id,
    label: THEME_LABELS[id],
    order: i + 1,
    count: counts[id] ?? 0,
  }));

  const data = { themes, items, tips };
  writeFileSync(outPath, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log(
    `build-completar: wrote ${items.length} items, ${tips.length} tips across ${themes.length} themes`
  );
}

main();

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
import { EXAMPLES } from "./completar-examples.mjs";

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
  // formal / informal (cortés vs normal) que no estaban diferenciados
  cv1_003: "aquella persona (normal)",
  cv1_004: "aquella persona (forma cortés)",
  cv2_005: "por aquí / esta persona (forma cortés)",
  cv2_006: "por ahí / ahí (forma cortés)",
  cv2_007: "por allí / allí (forma cortés)",
  cv2_008: "dónde / cuál (forma cortés)",
  cv8_004: "¿Quién es? (normal)",
  cv8_005: "¿Quién es? (forma cortés)",
  cv8_011: "¿Dónde está/es? (normal)",
  cv8_012: "¿Dónde/cuál? (forma cortés)",
  cv8_020: "¿Cuántos años? (normal)",
  cv8_021: "¿Cuántos años? (forma cortés)",
};

/**
 * Association tips (section 10) → the exact item ids each tip groups together.
 * A consejo only shows for words that really belong to one of these root/meaning
 * families; words not listed here get no consejo. When a word fits more than one
 * tip, the lowest-numbered tip wins (see item→tip inversion below).
 */
const TIP_ITEMS = {
  tip10_001: ["cv2_027", "cv1_020", "cv1_021"],
  tip10_002: ["cv2_030", "cv1_022"],
  tip10_003: ["cv1_018", "cv2_009"],
  tip10_004: ["cv2_012"],
  tip10_005: ["cv2_015"],
  tip10_006: ["cv2_032", "cv2_033"],
  tip10_007: ["cv2_025", "cv1_019", "cv2_034"],
  tip10_008: ["cv6_008"],
  tip10_009: ["cv3_003"],
  tip10_010: ["cv1_024"],
  tip10_011: ["cv6_013"],
  tip10_012: ["cv6_016", "cv4_067", "cv4_068"],
  tip10_013: ["cv6_015", "cv4_009", "cv4_012", "cv4_011"],
  tip10_014: ["cv6_010", "cv4_080", "cv4_048"],
  tip10_015: ["cv2_010"],
  tip10_016: ["cv7_031", "cv7_032", "cv7_043", "cv7_058", "cv2_024"],
  tip10_017: ["cv2_004", "cv2_008", "cv4_004", "cv4_008"],
  tip10_018: ["cv4_001", "cv4_002", "cv4_003", "cv4_005", "cv4_006", "cv4_007"],
  tip10_019: ["cv2_001", "cv2_002", "cv2_003", "cv2_005", "cv2_006", "cv2_007"],
  tip10_020: ["cv6_023", "cv6_024", "cv6_025", "cv6_026"],
  tip10_021: ["cv6_007", "cv7_026", "cv5_023"],
  tip10_022: ["cv6_002", "cv6_021"],
};

/** item_id → tip_id (lowest-numbered tip wins on conflicts). */
function buildItemTip() {
  const map = {};
  for (const tipId of Object.keys(TIP_ITEMS).sort()) {
    for (const itemId of TIP_ITEMS[tipId]) {
      if (!(itemId in map)) map[itemId] = tipId;
    }
  }
  return map;
}

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
  const itemTip = buildItemTip();

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
      const example = EXAMPLES[row.item_id];
      if (!example) throw new Error(`Missing example for item ${row.item_id}`);
      items.push({
        id: row.item_id,
        themeId: row.theme_id,
        japanese: row.japanese,
        spanish,
        accepted: splitAccepted(row.japanese, row.accepted_japanese),
        example,
        tipId: itemTip[row.item_id] ?? null,
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
  const tipIds = new Set(tips.map((t) => t.id));
  for (const [tipId, ids] of Object.entries(TIP_ITEMS)) {
    if (!tipIds.has(tipId)) throw new Error(`TIP_ITEMS references unknown tip "${tipId}"`);
    for (const id of ids) {
      if (!itemIds.has(id)) throw new Error(`TIP_ITEMS["${tipId}"] references unknown item "${id}"`);
    }
  }
  for (const key of Object.keys(EXAMPLES)) {
    if (!itemIds.has(key)) throw new Error(`EXAMPLES references unknown item_id "${key}"`);
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

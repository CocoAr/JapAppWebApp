import type { VocabWord } from "../data/vocabulary";
import katakanaData from "../data/vocabulary-katakana.json";

/** Unique codepoints used in katakana vocabulary */
function collectVocabChars(): Set<string> {
  const s = new Set<string>();
  for (const w of katakanaData.words) {
    for (const ch of w.katakana) {
      s.add(ch);
    }
  }
  return s;
}

const VOCAB_CHARS = collectVocabChars();

export type KeyboardSection = {
  id: string;
  label: string;
  rows: string[][];
};

/** Blueprint: logical katakana groups → filtered by vocab */
const SECTION_BLUEPRINT: KeyboardSection[] = [
  {
    id: "vowels",
    label: "ア行",
    rows: [["ア", "イ", "ウ", "エ", "オ"]],
  },
  {
    id: "ka",
    label: "カ行",
    rows: [["カ", "キ", "ク", "ケ", "コ", "ガ", "ギ", "グ", "ゲ", "ゴ"]],
  },
  {
    id: "sa",
    label: "サ行",
    rows: [["サ", "シ", "ス", "セ", "ソ", "ザ", "ジ", "ズ", "ゼ", "ゾ"]],
  },
  {
    id: "ta",
    label: "タ行",
    rows: [["タ", "チ", "ツ", "テ", "ト", "ダ", "ヂ", "ヅ", "デ", "ド"]],
  },
  {
    id: "na",
    label: "ナ行",
    rows: [["ナ", "ニ", "ヌ", "ネ", "ノ"]],
  },
  {
    id: "ha",
    label: "ハ行",
    rows: [["ハ", "ヒ", "フ", "ヘ", "ホ", "バ", "ビ", "ブ", "ベ", "ボ", "パ", "ピ", "プ", "ペ", "ポ"]],
  },
  {
    id: "ma",
    label: "マ行",
    rows: [["マ", "ミ", "ム", "メ", "モ"]],
  },
  {
    id: "ya",
    label: "ヤ行",
    rows: [["ヤ", "ユ", "ヨ"]],
  },
  {
    id: "ra",
    label: "ラ行",
    rows: [["ラ", "リ", "ル", "レ", "ロ"]],
  },
  {
    id: "wa",
    label: "ワ・ン・長音",
    rows: [["ワ", "ン", "ー"]],
  },
  {
    id: "yoon",
    label: "拗音・小書き",
    rows: [["ャ", "ュ", "ョ", "ッ", "ァ", "ィ", "ゥ", "ェ", "ォ"]],
  },
  {
    id: "extras",
    label: "Extras (vocabulario)",
    rows: [["け", "し", "で", "ん", "T"]],
  },
];

function filterSection(s: KeyboardSection): KeyboardSection | null {
  const rows = s.rows
    .map((row) => row.filter((c) => VOCAB_CHARS.has(c)))
    .filter((row) => row.length > 0);
  if (rows.length === 0) return null;
  return { ...s, rows };
}

/** Teclado agrupado por filas lógicas; solo teclas presentes en el dataset */
export function getKatakanaKeyboardSections(): KeyboardSection[] {
  const out: KeyboardSection[] = [];
  for (const s of SECTION_BLUEPRINT) {
    const f = filterSection(s);
    if (f) out.push(f);
  }
  return out;
}

/** @deprecated usar getKatakanaKeyboardSections en UI con secciones */
export function getKatakanaKeyboardRows(): string[][] {
  return getKatakanaKeyboardSections().flatMap((s) => s.rows);
}

/** Caracteres de la respuesta esperada para resaltado */
export function charsInWord(w: VocabWord): Set<string> {
  const text = (w.katakana ?? "").trim();
  return new Set([...text]);
}

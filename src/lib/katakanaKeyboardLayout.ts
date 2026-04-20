import type { VocabWord } from "../data/vocabulary";
import katakanaData from "../data/vocabulary-katakana.json";

/** Unique codepoints used in katakana vocabulary (73 chars incl. T y hiragana mezclados). */
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

/** Visual rows — solo teclas que existen en el vocabulario (más espacio y retroceso aparte). */
const ROW_BLUEPRINT = [
  ["ア", "イ", "ウ", "エ", "オ"],
  ["カ", "キ", "ク", "ケ", "コ", "ガ", "ギ", "グ", "ゲ", "ゴ"],
  ["サ", "シ", "ス", "セ", "ソ", "ザ", "ジ", "ズ", "ゼ", "ゾ"],
  ["タ", "チ", "ツ", "テ", "ト", "ダ", "ヂ", "ヅ", "デ", "ド"],
  ["ナ", "ニ", "ヌ", "ネ", "ノ"],
  ["ハ", "ヒ", "フ", "ヘ", "ホ", "バ", "ビ", "ブ", "ベ", "ボ", "パ", "ピ", "プ", "ペ", "ポ"],
  ["マ", "ミ", "ム", "メ", "モ"],
  ["ャ", "ュ", "ョ", "ッ", "ァ", "ィ", "ゥ", "ェ", "ォ"],
  ["ラ", "リ", "ル", "レ", "ロ"],
  ["ワ", "ン", "ー"],
  ["ヤ", "ユ", "ヨ"],
  ["け", "し", "で", "ん", "T"],
];

export function filterKeyboardRows(allowed: Set<string>): string[][] {
  const rows: string[][] = [];
  for (const row of ROW_BLUEPRINT) {
    const filtered = row.filter((c) => allowed.has(c));
    if (filtered.length) rows.push(filtered);
  }
  return rows;
}

export function getKatakanaKeyboardRows(): string[][] {
  return filterKeyboardRows(VOCAB_CHARS);
}

/** Caracteres de la respuesta esperada para resaltado amarillo */
export function charsInWord(w: VocabWord): Set<string> {
  const text = (w.katakana ?? "").trim();
  return new Set([...text]);
}

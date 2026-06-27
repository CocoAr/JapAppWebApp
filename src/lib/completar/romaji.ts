/**
 * Romaji → kana conversion and reading normalization.
 *
 * Two jobs:
 *  - `romajiToKana(input, target)`: live preview while the user types (cosmetic).
 *  - `toReading(...)`: canonical hiragana "reading" used for scoring. Both the user
 *    input and every accepted answer are folded to this space so that hiragana /
 *    katakana / long-vowel spellings all compare equal.
 *
 * Pure module, no DOM. Safe to unit test.
 */

/** Wapuro-style romaji → hiragana table (longest keys matched first). */
const ROMAJI_TO_HIRAGANA: Record<string, string> = {
  // vowels
  a: "あ", i: "い", u: "う", e: "え", o: "お",
  // k / g
  ka: "か", ki: "き", ku: "く", ke: "け", ko: "こ",
  kya: "きゃ", kyu: "きゅ", kyo: "きょ",
  ga: "が", gi: "ぎ", gu: "ぐ", ge: "げ", go: "ご",
  gya: "ぎゃ", gyu: "ぎゅ", gyo: "ぎょ",
  // s / z
  sa: "さ", shi: "し", si: "し", su: "す", se: "せ", so: "そ",
  sha: "しゃ", shu: "しゅ", sho: "しょ", sya: "しゃ", syu: "しゅ", syo: "しょ", she: "しぇ",
  za: "ざ", ji: "じ", zi: "じ", zu: "ず", ze: "ぜ", zo: "ぞ",
  ja: "じゃ", ju: "じゅ", jo: "じょ", jya: "じゃ", jyu: "じゅ", jyo: "じょ", je: "じぇ",
  // t / d
  ta: "た", chi: "ち", ti: "ち", tsu: "つ", tu: "つ", te: "て", to: "と",
  cha: "ちゃ", chu: "ちゅ", cho: "ちょ", cya: "ちゃ", cyu: "ちゅ", cyo: "ちょ", che: "ちぇ",
  da: "だ", di: "ぢ", du: "づ", de: "で", do: "ど",
  dya: "ぢゃ", dyu: "ぢゅ", dyo: "ぢょ",
  // n
  na: "な", ni: "に", nu: "ぬ", ne: "ね", no: "の",
  nya: "にゃ", nyu: "にゅ", nyo: "にょ",
  // h / b / p / f
  ha: "は", hi: "ひ", fu: "ふ", hu: "ふ", he: "へ", ho: "ほ",
  hya: "ひゃ", hyu: "ひゅ", hyo: "ひょ",
  fa: "ふぁ", fi: "ふぃ", fe: "ふぇ", fo: "ふぉ",
  ba: "ば", bi: "び", bu: "ぶ", be: "べ", bo: "ぼ",
  bya: "びゃ", byu: "びゅ", byo: "びょ",
  pa: "ぱ", pi: "ぴ", pu: "ぷ", pe: "ぺ", po: "ぽ",
  pya: "ぴゃ", pyu: "ぴゅ", pyo: "ぴょ",
  // m
  ma: "ま", mi: "み", mu: "む", me: "め", mo: "も",
  mya: "みゃ", myu: "みゅ", myo: "みょ",
  // y
  ya: "や", yu: "ゆ", yo: "よ",
  // r
  ra: "ら", ri: "り", ru: "る", re: "れ", ro: "ろ",
  rya: "りゃ", ryu: "りゅ", ryo: "りょ",
  // w + を
  wa: "わ", wo: "を", wi: "うぃ", we: "うぇ",
  // v (tolerant: fold to b-row sounds)
  va: "ば", vi: "び", vu: "ぶ", ve: "べ", vo: "ぼ",
  // standalone small vowels (after foreign clusters)
  xa: "ぁ", xi: "ぃ", xu: "ぅ", xe: "ぇ", xo: "ぉ",
};

const VOWELS = new Set(["a", "i", "u", "e", "o"]);

/** Consonants that may double to form っ (small tsu). */
function isDoublableConsonant(c: string): boolean {
  return /[kgsztdhbpmyrwfcj]/.test(c);
}

const HIRA_START = 0x3041;
const HIRA_END = 0x3096;

function hiraganaToKatakana(s: string): string {
  let out = "";
  for (const ch of s) {
    const cp = ch.codePointAt(0)!;
    if (cp >= HIRA_START && cp <= HIRA_END) {
      out += String.fromCodePoint(cp + 0x60);
    } else {
      out += ch;
    }
  }
  return out;
}

/**
 * Convert romaji to hiragana for live preview. Unmappable characters (latin,
 * punctuation) pass through unchanged.
 */
export function romajiToHiragana(input: string): string {
  const s = input.toLowerCase();
  let out = "";
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    const next = s[i + 1] ?? "";

    // ん handling
    if (c === "n") {
      if (next === "n" || next === "'") {
        out += "ん";
        i += 2;
        continue;
      }
      const isSyllableStart = VOWELS.has(next) || next === "y";
      if (!isSyllableStart) {
        out += "ん";
        i += 1;
        continue;
      }
    }

    // small tsu (double consonant)
    if (c !== "n" && isDoublableConsonant(c) && next === c) {
      out += "っ";
      i += 1;
      continue;
    }

    // greedy longest match (3 → 1)
    let matched = false;
    for (let len = 3; len >= 1; len--) {
      const chunk = s.slice(i, i + len);
      if (ROMAJI_TO_HIRAGANA[chunk]) {
        out += ROMAJI_TO_HIRAGANA[chunk];
        i += len;
        matched = true;
        break;
      }
    }
    if (matched) continue;

    // passthrough (latin letters, digits, punctuation, spaces)
    out += c;
    i += 1;
  }
  return out;
}

/** Convert romaji to the requested syllabary for the live preview. */
export function romajiToKana(input: string, target: "hiragana" | "katakana"): string {
  const hira = romajiToHiragana(input.replace(/-/g, "ー"));
  if (target === "katakana") return hiraganaToKatakana(hira.replace(/ー/g, "ー"));
  return hira;
}

const KATA_START = 0x30a1;
const KATA_END = 0x30f6;
const PROLONGED = "ー";

/** Vowel (a/i/u/e/o) carried by a single hiragana mora char, for long-vowel folding. */
const KANA_VOWEL: Record<string, string> = {};
(function buildKanaVowel() {
  const groups: Record<string, string> = {
    a: "ぁあかがさざただなはばぱまやらわゃ",
    i: "ぃいきぎしじちぢにひびぴみり",
    u: "ぅうくぐすずつづぬふぶぷむゆるゅ",
    e: "ぇえけげせぜてでねへべぺめれ",
    o: "ぉおこごそぞとどのほぼぽもよろをょ",
  };
  for (const [v, chars] of Object.entries(groups)) {
    for (const ch of chars) KANA_VOWEL[ch] = v;
  }
})();

const VOWEL_TO_HIRA: Record<string, string> = { a: "あ", i: "い", u: "う", e: "え", o: "お" };

/**
 * Fold any kana string to a canonical hiragana reading:
 *  - katakana → hiragana
 *  - ー → the vowel of the previous mora
 *  - drop 〜 / spaces / Japanese & ASCII punctuation
 *  - latin letters kept but lowercased
 */
export function kanaToReading(input: string): string {
  let out = "";
  let lastHira = "";
  for (const ch of input) {
    const cp = ch.codePointAt(0)!;
    let h = ch;
    if (cp >= KATA_START && cp <= KATA_END) {
      h = String.fromCodePoint(cp - 0x60);
    }
    if (h === PROLONGED) {
      const v = KANA_VOWEL[lastHira];
      if (v) {
        out += VOWEL_TO_HIRA[v];
        lastHira = VOWEL_TO_HIRA[v];
      }
      continue;
    }
    // strip wave dash, spaces, punctuation
    if (h === "〜" || h === "～") continue;
    if (/\s/.test(h)) continue;
    if (/[。、．，！？!?.,;:・「」『』（）()]/.test(h)) continue;
    // latin → lowercase, keep
    if (/[A-Za-z]/.test(h)) {
      out += h.toLowerCase();
      lastHira = "";
      continue;
    }
    out += h;
    if (KANA_VOWEL[h]) lastHira = h;
  }
  return out;
}

/** Canonical reading for a romaji user input. */
export function readingFromRomaji(input: string): string {
  return kanaToReading(romajiToHiragana(input.replace(/-/g, "ー")));
}

/**
 * Expand small kana to their full-size counterpart for tolerant scoring:
 *   ゃゅょ → やゆよ, ぁぃぅぇぉ → あいうえお.
 * Small tsu (っ) is intentionally NOT folded (it stays a real, but "near", difference).
 * Readings are hiragana-only (katakana was already folded by `kanaToReading`), so
 * folding the hiragana smalls also covers their katakana origins.
 */
const SMALL_TO_LARGE: Record<string, string> = {
  ゃ: "や",
  ゅ: "ゆ",
  ょ: "よ",
  ぁ: "あ",
  ぃ: "い",
  ぅ: "う",
  ぇ: "え",
  ぉ: "お",
  ゎ: "わ",
};

export function foldSmallKana(reading: string): string {
  let out = "";
  for (const ch of reading) out += SMALL_TO_LARGE[ch] ?? ch;
  return out;
}

/** Collapse long vowels (double identical vowels) for tolerant comparison. */
export function collapseLongVowels(reading: string): string {
  let out = "";
  let prevVowel = "";
  for (const ch of reading) {
    const v = KANA_VOWEL[ch];
    const isBareVowel = ch === "あ" || ch === "い" || ch === "う" || ch === "え" || ch === "お";
    if (isBareVowel && v === prevVowel) {
      continue; // drop repeated vowel
    }
    out += ch;
    prevVowel = v ?? "";
  }
  return out;
}

/** Levenshtein distance between two short strings. */
export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  let curr = new Array<number>(n + 1);
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

/**
 * Tests for the "Completar Vocabulario" scoring, hints, dataset prompts and badges.
 * Run with: npm run test:completar  (bundled on the fly via scripts/run-tests-completar.mjs)
 */
import { evaluateAnswer } from "../src/lib/completar/scoring";
import { foldSmallKana, romajiToKana, kanaToReading } from "../src/lib/completar/romaji";
import { levelHint, kanaCount } from "../src/lib/completar/hints";
import {
  getItemById,
  getPartItems,
  getItemsForTheme,
  getThemes,
  isPartComplete,
  isThemeComplete,
} from "../src/lib/completar/data";
import type { CompletarItem } from "../src/lib/completar/types";

let passed = 0;
let failed = 0;
function check(name: string, cond: boolean): void {
  if (cond) passed += 1;
  else {
    failed += 1;
    console.error("  FAIL:", name);
  }
}
function eq<T>(name: string, got: T, want: T): void {
  check(`${name} (got ${JSON.stringify(got)}, want ${JSON.stringify(want)})`, got === want);
}

function item(p: Partial<CompletarItem>): CompletarItem {
  return {
    id: "x",
    themeId: "t",
    japanese: "",
    spanish: "",
    accepted: [],
    promptNote: "",
    hint: "",
    kanaMode: "hiragana",
    tags: "",
    ...p,
  } as CompletarItem;
}

// 1. small vs large kana are equivalent for scoring.
eq("fold きゃ == きや", foldSmallKana(kanaToReading("きゃ")), foldSmallKana(kanaToReading("きや")));
eq(
  "きゃ vs typed きや = exact",
  evaluateAnswer("きや", item({ japanese: "きゃ", accepted: ["きゃ"], kanaMode: "hiragana" })).category,
  "exact"
);
eq(
  "しゃ vs sha = exact",
  evaluateAnswer("sha", item({ japanese: "しゃ", accepted: ["しゃ"], kanaMode: "hiragana" })).category,
  "exact"
);
eq(
  "ちょ vs typed ちよ = exact",
  evaluateAnswer("ちよ", item({ japanese: "ちょ", accepted: ["ちょ"], kanaMode: "hiragana" })).category,
  "exact"
);

// 2. small tsu difference → near (general).
{
  const r = evaluateAnswer("gakou", item({ japanese: "がっこう", accepted: ["がっこう"], kanaMode: "hiragana" }));
  eq("がこう vs がっこう = near", r.category, "near");
  eq("がっこう near reason general", r.reason ?? null, "general");
}

// 3. long vowel ー.
{
  const it = item({ japanese: "コーヒー", accepted: ["コーヒー"], kanaMode: "katakana" });
  eq("コーヒー (koohii) = exact", evaluateAnswer("koohii", it).category, "exact");
  eq("コーヒー (ko-hi-) = exact", evaluateAnswer("ko-hi-", it).category, "exact");
  const near = evaluateAnswer("kohi", it);
  eq("コヒ = near", near.category, "near");
  eq("コヒ near reason longVowel", near.reason ?? null, "longVowel");
}
eq("dash makes ー (ko-hi-)", romajiToKana("ko-hi-", "katakana"), "コーヒー");

// 4. right reading, wrong syllabary typed by hand → near.
eq(
  "katakana typed for hiragana item = near",
  evaluateAnswer("ネコ", item({ japanese: "ねこ", accepted: ["ねこ"], kanaMode: "hiragana" })).category,
  "near"
);
eq(
  "hiragana typed for katakana item = near",
  evaluateAnswer("ねこ", item({ japanese: "ネコ", accepted: ["ネコ"], kanaMode: "katakana" })).category,
  "near"
);

// combination word stays exact.
eq(
  "きょうしつ (kyoushitsu) = exact",
  evaluateAnswer(
    "kyoushitsu",
    item({ japanese: "きょうしつ", accepted: ["きょうしつ"], kanaMode: "hiragana" })
  ).category,
  "exact"
);

// 5. empty input.
eq("empty input = empty", evaluateAnswer("   ", item({ japanese: "ねこ", accepted: ["ねこ"] })).category, "empty");

// hints
eq("kanaCount きょうしつ = 5", kanaCount("きょうしつ"), 5);
eq("level 4 hint has no pattern", levelHint("ねこ", 4)?.pattern ?? null, null);
eq("level 5 hint is null", levelHint("ねこ", 5), null);
check("level 2 hint reveals 2", (levelHint("きょうしつ", 2)?.pattern ?? "").startsWith("きょ"));

// 8. formal/informal context visible in the prompt.
eq("cv1_025 prompt", getItemById("cv1_025")?.spanish ?? "", "padre (mi familia)");
eq("cv1_040 prompt", getItemById("cv1_040")?.spanish ?? "", "padre / papá (forma cortés)");
eq("cv1_005 prompt", getItemById("cv1_005")?.spanish ?? "", "quién (normal)");
eq("cv1_006 prompt", getItemById("cv1_006")?.spanish ?? "", "quién (más cortés)");

// 6 & 7. badges per level + aggregation.
{
  const theme = getThemes()[0].id;
  const size = 5;
  const part1 = getPartItems(theme, size, 1);
  check("part1 has items", part1.length > 0);
  const exactL3 = new Set(part1.map((it) => `${it.id}:3`));
  const isExact = (id: string, lvl: number) => exactL3.has(`${id}:${lvl}`);
  check("part green at L3 when all exact", isPartComplete(theme, size, 1, (id) => isExact(id, 3)));
  check("part not green at L2", !isPartComplete(theme, size, 1, (id) => isExact(id, 2)));

  // remove one item → no longer green.
  exactL3.delete(`${part1[0].id}:3`);
  check("part not green if one missing", !isPartComplete(theme, size, 1, (id) => isExact(id, 3)));

  // aggregation: theme green only when every item exact at the level.
  const themeItems = getItemsForTheme(theme);
  const allL1 = new Set(themeItems.map((it) => `${it.id}:1`));
  const isExactA = (id: string, lvl: number) => allL1.has(`${id}:${lvl}`);
  check("theme green at L1 when all exact", isThemeComplete(theme, (id) => isExactA(id, 1)));
  allL1.delete(`${themeItems[0].id}:1`);
  check("theme not green if one part incomplete", !isThemeComplete(theme, (id) => isExactA(id, 1)));
}

console.log(`\ncompletar tests: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);

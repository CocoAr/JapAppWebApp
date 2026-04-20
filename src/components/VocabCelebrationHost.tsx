import { useEffect, useMemo, useState } from "react";
import { apiPostVocabCelebrationSeen, ApiError } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { allVocabularyWordsKnown } from "../lib/progress";
import {
  setCelebrationModalOpen,
  takeAndRunCelebrationAdvance,
} from "../lib/vocabCelebrationBridge";
import { VocabCelebrationModal } from "./VocabCelebrationModal";
import type { Script } from "../data/vocabulary";

export function VocabCelebrationHost() {
  const { progress, mergeCelebrationShown } = useAuth();
  const [saveError, setSaveError] = useState<string | null>(null);

  const { open, activeScript, scriptLabel } = useMemo(() => {
    if (!progress) {
      return { open: false, activeScript: null as Script | null, scriptLabel: "" };
    }
    const hiraganaComplete = allVocabularyWordsKnown(progress.words, "hiragana");
    const katakanaComplete = allVocabularyWordsKnown(progress.words, "katakana");
    const needHiragana = hiraganaComplete && !progress.celebrationShown.hiragana;
    const needKatakana = katakanaComplete && !progress.celebrationShown.katakana;
    if (needHiragana) {
      return { open: true, activeScript: "hiragana" as const, scriptLabel: "Hiragana" };
    }
    if (needKatakana) {
      return { open: true, activeScript: "katakana" as const, scriptLabel: "Katakana" };
    }
    return { open: false, activeScript: null, scriptLabel: "" };
  }, [progress]);

  useEffect(() => {
    setCelebrationModalOpen(open);
    return () => setCelebrationModalOpen(false);
  }, [open]);

  async function onContinue() {
    if (!activeScript) return;
    try {
      await apiPostVocabCelebrationSeen(activeScript);
      mergeCelebrationShown(activeScript);
      setSaveError(null);
      takeAndRunCelebrationAdvance();
    } catch (e) {
      setSaveError(e instanceof ApiError ? e.message : "No se pudo guardar.");
    }
  }

  return (
    <VocabCelebrationModal
      open={open}
      savingError={saveError}
      scriptLabel={scriptLabel}
      onContinue={onContinue}
    />
  );
}

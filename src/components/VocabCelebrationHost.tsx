import { useEffect, useState } from "react";
import { apiPostVocabCelebrationSeen, ApiError } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { allVocabularyWordsKnown } from "../lib/progress";
import {
  setCelebrationModalOpen,
  takeAndRunCelebrationAdvance,
} from "../lib/vocabCelebrationBridge";
import { VocabCelebrationModal } from "./VocabCelebrationModal";

export function VocabCelebrationHost() {
  const { progress, mergeCelebrationShown } = useAuth();
  const [saveError, setSaveError] = useState<string | null>(null);

  const open =
    progress !== null &&
    !progress.celebrationShown &&
    allVocabularyWordsKnown(progress.words);

  useEffect(() => {
    setCelebrationModalOpen(open);
    return () => setCelebrationModalOpen(false);
  }, [open]);

  async function onContinue() {
    try {
      await apiPostVocabCelebrationSeen();
      mergeCelebrationShown();
      setSaveError(null);
      takeAndRunCelebrationAdvance();
    } catch (e) {
      setSaveError(e instanceof ApiError ? e.message : "No se pudo guardar.");
    }
  }

  return <VocabCelebrationModal open={open} savingError={saveError} onContinue={onContinue} />;
}

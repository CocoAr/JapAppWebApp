import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  getVocabulary,
  getWordsForPage,
  getWordsForTopic,
  wordJapanese,
  type Script,
  type VocabWord,
} from "../data/vocabulary";
import { apiCategoryStarted, apiPostSession, apiPostWord, ApiError } from "../lib/api";
import { shuffle } from "../lib/shuffle";
import { useAuth } from "../context/AuthContext";
import {
  clearCelebrationAdvance,
  isCelebrationModalOpen,
  registerPendingCelebrationAdvance,
} from "../lib/vocabCelebrationBridge";
import { allVocabularyWordsKnown, weakWords, weakWordsForPage } from "../lib/progress";
import { useSpeechPreference } from "../context/SpeechPreferenceContext";
import { cancelJapaneseSpeech, speakJapaneseReading } from "../lib/speechJapanese";
import { scriptBase } from "../lib/script";

type StudyPhase = "prompt" | "revealWeak" | "revealKnownSelfCheck";

export function StudySession() {
  const { script: scriptParam } = useParams();
  const script = (scriptParam === "hiragana" || scriptParam === "katakana" ? scriptParam : null) as Script | null;
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode");
  const category = searchParams.get("category");
  const navigate = useNavigate();
  const { progress, mergeWordProgress, mergeCategorySession, mergeCategoryStarted } = useAuth();
  const { autoSpeakJapanese } = useSpeechPreference();

  const vocabulary = script ? getVocabulary(script) : null;
  const base = script ? scriptBase(script) : "/app";

  const [words, setWords] = useState<VocabWord[]>([]);
  const sessionKeyRef = useRef("");
  const listLockedRef = useRef(false);

  useEffect(() => {
    if (!script || !vocabulary) return;
    const sk = `${script}:${mode ?? ""}:${category ?? ""}`;
    if (sessionKeyRef.current !== sk) {
      sessionKeyRef.current = sk;
      listLockedRef.current = false;
      setWords([]);
    }

    if (listLockedRef.current) return;

    if (mode === "page" && category) {
      setWords(shuffle(getWordsForPage(category, script)));
      listLockedRef.current = true;
      return;
    }
    if (mode === "topic" && category) {
      setWords(shuffle(getWordsForTopic(category, script)));
      listLockedRef.current = true;
      return;
    }
    if (mode === "weak" && progress) {
      const w = shuffle(weakWords(progress, script));
      setWords(w.slice(0, Math.min(10, w.length)));
      listLockedRef.current = true;
      return;
    }
    if (mode === "random") {
      const all = vocabulary.words;
      setWords(shuffle([...all]).slice(0, Math.min(15, all.length)));
      listLockedRef.current = true;
      return;
    }
    if (mode === "weakPage" && category && progress) {
      setWords(shuffle(weakWordsForPage(category, progress, script)));
      listLockedRef.current = true;
    }
  }, [mode, category, progress, script, vocabulary]);

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<StudyPhase>("prompt");
  const [knownCount, setKnownCount] = useState(0);
  const [unknownCount, setUnknownCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);
  const lastAutoSpeakKeyRef = useRef<string | null>(null);

  const current = words[index];
  const isLast = words.length > 0 && index >= words.length - 1;

  useEffect(() => {
    setIndex(0);
    setPhase("prompt");
    setKnownCount(0);
    setUnknownCount(0);
    setError(null);
    startedRef.current = false;
  }, [mode, category, script]);

  useEffect(() => {
    return () => clearCelebrationAdvance();
  }, []);

  useEffect(() => {
    return () => cancelJapaneseSpeech();
  }, []);

  useEffect(() => {
    lastAutoSpeakKeyRef.current = null;
  }, [autoSpeakJapanese]);

  const jp = current ? wordJapanese(current) : "";

  useEffect(() => {
    if (!current || phase !== "prompt" || !script) return;
    if (isCelebrationModalOpen()) return;
    if (!autoSpeakJapanese) return;
    const key = `${current.id}:${index}`;
    if (lastAutoSpeakKeyRef.current === key) return;
    lastAutoSpeakKeyRef.current = key;
    speakJapaneseReading(jp);
  }, [current?.id, index, phase, autoSpeakJapanese, jp, script]);

  useEffect(() => {
    if (mode !== "page" && mode !== "topic" && mode !== "weakPage") return;
    if (!category || !script) return;
    if (startedRef.current) return;
    startedRef.current = true;
    const cat = category;
    const apiMode = mode === "weakPage" ? "page" : mode;
    apiCategoryStarted(apiMode, cat)
      .then(() => {
        mergeCategoryStarted(apiMode, cat);
      })
      .catch(() => {
        /* non-fatal */
      });
  }, [mode, category, mergeCategoryStarted, script]);

  const resolveLabel = useCallback(() => {
    if (!vocabulary || !script) return "";
    if (mode === "page" && category) {
      return vocabulary.pages.find((p) => p.id === category)?.label ?? category;
    }
    if (mode === "weakPage" && category) {
      const label = vocabulary.pages.find((p) => p.id === category)?.label ?? category;
      return `${label} — palabras débiles`;
    }
    if (mode === "topic" && category) {
      return vocabulary.topics.find((t) => t.id === category)?.label ?? category;
    }
    if (mode === "random") {
      return "Palabras al azar";
    }
    return "Palabras débiles";
  }, [mode, category, script, vocabulary]);

  const finishSession = useCallback(
    async (k: number, u: number) => {
      const total = k + u;
      const score = total > 0 ? Math.round((k / total) * 100) : 0;
      try {
        if (mode === "page" && category) {
          await apiPostSession("page", category, score);
          mergeCategorySession("page", category, score, true);
        } else if (mode === "weakPage" && category) {
          await apiPostSession("page", category, score);
          mergeCategorySession("page", category, score, true);
        } else if (mode === "topic" && category) {
          await apiPostSession("topic", category, score);
          mergeCategorySession("topic", category, score, true);
        }
      } catch (e) {
        if (e instanceof ApiError) setError(e.message);
        else setError("No se pudo guardar el resultado.");
      }
      navigate(`${base}/summary`, {
        replace: true,
        state: {
          total,
          correct: k,
          incorrect: u,
          score,
          mode,
          categoryId: category,
          categoryLabel: resolveLabel(),
          script,
        },
      });
    },
    [mode, category, navigate, mergeCategorySession, resolveLabel, base, script]
  );

  const advanceToNextOrFinish = useCallback(
    (k: number, u: number) => {
      if (isLast) {
        void finishSession(k, u);
        return;
      }
      setIndex((i) => i + 1);
      setPhase("prompt");
    },
    [isLast, finishSession]
  );

  const goNext = useCallback(() => {
    if (phase !== "revealWeak") return;
    advanceToNextOrFinish(knownCount, unknownCount);
  }, [phase, advanceToNextOrFinish, knownCount, unknownCount]);

  const onKnew = useCallback(() => {
    if (phase !== "prompt" || !current) return;
    setPhase("revealKnownSelfCheck");
  }, [phase, current]);

  const onUnknown = useCallback(async () => {
    if (phase !== "prompt" || !current || !script) return;
    try {
      await apiPostWord(current.id, "weak");
      mergeWordProgress(current.id, "weak");
      setUnknownCount((c) => c + 1);
      setPhase("revealWeak");
      setError(null);
    } catch (e) {
      if (e instanceof ApiError) setError(e.message);
      else setError("Error de red.");
    }
  }, [phase, current, mergeWordProgress, script]);

  const onSelfCorrect = useCallback(async () => {
    if (phase !== "revealKnownSelfCheck" || !current || !progress || !script) return;
    try {
      await apiPostWord(current.id, "known");
      mergeWordProgress(current.id, "known");
      const newK = knownCount + 1;
      setKnownCount(newK);
      setError(null);
      const mergedWords = { ...progress.words, [current.id]: "known" as const };
      const shown = progress.celebrationShown;
      const alreadyDismissed = script === "hiragana" ? shown.hiragana : shown.katakana;
      const shouldCelebrate =
        !alreadyDismissed && allVocabularyWordsKnown(mergedWords, script);
      if (shouldCelebrate) {
        registerPendingCelebrationAdvance({ newK, unknownCount }, advanceToNextOrFinish);
        return;
      }
      advanceToNextOrFinish(newK, unknownCount);
    } catch (e) {
      if (e instanceof ApiError) setError(e.message);
      else setError("Error de red.");
    }
  }, [
    phase,
    current,
    progress,
    mergeWordProgress,
    knownCount,
    unknownCount,
    advanceToNextOrFinish,
    script,
  ]);

  const onSelfWrong = useCallback(async () => {
    if (phase !== "revealKnownSelfCheck" || !current || !script) return;
    try {
      await apiPostWord(current.id, "weak");
      mergeWordProgress(current.id, "weak");
      const newU = unknownCount + 1;
      setUnknownCount(newU);
      setError(null);
      advanceToNextOrFinish(knownCount, newU);
    } catch (e) {
      if (e instanceof ApiError) setError(e.message);
      else setError("Error de red.");
    }
  }, [phase, current, mergeWordProgress, knownCount, unknownCount, advanceToNextOrFinish, script]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (isCelebrationModalOpen()) {
        e.preventDefault();
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        navigate(-1);
        return;
      }
      if (phase === "prompt") {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          onKnew();
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          void onUnknown();
        }
        return;
      }
      if (phase === "revealWeak") {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          goNext();
        }
        return;
      }
      if (phase === "revealKnownSelfCheck") {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          void onSelfCorrect();
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          void onSelfWrong();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, onKnew, onUnknown, goNext, onSelfCorrect, onSelfWrong, navigate]);

  if (!script || !vocabulary) {
    return (
      <div className="card">
        <p>Sesión inválida.</p>
        <button type="button" className="btn btn-primary" onClick={() => navigate("/app")}>
          Volver al inicio
        </button>
      </div>
    );
  }

  const needsCategory = mode === "page" || mode === "topic" || mode === "weakPage";
  if (!mode || (needsCategory && !category)) {
    return (
      <div className="card">
        <p>Sesión inválida.</p>
        <button type="button" className="btn btn-primary" onClick={() => navigate(base)}>
          Volver al menú
        </button>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="card">
        <p>
          {!progress && (mode === "weak" || mode === "weakPage")
            ? "Cargando progreso…"
            : mode === "weakPage"
              ? "No tenés palabras débiles en este nivel."
              : mode === "weak"
                ? "No tenés palabras débiles para practicar."
                : mode === "random"
                  ? "No hay palabras en el vocabulario."
                  : "No hay palabras para esta sesión."}
        </p>
        {mode !== "weak" && mode !== "random" ? (
          <button type="button" className="btn btn-primary" onClick={() => navigate(-1)}>
            Volver
          </button>
        ) : null}
      </div>
    );
  }

  if (!current) return null;

  return (
    <div className="study-wrap">
      <div className="study-header-row">
        <p className="muted session-progress">
          {index + 1} / {words.length}
        </p>
        <button
          type="button"
          className="btn btn-ghost study-speech-replay"
          onClick={() => speakJapaneseReading(jp)}
          title="Repetir pronunciación"
          aria-label="Repetir pronunciación en japonés"
        >
          <svg className="study-speech-replay-icon" viewBox="0 0 24 24" width="22" height="22" aria-hidden>
            <path
              fill="currentColor"
              d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"
            />
          </svg>
        </button>
      </div>
      {error ? <p className="form-error">{error}</p> : null}
      <div className="hiragana-display">{jp}</div>
      {phase === "revealWeak" ? (
        <div className="reveal">
          <p className="spanish-reveal">{current.spanish}</p>
          <button type="button" className="btn btn-primary btn-large" onClick={goNext}>
            {isLast ? "Ver resumen" : "Siguiente"}
          </button>
          <p className="muted hints">→ siguiente · Esc = volver</p>
        </div>
      ) : phase === "revealKnownSelfCheck" ? (
        <div className="reveal">
          <p className="spanish-reveal">{current.spanish}</p>
          <div className="answer-row">
            <button type="button" className="btn btn-known btn-large" onClick={() => void onSelfCorrect()}>
              Estaba en lo correcto
            </button>
            <button type="button" className="btn btn-unknown btn-large" onClick={() => void onSelfWrong()}>
              Me equivoqué
            </button>
          </div>
          <p className="muted hints">← correcto · → me equivoqué · Esc = volver</p>
        </div>
      ) : (
        <div className="answer-row">
          <button type="button" className="btn btn-known btn-large" onClick={onKnew}>
            Lo sabía
          </button>
          <button type="button" className="btn btn-unknown btn-large" onClick={() => void onUnknown()}>
            No lo sabía
          </button>
          <p className="muted hints">← lo sabía · → no lo sabía · Esc = volver</p>
        </div>
      )}
    </div>
  );
}

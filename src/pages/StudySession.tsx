import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { vocabulary, getWordsForPage, getWordsForTopic, type VocabWord } from "../data/vocabulary";
import {
  apiCategoryStarted,
  apiPostSession,
  apiPostWord,
  ApiError,
} from "../lib/api";
import { shuffle } from "../lib/shuffle";
import { useAuth } from "../context/AuthContext";
import { weakWords } from "../lib/progress";

export function StudySession() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode");
  const category = searchParams.get("category");
  const navigate = useNavigate();
  const { progress, mergeWordProgress, mergeCategorySession, mergeCategoryStarted } = useAuth();

  const [words, setWords] = useState<VocabWord[]>([]);
  const sessionKeyRef = useRef("");
  const listLockedRef = useRef(false);

  useEffect(() => {
    const sk = `${mode ?? ""}:${category ?? ""}`;
    if (sessionKeyRef.current !== sk) {
      sessionKeyRef.current = sk;
      listLockedRef.current = false;
      setWords([]);
    }

    if (listLockedRef.current) return;

    if (mode === "page" && category) {
      setWords(shuffle(getWordsForPage(category)));
      listLockedRef.current = true;
      return;
    }
    if (mode === "topic" && category) {
      setWords(shuffle(getWordsForTopic(category)));
      listLockedRef.current = true;
      return;
    }
    if (mode === "weak" && progress) {
      const w = shuffle(weakWords(progress));
      setWords(w.slice(0, Math.min(10, w.length)));
      listLockedRef.current = true;
    }
  }, [mode, category, progress]);

  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [knownCount, setKnownCount] = useState(0);
  const [unknownCount, setUnknownCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    setIndex(0);
    setAnswered(false);
    setKnownCount(0);
    setUnknownCount(0);
    setError(null);
    startedRef.current = false;
  }, [mode, category]);

  const current = words[index];
  const isLast = words.length > 0 && index >= words.length - 1;

  useEffect(() => {
    if (mode !== "page" && mode !== "topic") return;
    if (!category) return;
    if (startedRef.current) return;
    startedRef.current = true;
    const m = mode;
    const cat = category;
    apiCategoryStarted(m, cat)
      .then(() => {
        mergeCategoryStarted(m, cat);
      })
      .catch(() => {
        /* non-fatal */
      });
  }, [mode, category, mergeCategoryStarted]);

  const resolveLabel = useCallback(() => {
    if (mode === "page" && category) {
      return vocabulary.pages.find((p) => p.id === category)?.label ?? category;
    }
    if (mode === "topic" && category) {
      return vocabulary.topics.find((t) => t.id === category)?.label ?? category;
    }
    return "Palabras débiles";
  }, [mode, category]);

  const finishSession = useCallback(
    async (k: number, u: number) => {
      const total = k + u;
      const score = total > 0 ? Math.round((k / total) * 100) : 0;
      try {
        if (mode === "page" && category) {
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
      navigate("/app/summary", {
        replace: true,
        state: {
          total,
          correct: k,
          incorrect: u,
          score,
          mode,
          categoryId: category,
          categoryLabel: resolveLabel(),
        },
      });
    },
    [mode, category, navigate, mergeCategorySession, resolveLabel]
  );

  const goNext = useCallback(() => {
    if (!answered) return;
    if (isLast) {
      void finishSession(knownCount, unknownCount);
      return;
    }
    setIndex((i) => i + 1);
    setAnswered(false);
  }, [answered, isLast, finishSession, knownCount, unknownCount]);

  const onKnew = useCallback(async () => {
    if (answered || !current) return;
    try {
      await apiPostWord(current.id, "known");
      mergeWordProgress(current.id, "known");
      setKnownCount((c) => c + 1);
      setAnswered(true);
      setError(null);
    } catch (e) {
      if (e instanceof ApiError) setError(e.message);
      else setError("Error de red.");
    }
  }, [answered, current, mergeWordProgress]);

  const onUnknown = useCallback(async () => {
    if (answered || !current) return;
    try {
      await apiPostWord(current.id, "weak");
      mergeWordProgress(current.id, "weak");
      setUnknownCount((c) => c + 1);
      setAnswered(true);
      setError(null);
    } catch (e) {
      if (e instanceof ApiError) setError(e.message);
      else setError("Error de red.");
    }
  }, [answered, current, mergeWordProgress]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        navigate(-1);
        return;
      }
      if (!answered) {
        if (e.key === "j" || e.key === "J") {
          e.preventDefault();
          void onKnew();
        }
        if (e.key === "k" || e.key === "K") {
          e.preventDefault();
          void onUnknown();
        }
        return;
      }
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        goNext();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [answered, onKnew, onUnknown, goNext, navigate]);

  if (!mode || (mode !== "weak" && !category)) {
    return (
      <div className="card">
        <p>Sesión inválida.</p>
        <button type="button" className="btn btn-primary" onClick={() => navigate("/app")}>
          Volver al menú
        </button>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="card">
        <p>{mode === "weak" ? "Cargando palabras débiles…" : "No hay palabras para esta sesión."}</p>
        {mode !== "weak" ? (
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
      <p className="muted session-progress">
        {index + 1} / {words.length}
      </p>
      {error ? <p className="form-error">{error}</p> : null}
      <div className="hiragana-display">{current.hiragana}</div>
      {answered ? (
        <div className="reveal">
          <p className="spanish-reveal">{current.spanish}</p>
          <button type="button" className="btn btn-primary btn-large" onClick={goNext}>
            {isLast ? "Ver resumen" : "Siguiente"}
          </button>
          <p className="muted hints">Enter · Espacio · Esc = volver</p>
        </div>
      ) : (
        <div className="answer-row">
          <button type="button" className="btn btn-known btn-large" onClick={() => void onKnew()}>
            Lo sabía
          </button>
          <button type="button" className="btn btn-unknown btn-large" onClick={() => void onUnknown()}>
            No lo sabía
          </button>
          <p className="muted hints">J = sabía · K = no sabía · Esc = volver</p>
        </div>
      )}
    </div>
  );
}

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  distractorsForItem,
  getThemeLabel,
  pickSession,
} from "../../lib/completar/data";
import { romajiToKana } from "../../lib/completar/romaji";
import { evaluateAnswer } from "../../lib/completar/scoring";
import {
  contextHint,
  firstKanaInfo,
  HINT_LEVELS,
  MAX_HINT_LEVEL,
  maskedPattern,
} from "../../lib/completar/hints";
import { shuffle } from "../../lib/shuffle";
import { useCompletarProgress } from "../../context/CompletarProgressContext";
import type { AnswerCategory, CompletarItem } from "../../lib/completar/types";

export interface CompletarLogEntry {
  itemId: string;
  japanese: string;
  spanish: string;
  category: AnswerCategory;
  assisted: boolean;
  recommend: boolean;
}

function previewTarget(item: CompletarItem): "hiragana" | "katakana" {
  return item.kanaMode === "katakana" ? "katakana" : "hiragana";
}

export function CompletarSession() {
  const [searchParams] = useSearchParams();
  const theme = searchParams.get("theme") ?? "all";
  const sizeParam = Number(searchParams.get("size"));
  const size = [5, 10, 15].includes(sizeParam) ? sizeParam : 10;
  const navigate = useNavigate();
  const { recordResult } = useCompletarProgress();

  const sessionKey = `${theme}:${size}`;
  const itemsRef = useRef<{ key: string; items: CompletarItem[] }>({ key: "", items: [] });
  if (itemsRef.current.key !== sessionKey) {
    itemsRef.current = { key: sessionKey, items: pickSession(theme, size) };
  }
  const items = itemsRef.current.items;

  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [hintLevel, setHintLevel] = useState(0);
  const [phase, setPhase] = useState<"input" | "result">("input");
  const [category, setCategory] = useState<AnswerCategory | null>(null);
  const [assisted, setAssisted] = useState(false);
  const [log, setLog] = useState<CompletarLogEntry[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const current = items[index];
  const isLast = items.length > 0 && index >= items.length - 1;
  const target = current ? previewTarget(current) : "hiragana";
  const preview = useMemo(() => (current ? romajiToKana(input, target) : ""), [input, current, target]);

  const options = useMemo(() => {
    if (!current) return [] as CompletarItem[];
    return shuffle([current, ...distractorsForItem(current, 3)]);
  }, [current]);

  useEffect(() => {
    if (phase === "input") inputRef.current?.focus();
  }, [phase, index]);

  const finalize = useCallback(
    (cat: AnswerCategory, wasAssisted: boolean) => {
      if (!current) return;
      setCategory(cat);
      setAssisted(wasAssisted);
      setPhase("result");
      const persist = wasAssisted || cat === "empty" ? "wrong" : cat;
      recordResult(current.id, persist);
      setLog((prev) => [
        ...prev,
        {
          itemId: current.id,
          japanese: current.japanese,
          spanish: current.spanish,
          category: cat,
          assisted: wasAssisted,
          recommend: wasAssisted || cat !== "exact",
        },
      ]);
    },
    [current, recordResult]
  );

  const onCheck = useCallback(() => {
    if (phase !== "input" || !current) return;
    const res = evaluateAnswer(input, current);
    finalize(res.category, false);
  }, [phase, current, input, finalize]);

  const onChooseOption = useCallback(
    (opt: CompletarItem) => {
      if (phase !== "input" || !current) return;
      finalize(opt.id === current.id ? "exact" : "wrong", true);
    },
    [phase, current, finalize]
  );

  const onReveal = useCallback(() => {
    if (phase !== "input" || !current) return;
    finalize("wrong", true);
  }, [phase, current, finalize]);

  const finishSession = useCallback(
    (finalLog: CompletarLogEntry[]) => {
      const exact = finalLog.filter((e) => e.category === "exact" && !e.assisted).length;
      const near = finalLog.filter((e) => e.category === "near" && !e.assisted).length;
      const total = finalLog.length;
      navigate("/app/completar/summary", {
        replace: true,
        state: {
          theme,
          themeLabel: getThemeLabel(theme),
          total,
          exact,
          near,
          entries: finalLog,
        },
      });
    },
    [navigate, theme]
  );

  const onNext = useCallback(() => {
    if (phase !== "result") return;
    if (isLast) {
      finishSession(log);
      return;
    }
    setIndex((i) => i + 1);
    setInput("");
    setHintLevel(0);
    setCategory(null);
    setAssisted(false);
    setPhase("input");
  }, [phase, isLast, finishSession, log]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        navigate("/app/completar");
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        if (phase === "input") onCheck();
        else onNext();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, onCheck, onNext, navigate]);

  if (items.length === 0) {
    return (
      <div className="card">
        <p>No hay palabras para esta temática.</p>
        <button type="button" className="btn btn-primary" onClick={() => navigate("/app/completar")}>
          Volver
        </button>
      </div>
    );
  }
  if (!current) return null;

  const kana = firstKanaInfo(current.japanese);
  const feedback =
    category === "exact" && !assisted
      ? { cls: "ok", text: "¡Perfecto!" }
      : category === "exact" && assisted
        ? { cls: "near", text: "Correcto (con ayuda)" }
        : category === "near"
          ? { cls: "near", text: "¡Casi! Te faltó muy poco." }
          : category === "empty"
            ? { cls: "bad", text: "No escribiste nada." }
            : assisted
              ? { cls: "bad", text: "Respuesta revelada." }
              : { cls: "bad", text: "Todavía no, ¡seguí practicando!" };

  return (
    <div className="completar-session">
      <div className="completar-session-head">
        <span className="muted session-progress">
          {index + 1} / {items.length}
        </span>
        <span className="completar-theme-tag">{getThemeLabel(theme)}</span>
      </div>

      <div className="completar-prompt-card">
        <span className="completar-prompt-label">Escribí en japonés</span>
        <h2 className="completar-prompt-es">{current.spanish}</h2>
      </div>

      {phase === "input" ? (
        <>
          <input
            ref={inputRef}
            className="input completar-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="romaji (ej.: watashi)"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />
          <div className="completar-preview" aria-live="polite">
            {preview || <span className="muted">…</span>}
          </div>

          <div className="completar-actions">
            <button type="button" className="btn btn-primary btn-large" onClick={onCheck}>
              Comprobar
            </button>
            {hintLevel < MAX_HINT_LEVEL ? (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setHintLevel((h) => Math.min(MAX_HINT_LEVEL, h + 1))}
              >
                {hintLevel === 0 ? "Pista" : "Otra pista"}
              </button>
            ) : null}
          </div>

          {hintLevel >= HINT_LEVELS.context ? (
            <div className="completar-hints">
              {hintLevel >= HINT_LEVELS.context ? (
                <p className="completar-hint">
                  <span className="completar-hint-tag">Pista</span> {contextHint(current)}
                </p>
              ) : null}
              {hintLevel >= HINT_LEVELS.firstKana ? (
                <p className="completar-hint">
                  <span className="completar-hint-tag">Empieza</span> con{" "}
                  <strong className="jp">{kana.first}</strong> · {kana.count} caracteres
                </p>
              ) : null}
              {hintLevel >= HINT_LEVELS.pattern ? (
                <p className="completar-hint">
                  <span className="completar-hint-tag">Patrón</span>{" "}
                  <strong className="jp">{maskedPattern(current.japanese)}</strong>
                </p>
              ) : null}
              {hintLevel >= HINT_LEVELS.options ? (
                <div className="completar-options">
                  <span className="completar-hint-tag">Opciones</span>
                  <div className="completar-options-row">
                    {options.map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        className="completar-option jp"
                        onClick={() => onChooseOption(o)}
                      >
                        {o.japanese}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              {hintLevel >= HINT_LEVELS.answer ? (
                <p className="completar-hint">
                  <span className="completar-hint-tag">Respuesta</span>{" "}
                  <strong className="jp completar-answer">{current.japanese}</strong>
                  <button type="button" className="btn btn-ghost completar-reveal-next" onClick={onReveal}>
                    Continuar
                  </button>
                </p>
              ) : null}
            </div>
          ) : (
            <p className="muted hints">Enter = comprobar · Esc = salir</p>
          )}
        </>
      ) : (
        <div className="completar-result">
          <p className={`completar-feedback completar-feedback--${feedback.cls}`}>{feedback.text}</p>
          <div className="completar-answer-block">
            <span className="muted">Respuesta</span>
            <span className="jp completar-answer">{current.japanese}</span>
            {current.accepted.length > 1 ? (
              <span className="muted completar-accepted">
                También válido: {current.accepted.filter((a) => a !== current.japanese).join(" · ")}
              </span>
            ) : null}
            {current.promptNote ? <span className="muted completar-note">{current.promptNote}</span> : null}
          </div>
          <button type="button" className="btn btn-primary btn-large" onClick={onNext}>
            {isLast ? "Ver resumen" : "Siguiente"}
          </button>
          <p className="muted hints">Enter = siguiente</p>
        </div>
      )}
    </div>
  );
}

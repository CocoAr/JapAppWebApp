import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  distractorsForItem,
  getPartItems,
  getThemeLabel,
  partCount,
  tipForItem,
} from "../../lib/completar/data";
import { romajiToKana } from "../../lib/completar/romaji";
import { evaluateAnswer, type NearReason } from "../../lib/completar/scoring";
import { isValidLevel, levelHint, type CompletarLevel } from "../../lib/completar/hints";
import { shuffle } from "../../lib/shuffle";
import { useCompletarProgress } from "../../context/CompletarProgressContext";
import type { AnswerCategory, CompletarItem } from "../../lib/completar/types";

export interface CompletarLogEntry {
  itemId: string;
  japanese: string;
  spanish: string;
  category: AnswerCategory;
  recommend: boolean;
}

const VALID_SIZES = [5, 10, 15];

function previewTarget(item: CompletarItem): "hiragana" | "katakana" {
  return item.kanaMode === "katakana" ? "katakana" : "hiragana";
}

/** Render an example string, bolding the segments wrapped in `**`. */
function renderExample(example: string) {
  return example.split("**").map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
  );
}

export function CompletarSession() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { recordResult } = useCompletarProgress();

  const theme = params.get("theme") ?? "all";
  const sizeRaw = Number(params.get("size"));
  const size = VALID_SIZES.includes(sizeRaw) ? sizeRaw : 10;
  const part = Number(params.get("part")) || 1;
  const levelRaw = Number(params.get("level"));
  const level: CompletarLevel = isValidLevel(levelRaw) ? levelRaw : 5;

  const items = useMemo(() => getPartItems(theme, size, part), [theme, size, part]);

  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<"input" | "result">("input");
  const [category, setCategory] = useState<AnswerCategory | null>(null);
  const [nearReason, setNearReason] = useState<NearReason | null>(null);
  const [emptyNotice, setEmptyNotice] = useState(false);
  const [log, setLog] = useState<CompletarLogEntry[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const current = items[index];
  const isLast = items.length > 0 && index >= items.length - 1;
  const target = current ? previewTarget(current) : "hiragana";
  const preview = useMemo(() => (current ? romajiToKana(input, target) : ""), [input, current, target]);
  const hint = useMemo(
    () => (current && level !== 1 ? levelHint(current.japanese, level) : null),
    [current, level]
  );
  const options = useMemo(() => {
    if (!current || level !== 1) return [] as CompletarItem[];
    return shuffle([current, ...distractorsForItem(current, 3)]);
  }, [current, level]);

  useEffect(() => {
    if (phase === "input" && level !== 1) inputRef.current?.focus();
  }, [phase, index, level]);

  const finalize = useCallback(
    (cat: Exclude<AnswerCategory, "empty">, reason: NearReason | null) => {
      if (!current) return;
      setCategory(cat);
      setNearReason(cat === "near" ? reason : null);
      setEmptyNotice(false);
      setPhase("result");
      recordResult(current.id, level, cat);
      setLog((prev) => [
        ...prev,
        {
          itemId: current.id,
          japanese: current.japanese,
          spanish: current.spanish,
          category: cat,
          recommend: cat !== "exact",
        },
      ]);
    },
    [current, recordResult, level]
  );

  const onCheck = useCallback(() => {
    if (phase !== "input" || !current || level === 1) return;
    const res = evaluateAnswer(input, current);
    if (res.category === "empty") {
      setEmptyNotice(true);
      return;
    }
    finalize(res.category, res.reason ?? null);
  }, [phase, current, input, level, finalize]);

  const onChooseOption = useCallback(
    (opt: CompletarItem) => {
      if (phase !== "input" || !current) return;
      finalize(opt.id === current.id ? "exact" : "wrong", null);
    },
    [phase, current, finalize]
  );

  const finishSession = useCallback(
    (finalLog: CompletarLogEntry[]) => {
      const exact = finalLog.filter((e) => e.category === "exact").length;
      const near = finalLog.filter((e) => e.category === "near").length;
      navigate("/app/completar/summary", {
        replace: true,
        state: {
          theme,
          themeLabel: getThemeLabel(theme),
          size,
          part,
          level,
          total: finalLog.length,
          exact,
          near,
          entries: finalLog,
        },
      });
    },
    [navigate, theme, size, part, level]
  );

  const onNext = useCallback(() => {
    if (phase !== "result") return;
    if (isLast) {
      finishSession(log);
      return;
    }
    setIndex((i) => i + 1);
    setInput("");
    setCategory(null);
    setNearReason(null);
    setEmptyNotice(false);
    setPhase("input");
  }, [phase, isLast, finishSession, log]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        navigate(`/app/completar/levels?theme=${encodeURIComponent(theme)}&size=${size}&part=${part}`);
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        if (phase === "result") onNext();
        else if (level !== 1) onCheck();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, level, onCheck, onNext, navigate, theme, size, part]);

  if (partCount(theme, size) === 0 || items.length === 0) {
    return (
      <div className="card">
        <p>No hay palabras para esta sesión.</p>
        <button type="button" className="btn btn-primary" onClick={() => navigate("/app/completar")}>
          Volver
        </button>
      </div>
    );
  }
  if (!current) return null;

  const feedback =
    category === "exact"
      ? { cls: "ok", text: "Correcto! おめでとう!" }
      : category === "near"
        ? {
            cls: "near",
            text:
              nearReason === "longVowel"
                ? "Casi! Te faltó poner ー. Podés escribirlo con el signo menos (-). がんばれ"
                : "Casi! Estuviste cerca. がんばれ",
          }
        : { cls: "bad", text: "Incorrecto! たいへんですね" };

  const tip = tipForItem(current);

  return (
    <div className="completar-session">
      <div className="completar-session-head">
        <span className="muted session-progress">
          {index + 1} / {items.length}
        </span>
        <span className="completar-theme-tag">
          {getThemeLabel(theme)} · Parte {part} · Nivel {level}
        </span>
      </div>

      <div className="completar-prompt-card">
        <span className="completar-prompt-label">Escribí en japonés</span>
        <h2 className="completar-prompt-es">{current.spanish}</h2>
      </div>

      {phase === "input" ? (
        level === 1 ? (
          <div className="completar-mc">
            <p className="muted completar-mc-label">Elegí la palabra correcta</p>
            <div className="completar-mc-grid">
              {options.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  className="completar-mc-option jp"
                  onClick={() => onChooseOption(o)}
                >
                  {o.japanese}
                </button>
              ))}
            </div>
            <p className="muted hints">Esc = volver</p>
          </div>
        ) : (
          <>
            {hint ? (
              <div className="completar-level-hint">
                {hint.pattern ? <span className="jp completar-level-pattern">{hint.pattern}</span> : null}
                <span className="completar-level-count">{hint.count} caracteres</span>
              </div>
            ) : (
              <div className="completar-level-hint completar-level-hint--empty">Sin pista</div>
            )}

            <input
              ref={inputRef}
              className="input completar-input"
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (emptyNotice) setEmptyNotice(false);
              }}
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
            </div>
            {emptyNotice ? (
              <p className="completar-empty-note" aria-live="polite">
                Escribí una respuesta antes de comprobar.
              </p>
            ) : null}
            <p className="muted hints">Enter = comprobar · Esc = volver</p>
          </>
        )
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
            <span className="completar-example jp">
              <span className="completar-example-label">Ejemplo:</span> {renderExample(current.example)}
            </span>
            {tip ? (
              <span className="completar-consejo">
                <strong>Consejo:</strong> <span className="jp">{tip.text}</span>
                {tip.note ? ` — ${tip.note}` : ""}
              </span>
            ) : null}
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

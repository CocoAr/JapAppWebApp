import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getVocabulary, wordJapanese, type VocabWord } from "../data/vocabulary";
import { KatakanaKeyboard } from "../components/KatakanaKeyboard";
import {
  addKatakanaTypeMastered,
  loadKatakanaTypeMasteredIds,
  loadKatakanaTypeSettings,
} from "../lib/katakanaTypeStorage";
import { charsInWord, getKatakanaKeyboardRows } from "../lib/katakanaKeyboardLayout";
import { playKatakanaTypeError, playKatakanaTypeSuccess } from "../lib/katakanaTypeSounds";
import { speakJapaneseReading } from "../lib/speechJapanese";
import { shuffle } from "../lib/shuffle";
import { scriptBase } from "../lib/script";

const ROUND_SIZE = 10;
const MAX_ATTEMPTS = 3;

type Flash = "none" | "ok" | "err";

export function KatakanaTypeSession() {
  const { script } = useParams();
  const { user } = useAuth();

  const [words, setWords] = useState<VocabWord[]>([]);
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [wrongCount, setWrongCount] = useState(0);
  const [roundFinished, setRoundFinished] = useState(false);
  const [flash, setFlash] = useState<Flash>("none");
  const [emptyPool, setEmptyPool] = useState(false);

  const settings = user ? loadKatakanaTypeSettings(user.id) : null;
  const keyboardRows = useMemo(() => getKatakanaKeyboardRows(), []);

  useEffect(() => {
    if (!user) return;
    const vocab = getVocabulary("katakana");
    const mastered = loadKatakanaTypeMasteredIds(user.id);
    const pool = vocab.words.filter((w) => !mastered.has(w.id));
    const picked = shuffle([...pool]).slice(0, Math.min(ROUND_SIZE, pool.length));
    setWords(picked);
    setIdx(0);
    setInput("");
    setWrongCount(0);
    setRoundFinished(false);
    setEmptyPool(picked.length === 0);
  }, [user]);

  const current = words[idx];
  const answer = (current?.katakana ?? "").trim();
  const jp = current ? wordJapanese(current) : "";

  const highlightSet = useMemo(() => {
    if (!settings?.highlightKeyboardLetters || !current) return undefined;
    return charsInWord(current);
  }, [settings?.highlightKeyboardLetters, current]);

  const triggerFlash = useCallback((f: Flash) => {
    setFlash(f);
    window.setTimeout(() => setFlash("none"), 320);
  }, []);

  const goNextWord = useCallback(() => {
    setInput("");
    setWrongCount(0);
    setIdx((i) => {
      if (i >= words.length - 1) {
        setRoundFinished(true);
        return i;
      }
      return i + 1;
    });
  }, [words.length]);

  const onContinuar = useCallback(() => {
    if (!current || !user || !settings) return;
    const typed = input.trim();
    if (typed === answer) {
      playKatakanaTypeSuccess();
      triggerFlash("ok");
      addKatakanaTypeMastered(user.id, current.id);
      goNextWord();
      return;
    }

    playKatakanaTypeError();
    triggerFlash("err");

    const fails = wrongCount + 1;
    if (!settings.unlimitedAttempts && fails >= MAX_ATTEMPTS) {
      goNextWord();
      return;
    }
    setWrongCount(fails);
    setInput("");
  }, [answer, current, goNextWord, input, settings, triggerFlash, user, wrongCount]);

  if (script !== "katakana") {
    return <Navigate to="/app/hiragana" replace />;
  }

  if (!user || !settings) {
    return null;
  }

  const base = scriptBase("katakana");

  if (emptyPool) {
    return (
      <div className="card">
        <h1 className="page-title">¡Listo!</h1>
        <p className="muted">Ya escribiste correctamente todas las palabras del vocabulario en este modo.</p>
        <Link to={`${base}/type`} className="btn btn-primary">
          Volver al panel
        </Link>
      </div>
    );
  }

  if (roundFinished) {
    return (
      <div className="card">
        <h1 className="page-title">Ronda terminada</h1>
        <p className="muted">Practicaste {words.length} palabra{words.length === 1 ? "" : "s"} en esta sesión.</p>
        <div className="katakana-type-actions">
          <Link to={`${base}/type`} className="btn btn-primary">
            Volver al panel
          </Link>
          <Link to={base} className="btn btn-ghost">
            Menú Katakana
          </Link>
        </div>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="card">
        <p>Cargando…</p>
      </div>
    );
  }

  const slots = [...answer];

  return (
    <div
      className={`katakana-type-session-wrap ${flash === "ok" ? "katakana-type-flash--ok" : ""} ${flash === "err" ? "katakana-type-flash--err" : ""}`}
    >
      <div className="katakana-type-session-head">
        <p className="muted session-progress">
          Palabra {idx + 1} de {words.length}
        </p>
        {settings.volumeEnabled ? (
          <button
            type="button"
            className="btn btn-ghost study-speech-replay"
            onClick={() => speakJapaneseReading(jp)}
            title="Escuchar pronunciación"
          >
            Escuchar
          </button>
        ) : null}
      </div>

      <p className="katakana-type-spanish-prompt">{current.spanish}</p>

      {settings.showLetterCount ? (
        <div className="katakana-type-slots" aria-hidden>
          {slots.map((_, i) => (
            <span key={i} className="katakana-type-slot" />
          ))}
        </div>
      ) : null}

      <div className="katakana-type-input-display" aria-live="polite">
        {input || <span className="katakana-type-input-placeholder">…</span>}
      </div>

      {!settings.unlimitedAttempts ? (
        <p className="muted katakana-type-attempts">
          Intentos incorrectos en esta palabra: {wrongCount} / {MAX_ATTEMPTS}
        </p>
      ) : (
        <p className="muted katakana-type-attempts">Chances ilimitadas</p>
      )}

      <div className="katakana-type-continue-row">
        <button type="button" className="btn btn-primary btn-large" onClick={onContinuar}>
          Continuar
        </button>
      </div>

      <KatakanaKeyboard
        rows={keyboardRows}
        highlightChars={highlightSet}
        onKey={(ch) => setInput((s) => s + ch)}
        onBackspace={() => setInput((s) => s.slice(0, -1))}
      />

      <p className="muted hints katakana-type-hint">
        <Link to={`${base}/type`}>Cambiar opciones</Link>
        {" · "}
        <Link to={base}>Menú</Link>
      </p>
    </div>
  );
}

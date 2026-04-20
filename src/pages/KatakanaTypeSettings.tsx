import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getVocabulary } from "../data/vocabulary";
import {
  DEFAULT_KATAKANA_TYPE_SETTINGS,
  loadKatakanaTypeMasteredIds,
  loadKatakanaTypeSettings,
  saveKatakanaTypeSettings,
} from "../lib/katakanaTypeStorage";
import type { KatakanaTypeSettings } from "../lib/katakanaTypeTypes";
import { scriptBase } from "../lib/script";

function ToggleRow({
  label,
  description,
  on,
  onToggle,
}: {
  label: string;
  description: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="katakana-type-option">
      <div className="katakana-type-option-text">
        <strong>{label}</strong>
        <span className="muted katakana-type-option-desc">{description}</span>
      </div>
      <button
        type="button"
        className={`katakana-type-toggle ${on ? "katakana-type-toggle--on" : "katakana-type-toggle--off"}`}
        onClick={onToggle}
        aria-pressed={on}
      >
        {on ? "Activado" : "Desactivado"}
      </button>
    </div>
  );
}

export function KatakanaTypeSettings() {
  const { script } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [settings, setSettings] = useState<KatakanaTypeSettings>(DEFAULT_KATAKANA_TYPE_SETTINGS);

  useEffect(() => {
    if (!user) return;
    setSettings(loadKatakanaTypeSettings(user.id));
  }, [user]);

  const vocab = getVocabulary("katakana");
  const total = vocab.words.length;

  const masteredCount = user ? loadKatakanaTypeMasteredIds(user.id).size : 0;
  const pct = total > 0 ? Math.round((masteredCount / total) * 100) : 0;

  function patch(p: Partial<KatakanaTypeSettings>) {
    if (!user) return;
    const next = { ...settings, ...p };
    setSettings(next);
    saveKatakanaTypeSettings(user.id, next);
  }

  if (script !== "katakana") {
    return <Navigate to="/app/hiragana" replace />;
  }

  if (!user) {
    return null;
  }

  const base = scriptBase("katakana");

  return (
    <div>
      <h1 className="page-title">Escribe el vocabulario</h1>
      <p className="muted page-lead">
        Configurá la sesión y presioná <strong>Comenzar</strong>. Se practican hasta 10 palabras seguidas que todavía no
        escribiste bien en este modo.
      </p>

      <div className="card katakana-type-settings-card">
        <h2 className="katakana-type-settings-heading">Progreso global</h2>
        <div className="katakana-type-progress-wrap">
          <div className="katakana-type-progress-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
            <div className="katakana-type-progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="katakana-type-progress-label">
            {masteredCount} / {total} palabras ({pct}%)
          </span>
        </div>

        <h2 className="katakana-type-settings-heading">Opciones</h2>
        <div className="katakana-type-options">
          <ToggleRow
            label="Activar volumen"
            description="Muestra un botón para escuchar la palabra en japonés (no se reproduce sola)."
            on={settings.volumeEnabled}
            onToggle={() => patch({ volumeEnabled: !settings.volumeEnabled })}
          />
          <ToggleRow
            label="Mostrar cantidad de letras"
            description="Muestra una ranura por cada letra de la respuesta."
            on={settings.showLetterCount}
            onToggle={() => patch({ showLetterCount: !settings.showLetterCount })}
          />
          <ToggleRow
            label="Marcar letras en teclado"
            description="Resalta en amarillo las teclas que forman la palabra."
            on={settings.highlightKeyboardLetters}
            onToggle={() => patch({ highlightKeyboardLetters: !settings.highlightKeyboardLetters })}
          />
          <ToggleRow
            label="Chances ilimitadas por palabra"
            description="Si está desactivado, después de 3 intentos incorrectos se pasa a la siguiente palabra."
            on={settings.unlimitedAttempts}
            onToggle={() => patch({ unlimitedAttempts: !settings.unlimitedAttempts })}
          />
        </div>

        <div className="katakana-type-actions">
          <button type="button" className="btn btn-primary btn-large" onClick={() => navigate(`${base}/type/session`)}>
            Comenzar
          </button>
          <Link to={base} className="btn btn-ghost">
            Volver al menú Katakana
          </Link>
        </div>
      </div>
    </div>
  );
}

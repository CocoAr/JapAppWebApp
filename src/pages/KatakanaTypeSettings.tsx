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

function ToggleSwitch({
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
    <div className="kt-toggle-row">
      <div className="kt-toggle-copy">
        <span className="kt-toggle-label">{label}</span>
        <span className="muted kt-toggle-desc">{description}</span>
      </div>
      <button
        type="button"
        className={`kt-switch ${on ? "kt-switch--on" : "kt-switch--off"}`}
        onClick={onToggle}
        aria-pressed={on}
        role="switch"
        aria-checked={on}
      >
        <span className="kt-switch-track" aria-hidden>
          <span className="kt-switch-thumb" />
        </span>
        <span className="kt-switch-text">{on ? "Activado" : "Desactivado"}</span>
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
    <div className="kt-stack-page">
      <div className="kt-stack-intro">
        <h1 className="page-title kt-page-title">Escribe el vocabulario</h1>
        <p className="muted kt-page-lead">
          Configurá la sesión y empezá con <strong>Comenzar</strong>. En cada ronda practicás hasta 10 palabras que todavía
          no escribiste bien en este modo.
        </p>
      </div>

      <div className="card kt-panel">
        <section className="kt-panel-section">
          <h2 className="kt-section-title">Progreso global</h2>
          <p className="muted kt-section-sub">Palabras escritas correctamente al menos una vez (este modo)</p>
          <div className="kt-progress-block">
            <div className="kt-progress-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
              <div className="kt-progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="kt-progress-meta">
              <span className="kt-progress-count">
                {masteredCount} <span className="kt-progress-of">/ {total}</span>
              </span>
              <span className="kt-progress-pct">{pct}%</span>
            </div>
          </div>
        </section>

        <section className="kt-panel-section kt-panel-section--options">
          <h2 className="kt-section-title">Opciones</h2>
          <div className="kt-toggle-list">
            <ToggleSwitch
              label="Activar volumen"
              description="Mostrás un botón para escuchar la palabra en japonés (no suena solo al cambiar de palabra)."
              on={settings.volumeEnabled}
              onToggle={() => patch({ volumeEnabled: !settings.volumeEnabled })}
            />
            <ToggleSwitch
              label="Mostrar cantidad de letras"
              description="Una raya por cada carácter de la respuesta esperada."
              on={settings.showLetterCount}
              onToggle={() => patch({ showLetterCount: !settings.showLetterCount })}
            />
            <ToggleSwitch
              label="Marcar letras en teclado"
              description="Resaltá en amarillo las teclas que forman la palabra."
              on={settings.highlightKeyboardLetters}
              onToggle={() => patch({ highlightKeyboardLetters: !settings.highlightKeyboardLetters })}
            />
            <ToggleSwitch
              label="Chances ilimitadas por palabra"
              description="Si está desactivado, a los tres intentos incorrectos pasás a la siguiente palabra."
              on={settings.unlimitedAttempts}
              onToggle={() => patch({ unlimitedAttempts: !settings.unlimitedAttempts })}
            />
          </div>
        </section>

        <footer className="kt-panel-footer">
          <button type="button" className="btn btn-primary btn-large kt-btn-primary" onClick={() => navigate(`${base}/type/session`)}>
            Comenzar
          </button>
          <Link to={base} className="btn btn-ghost kt-btn-secondary">
            Volver al menú Katakana
          </Link>
        </footer>
      </div>
    </div>
  );
}

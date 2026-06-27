import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ALL_LEVELS,
  getAllItems,
  getThemes,
  isThemeComplete,
  SPECIAL_THEME_ALL,
} from "../../lib/completar/data";
import { useCompletarProgress } from "../../context/CompletarProgressContext";
import { cardGrey, masteryBackground } from "../../lib/colors";

const SIZES = [5, 10, 15] as const;
const DEFAULT_SIZE = 10;

export function CompletarSettings() {
  const navigate = useNavigate();
  const { isExactAt } = useCompletarProgress();
  const [size, setSize] = useState<number>(DEFAULT_SIZE);
  const themes = getThemes();

  function start(themeId: string) {
    navigate(`/app/completar/parts?theme=${encodeURIComponent(themeId)}&size=${size}`);
  }

  return (
    <div>
      <h1 className="page-title">Completar Vocabulario</h1>
      <p className="muted page-lead">
        Ves el significado en español y lo escribís en japonés con el teclado normal (romaji). La app
        lo convierte a kana mientras tipeás.
      </p>

      <div className="completar-bar">
        <div className="completar-size">
          <span className="completar-size-label">Palabras por sesión</span>
          <div className="completar-size-options">
            {SIZES.map((s) => (
              <button
                key={s}
                type="button"
                className={`completar-size-btn ${size === s ? "completar-size-btn--on" : ""}`}
                onClick={() => setSize(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <Link to="/app/completar/tips" className="btn btn-ghost completar-tips-link">
          Consejos y asociaciones
        </Link>
      </div>

      <div className="category-grid completar-theme-grid">
        <button type="button" className="completar-theme-card completar-theme-card--all" onClick={() => start(SPECIAL_THEME_ALL)}>
          <span className="completar-theme-title">Todas las temáticas</span>
          <span className="completar-theme-meta">Mezcla de {getAllItems().length} palabras</span>
        </button>

        {themes.map((t) => {
          const greens = ALL_LEVELS.map((lvl) => isThemeComplete(t.id, (id) => isExactAt(id, lvl)));
          const greenCount = greens.filter(Boolean).length;
          const bg = greenCount > 0 ? masteryBackground((greenCount / 5) * 100) : cardGrey;
          return (
            <button
              key={t.id}
              type="button"
              className={`completar-theme-card ${greenCount > 0 ? "" : "completar-theme-card--grey"}`}
              style={{ background: bg }}
              onClick={() => start(t.id)}
            >
              <span className="completar-theme-title">{t.label}</span>
              <span className="completar-theme-meta">
                <span>{t.count} palabras</span>
              </span>
              <span className="completar-badges" aria-label="Niveles completados">
                {ALL_LEVELS.map((lvl, idx) => (
                  <span
                    key={lvl}
                    className={`completar-badge ${greens[idx] ? "completar-badge--on" : ""}`}
                  >
                    {lvl}
                  </span>
                ))}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

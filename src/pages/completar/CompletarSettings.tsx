import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAllItems, getItemsForTheme, getThemes, SPECIAL_THEME_ALL } from "../../lib/completar/data";
import { useCompletarProgress } from "../../context/CompletarProgressContext";
import { cardGrey, masteryBackground } from "../../lib/colors";

const SIZES = [5, 10, 15] as const;
const DEFAULT_SIZE = 10;

function themeMastery(
  itemIds: string[],
  items: Record<string, "exact" | "near" | "wrong">
): { mastery: number; started: boolean } {
  if (itemIds.length === 0) return { mastery: 0, started: false };
  let mastered = 0;
  let started = false;
  for (const id of itemIds) {
    const s = items[id];
    if (s) started = true;
    if (s === "exact") mastered += 1;
  }
  return { mastery: Math.round((mastered / itemIds.length) * 100), started };
}

export function CompletarSettings() {
  const navigate = useNavigate();
  const { items } = useCompletarProgress();
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
          const ids = getItemsForTheme(t.id).map((i) => i.id);
          const { mastery, started } = themeMastery(ids, items);
          const bg = started ? masteryBackground(mastery) : cardGrey;
          return (
            <button
              key={t.id}
              type="button"
              className={`completar-theme-card ${started ? "" : "completar-theme-card--grey"}`}
              style={{ background: bg }}
              onClick={() => start(t.id)}
            >
              <span className="completar-theme-title">{t.label}</span>
              <span className="completar-theme-meta">
                <span>{t.count} palabras</span>
                <span className="completar-theme-pct">{started ? `${mastery}%` : "—"}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

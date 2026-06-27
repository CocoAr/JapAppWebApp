import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { getPartItems, getThemeLabel, partCount } from "../../lib/completar/data";
import { useCompletarProgress } from "../../context/CompletarProgressContext";
import { cardGrey, masteryBackground } from "../../lib/colors";

const VALID_SIZES = [5, 10, 15];

export function CompletarParts() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { items } = useCompletarProgress();

  const theme = params.get("theme") ?? "all";
  const sizeRaw = Number(params.get("size"));
  const size = VALID_SIZES.includes(sizeRaw) ? sizeRaw : 10;

  const total = partCount(theme, size);

  if (total === 0) {
    return (
      <div className="card">
        <p>No hay palabras para esta temática.</p>
        <Link to="/app/completar" className="btn btn-primary">
          Volver
        </Link>
      </div>
    );
  }

  function partMastery(part: number): { mastery: number; started: boolean } {
    const list = getPartItems(theme, size, part);
    if (list.length === 0) return { mastery: 0, started: false };
    let mastered = 0;
    let started = false;
    for (const it of list) {
      const s = items[it.id];
      if (s) started = true;
      if (s === "exact") mastered += 1;
    }
    return { mastery: Math.round((mastered / list.length) * 100), started };
  }

  return (
    <div>
      <h1 className="page-title">{getThemeLabel(theme)}</h1>
      <p className="muted page-lead">
        Elegí una parte. Cada parte tiene siempre las mismas palabras ({size} por parte).
      </p>

      <div className="category-grid completar-theme-grid">
        {Array.from({ length: total }, (_, i) => i + 1).map((part) => {
          const list = getPartItems(theme, size, part);
          const { mastery, started } = partMastery(part);
          const bg = started ? masteryBackground(mastery) : cardGrey;
          return (
            <button
              key={part}
              type="button"
              className={`completar-theme-card ${started ? "" : "completar-theme-card--grey"}`}
              style={{ background: bg }}
              onClick={() =>
                navigate(
                  `/app/completar/levels?theme=${encodeURIComponent(theme)}&size=${size}&part=${part}`
                )
              }
            >
              <span className="completar-theme-title">Parte {part}</span>
              <span className="completar-theme-meta">
                <span>{list.length} palabras</span>
                <span className="completar-theme-pct">{started ? `${mastery}%` : "—"}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="summary-actions">
        <Link to="/app/completar" className="btn btn-ghost">
          Cambiar temática
        </Link>
      </div>
    </div>
  );
}

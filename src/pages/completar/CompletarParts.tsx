import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ALL_LEVELS,
  getPartItems,
  getThemeLabel,
  isPartComplete,
  partCount,
} from "../../lib/completar/data";
import { useCompletarProgress } from "../../context/CompletarProgressContext";
import { cardGrey, masteryBackground } from "../../lib/colors";

const VALID_SIZES = [5, 10, 15];

export function CompletarParts() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { isExactAt } = useCompletarProgress();

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

  return (
    <div>
      <h1 className="page-title">{getThemeLabel(theme)}</h1>
      <p className="muted page-lead">
        Elegí una parte. Cada parte tiene siempre las mismas palabras ({size} por parte). Un badge se
        pone verde cuando completás todas sus palabras de forma exacta en ese nivel.
      </p>

      <div className="category-grid completar-theme-grid">
        {Array.from({ length: total }, (_, i) => i + 1).map((part) => {
          const list = getPartItems(theme, size, part);
          const greens = ALL_LEVELS.map((lvl) =>
            isPartComplete(theme, size, part, (id) => isExactAt(id, lvl))
          );
          const greenCount = greens.filter(Boolean).length;
          const bg = greenCount > 0 ? masteryBackground((greenCount / 5) * 100) : cardGrey;
          return (
            <button
              key={part}
              type="button"
              className={`completar-theme-card ${greenCount > 0 ? "" : "completar-theme-card--grey"}`}
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

      <div className="summary-actions">
        <Link to="/app/completar" className="btn btn-ghost">
          Cambiar temática
        </Link>
      </div>
    </div>
  );
}

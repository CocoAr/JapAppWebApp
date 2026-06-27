import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { getThemeLabel, partCount } from "../../lib/completar/data";
import { LEVELS } from "../../lib/completar/hints";

const VALID_SIZES = [5, 10, 15];

export function CompletarLevels() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const theme = params.get("theme") ?? "all";
  const sizeRaw = Number(params.get("size"));
  const size = VALID_SIZES.includes(sizeRaw) ? sizeRaw : 10;
  const part = Number(params.get("part")) || 1;

  const total = partCount(theme, size);
  if (part < 1 || part > total) {
    return (
      <div className="card">
        <p>Parte inválida.</p>
        <Link to={`/app/completar/parts?theme=${encodeURIComponent(theme)}&size=${size}`} className="btn btn-primary">
          Volver
        </Link>
      </div>
    );
  }

  function start(level: number) {
    navigate(
      `/app/completar/session?theme=${encodeURIComponent(theme)}&size=${size}&part=${part}&level=${level}`
    );
  }

  return (
    <div>
      <h1 className="page-title">
        {getThemeLabel(theme)} · Parte {part}
      </h1>
      <p className="muted page-lead">Elegí la dificultad. A mayor nivel, menos pistas.</p>

      <div className="completar-level-note">
        En los ejercicios de nivel 2 y 3 (donde se muestran algunos de los caracteres de la palabra) hay
        que escribir la palabra completa, no solo los caracteres que faltan.
      </div>

      <div className="completar-level-grid">
        {LEVELS.map((l) => (
          <button key={l.level} type="button" className="completar-level-card" onClick={() => start(l.level)}>
            <span className="completar-level-num">{l.level}</span>
            <span className="completar-level-body">
              <span className="completar-level-title">{l.title}</span>
              <span className="muted completar-level-desc">{l.desc}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="summary-actions">
        <Link to={`/app/completar/parts?theme=${encodeURIComponent(theme)}&size=${size}`} className="btn btn-ghost">
          Cambiar parte
        </Link>
      </div>
    </div>
  );
}

import { Link, useLocation, useNavigate } from "react-router-dom";
import type { CompletarLogEntry } from "./CompletarSession";

type SummaryState = {
  theme: string;
  themeLabel: string;
  total: number;
  exact: number;
  near: number;
  entries: CompletarLogEntry[];
};

export function CompletarSummary() {
  const navigate = useNavigate();
  const location = useLocation();
  const st = location.state as SummaryState | undefined;

  if (!st || typeof st.total !== "number") {
    return (
      <div className="card">
        <p>No hay datos de sesión.</p>
        <Link to="/app/completar" className="btn btn-primary">
          Completar Vocabulario
        </Link>
      </div>
    );
  }

  const { theme, themeLabel, total, exact, near, entries } = st;
  const score = total > 0 ? Math.round(((exact + 0.5 * near) / total) * 100) : 0;
  const recommend = entries.filter((e) => e.recommend);

  return (
    <div className="completar-summary">
      <h1 className="page-title">Resumen — {themeLabel}</h1>

      <ul className="summary-stats">
        <li>
          Palabras: <strong>{total}</strong>
        </li>
        <li>
          Perfectas: <strong className="ok">{exact}</strong>
        </li>
        <li>
          Casi: <strong className="near-text">{near}</strong>
        </li>
        <li>
          Puntaje: <strong>{score}%</strong>
        </li>
      </ul>

      {recommend.length > 0 ? (
        <div className="card completar-handwrite">
          <h2 className="completar-section-title">Conviene escribir a mano</h2>
          <p className="muted">
            Estas palabras te costaron o necesitaste ayuda. Escribirlas a mano un par de veces ayuda a
            fijarlas.
          </p>
          <ul className="completar-handwrite-list">
            {recommend.map((e) => (
              <li key={e.itemId} className="completar-handwrite-item">
                <span className="jp completar-handwrite-jp">{e.japanese}</span>
                <span className="muted">{e.spanish}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="completar-feedback completar-feedback--ok">
          ¡Excelente! No quedaron palabras para reforzar a mano.
        </p>
      )}

      <div className="summary-actions">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() =>
            navigate(`/app/completar/session?theme=${encodeURIComponent(theme)}&size=${total}`, {
              replace: true,
            })
          }
        >
          Repetir temática
        </button>
        <Link to="/app/completar" className="btn btn-ghost">
          Elegir otra
        </Link>
        <Link to="/app/completar/tips" className="btn btn-ghost">
          Consejos
        </Link>
      </div>
    </div>
  );
}

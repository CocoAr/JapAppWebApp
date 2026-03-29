import { Link, useLocation, useNavigate } from "react-router-dom";

type SummaryState = {
  total: number;
  correct: number;
  incorrect: number;
  score: number;
  mode: string | null;
  categoryId: string | null;
  categoryLabel: string;
};

export function SessionSummary() {
  const navigate = useNavigate();
  const location = useLocation();
  const st = location.state as SummaryState | undefined;

  if (!st || typeof st.total !== "number") {
    return (
      <div className="card">
        <p>No hay datos de sesión.</p>
        <Link to="/app" className="btn btn-primary">
          Menú
        </Link>
      </div>
    );
  }

  const { total, correct, incorrect, score, mode, categoryLabel } = st;

  return (
    <div className="summary-card card">
      <h1 className="page-title">Resumen de sesión</h1>
      <p className="muted">{categoryLabel}</p>
      <ul className="summary-stats">
        <li>
          Palabras: <strong>{total}</strong>
        </li>
        <li>
          Correctas: <strong className="ok">{correct}</strong>
        </li>
        <li>
          Incorrectas: <strong className="bad">{incorrect}</strong>
        </li>
        <li>
          Porcentaje de la sesión: <strong>{score}%</strong>
        </li>
      </ul>
      <div className="summary-actions">
        {mode === "page" ? (
          <button type="button" className="btn btn-primary" onClick={() => navigate("/app/train/page")}>
            Otro nivel
          </button>
        ) : null}
        {mode === "topic" ? (
          <button type="button" className="btn btn-primary" onClick={() => navigate("/app/train/topic")}>
            Otro tema
          </button>
        ) : null}
        {mode === "weak" ? (
          <button type="button" className="btn btn-primary" onClick={() => navigate("/app/train/weak")}>
            Palabras débiles
          </button>
        ) : null}
        <Link to="/app" className="btn btn-ghost">
          Menú principal
        </Link>
      </div>
    </div>
  );
}

import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import type { Script } from "../data/vocabulary";
import { scriptBase } from "../lib/script";

type SummaryState = {
  total: number;
  correct: number;
  incorrect: number;
  score: number;
  mode: string | null;
  categoryId: string | null;
  categoryLabel: string;
  script?: Script;
};

export function SessionSummary() {
  const navigate = useNavigate();
  const location = useLocation();
  const { script: scriptParam } = useParams();
  const st = location.state as SummaryState | undefined;

  const scriptFromRoute =
    scriptParam === "hiragana" || scriptParam === "katakana" ? scriptParam : null;
  const script = st?.script ?? scriptFromRoute;

  if (!st || typeof st.total !== "number" || !script) {
    return (
      <div className="card">
        <p>No hay datos de sesión.</p>
        <Link to="/app" className="btn btn-primary">
          Inicio
        </Link>
      </div>
    );
  }

  const { total, correct, incorrect, score, mode, categoryLabel } = st;
  const base = scriptBase(script);

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
          <button type="button" className="btn btn-primary" onClick={() => navigate(`${base}/train/page`)}>
            Otro nivel
          </button>
        ) : null}
        {mode === "weakPage" ? (
          <button type="button" className="btn btn-primary" onClick={() => navigate(`${base}/train/weak-page`)}>
            Otro nivel (débiles)
          </button>
        ) : null}
        {mode === "topic" ? (
          <button type="button" className="btn btn-primary" onClick={() => navigate(`${base}/train/topic`)}>
            Otro tema
          </button>
        ) : null}
        {mode === "weak" ? (
          <button type="button" className="btn btn-primary" onClick={() => navigate(`${base}/train/weak`)}>
            Palabras débiles
          </button>
        ) : null}
        {mode === "random" ? (
          <button type="button" className="btn btn-primary" onClick={() => navigate(`${base}/session?mode=random`)}>
            Otra sesión al azar
          </button>
        ) : null}
        <Link to={base} className="btn btn-ghost">
          Menú ({script === "hiragana" ? "Hiragana" : "Katakana"})
        </Link>
      </div>
    </div>
  );
}

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { weakWords } from "../lib/progress";
import { scriptBase, useScriptParam } from "../lib/script";

export function TrainWeak() {
  const script = useScriptParam();
  const base = scriptBase(script);
  const { progress } = useAuth();
  const navigate = useNavigate();
  const weak = weakWords(progress, script);
  const empty = weak.length === 0;

  return (
    <div>
      <h1 className="page-title">Palabras débiles</h1>
      <p className="muted page-lead">
        Se practican hasta 10 palabras marcadas como débiles, al azar y sin repetir en la misma sesión.
      </p>
      {empty ? (
        <div className="card empty-card">
          <p>No tenés palabras débiles todavía.</p>
          <p className="muted">Cuando marques “No lo sabía” en una palabra, aparecerá acá.</p>
          <Link to={`${base}/train/page`} className="btn btn-primary">
            Ir a practicar por nivel
          </Link>
        </div>
      ) : (
        <div className="card">
          <p>
            Tenés <strong>{weak.length}</strong> palabra{weak.length === 1 ? "" : "s"} débil
            {weak.length === 1 ? "" : "es"}.
          </p>
          <button type="button" className="btn btn-primary" onClick={() => navigate(`${base}/session?mode=weak`)}>
            Empezar sesión
          </button>
        </div>
      )}
    </div>
  );
}

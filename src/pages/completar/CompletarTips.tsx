import { Link } from "react-router-dom";
import { getTips } from "../../lib/completar/data";

export function CompletarTips() {
  const tips = getTips();
  return (
    <div>
      <h1 className="page-title">Consejos y asociaciones</h1>
      <p className="muted page-lead">
        Raíces compartidas y trucos para recordar. No es un ejercicio: leelo con calma.
      </p>

      <div className="completar-tips-grid">
        {tips.map((t) => (
          <div key={t.id} className="card completar-tip-card">
            <p className="jp completar-tip-chain">{t.text}</p>
            {t.spanish ? <p className="completar-tip-es">{t.spanish}</p> : null}
            {t.note ? <p className="muted completar-tip-note">{t.note}</p> : null}
            {t.tags ? <span className="completar-tip-tag">{t.tags}</span> : null}
          </div>
        ))}
      </div>

      <div className="summary-actions">
        <Link to="/app/completar" className="btn btn-primary">
          Volver a Completar
        </Link>
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";
import { SpeechAutoToggle } from "../components/SpeechAutoToggle";
import { useScriptParam } from "../lib/script";

export function TrainingMenu() {
  const script = useScriptParam();
  const base = `/app/${script}`;
  const label = script === "hiragana" ? "Hiragana" : "Katakana";

  return (
    <div>
      <div className="menu-page-head">
        <h1 className="page-title menu-page-title">Menú principal — {label}</h1>
        <SpeechAutoToggle />
      </div>
      <p className="muted page-lead">Elegí cómo querés practicar.</p>
      <div className="menu-grid">
        <Link to={`${base}/train/page`} className="menu-tile">
          <span className="menu-tile-title">Por nivel</span>
          <span className="muted">Palabras por página del material</span>
        </Link>
        <Link to={`${base}/train/topic`} className="menu-tile">
          <span className="menu-tile-title">Por tema</span>
          <span className="muted">Agrupadas por tema</span>
        </Link>
        <Link to={`${base}/session?mode=random`} className="menu-tile">
          <span className="menu-tile-title">Palabras al azar</span>
          <span className="muted">15 palabras únicas de todo el vocabulario</span>
        </Link>
        <Link to={`${base}/train/weak`} className="menu-tile">
          <span className="menu-tile-title">Palabras débiles</span>
          <span className="muted">Hasta 10 palabras marcadas como &quot;No lo sabía&quot;</span>
        </Link>
        <Link to={`${base}/train/weak-page`} className="menu-tile">
          <span className="menu-tile-title">Palabras débiles por nivel</span>
          <span className="muted">Solo las que no sabés, por cada nivel</span>
        </Link>
      </div>
    </div>
  );
}

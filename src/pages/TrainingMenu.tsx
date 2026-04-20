import { Link } from "react-router-dom";
import { SpeechAutoToggle } from "../components/SpeechAutoToggle";
import { useScriptParam } from "../lib/script";

export function TrainingMenu() {
  const script = useScriptParam();
  const base = `/app/${script}`;
  const label = script === "hiragana" ? "Hiragana" : "Katakana";

  const legacyGrid = (
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
  );

  return (
    <div>
      <div className="menu-page-head">
        <h1 className="page-title menu-page-title">Menú principal — {label}</h1>
        <SpeechAutoToggle />
      </div>
      <p className="muted page-lead">Elegí cómo querés practicar.</p>

      {script === "katakana" ? (
        <div className="katakana-menu-split">
          <div className="katakana-menu-write-col">
            <Link to={`${base}/type`} className="katakana-menu-write-tile">
              <span className="katakana-menu-write-title">Escribe el vocabulario</span>
              <span className="muted katakana-menu-write-desc">
                Español → katakana con teclado en pantalla. Configuración y progreso propios.
              </span>
            </Link>
          </div>
          <div className="katakana-menu-legacy-col">
            <h2 className="katakana-menu-section-title">Ejercicios viejos</h2>
            <p className="muted katakana-menu-section-lead">Mismos ejercicios que hiragana</p>
            {legacyGrid}
          </div>
        </div>
      ) : (
        legacyGrid
      )}
    </div>
  );
}

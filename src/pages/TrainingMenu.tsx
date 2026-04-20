import { Link } from "react-router-dom";
import { SpeechAutoToggle } from "../components/SpeechAutoToggle";
import { useScriptParam } from "../lib/script";

export function TrainingMenu() {
  const script = useScriptParam();
  const base = `/app/${script}`;
  const label = script === "hiragana" ? "Hiragana" : "Katakana";

  const legacyGrid = (
    <div className={`menu-grid ${script === "katakana" ? "menu-grid--katakana-legacy" : ""}`}>
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
    <div className={script === "katakana" ? "katakana-training-root" : undefined}>
      <header className={`training-menu-header ${script === "katakana" ? "training-menu-header--katakana" : ""}`}>
        <div className="training-menu-title-block">
          <h1 className="page-title training-menu-h1">Menú principal — {label}</h1>
          <p className="muted page-lead training-menu-lead">Elegí cómo querés practicar.</p>
        </div>
        <SpeechAutoToggle compact={script === "katakana"} />
      </header>

      {script === "katakana" ? (
        <div className="katakana-landing">
          <Link to={`${base}/type`} className="katakana-hero-card">
            <span className="katakana-hero-kicker">Nuevo</span>
            <span className="katakana-hero-title">Escribe el vocabulario</span>
            <span className="katakana-hero-desc">
              Español → katakana con teclado en pantalla. Progreso y opciones propias de este modo.
            </span>
            <span className="katakana-hero-cta">Abrir configuración →</span>
          </Link>

          <section className="katakana-legacy-panel" aria-labelledby="katakana-legacy-heading">
            <div className="katakana-legacy-panel-head">
              <h2 id="katakana-legacy-heading" className="katakana-legacy-title">
                Ejercicios viejos
              </h2>
              <p className="muted katakana-legacy-sub">Mismos ejercicios que hiragana</p>
            </div>
            {legacyGrid}
          </section>
        </div>
      ) : (
        legacyGrid
      )}
    </div>
  );
}

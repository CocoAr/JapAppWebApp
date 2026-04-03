import { Link } from "react-router-dom";
import { SpeechAutoToggle } from "../components/SpeechAutoToggle";

export function Menu() {
  return (
    <div>
      <div className="menu-page-head">
        <h1 className="page-title menu-page-title">Menú principal</h1>
        <SpeechAutoToggle />
      </div>
      <p className="muted page-lead">Elegí cómo querés practicar.</p>
      <div className="menu-grid">
        <Link to="/app/train/page" className="menu-tile">
          <span className="menu-tile-title">Por nivel</span>
          <span className="muted">Palabras por página del material</span>
        </Link>
        <Link to="/app/train/topic" className="menu-tile">
          <span className="menu-tile-title">Por tema</span>
          <span className="muted">Agrupadas por tema</span>
        </Link>
        <Link to="/app/session?mode=random" className="menu-tile">
          <span className="menu-tile-title">Palabras al azar</span>
          <span className="muted">15 palabras únicas de todo el vocabulario</span>
        </Link>
        <Link to="/app/train/weak" className="menu-tile">
          <span className="menu-tile-title">Palabras débiles</span>
          <span className="muted">Hasta 10 palabras marcadas como "No lo sabía"</span>
        </Link>
        <Link to="/app/train/weak-page" className="menu-tile">
          <span className="menu-tile-title">Palabras débiles por nivel</span>
          <span className="muted">Solo las que no sabés, por cada nivel</span>
        </Link>
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";
import { useSpeechPreference } from "../context/SpeechPreferenceContext";

export function Menu() {
  const { autoSpeakJapanese, toggleAutoSpeakJapanese } = useSpeechPreference();

  return (
    <div>
      <h1 className="page-title">Menú principal</h1>
      <p className="muted page-lead">Elegí cómo querés practicar.</p>
      <div className="card speech-pref-card">
        <div className="speech-pref-row">
          <div>
            <span className="speech-pref-label">Pronunciación automática (japonés)</span>
            <p className="muted speech-pref-hint">
              Si está activada, al estudiar se lee en voz alta cada palabra nueva. Podés repetir la lectura con el
              botón en la sesión aunque esto esté desactivado.
            </p>
          </div>
          <button
            type="button"
            className={autoSpeakJapanese ? "btn btn-primary" : "btn"}
            onClick={toggleAutoSpeakJapanese}
            aria-pressed={autoSpeakJapanese}
          >
            {autoSpeakJapanese ? "Activada" : "Desactivada"}
          </button>
        </div>
      </div>
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

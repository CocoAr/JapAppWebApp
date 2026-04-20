import { Link } from "react-router-dom";

export function ScriptPicker() {
  return (
    <div>
      <h1 className="page-title">Elegí un sistema de escritura</h1>
      <p className="muted page-lead">Cada modo tiene su propio vocabulario y progreso.</p>
      <div className="script-picker-grid">
        <Link to="/app/hiragana" className="script-picker-tile script-picker-tile--hiragana">
          <span className="script-picker-tile-title">Hiragana</span>
          <span className="muted script-picker-tile-desc">Ejercicios de hiragana</span>
        </Link>
        <Link to="/app/katakana" className="script-picker-tile script-picker-tile--katakana">
          <span className="script-picker-tile-title">Katakana</span>
          <span className="muted script-picker-tile-desc">Ejercicios de katakana</span>
        </Link>
      </div>
    </div>
  );
}

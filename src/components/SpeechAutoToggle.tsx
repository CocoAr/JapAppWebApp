import { useSpeechPreference } from "../context/SpeechPreferenceContext";

type Props = {
  /** Más discreto para el menú Katakana (no compite con el contenido principal) */
  compact?: boolean;
};

export function SpeechAutoToggle({ compact }: Props) {
  const { autoSpeakJapanese, toggleAutoSpeakJapanese } = useSpeechPreference();

  return (
    <div className={`speech-auto-box ${compact ? "speech-auto-box--compact" : ""}`}>
      <span className="speech-auto-label">Audio automático (sesiones)</span>
      <button
        type="button"
        className={`speech-auto-btn ${autoSpeakJapanese ? "speech-auto-btn--on" : "speech-auto-btn--off"}`}
        onClick={toggleAutoSpeakJapanese}
        aria-pressed={autoSpeakJapanese}
      >
        {autoSpeakJapanese ? "Sí" : "No"}
      </button>
    </div>
  );
}

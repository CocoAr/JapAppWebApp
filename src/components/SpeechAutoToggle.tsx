import { useSpeechPreference } from "../context/SpeechPreferenceContext";

export function SpeechAutoToggle() {
  const { autoSpeakJapanese, toggleAutoSpeakJapanese } = useSpeechPreference();

  return (
    <div className="speech-auto-box">
      <div className="speech-auto-label">Reproducción automática de audio</div>
      <button
        type="button"
        className={`speech-auto-btn ${autoSpeakJapanese ? "speech-auto-btn--on" : "speech-auto-btn--off"}`}
        onClick={toggleAutoSpeakJapanese}
        aria-pressed={autoSpeakJapanese}
      >
        {autoSpeakJapanese ? "Activada" : "Desactivada"}
      </button>
    </div>
  );
}

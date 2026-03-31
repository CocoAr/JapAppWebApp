import { useEffect, useRef } from "react";
import { VOCAB_CELEBRATION_AUDIO, VOCAB_CELEBRATION_GIF } from "../lib/vocabCelebrationAssets";

type Props = {
  open: boolean;
  onContinue: () => void;
  savingError: string | null;
};

export function VocabCelebrationModal({ open, onContinue, savingError }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const el = audioRef.current;
    if (!el) return;
    el.volume = 0.85;
    void el.play().catch(() => {
      /* autoplay may be blocked before gesture; session flow usually allows it */
    });
    return () => {
      el.pause();
      el.currentTime = 0;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="vocab-celebration-backdrop" role="dialog" aria-modal="true" aria-labelledby="vocab-celebration-title">
      <div className="vocab-celebration-panel">
        <h2 id="vocab-celebration-title" className="vocab-celebration-title">
          ¡Omedetou! Completaste todo el vocabulario
        </h2>
        <div className="vocab-celebration-media">
          <img
            className="vocab-celebration-gif"
            src={VOCAB_CELEBRATION_GIF}
            alt=""
            loading="eager"
            decoding="async"
          />
        </div>
        <audio ref={audioRef} src={VOCAB_CELEBRATION_AUDIO} preload="auto" />
        {savingError ? <p className="form-error vocab-celebration-error">{savingError}</p> : null}
        <button type="button" className="btn btn-primary btn-large" onClick={onContinue}>
          {savingError ? "Reintentar" : "Continuar"}
        </button>
      </div>
    </div>
  );
}

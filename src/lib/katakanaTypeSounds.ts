let audioCtx: AudioContext | null = null;

function ctx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    audioCtx = new Ctx();
  }
  return audioCtx;
}

function beep(freq: number, durationMs: number, type: OscillatorType, gain = 0.1): void {
  const c = ctx();
  if (!c) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.value = 0.0001;
  osc.connect(g);
  g.connect(c.destination);
  const now = c.currentTime;
  const peak = gain;
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(peak, now + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);
  osc.start(now);
  osc.stop(now + durationMs / 1000 + 0.03);
}

/** Sonido breve de error (suave) */
export function playKatakanaTypeError(): void {
  beep(165, 160, "triangle", 0.085);
  setTimeout(() => beep(130, 140, "triangle", 0.065), 75);
}

/** Sonido agradable de acierto */
export function playKatakanaTypeSuccess(): void {
  beep(523.25, 85, "sine", 0.095);
  setTimeout(() => beep(659.25, 100, "sine", 0.085), 65);
  setTimeout(() => beep(783.99, 125, "sine", 0.075), 145);
}

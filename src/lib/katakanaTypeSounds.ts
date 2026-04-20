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

function beep(freq: number, durationMs: number, type: OscillatorType, gain = 0.12): void {
  const c = ctx();
  if (!c) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.value = gain;
  osc.connect(g);
  g.connect(c.destination);
  const now = c.currentTime;
  g.gain.setValueAtTime(gain, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + durationMs / 1000);
  osc.start(now);
  osc.stop(now + durationMs / 1000 + 0.02);
}

/** Sonido breve de error */
export function playKatakanaTypeError(): void {
  beep(180, 220, "sawtooth", 0.1);
  setTimeout(() => beep(140, 180, "sawtooth", 0.08), 80);
}

/** Sonido agradable de acierto */
export function playKatakanaTypeSuccess(): void {
  beep(523.25, 90, "sine", 0.11);
  setTimeout(() => beep(659.25, 110, "sine", 0.1), 70);
  setTimeout(() => beep(783.99, 140, "sine", 0.09), 160);
}

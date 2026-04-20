/** Web Speech API — Japanese TTS (browser voices, no external vendor). */

export function isSpeechSynthesisAvailable(): boolean {
  return typeof window !== "undefined" && typeof window.speechSynthesis !== "undefined";
}

/** Speak Japanese text (hiragana or katakana) with a Japanese voice. Cancels any ongoing utterance first. */
export function speakJapaneseHiragana(text: string): void {
  if (!isSpeechSynthesisAvailable()) return;
  const trimmed = text.trim();
  if (!trimmed) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(trimmed);
  u.lang = "ja-JP";
  u.rate = 0.92;
  window.speechSynthesis.speak(u);
}

/** Alias: same TTS path for katakana loanwords. */
export function speakJapaneseReading(text: string): void {
  speakJapaneseHiragana(text);
}

export function cancelJapaneseSpeech(): void {
  if (isSpeechSynthesisAvailable()) window.speechSynthesis.cancel();
}

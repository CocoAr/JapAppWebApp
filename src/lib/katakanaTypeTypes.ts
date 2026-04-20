export type KatakanaTypeSettings = {
  /** Botón para reproducir audio (no automático) */
  volumeEnabled: boolean;
  /** Líneas por letra */
  showLetterCount: boolean;
  /** Resaltar en amarillo en el teclado */
  highlightKeyboardLetters: boolean;
  /** Si false: máximo 3 intentos por palabra */
  unlimitedAttempts: boolean;
};

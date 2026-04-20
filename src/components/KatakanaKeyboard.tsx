type Props = {
  rows: string[][];
  onKey: (ch: string) => void;
  onBackspace: () => void;
  /** Si está definido, estas teclas se resaltan en amarillo */
  highlightChars?: Set<string>;
};

export function KatakanaKeyboard({ rows, onKey, onBackspace, highlightChars }: Props) {
  return (
    <div className="katakana-keyboard">
      {rows.map((row, ri) => (
        <div key={ri} className="katakana-keyboard-row">
          {row.map((ch) => {
            const hi = highlightChars?.has(ch) ?? false;
            return (
              <button
                key={`${ri}-${ch}`}
                type="button"
                className={`katakana-key ${hi ? "katakana-key--hint" : ""}`}
                onClick={() => onKey(ch)}
              >
                {ch}
              </button>
            );
          })}
        </div>
      ))}
      <div className="katakana-keyboard-row katakana-keyboard-row--actions">
        <button type="button" className="katakana-key katakana-key--wide" onClick={onBackspace}>
          Borrar
        </button>
      </div>
    </div>
  );
}

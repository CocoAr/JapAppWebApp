import type { KeyboardSection } from "../lib/katakanaKeyboardLayout";

type Props = {
  sections: KeyboardSection[];
  onKey: (ch: string) => void;
  onBackspace: () => void;
  highlightChars?: Set<string>;
};

export function KatakanaKeyboard({ sections, onKey, onBackspace, highlightChars }: Props) {
  return (
    <div className="katakana-keyboard" role="group" aria-label="Teclado katakana">
      {sections.map((sec) => (
        <div key={sec.id} className="katakana-kb-section">
          <div className="katakana-kb-section-label">{sec.label}</div>
          <div className="katakana-kb-grid">
            {sec.rows.map((row, ri) => (
              <div key={ri} className="katakana-kb-row">
                {row.map((ch) => {
                  const hi = highlightChars?.has(ch) ?? false;
                  return (
                    <button
                      key={`${sec.id}-${ri}-${ch}`}
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
          </div>
        </div>
      ))}
      <div className="katakana-kb-actions">
        <button type="button" className="katakana-key katakana-key--backspace" onClick={onBackspace}>
          ← Borrar
        </button>
      </div>
    </div>
  );
}

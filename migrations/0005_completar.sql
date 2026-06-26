-- "Completar Vocabulario" mode: per-item progress, fully independent from
-- the hiragana/katakana word_progress so the two never mix.
CREATE TABLE IF NOT EXISTS completar_item_progress (
  user_id INTEGER NOT NULL,
  item_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('exact', 'near', 'wrong')),
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, item_id),
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_completar_item_progress_user ON completar_item_progress (user_id);

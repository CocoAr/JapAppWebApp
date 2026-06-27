-- Per-(item, level) progress for "Completar Vocabulario", so badges can light up
-- only when a whole part is exact at a given difficulty level.
-- Additive: does not touch 0005 (completar_item_progress).
CREATE TABLE IF NOT EXISTS completar_level_progress (
  user_id INTEGER NOT NULL,
  item_id TEXT NOT NULL,
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 5),
  best_result TEXT NOT NULL CHECK (best_result IN ('exact', 'near', 'wrong')),
  exact_count INTEGER NOT NULL DEFAULT 0,
  near_count INTEGER NOT NULL DEFAULT 0,
  wrong_count INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, item_id, level),
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_completar_level_progress_user ON completar_level_progress (user_id);

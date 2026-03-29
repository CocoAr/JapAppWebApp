-- Users: PIN stored as PBKDF2 hash + salt (hex)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL COLLATE NOCASE,
  pin_hash TEXT NOT NULL,
  pin_salt TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users (username);

CREATE TABLE IF NOT EXISTS word_progress (
  user_id INTEGER NOT NULL,
  word_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('known', 'weak')),
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, word_id),
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_word_progress_user ON word_progress (user_id);

CREATE TABLE IF NOT EXISTS category_progress (
  user_id INTEGER NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('page', 'topic')),
  category_id TEXT NOT NULL,
  started INTEGER NOT NULL DEFAULT 0 CHECK (started IN (0, 1)),
  last_session_score REAL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, mode, category_id),
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_category_progress_user ON category_progress (user_id);

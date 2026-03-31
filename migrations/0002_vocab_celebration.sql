-- One-time celebration when user marks every vocabulary word as known (first time only).
ALTER TABLE users ADD COLUMN vocab_celebration_seen INTEGER NOT NULL DEFAULT 0;

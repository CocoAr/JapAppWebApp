-- Separate "full vocab" celebration dismissal for katakana track.
ALTER TABLE users ADD COLUMN vocab_celebration_katakana_seen INTEGER NOT NULL DEFAULT 0;

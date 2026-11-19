-- Kombucha Christmas Run: Cloudflare D1 leaderboard schema
-- Email is private. Public API must only expose nickname and best_score.
CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  nickname TEXT NOT NULL CHECK(length(nickname) BETWEEN 1 AND 24),
  email TEXT NOT NULL CHECK(length(email) BETWEEN 3 AND 254),
  email_normalized TEXT NOT NULL UNIQUE,
  best_score INTEGER NOT NULL DEFAULT 0 CHECK(best_score >= 0),
  best_bottles INTEGER NOT NULL DEFAULT 0 CHECK(best_bottles >= 0),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_players_leaderboard
ON players(best_score DESC, updated_at ASC);
CREATE TABLE IF NOT EXISTS runs (
  id TEXT PRIMARY KEY,
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK(score >= 0),
  bottles INTEGER NOT NULL CHECK(bottles >= 0),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_runs_player ON runs(player_id, created_at DESC);

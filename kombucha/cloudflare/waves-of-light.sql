CREATE TABLE IF NOT EXISTS waves_scores (
  run_id TEXT PRIMARY KEY,
  nickname TEXT NOT NULL CHECK(length(nickname) BETWEEN 1 AND 24),
  score INTEGER NOT NULL CHECK(score BETWEEN 1 AND 10000000),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_waves_scores_rank
ON waves_scores(score DESC, created_at ASC, run_id ASC);

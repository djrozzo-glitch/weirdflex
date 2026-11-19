CREATE TABLE IF NOT EXISTS le_martini_scores (
  run_id TEXT PRIMARY KEY,
  nickname TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score BETWEEN 1 AND 340),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS le_martini_scores_rank
ON le_martini_scores (score DESC, created_at ASC, run_id ASC);

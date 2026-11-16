# Waves of Light leaderboard

1. In the Cloudflare dashboard, open the D1 database already bound as `db` in `kombucha-leaderboard`. Run [waves-of-light.sql](waves-of-light.sql) in the D1 console.
2. Update the existing Worker with [worker.js](worker.js), retaining its `db` binding and `RUN_SECRET`, then deploy it.
3. Verify GET `/api/waves-of-light/scores` returns `{"entries":[]}` on a fresh table and `/api/kombucha/scores` still serves Kombucha scores.

Waves of Light stores nicknames and one result per signed run token in its own table. The token and score cap guard against simple duplicate or implausibly large submissions. Scores come from the browser and are not replay-verified. Kombucha keeps its own tables and replay verification.

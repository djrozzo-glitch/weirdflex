# Le Martini leaderboard

Le Martini shares the existing `kombucha-leaderboard` Worker and D1 database. Run [le-martini.sql](le-martini.sql) in the existing database's D1 console, then deploy [worker.js](worker.js) to the existing Worker. Keep the `db` and `RUN_SECRET` bindings.

- `GET /api/le-martini/scores` lists the top 10 by tips. Only nickname and score are returned.
- `POST /api/le-martini/run` issues a game-specific signed token at shift start.
- `POST /api/le-martini/scores` saves `{name, score, token}`. The same shift can be submitted once, with an idempotent retry for an identical submission.
- Browser access is allowed from the existing weirdflex.online origin and the user's GitHub Pages origin.

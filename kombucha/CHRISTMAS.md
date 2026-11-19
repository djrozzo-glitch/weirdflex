# Kombucha Christmas Run

The game runs at `/kombucha/` on the existing Pages mirror. Start a run, tap or press Space/Up to jump, and collect bottles for 10 points each. Three bottles form an arc at a random height above each obstacle. About one in four arcs is high enough to require a double jump. Running speed increases continuously by 20% of the starting speed per minute, up to 180% at four minutes. A collision ends the run. The track loops through three winter scenes. This edition has one caribou and no locations or shop to select.

## Run locally with the leaderboard

Use Node 24 or later.

```sh
node server/index.mjs
```

Open http://127.0.0.1:8787/kombucha/. The SQLite database defaults to `.data/christmas.sqlite`. The server serves the game as well as the API. Its default bind address is localhost.

## Connect GitHub Pages to a shared leaderboard

Run the same Node process behind an HTTPS reverse proxy on a host with persistent storage and a secret. Set `GAME_ORIGIN=https://weirdflex.online`, `HOST=0.0.0.0`, `SCORE_DB` to an absolute path on the persistent volume, and `SCORE_SECRET` to a stable secret generated with `openssl rand -hex 32`. The process uses port 8787 by default and respects `PORT`. Keep request body limits and per-IP rate limits at the proxy. It only needs to expose the `/api/kombucha/` endpoints for the Pages version. In `christmas/config.mjs`, set `scoreOrigin` to the API's public HTTPS origin.

The server signs each run, replays the jump inputs, calculates the score and records each run once. The first submitted run wins a tie. The public board shows the ten highest runs with nicknames and scores. Practice runs remain available when the service is unreachable. For awarding a prize, use campaign rules with an explicit cutoff and a way for the winner to claim the result. Replay verification checks that a run is possible under the game rules. It cannot establish that every input came from a person.

Artwork follows the assembled Christmas asset pack. The collectible is based on the Caribou Kombucha Christmas Brut bottle. The course features 16 obstacle designs. SFX and background audio are reused from the previous version.

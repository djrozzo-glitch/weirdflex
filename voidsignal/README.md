# VOID SIGNAL v0.1

A fully offline-capable, single-touch chain reaction arcade game. No frameworks, API keys, external assets, accounts, or third-party services required.

## Play

Open `index.html` in a modern browser. For PWA install and service-worker caching, serve it over HTTPS (GitHub Pages works) or `localhost`.

Local preview: `python3 -m http.server 8000` and visit `http://localhost:8000/`.

Deploy: upload the *contents* of this folder to `/voidsignal/` in your GitHub Pages repository. It will then appear at `https://weirdflex.online/voidsignal/` assuming that domain is connected to the repository.

## Controls

- Click/tap the arena once to trigger a pulse.
- Wait and watch the chain reaction. Timing and location matter.
- `R` = restart mission; `M` = mute/unmute; `Esc` = home / close panel.
- Earn at least one star to unlock the next mission.
- All results and personal bests save in browser localStorage.

## System design

- The simulation is independent of frame rate (60 Hz fixed tick) and generated with seeded PRNG for repeatability.
- A restart returns the same initial particle positions, velocities, and special particles. Results are repeatable when pulse position and simulation frame are identical.
- The only audio is user-initiated short Web Audio synthesis; there is **no ambient drone**.
- Mission 1–3: normal particles; 4–5 introduce Amplifier; 6–10 introduce Echo.
- Designed for pointer/touch, desktop and phone browsers. PWA works after a successful online load.

## Files

- `index.html` — UI layout
- `style.css` — responsive design
- `app.mjs` — renderer, audio, controls, storage
- `game-engine.mjs` — deterministic physics and level definitions
- `manifest.webmanifest`, `sw.js` — installable PWA/offline assets
- `assets/` — icon and social cover

v0.1 deliberately includes no online leaderboard. Multiplayer comparison needs a backend and abuse-resistant submission design.

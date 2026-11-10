# VOID SIGNAL v0.4 — Daily & Total Collapse

A complete standalone HTML5 Canvas / JavaScript / CSS game. Everything is in English.

## New in 0.4

- 30 campaign missions (20 existing + 10 new), rebalanced star thresholds
- VOID nodes absorb the particular wave that reaches them. They count as hazards, not collectible targets.
- FREEZE nodes create a standard wave and briefly immobilize nearby particles.
- Brighter sprites and particle explosions, floating score, temporary slow motion, TOTAL COLLAPSE animation for 100% target completion
- Daily Signal: seeded UTC challenge, three launches per day per browser profile, local personal best (no server or global leaderboard)
- Persisting campaign progress from v0.2/v0.3/v0.3.1 via the original `voidsignal.v02.progress` localStorage key.
- Offline PWA service worker cache v0.4.0; mobile support.

## Upload

Upload **the contents of this folder** to a static directory on GitHub Pages, e.g. `/voidsignal/`.
For a PWA update, reload after the new service worker installs; hard refresh if necessary.

## QA

`node tests/qa-v04.mjs` checks campaign solvability, fixed-seed reproducibility, VOID/FREEZE distribution and UTC daily rollover.

Daily limit is enforced locally only and can be reset by clearing storage. A real cross-device global leaderboard would require backend infrastructure.

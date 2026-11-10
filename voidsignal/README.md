# VOID SIGNAL v0.3

Playable browser MVP of a one-tap neon chain-reaction arcade game.

## What's new in v0.3

- Fixed mission names clipping by wrapping complete names within a wider log.
- Replaced awkward raster-skinned buttons with clean CSS neon/glass buttons.
- Added 8 painted FX sprites cropped from bespoke generated concept art and integrated glow/compositing into the gameplay Canvas.
- Expanded spark density and corrected the initial ripple animation.
- Kept v0.2 progress and sound preferences.


- Richer illustrated UI with custom sliced interface assets integrated into the layout
- Expanded campaign from 10 to 20 missions
- Rebalanced mission progression and thresholds
- Stronger visual spectacle: trails, burst sparks, extra ripple rings, combo callouts, and bigger impact feedback
- Deterministic simulation retained
- Sound effects only, with no ambient drone
- Mobile-friendly layout, local saves, and PWA support

## Tech

- Vanilla HTML/CSS/JavaScript
- HTML5 Canvas rendering
- Web Audio API for SFX
- localStorage saves
- Service worker for offline caching

## Publish

Upload the contents of this folder to a static host such as GitHub Pages.

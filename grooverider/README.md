# GROOVE RAID v0.1
A playable, original browser arcade shooter inspired by the forward-scrolling mechanics of classic River Raid, set inside a vinyl groove.

## Play
Open `index.html` in any modern browser. To host on GitHub Pages, put the files at the repository root (or in a subdirectory) and enable Pages.

## Controls
- Desktop: ←/→ or A/D steer; ↑/↓ or W/S change speed; Space fires; P or Esc pauses; Mute button toggles sound.
- Mobile: drag horizontally on the playfield to steer, or use left/right buttons. Hold FIRE to shoot; + / − to change speed.

## Mechanics
- Infinite procedural scrolling groove; fixed-seed predictable obstacle sequence
- Shooting, 2 enemy types, electrical cracks, recharge pickups
- Beat accents at 128 BPM generated with Web Audio; no background drone or externally hosted audio
- Increasing speed and obstacle density, energy attrition, score and saved high score
- Responsive interface, installable PWA and offline cache after first visit

## Technical
Pure HTML, CSS and JavaScript, no runtime dependencies. Fonts use Google Fonts when online; built-in fallbacks are provided for offline play.

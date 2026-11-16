# GROOVE RAID v1.5 — Sprite & Shuffle Edition

- New truly transparent charge canister, replacing `assets/charge.webp`.
- New transparent crystal-star enemy in `assets/enemy.webp` and `assets/enemy-needle.webp`.
- Needle renders at roughly the player's ship width (~64px vs 60px). Collision radius remains fair.
- Retains v1.4 relative touch steering, auto-fire, playlists and game balance.
- Service worker cache version updated and main scripts cache-busted.

## Music and deployment

- The built-in soundtrack has four lowQ tracks. Playback starts when the player starts the game with music enabled, and shuffles through the playlist without an immediate repeat.
- The HUD credits the four lowQ tracks to SHIFTED. The game menu links to the Waves of Light single on album.link.
- The built-in MP3s are served from the source `grooverider` repository at a pinned revision. `audio/tracks.json` uses its exact filenames and can override a track URL with `src`.

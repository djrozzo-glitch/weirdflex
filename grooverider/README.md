# GROOVE RAID v1.5 — Sprite & Shuffle Edition

- New truly transparent charge canister, replacing `assets/charge.webp`.
- New transparent crystal-star enemy in `assets/enemy.webp` and `assets/enemy-needle.webp`.
- Needle renders at roughly the player's ship width (~64px vs 60px). Collision radius remains fair.
- Retains v1.4 relative touch steering, auto-fire, playlists and game balance.
- Service worker cache version updated and main scripts cache-busted.

## Deploy
Upload contents directly into `weirdflex/grooverider/`, replacing existing game files.
**Do not remove the existing `audio/` folder:** there are no MP3s or audio folder in this ZIP.

- Shuffled nine-song playback, no immediate repeat; reshuffle after the full cycle.
- Full track credit shown in HUD: artist — track — label. Unknown labels marked "Label not specified".
- Next-track control follows the same shuffled order.

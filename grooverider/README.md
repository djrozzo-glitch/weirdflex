# GROOVE RAID v0.4 — Music playback hotfix

Replace files in `weirdflex/grooverider/` with this archive, keeping all nine MP3 files in the existing `audio/` folder. Do not delete your audio files.

## What changed

- The nine ROZZO tracks are declared directly in game.js, synchronously before the player can press start; no more race between asynchronous playlist loading and browser autoplay permissions.
- Audio starts directly inside the `DROP THE NEEDLE` click handler.
- The playlist manifest is optional; it can supply title/offset metadata without interrupting playback.
- Music toggle correctly pauses and resumes the track, SFX toggle is independent, and Next Track advances immediately.
- Playback status and errors now appear beside header controls on desktop and in the start overlay.
- Service-worker cache bumped to `groove-raid-v04` to replace old scripts.

## Troubleshooting

If it stays silent: make sure the music icon shows ♫ rather than the muted icon, then click it OFF and ON. If the header says COULD NOT LOAD, inspect exact MP3 names and `audio/` folder. If an older build persists, hard refresh (Ctrl+Shift+R / Cmd+Shift+R); installed PWA may need reopening. You can always select files manually via LOAD YOUR TRACKS.

The timing remains 124 BPM; correct `offset` values per track are needed to align exact first beats.

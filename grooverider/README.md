# GROOVE RAID v0.3 — ROZZO Edition

## Deploy

Replace `index.html`, `game.js`, `style.css`, `sw.js`, `README.md`, `audio/tracks.json`, and the assets from this archive in `weirdflex/grooverider/`. **Keep all nine existing MP3 files in the server `audio/` folder. They are NOT included in this ZIP.** Do not delete the folder when uploading this archive.

## Playlist

`audio/tracks.json` lists all nine existing rozzo MP3 filenames exactly as they appear in GitHub, including Unicode en dashes. The music starts from the first song when you click DROP THE NEEDLE, automatically advances when a song ends, and loops the entire playlist. The `⏭` button skips to the next track. The ♫ button independently mutes/unmutes music, the speaker button toggles gameplay SFX, and pause/resume also pauses/resumes music.

## Rhythm

The game uses 124 BPM (60/124 seconds per beat). Timing is driven by the HTML audio element's playback position, and the game analyzes bass/mid-frequency energy for responsive edge glow, speed and enemy movement. Visual pulses occur at every 4-beat bar. Actual beat alignment requires configuring each track's `offset` (seconds until its first downbeat); all offsets currently default to zero. No claimed automatic beat detection or musical structure detection.

## Notes

GitHub Pages is case-sensitive. MP3s require hosting on the same site; simply opening index.html locally will not load the JSON playlist. Audio playback begins on user interaction per browser policies. If an old build persists, hard-refresh to update the PWA cache. ZIP verified with Node syntax checks and archive integrity; actual visual test in a live browser remains recommended.

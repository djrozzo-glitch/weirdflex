# GROOVE RAID v0.2 — 124 BPM

Browser arcade, custom illustrated assets, music playback and synced pulse.

## Adding your own music

Put your audio files in `audio/` and edit `audio/tracks.json`:

```json
[
  {"file": "my-track.mp3", "title": "My Track", "offset": 0},
  {"file": "my-second-track.ogg", "title": "Second Track", "offset": 0.12}
]
```

`offset` is the seconds from the start of the recording to the first downbeat (optional). All tracks are assumed 124 BPM. Names are case-sensitive on GitHub Pages. Browser games cannot enumerate a server folder directly: update `tracks.json`, or use **LOAD YOUR TRACKS** in the menu to select audio files from your computer.

Music toggle (♫) mutes/unmutes songs; the speaker button toggles gameplay SFX independently. Music pauses and resumes along with gameplay, and plays the next playlist item after the track ends. Local file loading via the button works offline. Music files are NOT included in this ZIP; copy yours into `audio/`. The beat display is driven by audio playback time when a track is playing, with an internal 124 BPM fallback.

## Deployment

Upload all contents to GitHub Pages. On first update, refresh the site to replace the old service worker cache.

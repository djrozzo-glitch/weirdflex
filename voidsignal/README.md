# VOID SIGNAL v1.2 — Persistent Endless + Mobile Audio

## Changes
- In Endless, particles that survive a pulse remain in their exact position and keep their velocity and type on the next wave. Only hit particles disappear. The next wave **adds** fresh particles without replacing survivors.
- Incoming wave batches start at 26, then rise from 17 towards 40 new particles per wave (subject to available field capacity).
- A hard cap of 150 live particles protects mobile frame rate. If the field fills completely, the game ends with **CRITICAL OVERLOAD**, rather than silently deleting survivors.
- The 0.35-second gap between waves stays; there are no inter-wave popup screens.
- The Endless HUD displays kept, added and field population. Energy and personal best remain compatible with prior versions.
- Web Audio is unlocked from the first touch/pointer/click gesture anywhere in the game, including Start, Sound and Resume, with resume on returning to the page. On iOS, check the device's media volume and silent settings if sound is still blocked.
- Existing campaign, Daily and Endless saves retain their previous localStorage keys.
- PWA cache version bumped for updates.

## Testing
Run `node tests/endless-qa.mjs`, `node tests/qa-v04.mjs` and `node tests/release-qa.mjs`. Mobile sound needs final hands-on verification in Safari iOS and Chrome Android.

## v1.1.1 — Seamless Endless waves

Endless now advances to the next wave without a blocking success/failure overlay. The delay has been reduced from two seconds to 0.35 seconds. Energy, wave number, total score and game-over behavior are unchanged.

# VOID SIGNAL 1.1 — Endless Mode

**New**: Endless Mode. A fresh set of particles spawns automatically after each resolved reaction. Each wave gives one pulse; clear the target to preserve your three energy charges. Below target costs one charge; clear 90% or more to recharge one (maximum three). When energy reaches zero the run ends, showing total score, waves survived, best chain depth, and a locally saved personal best. Difficulty and particle types ramp with each wave, with a safe cap on particle count. Waves are deterministic within a run seed.

Start Endless from the main menu. Press R to begin a fresh Endless run. Pause works between waves too. Campaign and Daily remain unchanged, and their localStorage keys are preserved.

# VOID SIGNAL — Public Release 1.0

A standalone neon chain-reaction arcade game for desktop and mobile browsers.
Everything inside the game is in English. No build tools, accounts, cookies, ads, external scripts, or back-end services are required.

## Game modes
- 30 campaign missions with three-star objectives, 5 particle types, deterministic simulations, local high scores, and a progressive unlock system
- Daily Signal: the same seeded daily field for all players by UTC date; **three locally enforced shots per UTC day** and a local personal best. There is **no global leaderboard**.
- One tap/click launches a pulse. Every other wave is triggered by chain reactions.

## 1.0 release improvements
- Pause button and keyboard shortcut (P); automatic pause when leaving the browser tab
- Settings for audio, camera shake, and bright FX; keyboard accessibility and focus outlines
- Public privacy / data information page
- Responsive scrollable dialogs on smaller phones
- Updated page title, social sharing metadata, PWA offline cache and update alert
- Original save keys retained: `voidsignal.v02.progress`, `voidsignal.v02.muted`, `voidsignal.v04.daily`

## How to publish on GitHub Pages
1. Extract this archive.
2. Upload the **contents** of `void-signal-release-1.0/` to `/voidsignal/` in the repository hosting `weirdflex.online`.
3. Keep paths and filenames exactly as provided. Wait for deployment to complete.
4. Open `https://weirdflex.online/voidsignal/` and refresh. Existing PWA installs may need an additional reload to activate the new service worker.
5. Verify one real phone (iOS Safari and/or Android Chrome), a desktop browser, sound after first interaction, Daily attempt tracking, save persistence, and install/offline behavior.
6. Confirm the social preview using a share-debugging tool after deploy (the `og:image` uses the expected production URL).

## QA
`node tests/qa-v04.mjs` checks all 30 mission simulations, particle types, reproducibility, sampled solvability, UTC date changes, and VOID/FREEZE mechanics.
`node tests/release-qa.mjs` checks integrity of referenced files, service worker precache, metadata, and the release UI.

## Controls
- Pointer / touch: select a point on the arena to launch the single pulse
- Enter / Space when arena focused: fire at center
- P: pause / resume
- R: restart current campaign level
- M: toggle audio
- Escape: close dialogs or return to menu

## Privacy and limitations
Saves and Daily data stay in localStorage. They are not synchronized between devices; clearing site data clears them. Hosting providers may keep access logs. Daily limits are local only and can be circumvented. No third-party analytics or tracking are included.

## Release checklist for owner
- [ ] Upload new files and verify HTTPS loads
- [ ] Check console, PWA update, app install and offline reload
- [ ] Confirm new save format doesn't reset existing progress
- [ ] Verify mobile landscape/portrait and button visibility
- [ ] Test touch and audio on physical iOS + Android devices
- [ ] Check public privacy language/contact/legal attribution as appropriate
- [ ] Decide whether to add global leaderboard later (requires backend)

Do not remove the `assets/fx` folder. It contains the composited burst and core sprites.

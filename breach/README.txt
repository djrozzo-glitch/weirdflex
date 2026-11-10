BREACH.exe — Release Candidate 4.2 (English)
============================================

START
Open index.html in your browser to play locally. Or upload the contents of
this folder to the root of your GitHub Pages repository and use HTTPS.

CAMPAIGN
50 missions across five corporations. Missions 1–3 introduce basic routing.
Firewall and TRACE start at mission 4; Splitter/Relay at mission 5;
Booster/energy limitations at mission 6.

4.2 GAMEPLAY BALANCE
- Shorter introductory routes; more gradual network complexity later on.
- Stars are based on turns relative to the reference route for each puzzle.
- Hints or failed signal injections cap a run at two stars.
- High TRACE can further reduce stars; TRACE reaches failure at 100%.
- Resets preserve accumulated TRACE. Daily scores compare stars, then moves,
  then TRACE as a tie-breaker.

DAILY BREACH
Each UTC date has a deterministic seeded puzzle. The puzzle and score date
are frozen when a run begins, even if midnight passes while you play.
Results are stored on the current browser/device, not publicly online.
Daily missions never advance story unlocks.

PWA / OFFLINE
On HTTPS (or localhost), the service worker installs a versioned cache of
all required game screens, sprites, and icons. Subsequent visits can work
offline. Navigation requests use network-first fetching to avoid a stale
HTML page after updating to a new release.

SOUND
Web Audio effects and ambient drone are generated locally; click/tap the
sound toggle to mute. Browsers may require an interaction to start audio.

SAVES AND UPGRADES
Uses the existing breach-save-v1 key, so campaign unlocks and saved stars
are preserved. Some puzzles have been rebalanced, and best scores from
previous versions may belong to earlier puzzle layouts.

QA
See QA_REPORT.txt. Automated game logic, JavaScript syntax, offline cache
asset paths, and ZIP contents were checked. Full interactive visual testing
in a real browser/device remains recommended before public release.

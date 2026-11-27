# WeirdFlex project context

WeirdFlex is an independent creative studio in The Hague, Netherlands. It makes browser mini-games for brands, artists, labels, and events. The website and game portfolio are at [weirdflex.online](https://weirdflex.online/). The public contact is [djrozzo@gmail.com](mailto:djrozzo@gmail.com).

## Commercial offer

**Small games. Big ideas.** WeirdFlex sells affordable playable marketing, especially for small businesses such as cafés, shops, and restaurants. Food and beverage brands, independent artists and labels, festivals, and cultural organizations can also use games to promote products, releases, and events.

Personalization starts at **€299** for a proven browser game. This covers agreed branding, visual changes, and promotional links. New mechanics, complex integrations, leaderboards, and original games are scoped and quoted separately. The business goal is to turn the portfolio into a steady source of paid commissions.

## Homepage

| Section | Purpose |
| --- | --- |
| Hero | Introduce the offer and starting price. Give visitors a choice between exploring games and making contact. |
| Pick your play | Explain mini-games for small businesses, playable releases, interactive experiences, and original development. |
| Choose your game | Offer four demos and a customization CTA for each. The design calls for a horizontal catalog. The current CSS uses a desktop grid and a mobile carousel. |
| Simple by design | Combine the process carousel and the ShibaRun-to-Kombucha case study in one section. The case shows how a runner became a branded Christmas promotion with a caribou, bottle collectibles, and seasonal scenery. |
| Play before you buy | Show playable work in a horizontal portfolio with consistent artwork and actions. |
| Good questions | Cover scope, price, mobile play, hosting, and optional features. End with a contact CTA. |

The visual identity uses a warm off-white background, near-black type, terracotta accents, tight editorial headings, and purposeful whitespace. Keep game artwork prominent, use subtle animation, and keep copy direct. Aim for roughly one desktop screen per logical section with natural overflow when the content needs it. Mobile readability and touch controls take priority over matching a viewport height.

## Repository and hosting

- `index.html` is the studio homepage. It contains the sections, cards, metadata, inline carousel and interaction code, and the consent bootstrap. `assets/site.css` contains layout, breakpoints, and visual styles. The homepage has no package manager or framework build. The old indexes and root READMEs describe earlier revisions.
- `assets/previews/` contains optimized portfolio artwork. Some cards use artwork from game directories, Pages proxies, or an upstream repository. The root `assets/` directory also contains social previews and mascot art. Keep an eye on file sizes and external dependencies when adding artwork.
- `shibarun/`, `kombucha/`, `grooverider/`, `nightshift/`, `breach/`, `voidsignal/`, and `gullcity/` serve game files from this repository. `twilight/` and `highfidelity/` contain iframe shells for separate GitHub Pages projects.
- The custom domain is served through Cloudflare Pages. Its GitHub check reports the deployment for `main`. `functions/` contains Pages Functions for Le Martini, Everybody Dances, and short dance links, including the upstream dance-link API bridge.
- The repository also publishes to [GitHub Pages](https://djrozzo-glitch.github.io/weirdflex/). `_config.yml` excludes selected original NightShift models from that publication. Cloudflare Pages Functions are specific to the Cloudflare deployment.
- `.github/workflows/` contains image generation and optimization workflows backed by the Python scripts in `scripts/`, plus Kombucha sync workflows. The scheduled sync copies the game from [its source repository](https://github.com/djrozzo-glitch/kombucha) and records the source SHA in `kombucha/.source-commit`. Make requested Kombucha gameplay changes in its source repository because scheduled sync can replace the published copy.
- For a local homepage preview, run `python3 -m http.server 8000` from the repository root. Test Pages Function routes on an appropriate Pages deployment. Run the existing game checks with `for test in voidsignal/tests/*.mjs; do node "$test" || exit; done` from the repository root.

## Game portfolio

| Game | Route | Role and source |
| --- | --- | --- |
| ShibaRun | [/shibarun/](https://weirdflex.online/shibarun/) | Ozzy endless runner and the catalog's Endless Runner demo. |
| Kombucha | [/kombucha/](https://weirdflex.online/kombucha/) | Christmas runner and the main customization case study. [Source](https://github.com/djrozzo-glitch/kombucha) |
| Waves of Light | [/grooverider/](https://weirdflex.online/grooverider/) | Jungle EP inside a vinyl-themed shooter. Catalog Arcade Shooter demo. |
| Le Martini | [/lemartini/](https://weirdflex.online/lemartini/) | Cocktail-making game for a deep house release. Catalog Bartender Game demo. [Source](https://github.com/djrozzo-glitch/lemartini) |
| Twilight | [/twilight/](https://weirdflex.online/twilight/) | lowQ dubstep release and the catalog's Arkanoid demo. Both cards use `assets/backgrounds/london-alley.webp` from the [Twilight source](https://github.com/djrozzo-glitch/twilight-ep). |
| Everybody Dances | [/dances/](https://weirdflex.online/dances/) | Choreography creator with sharing. [Source](https://github.com/djrozzo-glitch/choreo_game) |
| NightShift | [/nightshift/](https://weirdflex.online/nightshift/) | Nightclub simulator. Also available at [Play My Club](https://playmyclub.online/) and its [full route](https://playmyclub.online/full/). [Source](https://github.com/djrozzo-glitch/NightShift) |
| BREACH.exe | [/breach/](https://weirdflex.online/breach/) | Cyberpunk pipe puzzle with missions and daily challenges. |
| VOID SIGNAL | [/voidsignal/](https://weirdflex.online/voidsignal/) | Chain-reaction puzzle. Its engine and Node checks live in the game directory. |
| Gull and the City | [/gullcity/](https://weirdflex.online/gullcity/) | One-button flying game. |
| Kollegium | [kollegium.online/en/](https://kollegium.online/en/) | External fantasy adventure and mystery project. |
| High Fidelity | [/highfidelity/](https://weirdflex.online/highfidelity/) | Record shop arcade with music by nerdy turtle. The route is live. The homepage has no card for it. [Source](https://github.com/djrozzo-glitch/high-fidelity) |

## Ozzy

The site mascot uses custom PNG artwork in `assets/shiba/`. `assets/shiba-controller.js` controls movement, interaction, animation state, and analytics hooks. `assets/shiba-sprites.js` loads frames and displays poses. The homepage preloads the original idle pose at high priority and keeps the dog hidden until the renderer has an image. The sprite loader retries idle once, then loads base and walking frames. Optional poses load during idle time. The renderer pauses its frame timer while the document is hidden and restarts it on return.

Preserve roaming and edge re-entry, heading interactions, resting and playful animations, petting, dragging, and Easter eggs. Check real iPhone Safari for browser chrome and safe areas, pointer behavior, sprite readiness on a cold load, and resume after switching tabs or apps.

## Analytics and discoverability

The homepage uses opt-in PostHog in the EU. It stores the choice locally and loads the SDK after consent. Page visits, project clicks, navigation, contact clicks, and mascot interactions use existing instrumentation. Autocapture and session recording are disabled. Keep those privacy settings and existing consent preferences intact.

The homepage provides canonical, Open Graph, and Twitter/X metadata, structured data, and favicon links. The root also contains `robots.txt`, `sitemap.xml`, and `llms.txt`. Game pages can have their own metadata, manifests, and service workers.

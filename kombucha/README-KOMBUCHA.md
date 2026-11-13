# Kombucha: The Caribou World Tour

A reskin kit for the original browser runner at https://github.com/djrozzo-glitch/shiba_run. Includes a new 12-frame caribou atlas, individual transparent sprites, a title logo, and an installer that rebrands the web game while retaining its cities, obstacles, music, jump physics, and collectible system.

## Assemble a full project

1. Download/clone the original repo: `git clone https://github.com/djrozzo-glitch/shiba_run.git kombucha`
2. Unzip this kit, then copy **all contents of the kit folder** into the newly cloned `kombucha` folder (merging `assets`).
3. In that folder, run `python3 apply_kombucha.py`.
4. Test using `python3 -m http.server 8080` and open http://localhost:8080.
5. On GitHub, create a **new empty public repository** called `kombucha` under `djrozzo-glitch` (do not initialize with README).
6. In the local `kombucha` folder run:

```sh
git remote remove origin
git remote add origin https://github.com/djrozzo-glitch/kombucha.git
git add .
git commit -m "Create Kombucha caribou edition"
git push -u origin main
```

For GitHub Pages, go to Settings → Pages → Deploy from a branch → main / (root).

## Notes

- The original `shiba_run` repository is untouched.
- Existing costume purchase options are retained but currently display the same Kombucha sprite. Dedicated costume art can be added later.
- All original world/obstacle art remains unchanged; this is a character-first reskin.
- Preview and test the game in a browser before public release; this package hasn't been tested with the full original assets in this environment.

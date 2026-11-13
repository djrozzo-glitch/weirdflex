# Ozzy: The Hunt for Syrniki — World Obstacle Art Pack v2.0

17 standalone 512×512 RGBA PNG sprites, consistent thick outlines and safe margins. All objects have been normalized from the supplied source art and are ready for integration / iteration.

IMPORTANT: This is an ART PACK, NOT a replacement for the whole game. The graphics are not yet wired into index.html. No files in your repository were changed.

Implementation notes:
- Display each sprite preserving its aspect ratio. The 512×512 artboard itself is square, but the illustrated object occupies a centered subset.
- Object baseline is placed around y=480 in every source PNG. For robust in-game sizing, base geometry on an alpha trim rectangle or use per-item collision boxes, not the full artboard.
- Do not crop based on the original historical hard-coded 256×256 rectangles.
- Avoid any color-based background removal, because light details and internal holes have been damaged before.
- Test on bright/dark backgrounds and on iPhone before release.
- For collectibles, use assets/syrnik.png from the current game; this pack contains obstacles only.
- preview-contact-sheet.jpg is a visual index; manifest.json includes current concepts and city-life alternatives to food stereotypes.

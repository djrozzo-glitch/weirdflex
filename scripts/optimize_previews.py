#!/usr/bin/env python3
"""Generate smaller, display-only previews. Original game assets stay untouched."""
from pathlib import Path
from PIL import Image, ImageOps
import re

root = Path(__file__).resolve().parents[1]
html_path = root / "index.html"
html = html_path.read_text(encoding="utf-8")
assets = [
    ("gullcity/assets/backgrounds/skyline.png", "assets/previews/gull-skyline.webp"),
    ("breach/assets/screens/missions.png", "assets/previews/breach-missions.webp"),
    ("nightshift/assets/artwork/main_page_pic.jpg", "assets/previews/nightshift.webp"),
    ("grooverider/assets/share-card.jpg", "assets/previews/waves-of-light.webp"),
]
changes = []
for source, output in assets:
    src, dst = root / source, root / output
    if not src.is_file():
        raise FileNotFoundError(f"Missing source: {source}")
    with Image.open(src) as original:
        image = ImageOps.exif_transpose(original)
        image.thumbnail((960, 960), Image.Resampling.LANCZOS)
        image = image.convert("RGB")
        dst.parent.mkdir(parents=True, exist_ok=True)
        image.save(dst, "WEBP", quality=80, method=6)
    old_size, new_size = src.stat().st_size, dst.stat().st_size
    if new_size >= old_size:
        raise RuntimeError(f"Not smaller: {output}: {new_size} >= {old_size}")
    old = 'src="/' + source + '"'
    if old not in html:
        raise RuntimeError(f"Missing HTML reference: {old}")
    html = html.replace(old, 'src="/' + output + '"')
    changes.append((source, old_size, output, new_size))
html_path.write_text(html, encoding="utf-8")
for source, old, dest, new in changes:
    print(f"{source}: {old:,} -> {dest}: {new:,} bytes ({(1-new/old)*100:.1f}% smaller)")

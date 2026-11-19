#!/usr/bin/env python3
"""Run from the root of a freshly cloned shiba_run repo after copying kit files."""
from pathlib import Path
import re,json,shutil
root=Path(__file__).resolve().parent
html=root/'index.html'
if not html.exists():raise SystemExit('Missing index.html: copy kit into the cloned shiba_run root first.')
s=html.read_text(encoding='utf8')
s=s.replace('Ozzy: The Hunt for Syrniki','Kombucha: The Caribou World Tour')
s=s.replace('Ozzy:<br>The Hunt for Syrniki','Kombucha:<br>The Caribou World Tour')
s=s.replace('One dog. One delicious mission.','One caribou. One epic adventure.')
s=s.replace('Our brave shiba has met an obstacle','Our brave caribou has met an obstacle')
s=s.replace('SHIBA WARDROBE','CARIBOU WARDROBE')
s=s.replace('🐾 SHIBA WARDROBE','🦌 CARIBOU WARDROBE')
s=s.replace('Classic Shiba','Classic Kombucha')
s=s.replace('SHIBA','CARIBOU')
s=s.replace('assets/ozzy-logo.webp','assets/kombucha-logo.png')
s=s.replace("image:'shiba-atlas.png'","image:'kombucha-atlas.png'")
# Put the new hero in every costume slot to prevent dog sprites returning on persisted saves.
for name in ['ninja','samurai','hotdog']:
 s=s.replace(f"image:'skins/{name}-atlas.png'", "image:'kombucha-atlas.png'")
# Rebrand storage to ensure independent save slots when hosted on same domain.
s=s.replace('shiba-run-', 'kombucha-run-')
s=s.replace('dogAtlas','caribouAtlas')
s=s.replace('const dog={','const dog={') # preserve tested physics and animation data structure
s=s.replace('dog has','caribou has')
s=s.replace("const musicCandidates=['audio/bg_music_loop.mp3','audio/shiba-theme.wav'];", "const musicCandidates=['audio/bg_music_loop.mp3'];")
s=s.replace('The double_jump artwork is already upside-down. Spin the upright airborne pose instead.', 'Spin the upright airborne pose for the second jump.')
s=s.replace("const skinCatalog=[", "const skinCatalog=[")
# Ensure newly supplied atlas asset exists.
assert (root/'kombucha-atlas.png').exists(), 'Missing kombucha-atlas.png'
assert (root/'assets/kombucha-logo.png').exists(), 'Missing assets/kombucha-logo.png'
html.write_text(s,encoding='utf8')
for file in ['README.md','README.txt']:
 p=root/file
 if p.exists():
  t=p.read_text(encoding='utf8',errors='replace').replace('Ozzy: The Hunt for Syrniki','Kombucha: The Caribou World Tour').replace('shiba_run','kombucha')
  p.write_text(t,encoding='utf8')
manifest=root/'manifest.json'
if manifest.exists():
 try:
  d=json.loads(manifest.read_text(encoding='utf8'))
  for field in ['name','short_name','description']:
   if field in d and isinstance(d[field],str):d[field]=d[field].replace('Ozzy','Kombucha').replace('Shiba','Caribou')
  manifest.write_text(json.dumps(d,indent=2,ensure_ascii=False)+'\n',encoding='utf8')
 except json.JSONDecodeError:pass
atlas=root/'shiba-atlas.json'
if atlas.exists():
 try:
  d=json.loads(atlas.read_text());d['image']='kombucha-atlas.png';d['notes']='Caribou facing right, 320x320 transparent frames in a 4x3 atlas. Ground anchor near y=258.'
  (root/'kombucha-atlas.json').write_text(json.dumps(d,indent=2)+'\n')
 except json.JSONDecodeError:pass
print('Kombucha patch applied. Original game engine and city assets preserved.')

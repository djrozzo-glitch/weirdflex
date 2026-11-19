from PIL import Image, ImageDraw, ImageEnhance
from pathlib import Path
import random

root=Path(__file__).resolve().parent.parent
source=Image.open(root/'kombucha-atlas.png').convert('RGBA')
source=source.resize((1280,960),Image.Resampling.LANCZOS)
folder=root/'skins'
folder.mkdir(exist_ok=True)

flavors=[
 ('blackcurrant-juniper-atlas.webp',(92,64,112),(65,111,80),'currant'),
 ('tarragon-cedar-atlas.webp',(77,137,75),(129,109,67),'tarragon'),
 ('raspberry-mint-atlas.webp',(191,76,111),(86,160,129),'raspberry'),
]
for filename,primary,secondary,kind in flavors:
 target=folder/filename
 if target.exists():
  print('Keeping existing artwork:',target)
  continue
 # Preserve the proven 4x3 sprite layout, alpha and collision anchors.
 # These fallback recolors are generated only when the hand-painted atlases
 # have not yet been uploaded.
 texture=Image.new('RGBA',source.size,(0,0,0,0))
 draw=ImageDraw.Draw(texture,'RGBA')
 for i in range(12):
  rng=random.Random(i+11)
  col=i%4;row=i//4
  left=col*320;top=row*320
  # Botanical accents inside the caribou flank
  for j in range(8):
   x=left+86+rng.randint(-18,35)
   y=top+164+rng.randint(-16,23)
   color=primary if j%2 else secondary
   r=6 if kind=='tarragon' else 5
   draw.ellipse((x-r,y-r,x+r,y+r),fill=(*color,130))
   draw.line((x+2,y-2,x+11,y-12),fill=(*secondary,165),width=2)
  for j in range(6):
   x=left+120+j*14+rng.randint(-4,4)
   y=top+150+rng.randint(-12,12)
   draw.ellipse((x-13,y-3,x+13,y+3),fill=(*secondary,108))
 tinted=Image.new('RGBA',source.size,(*primary,0))
 alpha=source.getchannel('A')
 tinted.putalpha(alpha)
 # 26% tint preserves depth/detail of the original grayscale forest artwork.
 combined=Image.blend(source,tinted,0.26)
 combined.putalpha(alpha)
 combined=Image.alpha_composite(combined,texture)
 combined.putalpha(alpha)
 combined.save(target,format='WEBP',lossless=False,quality=85,method=6)
 print('Generated fallback',target)

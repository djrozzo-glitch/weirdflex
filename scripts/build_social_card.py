#!/usr/bin/env python3
"""Build the WeirdFlex social preview without changing any game imagery."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
root=Path(__file__).resolve().parents[1]
out=root/"assets/weirdflex-social.jpg"
out.parent.mkdir(parents=True,exist_ok=True)
W,H=1200,630
im=Image.new("RGB",(W,H),"#f5f3ee")
d=ImageDraw.Draw(im)
fonts=["/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf","/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf"]
regular=["/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf","/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf"]
def font(paths,size):
 for p in paths:
  if Path(p).exists():return ImageFont.truetype(p,size)
 return ImageFont.load_default()
heavy=font(fonts,112)
body=font(regular,39)
small=font(fonts,23)
d.rectangle((0,0,14,H),fill="#f06436")
d.text((75,55),"WEIRDFLEX  /  PLAYABLE STUDIO",font=small,fill="#171715")
d.text((68,180),"Ideas worth",font=heavy,fill="#171715")
d.text((68,305),"playing.",font=heavy,fill="#f06436")
d.line((75,483,1125,483),fill="#c8c5bd",width=2)
d.text((75,512),"Browser games  /  Brand experiences  /  Music",font=body,fill="#171715")
im.save(out,"JPEG",quality=88,optimize=True,progressive=True)
print(out, out.stat().st_size)

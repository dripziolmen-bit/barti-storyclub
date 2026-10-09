#!/usr/bin/env python3
"""Produce cohesive illustrated SVG book covers and rich menu pictograms.
Third-party illustration glyphs adapted from Twemoji (CC BY 4.0) with attribution.
Everything else (landscapes, compositions, lighting, sparkles, typography) is original SVG.
"""
import json, urllib.request, xml.etree.ElementTree as ET, random, html
from pathlib import Path
ROOT=Path('/home/ubuntu/bartek-workspace/projects/BARTI_CZYTA')
OUT=ROOT/'assets/visuals/covers';OUT.mkdir(parents=True,exist_ok=True)
ICONS=ROOT/'assets/ui/twemoji';ICONS.mkdir(parents=True,exist_ok=True)
story=json.loads((ROOT/'data/extra-stories.json').read_text())
# Story-specific palettes and decorative motifs
themes={
'teremok':('#162f43','#669f92','#e0bd79','1f3e1','1f42d'),
'masha':('#40204c','#db90a7','#fcc381','1f43b','1f467'),
'lisa-zhuravl':('#274858','#86bdbe','#ffe1a9','1f98a','1f426'),
'zaika-lisa-petuh':('#453246','#e2a28b','#f8ddac','1f407','1f413'),
'volk-kozl':('#26446b','#789cb7','#e8d8a2','1f43a','1f410'),
'gusi-lebedi':('#254964','#a6cad4','#fae4c6','1fabf','1f340'),
'snegurochka':('#3e5d86','#aacbde','#fff7e6','2744','1f478'),
'morozko':('#263d70','#93add3','#f3e7ed','2603','2744'),
'shchuka':('#123f53','#58a6b7','#cce7cc','1f41f','1f4a7'),
'carevna':('#33395e','#869d8f','#f9d99b','1f438','1f451'),
'ivan-volk':('#28325e','#777eaf','#f3d0a1','1f43a','1f451'),
'havroshechka':('#3d4650','#a6b395','#f3ddb0','1f404','1f34e'),
'lisa-rak':('#224d61','#74bac2','#f5d6bb','1f98a','1f980'),
'tri-medvedya':('#4c3c40','#ae977c','#e7cba6','1f43b','1f3e0'),
'kot-petuh-lisa':('#314d4a','#9eb395','#f8d7a0','1f408','1f413'),
}
def icon(c):
 f=ICONS/(c+'.svg')
 if not f.exists():
  url='https://raw.githubusercontent.com/jdecked/twemoji/main/assets/svg/'+c+'.svg'
  try:
   with urllib.request.urlopen(url,timeout=12) as r: f.write_bytes(r.read())
  except Exception as e:
   print('GLYPH_UNAVAILABLE',c,str(e),flush=True)
   return ''
 try: root=ET.fromstring(f.read_text())
 except: return ''
 return ''.join(ET.tostring(e,encoding='unicode').replace('ns0:','').replace('xmlns:ns0="http://www.w3.org/2000/svg"','') for e in root)
def draw_symbol(c,x,y,size,opacity=1):
 p=icon(c)
 if not p:return ''
 return f'<g opacity="{opacity}" transform="translate({x} {y}) scale({size/36:.5f})">{p}</g>'
def cover(st):
 sid=st['id'];bg,dusk,sun,a,b=themes[sid]
 rng=random.Random(sid)
 stars=''.join(f'<circle cx="{rng.randrange(20,1140)}" cy="{rng.randrange(20,390)}" r="{rng.choice([2,3,4,6])}" fill="#fff8e6" opacity="{rng.uniform(.18,.75):.2f}"/>' for _ in range(70))
 blades=''.join(f'<path d="M{n} 770 Q{n-16} {rng.randint(640,725)} {n+rng.randint(-40,40)} {rng.randint(550,680)}" stroke="{rng.choice([sun,"#b5d4aa","#9fb797"])}" stroke-width="{rng.randint(2,6)}" stroke-linecap="round" opacity=".33" fill="none"/>' for n in range(0,1200,28))
 trees=''.join(f'<g opacity="{rng.uniform(.21,.48):.2f}"><path d="M{x} 620 v-{h}" stroke="{dusk}" stroke-width="11"/><path d="M{x-51} {620-h//2} Q{x-62} {590-h} {x} {530-h} Q{x+71} {588-h} {x+51} {620-h//2}Z" fill="{dusk}"/></g>' for x,h in [(100,180),(300,125),(950,175),(1090,225)])
 big=draw_symbol(a,410,160,380)
 small=draw_symbol(b,800,355,180,.95)
 if sid in ['snegurochka','morozko']:big=draw_symbol(a,410,160,360)
 image=f'''<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="820" viewBox="0 0 1200 820">
 <defs>
 <linearGradient id="sky" x2=".8" y2="1"><stop stop-color="{bg}"/><stop offset=".57" stop-color="{dusk}"/><stop offset="1" stop-color="{sun}"/></linearGradient>
 <radialGradient id="halo"><stop stop-color="#fff7e5" stop-opacity=".91"/><stop offset=".55" stop-color="#fff8e3" stop-opacity=".24"/><stop offset="1" stop-color="#fff8e3" stop-opacity="0"/></radialGradient>
 <linearGradient id="hill" x2="0" y2="1"><stop stop-color="{dusk}"/><stop offset="1" stop-color="{bg}"/></linearGradient>
 <filter id="sh"><feGaussianBlur stdDeviation="16"/></filter>
 </defs>
 <rect width="1200" height="820" fill="url(#sky)"/>
 <circle cx="780" cy="310" r="380" fill="url(#halo)"/>
 <path d="M0 448 Q170 340 370 469 T780 437 T1200 444 V820 H0Z" fill="{sun}" opacity=".19"/>
 <path d="M0 510 Q250 400 450 512 T820 475 T1200 520 V820 H0Z" fill="{dusk}" opacity=".36"/>
 {stars}
 {trees}
 <ellipse cx="605" cy="744" rx="350" ry="48" fill="#15202d" opacity=".26" filter="url(#sh)"/>
 <path d="M0 703 Q185 640 375 705 Q550 640 760 696 Q1000 630 1200 700 V820 H0Z" fill="url(#hill)"/>
 {blades}
 <g filter="url(#sh)" opacity=".30">{draw_symbol(a,410,180,370)}</g>
 {big}
 {small}
 <path d="M24 24H1176V796H24Z" fill="none" stroke="#ffffff" stroke-width="4" opacity=".21" rx="18"/>
 <circle cx="1045" cy="102" r="43" fill="#ffefc0" opacity=".18"/>
 </svg>'''
 (OUT/(sid+'.svg')).write_text(image)
 print('COVER',sid,(OUT/(sid+'.svg')).stat().st_size,flush=True)
for st in story: cover(st)
for key,emoji in [('library','1f4da'),('words','1f4ac'),('achievements','1f3c6'),('more','1f9ed')]:
 svg=f'''<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
 <defs><linearGradient id="a" x2="1" y2="1"><stop stop-color="#fff4f9"/><stop offset="1" stop-color="#fbd6e6"/></linearGradient></defs>
 <rect width="160" height="160" rx="38" fill="url(#a)"/>
 <circle cx="81" cy="79" r="59" fill="#fff" opacity=".62"/>
 <circle cx="120" cy="36" r="6" fill="#e19ab9"/>
 <circle cx="36" cy="129" r="4" fill="#d685ab"/>
 {draw_symbol(emoji,32,30,96)}
 </svg>'''
 (ROOT/'assets/ui'/f'{key}.svg').write_text(svg)
print('ILLUSTRATION_ASSETS_COMPLETE',len(story),'story_covers','4 menu_buttons')

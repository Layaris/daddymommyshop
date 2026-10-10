# Prepara le immagini per il sito (serve Pillow):
#  - public/img/art/<slug>.png: design leggeri (640x768) per la maglietta 3D
#  - public/img/pf/**.jpg: mockup Printful ridotti a 900px, qualità 80
# Uso: python3 scripts/images.py   (dopo printful-mockups.mjs)
import json, os, glob
from PIL import Image
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
data = json.load(open(os.path.join(root, 'data/designs.json')))
out = os.path.join(root, 'public/img/art'); os.makedirs(out, exist_ok=True)
for d in data['designs']:
    for key, suffix in (('fronte', ''), ('retro', '-back')):
        if not d.get(key): continue
        im = Image.open(os.path.join(root, d[key])).convert('RGBA').resize((640, 768), Image.LANCZOS)
        im.save(os.path.join(out, f"{d['slug']}{suffix}.png"), optimize=True)
for f in glob.glob(os.path.join(root, 'public/img/pf/*/*.jpg')):
    im = Image.open(f)
    if im.width > 900:
        im.convert('RGB').resize((900, 900), Image.LANCZOS).save(f, 'JPEG', quality=80, optimize=True, progressive=True)
print('immagini pronte')

# Prepara le immagini per il sito (serve Pillow), dopo printful-mockups.mjs:
#  - public/img/pf/**/*.jpg: mockup Printful ridotti a 900px, qualità 80
#  - public/img/pf/**/flat-*.png -> flat-*.webp: maglietta piatta trasparente per il 3D (800px)
# Uso: python3 scripts/images.py
import os, glob
from PIL import Image
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
for f in glob.glob(os.path.join(root, 'public/img/pf/**/*.jpg'), recursive=True):
    im = Image.open(f)
    if im.width > 900:
        im.convert('RGB').resize((900, 900), Image.LANCZOS).save(f, 'JPEG', quality=80, optimize=True, progressive=True)
for f in glob.glob(os.path.join(root, 'public/img/pf/**/flat-*.png'), recursive=True):
    im = Image.open(f).convert('RGBA')
    if im.width > 800: im = im.resize((800, 800), Image.LANCZOS)
    im.save(f[:-4] + '.webp', 'WEBP', quality=82, method=6)
    os.remove(f)
print('immagini pronte')

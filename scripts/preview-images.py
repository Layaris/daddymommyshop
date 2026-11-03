# Copie leggere delle foto per l'anteprima in un solo file (dist/small/, 560px). Serve Pillow.
import os, glob
from PIL import Image
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
for f in glob.glob(os.path.join(root, 'public/img/**/*.*'), recursive=True):
    out = os.path.join(root, 'dist/small', os.path.relpath(f, os.path.join(root, 'public')))
    if os.path.exists(out) and os.path.getmtime(out) >= os.path.getmtime(f): continue
    os.makedirs(os.path.dirname(out), exist_ok=True)
    im = Image.open(f)
    if im.width > 560: im = im.resize((560, round(im.height * 560 / im.width)), Image.LANCZOS)
    if f.endswith('.jpg'): im.convert('RGB').save(out, 'JPEG', quality=70, optimize=True, progressive=True)
    else: im.save(out, 'WEBP', quality=78, method=6)

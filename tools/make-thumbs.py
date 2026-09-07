# -*- coding: utf-8 -*-
"""images/ -> thumbs/, one small copy per scan.

The binder shows nine stubs to a page and the collection can run to
hundreds; loading full-resolution scans for that is the difference
between a page that opens and a page that hangs. Every scan needs a
thumbnail of the same name.

    python tools/make-thumbs.py           # only what is missing
    python tools/make-thumbs.py --all     # rebuild every one

Needs Pillow (pip install pillow).
"""
import os, sys, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG, THUMB = os.path.join(ROOT, 'images'), os.path.join(ROOT, 'thumbs')
EDGE = 300          # long edge in pixels; plenty for a stub in the binder

try:
    from PIL import Image
except ImportError:
    sys.exit('needs Pillow:  pip install pillow')

os.makedirs(THUMB, exist_ok=True)
force = '--all' in sys.argv
made = skipped = 0
for p in sorted(glob.glob(os.path.join(IMG, '*'))):
    if not p.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
        continue
    out = os.path.join(THUMB, os.path.basename(p))
    if os.path.exists(out) and not force:
        skipped += 1; continue
    with Image.open(p) as im:
        im = im.convert('RGB')
        im.thumbnail((EDGE, EDGE), Image.LANCZOS)
        im.save(out, quality=82)
    made += 1
print('thumbs: %d written, %d already there' % (made, skipped))

orphans = (set(os.path.basename(p) for p in glob.glob(os.path.join(THUMB, '*')))
           - set(os.path.basename(p) for p in glob.glob(os.path.join(IMG, '*'))))
if orphans:
    print('thumbs with no scan behind them: %s' % ', '.join(sorted(orphans)))

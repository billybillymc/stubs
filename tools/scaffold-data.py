# -*- coding: utf-8 -*-
"""Read images/ and write a data.js skeleton to transcribe into.

The tedious half of making this yours is mechanical: every ticket needs
a file name and the exact pixel size of its scan, because the page cuts
the stub geometry to the scan's aspect. This fills those in and leaves
everything a human (or a vision model) has to read off the paper as
null. Run it once, then fill in the blanks — see docs/TRANSCRIBING.md.

    python tools/scaffold-data.py            # writes data.new.js
    python tools/scaffold-data.py --force    # overwrites data.js

Needs Pillow (pip install pillow) only to read image dimensions.
"""
import io, os, sys, json, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(ROOT, 'images')

try:
    from PIL import Image
except ImportError:
    sys.exit('needs Pillow:  pip install pillow')

files = sorted(os.path.basename(p) for p in glob.glob(os.path.join(IMG, '*'))
               if p.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')))
if not files:
    sys.exit('no scans in images/ — put them there first')

recs = []
for i, f in enumerate(files, 1):
    with Image.open(os.path.join(IMG, f)) as im:
        w, h = im.size
    recs.append({
        'id': i,              # the caption key: keep it stable for ever
        'title_raw': None,    # what the printer actually printed
        'title': None,        # the real film, spelled out
        'date': None,         # "YYYY-MM-DD" — the page sorts on this
        'year': None,         # the year OF THE TICKET, for the runtime key
        'showtime': None,     # "7:15pm" — decides the sky and the clock
        'theater': None,
        'format': [],         # ["IMAX"], ["3D"], ["CC"] … free-form tags
        'price': None,
        'seat': None,
        'confidence': 'low',  # low until a human has looked at the scan
        'notes': None,
        'file': f, 'source': None, 'page': i,
        'w': w, 'h': h,
        'theater_short': None,
        'aud': None,          # the chip on the stub: "Aud 3" / "Screen 2"
    })

head = ('/* THE COLLECTION — scaffolded from images/ by tools/scaffold-data.py.\n'
        '   File names and scan sizes are filled in; everything a person has\n'
        '   to read off the paper is null. See docs/TRANSCRIBING.md. */\n'
        'window.TICKETS = ')
out = os.path.join(ROOT, 'data.js' if '--force' in sys.argv else 'data.new.js')
io.open(out, 'w', encoding='utf-8', newline='\n').write(
    head + json.dumps(recs, ensure_ascii=False, indent=0) + ';\n')
print('scaffolded %d tickets -> %s' % (len(recs), os.path.basename(out)))
if '--force' not in sys.argv:
    print('review it, then rename over data.js (or re-run with --force)')

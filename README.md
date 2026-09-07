# Ticket Stubs — a harness to create a UI for browsing your movie ticket stubs

Relive every ticket stub in your collection. You tear the ticket outside the cinema, 
pocket the stub at the auditorium door, and file it in a binder on a desk at home. 

Built in Three.js, runs from a folder of files with no build step, and
comes with the engine finished so you can start from a working thing rather than from nothing.
Designed to work well with a coding agent.

---

## Run it

It has to be served over HTTP. ES modules and canvas textures will not
load from a `file://` URL.

```
cd stubs
python tools/serve.py
```

Then open **http://localhost:8713/ui-passage-pull.html**.

Click the ticket and pull down. Press `i` for the instructions.

`serve.py` is Python's own static server with caching switched off.
Plain `python -m http.server` works too, but it sends no cache headers,
so an edit to `data.js` can sit unseen behind the browser's guess at
freshness for half an hour and look like it it didn't take. Use
`serve.py` while you are editing; pass a port as the first argument if
8713 is busy.

There is no build, no `npm install`, no bundler. Three.js comes from a
CDN through the import map in the page. The scripts in `tools/` need
one of two things: Pillow (`pip install pillow`) for the two Python
helpers, and **Node 22 or newer** for the three `.mjs` ones — they use
Node's built-in `fetch` and `WebSocket`, which older Nodes do not have.

---

## Make it yours

**1. Scan your stubs.** One image per ticket, in `images/`, named
however you like. (`t001.jpg`, `t002.jpg` is the convention the sample
uses.)

I used Google Drive's camera scanner for this part.

**2. Build the thumbnails.**

```
python tools/make-thumbs.py
```

The binder shows nine stubs at a time and will holds hundreds if you have them.
The page loads full-resolution scans for all of them and hangs on the loading bar.

**3. Write down what is on the paper.**

```
python tools/scaffold-data.py
```

That reads `images/` and writes `data.new.js` with every ticket's file
name and pixel size filled in and everything else `null`. Fill in the
blanks and rename it over `data.js`.

This is something a coding agent is genuinely great at: hand it a scan
and the empty record and ask it to read the ticket.

**`docs/TRANSCRIBING.md`is written for that**: it has
the prompt, the field-by-field rules, and the traps that make this
harder than it looks (box-office printers truncate titles, stubs get
scanned face-down, and the date is often only legible in the
transaction stamp at the foot).

`docs/DATA.md` is the schema.

**4. Fetch the posters.**

```
node tools/fetch-posters.mjs
```

The marquee outside the cinema hangs four posters per night: the film
on your stub and three others that were out that season, drawn from
the almanac in `films.js`. This asks Wikipedia once for each of those
titles, saves the picture into `posters/`, and writes `posters.js` — a
list of which file goes with which title. After that the walls load off
the disk and the page never needs the network for art. Run it again
whenever you add tickets; it only fetches what is new. A title Wikipedia
has no picture for gets a drawn one-sheet instead, and that is fine.

**5. Say something about them.** Open
**http://localhost:8713/captions.html**, type a line against any
ticket, and hit `EXPORT captions.js`. Drop the download next to
`data.js`. A ticket with a line gets a speech bubble from off frame
while its stub is in the binder; a ticket without one gets none, and
nothing about the page changes. This is the part that turns an archive
into somebody's collection, and no agent can do it for you.

---

## What's in the box

```
ui-passage-pull.html   the page: markup, all the CSS, and one script tag
passage/               the engine, split by concern
  tickets.js             the collection, sorted, plus the small helpers
  tween.js               the clock the choreography runs on
  tex.js                 canvas textures — wood, carpet, plaster, paper
  hour.js                what time it is and what the sky does about it
  mats.js                materials, and light with a shape to it
  posters.js             poster art, the season's bill, the texture cache
  stage.js               renderer, environment map, the lens that fails
  type.js                hand-set marquee letters and the LED board
  app.js                 the one piece of state every room reads
  ui.js                  the card, the captions, the voice, the "i"
  main.js                the flow, the hand, the boot
  acts/outside.js        ACT I  — under the marquee
  acts/inside.js         ACT II — the door of the auditorium
  acts/home.js           ACT III— the binder on the desk
captions.html          the caption desk: write a line per ticket
data.js                your collection            <- replace this
captions.js            your lines                 <- replace this
runtimes.js            how long each film runs    <- extend this
posters.js  posters/   the poster art, by title   <- regenerate this
images/  thumbs/       your scans                 <- replace these
favicon.svg            the stub in the browser tab
lamp-steampunk.js  poster-case.js  stanchion.js  door-set.js
glass-entrance.js      procedural props, each self-contained
sfx.js                 every sound, synthesised — no audio files
films.js               a small film almanac, for the posters on the wall
tools/                 serve.py, scaffold-data.py, make-thumbs.py,
                       fetch-posters.mjs, qa.mjs, perf.mjs
docs/                  DATA.md, TRANSCRIBING.md
CLAUDE.md              orientation for a coding agent
LICENSE                MIT
```

---

## Working on it with an agent

`CLAUDE.md` is written for whatever coding agent you point at this
folder: what the pieces are, the conventions that hold the thing
together, and the specific ways it will bite you. Read it yourself too
— it is short, and it will save you an afternoon.

There is a real smoke test in `tools/qa.mjs`. It boots the page in
headless Chrome, waits out the loading bar, walks a whole night with
the space bar, and reports what state the page ended in and whether
anything threw:

```
node tools/qa.mjs http://127.0.0.1:8713/ui-passage-pull.html
```

A clean run says `boot: OPEN`, three acts named `OUTSIDE, INSIDE,
HOME`, the walk stepping `0 -> 1 -> 2`, and `errors: none`. Use it
after any change to the engine; the 3D is not something you can eyeball
in a diff.

---

*Built by Billy Gardner McIntyre <https://gardnermcintyre.com>*
*Source <https://github.com/billybillymc/stubs>*

*Licence: MIT — see `LICENSE`.
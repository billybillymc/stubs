# Orientation for a coding agent

This folder is a finished Three.js piece — *The Passage* — plus the
tools to point it at somebody else's ticket collection. It runs from
static files over HTTP. There is no build step, no package manager, no
bundler, and adding one is almost never the right answer.

Read this before changing anything. Most of it is scar tissue.

---

## The shape of it

`ui-passage-pull.html` is a shell: markup, all of the CSS, a small
inline script that decides whether this is a phone, and a module that
imports `./passage/main.js` only when it is not. On a small screen
(`max-width:600px`, or a coarse pointer under 1024px) the page never
loads three.js or a single thumb: it hands over `#mobile`, a
scroll-snap reel of the scans with each ticket's card and caption
under it, and a note at the top saying the piece wants a bigger
screen. That view is plain DOM built from the same `window.TICKETS`,
so it needs nothing from `passage/`. The engine is in
`passage/`, one file per concern, and the three rooms are in
`passage/acts/`. Data is four plain globals loaded by `<script src>`
before the module: `window.TICKETS` (data.js), `window.CAPTIONS`
(captions.js), `window.RUNTIMES` (runtimes.js) and `window.POSTERS`
(posters.js — the root one, a manifest of title → file under
`posters/`; not to be confused with `passage/posters.js`, the engine
module that reads it).

The import graph is acyclic and it must stay that way — `app.js`
dereferences `N` from `tickets.js` while it is evaluating, so a cycle
back into `app.js` kills the page with *"Cannot access 'N' before
initialization"*. If you add an import, check the direction.

**The act interface.** Each room is a class with the same five methods,
and the flow in `main.js` drives all three identically:

| method | contract |
|---|---|
| `enter(idx)` | build/stage the room for ticket `idx`; `await`ed behind the fade |
| `grab()` | true if there is something to take right now |
| `drag(k)` | scrub the whole gesture by `k` = 0..1 of the pull |
| `release(done)` | finish the act, or spring it back |
| `exit()` | kill tweens, drop references |
| `perform()` | the same pull done by the machine, for the space bar |
| `committed()` | *optional* — true once the act cannot be undone |

`drag(k)` is the important one: it is a pure function of how far the
hand has come down, so the keyboard version is the identical
choreography played by a tween. Never animate inside `drag`.

`committed()` exists because paper does not un-tear. The tear fires at
`k > .18` but a pull only "counts" past `k > .6`; without
`committed()` the street would visibly rip and then close back up when
you let go. Rooms where the gesture is genuinely reversible (a stub half
out of a pocket) do not implement it.

---

## Things that will bite you

**The HTML is CRLF.** Patch scripts that build a replacement string
with `\n` silently match nothing. Convert your needles, and assert on
the substitution count — a regex that matched zero times looks exactly
like success.

**`node --check file.js` is not an ESM parse.** It will pass a file
whose `export` is in the wrong place. Copy to `.mjs` and check that, or
you will find out in the browser.

**You cannot screenshot this page with `--virtual-time-budget`.** Boot
never finishes inside one; the shot comes back as a loading bar at 8%.
Use `tools/qa.mjs`, which drives real Chrome over CDP and *waits* —
about 50-75 seconds under software GL. That harness is the only honest
verification of a change to the 3D; a diff tells you nothing about
whether the room still renders.

**Poster art is local, with Wikipedia as the fallback.**
`tools/fetch-posters.mjs` writes `posters/` and `posters.js`; the page
loads a title from there, asks Wikipedia only for a title the manifest
does not mention, and draws a card when neither has anything. Which
Wikipedia article counts as "the film" is decided once, in
`passage/wiki.js`, and both the page and the tool import it — change
the rule there or the two will disagree. When somebody adds tickets,
re-run the tool; it only fetches what is new.

**Serve with `tools/serve.py`, not `python -m http.server`.** The plain
server sends no cache headers, so the browser guesses a freshness window
off the file's age and an edit to `data.js` can go unseen for half an
hour. `serve.py` is the same server with `no-store` on everything.

**Expect one 404 in the console, plus the favicon.** `poster-case.js`
was generated elsewhere and refers to a texture path that is not
shipped; that request failing is harmless. Headless Chrome also asks
for `/favicon.ico` even though the page links an SVG icon, and that is
harmless too. Any other 404 is a real missing file.

**Don't "fix" the data by regenerating it.** `data.js` is the source of
truth for the collection. If you write a script that rebuilds it,
diff the output against the current file before you overwrite: it is
very easy to reformat 200 records and bury the one change that
mattered, or to drop a ticket entirely.

---

## Conventions worth keeping

- **Comments say *why*, in prose.** This codebase explains the decision
  and the thing that went wrong before, not what the next line does.
  Match that register; do not replace it with `// set position`.
- **Nothing terminates on screen.** Wires run off the frame, the desk
  runs past both edges. If you add an object, check where it ends.
- **The paper UI is one language.** Cream stock, a warm-brown ink line
  gone round twice, handwriting (Caveat) for anything the collector
  "wrote", mono (Space Mono) for machine labels, and red-brown for
  links and dates. New UI should be drawn in that language or it will
  look like a browser dialog dropped into a film.
- **Ticket ids are for ever.** Captions are keyed by `data.js` `id`,
  never by position, so re-scanning or re-sorting the shoebox cannot
  shuffle somebody's memories onto the wrong nights. Never renumber.
- **Confidence is a real field.** `confidence: "low"` means nobody has
  verified that record. Don't quietly promote it because a record looks
  tidy.

---

## When the owner asks for a change

- *"the X looks wrong"* — get a picture before you theorise. For one
  object, a throwaway probe page that imports only Three.js and that
  model, rebuilds the same camera, renders one frame and prints
  measurements into the DOM is far faster than booting the whole piece.
- *"add a new room"* — implement the six required methods above
  (`committed()` only if the gesture is irreversible), push it into
  `app.acts`, and extend the flow in `main.js`. The rooms share nothing
  but the interface and the helpers in `passage/`.
- *"make it about my thing, not tickets"* — `data.js` is the only file
  that knows what a ticket is. The rooms are a cinema, a corridor and a
  bedroom because of what the collection is; they are the part to
  replace. The gesture engine, the tween clock, the texture helpers,
  the caption desk and the QA harness are all subject-agnostic.

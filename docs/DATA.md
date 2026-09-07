# data.js — the schema

`data.js` sets one global:

```js
window.TICKETS = [ { …one object per ticket… } ];
```

Order does not matter. The page sorts by `date`, and a ticket with no
date sorts to the very end — which is a useful way to see what you
still have to identify.

---

## What the page actually reads

Not every field is wired to something. These are, and roughly where
they show up:

| field | type | used for |
|---|---|---|
| `file` | `"t001.jpg"` | the scan, looked up in **both** `images/` and `thumbs/` under this exact name |
| `w`, `h` | numbers | pixel size of the scan; the 3D stub is cut to this aspect. Wrong values give you a stretched ticket |
| `date` | `"1999-06-25"` | the running order, and the date on the card. `null` sorts last |
| `title` | string | the card, the marquee, the poster lookup |
| `title_raw` | string | falls back to this when `title` is null — it is what the printer printed |
| `year` | number | the *ticket's* year. Used with `title` as the runtime key `"title|year"` |
| `showtime` | `"7:15pm"` | decides which sky the rooms are built under, and what the bedroom clock reads |
| `id` | number | **the caption key.** Stable for ever; see below |
| `theater` | string | the card |
| `seat` | string | the card |
| `price` | string | the card |
| `aud` | `"Aud 3"` | the small chip printed on the stub in 3D |

## Archival, and ignored by the page

Keep them anyway — they are the difference between a dataset and an
archive, and they are what lets you (or an agent) re-check a record
years later without going back to the paper.

| field | for |
|---|---|
| `confidence` | `"high"` / `"medium"` / `"low"` — how sure anyone is of this record |
| `notes` | how it was read, what was illegible, who identified it |
| `format` | `["IMAX"]`, `["3D"]`, `["CC"]` — tags off the ticket |
| `source` | which scan or PDF this came out of |
| `page` | page within that source |
| `theater_short` | a grouping label for venues that changed name or owner |

---

## The rules that matter

**`id` is permanent.** Captions in `captions.js` are keyed by it. Renumber
your tickets and you move somebody's memories onto the wrong nights.
When you add tickets later, give them new ids — never reuse or
re-sequence.

**`year` is the year of the *ticket*, not the film.** A 1942 film seen
at a revival in 2004 has `year: 2004`, and its runtime key is
`"Casablanca|2004"`. This trips people up constantly.

**`date` is ISO, `YYYY-MM-DD`.** No other format sorts correctly.

**`w` and `h` must match the file.** `tools/scaffold-data.py` reads them
off the images so you never have to; if you add a ticket by hand,
measure it.

**A missing runtime is not an error.** `runtimes.js` is keyed
`"title|year"`; anything not listed falls back to a flat two hours,
which only affects what time the bedroom clock reads.

---

## A record, filled in

```js
{
 "id": 3,
 "title_raw": "SPIRITED AWAY",
 "title": "Spirited Away",
 "date": "2002-09-20",
 "year": 2002,
 "showtime": "4:30pm",
 "theater": "Palace Twin",
 "format": [],
 "price": "$5.00",
 "seat": "Screen 1",
 "confidence": "high",
 "notes": "Matinee — this night opens in daylight.",
 "file": "t003.jpg",
 "source": "scan-2026-01-14.pdf",
 "page": 3,
 "w": 760,
 "h": 1120,
 "theater_short": "Palace Twin",
 "aud": "Aud 1"
}
```

## A record you cannot fully read yet

Perfectly valid. It will sort to the end of the walk until it gets a
date, and it will show its raw printed title until it gets a real one.

```js
{
 "id": 47,
 "title_raw": null,
 "title": null,
 "date": null,
 "year": 2009,
 "showtime": null,
 "theater": "Rave Motion Pictures",
 "format": [],
 "price": null,
 "seat": null,
 "confidence": "low",
 "notes": "Reverse-side print, badly faded; only 'Auditorium 5' legible.",
 "file": "t047.jpg", "source": "scan-2026-01-14.pdf", "page": 47,
 "w": 1404, "h": 1711,
 "theater_short": null,
 "aud": "Aud 5"
}
```

# Turning a shoebox into data.js

This is the long part, and it is the part a coding agent with vision is
genuinely good at — far better than OCR, because reading a ticket is
reasoning, not character recognition. A box-office printer will hand
you `LARA CROFT: THE CRA` and a July 2003 date; no amount of text
extraction turns that into *Lara Croft Tomb Raider: The Cradle of
Life*, but knowing that exactly one Lara Croft film opened that summer
does it in one step.

## The loop

1. Scan or photograph every stub into `images/`.
2. `python tools/make-thumbs.py`
3. `python tools/scaffold-data.py` → `data.new.js`, with `file`, `w`,
   `h`, `id` and `page` already filled in and everything else `null`.
4. Work through it in batches of ten or twenty, looking at each scan
   and filling in the record. Rename over `data.js` when done.
5. `node tools/fetch-posters.mjs` — pulls the poster art for every
   title the marquee will hang, into `posters/`. Re-run it after any
   batch that adds or renames a title; it only fetches what is new.
6. Open the page. Anything you got wrong is extremely visible: undated
   tickets pile up at the end of the walk, and a wrong `showtime` puts
   a matinee under a midnight sky.

## A prompt that works

> Here are ten ticket scans and their empty records from `data.js`.
> For each one, read the ticket and fill in the record.
>
> - `title_raw` is exactly what is printed, truncation and all.
> - `title` is the actual film. Use the date, the venue and the
>   truncated string together to identify it; a title cut off at 20
>   characters plus a release window is usually decisive.
> - `date` is ISO. If the printed date is illegible, check the
>   transaction stamp at the foot of the ticket — it is often clearer,
>   and it is the same day.
> - `year` is the year of the ticket, not of the film.
> - `showtime` like `7:15pm`. Distinguish the showtime from the
>   transaction time; they are usually minutes apart and the showtime
>   is the round one.
> - `confidence`: `high` only if you can read it; `medium` if you
>   inferred it; `low` if you are guessing. Say which in `notes`.
> - Never invent a date to fill the field. `null` is a correct answer
>   and the page handles it.

Then check its work on a sample. An agent that is guessing will tell
you so in `notes` if you ask it to; one that has been told to always
produce a value will quietly make things up.

---

## What makes this hard

**Titles are truncated to fit the roll.** `THE CRA`, `TALLADEGA`,
`BUTTON`, `PURSUIT OF`. Keep the truncation in `title_raw` — it is
evidence, and it is part of what the paper looks like.

**Titles get mangled, not just cut.** `SUBSTANCE, TAD CC` is *The
Substance*, with the article moved to the end and a closed-caption tag
stuck on. Tags like `CC`, `DV`, `3D`, `DLP`, `35MM`, `IMAX` are not
part of the name — put them in `format`.

**Half of a stub is often the back.** Thermal print bleeds through, so
a scan of the reverse shows the text mirrored and faint. Flip it
horizontally and raise the contrast and it usually reads. Watch for
mistaking the day for the month: a stamp partly hidden behind an ink
overprint can leave `4/2009` visible out of `3/4/2009`.

**The rating line is a strong hint.** A `PG` next to an illegible title
rules out most of the candidates for that week.

**A film's release date bounds the ticket date.** If your reading says
a film was seen two years before it opened, the reading is wrong —
usually the date, not the title. This catches real errors: it is how a
`2006-07-29` on an X-Files stub turned out to be `2008-07-25`.

**The owner beats the paper.** Whoever kept these tickets remembers
things no scan contains — which cinema was down the road, who they went
with, which stub is the duplicate. When they contradict your reading,
they are right; record how the record was arrived at in `notes`.

---

## Runtimes

`runtimes.js` maps `"title|year of the ticket"` to minutes. It only
affects what time the bedroom clock reads — showtime plus runtime plus
half an hour for the drive home. Anything missing falls back to two
hours, so fill it in for the films you care about and ignore the rest.

## Captions

Do these last, in the page itself, at `captions.html`. They are not
transcription — they are the only part of the whole exercise that is
not recoverable from the paper, and the only part that makes it yours
rather than a database. One line per night, in your own words:
who you went with, what happened, why that one stuck.

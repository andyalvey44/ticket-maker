# ticket-maker

Internal tool for the Comedy Castle office. It replaces the manual Adobe
Express process: read the club's upcoming shows, check them over, and produce
a folder of print-ready ticket PDFs.

The office workflow is **Get Shows → Review → Create Tickets**, run about once
a week. Users are non-technical, so the app is one page with no navigation, no
settings, and one obvious final button.

## Two pages

- `/` — public front door (`index.html` + `public/home.css`). Static, no
  JavaScript. Says what the tool is and who it belongs to, for visitors
  arriving from elsewhere.
- `/app` — the tool itself (`app.html` + React). Where staff work.

## Running it

```
npm install
npm run dev
```

`npm run dev` also serves `/api/shows`. `npm run preview` does not — it only
serves the built front end, so the Get buttons will not work there.

## How it works

1. **Get This Week's Shows** / **Get Next 4 Weeks** calls `/api/shows`, which
   reads comedycastle.com on the server and returns every upcoming
   performance. Browsers are not allowed to read another site directly, which
   is the only reason a server piece exists at all.
2. The shows appear in a review list. Each one can be changed or removed.
3. **Create Tickets** builds one PDF per show and downloads them as a single
   zip named after the folder, e.g. `Tickets - Week of Aug 26.zip`. The
   employee extracts it and copies the folder to the ticket window computer.
4. **Just this ticket** on any row re-makes that one show's ticket, for when a
   single show changes after the batch was made.

There is no database, no login and no scheduler. Nothing is stored between
visits except the print alignment nudge, which lives in the browser.

## Reading the club's schedule

`api/parseEvents.ts` parses the events page. The site is WordPress running the
RHP events plugin, and everything is server-rendered, so parsing is
deterministic — no browser automation and no AI guessing at names or times.
There is no REST or iCal feed; both were checked and are switched off.

Two kinds of entry appear on the page:

- **One-off shows** carry their own date, time and price.
- **A headliner playing several nights** is one "series" entry containing a
  full performance listing. Each night in that listing becomes its own ticket
  record, because each one needs its own ticket.

The page renders the whole list twice, once for phones and once for wider
screens, so repeats are dropped. Days the club is closed are listed as events
titled `CLOSED: …` and are excluded.

Age restrictions come from the site when it states them and default to 18+.
A few shows are listed with no price; those are flagged in the review list and
block ticket creation until someone fills them in.

## Ticket specification

Taken from the two reference PDFs and the photo of a printed ticket in
`reference/`, which together are the target specification. They live outside
`public/` so they are not published on the live site.

### Page size

Both reference PDFs are `899.25 x 327 pt`, made in Adobe Express. Generated
tickets use that page box **exactly**, so the office's existing "Concert
Ticket" print setting places them on the stock the same way it always has.
The inch measurements below are for understanding the design; nothing in the
generator depends on them.

### Where the page lands on the stock

Measured from the photo of a real printed ticket, page unit `p` lands at:

```
inches across the stock = 0.005701 * p + 0.0396
```

That was fixed by matching the printed headliner against the same text in the
reference PDF, then checked against the printed price, which agreed to within
four pixels of a 227 pixel-per-inch photo.

So the printed page covers about `0.04"` to `5.17"` of the 5.375" stock.

### Ticket zones

The physical stock, confirmed against the photo:

```
0.0000 - 1.0000   orange band
1.0000 - 3.9375   white information area   -> page units 168.5 - 687
3.9375 - 4.8125   orange band
4.8125 - 5.3750   white strip
```

Note for anyone working from the original brief: that last strip is **not**
dead space. The printed `+18` sits across the boundary between the second
orange band and this strip, and so does the tail of the price. Price and age
genuinely do belong over the orange, as the brief said — there is not enough
room in the white strip for either at ticket size.

### Element positions

In page units, y measured up from the bottom. Both references agree on every
number here.

| Element | Position |
| --- | --- |
| Background | white, full page |
| Logo | x 317.3795, y 246.4035, 264.4845 x 58.2762 |
| Headliner | centred on the logo axis 449.62, baseline y 191.148 |
| Day and date | centred on the logo axis 449.62, baseline y 155.117 |
| Show time | centred on the logo axis 449.62, baseline y 119.119 |
| Price | centred on x 814.3, baseline y 39.05, size 26.804 |
| Age | centred on x 814.3, baseline y 283.847, size 30.3224 |

Adobe put the text block on x 481.5 and the age on x 843.7. Both were moved:
the text now shares the logo's axis, and the age shares the price's, so each
group reads as one centred stack. The baselines and sizes are Adobe's.

The centring axes were solved from the reference coordinates using real font
metrics: all six main-block lines across both files agree on 481.5 within
0.7 units, and both prices agree on 814.3 exactly. Generated output matches
the reference to under a quarter of a page unit on every element.

Moving the text onto the logo axis also widens the room a centred line has,
from 411 to 475 units, so fewer dates need shrinking.

### One deliberate difference

Adobe let a long date run onto the orange band — `WEDNESDAY, SEPTEMBER 30,
2026` would overflow by about 0.6", and the printed ticket in `public/` shows
`SUNDAY, AUGUST 23, 2026` already crossing the boundary by 0.15".

The generator shrinks a line that would not fit inside the white information
area, down to 60% at the most. Most dates end up slightly smaller than the
headliner; none of them touch the orange.

### Typography

- Font: **Ultra Regular**, taken out of the reference PDF itself, so it is the
  same bytes the office's tickets already use. `scripts/extract-reference-assets.cjs`
  regenerates the logo from the same source.
  The extracted file had its tables packed with no padding, as PDF embedders do;
  browsers reject that, so `scripts/repack-ticket-font.cjs` realigned them to
  4-byte boundaries. Glyph, metric and cmap bytes are untouched — it is still the
  same typeface, and generated PDFs are byte-identical. Run it again if the font
  is ever re-extracted.
- Size: 30.02 for the main block.
- Main block is pure black. Price and age are `#02191C`.

### Text formats

| Field | Ticket text |
| --- | --- |
| Headliner | `BIG JAY OAKERSON` — all caps |
| Day and date | `SATURDAY, AUGUST 22, 2026` — all caps, year included |
| Show time | `9:30PM` — no space, uppercase |
| Age | `+18` — the sign comes first |
| Price | `$5`, `$26-$31` — a range is normal, so price is free text |

An all-ages show prints no age line, since there is nothing to restrict.

### Lining up on the printer

"Printing not lining up on the ticket?" on the main page moves everything in
steps of about 0.03", and remembers the setting on that computer. It exists so
the office can correct a drifting printer without a code change. All the
geometry is in `src/ticket/geometry.ts` if a real change is needed.

## Deployment

GitHub to Vercel. Vite builds the front end; `api/shows.ts` becomes a
serverless function. The office uses a bookmarked URL on 2-3 computers, so
updates ship remotely.

## How it is meant to behave

`.claude/PRODUCT-NOTES.md` is the running record of real-world office
behaviour — scenarios from the office, every decision made and why, and the
questions still open. Read it before changing how anything works; where it and
the code disagree, it wins.

## Still to do

- A test print, to confirm the page really does sit where the photo says.
- Whether shrinking long dates is the right call, or the office would rather
  keep them full size and overlapping as they are today.

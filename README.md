# ticket-maker

Internal tool for the Comedy Castle office. Replaces the manual Adobe Express
process for making show tickets.

The office workflow is: **Get Shows → Review → Create Tickets**, run about once
a week. Users are non-technical, so the app is one page with no navigation,
no settings, and one obvious final button.

## Running it

```
npm install
npm run dev
```

## Where the project is

- [x] **1. Office UI with mock show data** — done
- [ ] **2. Confirm the workflow reads clearly to office staff**
- [ ] 3. Real Comedy Castle event extraction
- [ ] 4. One generated ticket PDF
- [ ] 5. Compare against the reference PDFs
- [ ] 6. Batch generation
- [ ] 7. Regenerate a single show
- [ ] 8. Print geometry, typography, alignment

Current code: `src/App.tsx` (page), `src/ShowRow.tsx` (one show, view + edit),
`src/shows.ts` (types, mock schedule, formatting). Mock data is generated
forward from today, so the list is always upcoming.

## Ticket specification

Taken from the two reference PDFs in `public/`, which are real office output
and are the target specification.

### Page

Both reference PDFs are `899.25 x 327 pt`, produced by Adobe Express. That is
an exact **2.75:1** ratio and does *not* map to the full 5.375" ticket width.

The page corresponds to the ticket **minus the dead space** on the right:

```
page width  = 4.8125"   (left edge through the end of the right orange band)
page height = 1.7500"   (4.8125 / 2.75, exactly)
```

Four independent checks agree with this reading, and none agree with mapping
the page to the full 5.375":

| Check | Under 4.8125" | Under 5.375" |
| --- | --- | --- |
| Ticket height | 1.7500" exactly | 1.9545" |
| Text centre axis | 2.467" — white-area centre is 2.4688" | 2.756" — 0.29" off |
| "+18" x position | 4.358" — inside right orange band | 4.867" — in dead space |
| Price x position | 4.030" — inside right orange band | 4.501" — in dead space |

Confirm with one test print before treating it as final.

### Ticket zones (physical stock, 5.375" wide)

```
0.0000 - 1.0000   left orange band
1.0000 - 3.9375   white information area   (centre 2.4688")
3.9375 - 4.8125   right orange band
4.8125 - 5.3750   dead space               (outside the generated page)
```

### Element positions

Measured from the reference PDFs and converted to inches on a
4.8125" x 1.75" page. Y is from the bottom edge.

| Element | Position |
| --- | --- |
| Background | white, full page |
| Logo | x 1.6985 - 3.1140, y 1.3187 - 1.6306 (identical in both references) |
| Headliner | baseline y 1.0230, centred |
| Day and date | baseline y 0.8301, centred |
| Show time | baseline y 0.6375, centred |
| Age | x 4.3579, baseline y 1.5191 (identical in both references) |
| Price | x ~4.030, baseline y ~0.209 |

Line spacing in the centred block is 1.2 em. The three baselines are fixed
across both references — only the x changes, because Adobe centred each line
individually.

The logo is centred on the page at 2.406", which is 0.063" left of the white
area's true centre. The text block is centred at ~2.467", which is correct.
Centre everything on the white area rather than copying the logo's offset.

### Typography

- Font: **Ultra Regular** throughout — a free Google Font, so it can be
  embedded directly.
- Size: 30.02 pt on the reference page = **11.57 pt** at final ticket scale.
- Price size was hand-tweaked per ticket in Adobe (26.8 and 27.8 pt); pick one
  size and centre it in the band.
- Main block: pure black. Price and age: `#02191C`.

### Text formats

Copy these exactly — they are what the references print:

| Field | Ticket text |
| --- | --- |
| Headliner | `BIG JAY OAKERSON`, `OPEN MIC NIGHT` — all caps |
| Day and date | `SATURDAY, AUGUST 22, 2026` — all caps, year included |
| Show time | `9:30PM` — no space, uppercase |
| Age | `+18` — note the sign comes **first** |
| Price | `$5`, `$35-$40` — a range is normal, so price is free text |

The app's own UI says "18+" because that is how the office says it. The
`+18` form is a ticket-rendering detail.

### Logo asset

`public/comedycastlelogo.png` is 394x100 (aspect 3.94). The logo embedded in
the reference tickets is 708x156 (aspect 4.54) — a different crop. Extract the
embedded image from a reference PDF when building the generator.

## Deployment

GitHub to Vercel. The office uses a bookmarked URL on 2-3 computers, so
updates ship remotely. No auth, no database, no scheduler.

# ticket-maker — product notes

The shared record between Andy and Claude for how this tool is meant to behave
in the real office. Andy writes scenarios and rules. Claude writes down every
decision it makes and why.

**Read this before changing behaviour. Where this file and the code disagree,
this file wins** — say so, then fix the code.

---

## For Andy

Add anything to **Notes from Andy** below, in whatever words come naturally.
Half a sentence is fine. The useful ones sound like real life:

- "Sometimes a comic gets added on the Thursday for that same weekend."
- "Denise prints the whole weekend at once, never one show at a time."
- "If the website says 'at the door' we still just print $5."

Rough beats tidy. The real behaviour is what matters, not the phrasing.

If something replaces an earlier note, strike the old line
(`~~like this~~`) rather than deleting it, so the reason for the change stays
visible.

## For Claude

- Read this whole file before changing how anything works.
- Every time you make a call the user did not explicitly specify, add a row to
  **Decision log** with the date, what you chose, and why. Cite the note or
  scenario that drove it where there is one.
- When a note from Andy contradicts something in the log, do not quietly
  reconcile it. Say which decision is being overturned, change the code, and
  strike the old row with a pointer to the new one.
- If you are unsure, add it to **Open questions** instead of guessing. Say in
  chat what you assumed in the meantime.
- Keep the reasons in this file. Anyone can read the code to see *what* it
  does; this is the only record of *why*.

---

## Notes from Andy

<!-- Newest at the top. -->

- **10-23** (said in chat) — A show with no price must not stop the printing.
  Keep the red "Needs a price", and when they click to make the tickets, pop
  up a message saying some tickets have no price because the website listed
  none. Offer to go back and add the missing prices, or continue anyway.

---

## Decision log

Newest at the top. Everything below was decided during the initial build
(2026-08-23 to 2026-08-24) unless noted.

| Date | Decision | Why |
| --- | --- | --- |
| 10-23 | A missing price no longer blocks. Create Tickets asks first, naming each unpriced show by date and time, then either goes back or makes the tickets with the price left blank | Andy's 10-23 note. **Overturns the 08-24 "blocks Create Tickets" row.** Shows are listed with their date because a run of nights repeats the same name |
| 10-23 | Just this ticket asks the same question | Andy said printing should not be stopped; the single-ticket button had the same block, so it gets the same treatment |
| 10-23 | "Go back" is the highlighted, pre-selected choice, and Esc counts as going back | An accidental Enter or Esc should cost nothing. Continuing is one deliberate click |
| 10-23 | Going back scrolls to the first unpriced show and puts the cursor on its Change button | The list can run to 20+ shows over four weeks, and the button that starts the fix is the one they need |
| 10-23 | The question is an in-page box, not the browser's own pop-up | The browser's version can only say OK and Cancel; non-technical users need the buttons to say what they do |
| 08-24 | Home page drawing bumps the whole centre block (logo and all three lines) one nudge step left, to 47.9% | Andy: the centre info should sit in the white completely. On the stock the date is shrunk to fill the white area exactly, so it lands hard against the orange — and the office sees the same in the room because the template paper sits shifted. The logo moves with the lines so the two keep sharing one axis. Measured clearance in the drawing is 0.02"; the age and price did not move, and the printed axis is unchanged |
| 08-24 | Ticket font repacked so its tables start on 4-byte boundaries (`scripts/repack-ticket-font.cjs`) | The font was lifted out of the reference PDF, and PDF embedders pack tables with no padding. Chrome's sanitiser rejected the whole file — "OTS parsing error: cvt : misaligned table" — so the home page had been silently falling back to a plain serif and looked nothing like a ticket. Only table positions and checksums changed; every table's bytes are identical and three sample tickets generate byte-identical PDFs |
| 08-24 | Home page drawing centres age and price on the orange band (81.4%), not on the printed axis (87.11%) | Andy: the right-most info looked misaligned. On the real stock both lines genuinely sit half on the orange and half on the white strip past it — confirmed against the ticket photo — but on a drawing that just reads as a mistake. **The one place the drawing departs from the print.** The printed axis is unchanged |
| 08-24 | Centre block moved onto the logo's axis (481.5 -> 449.6, 0.18" left) | Andy: centre info should be bumped left and sit under the logo. Derived from `LOGO.x + LOGO.width / 2` so the two cannot drift apart |
| 08-24 | Price and age share one axis (814.3) | Andy: they should be centre-justified with each other. Adobe had age 0.17" right of price |
| 08-24 | Date lines now print larger as a side effect | Centring under the logo gains 64 units of room, so less shrinking — one common date now fits at full size |
| 08-24 | Home page ticket drawing positioned from measured geometry, not by eye | First version put age and price off the edge of the drawing; every position is now a share of the 5⅜" stock derived from the reference tickets |
| 08-24 | The drawing shows the real logo image, not the name set in type | The club logo is handwritten script; setting it in the ticket face was wrong |
| 08-24 | The drawing reproduces the centre block sitting right of true centre, and the date shrunk | It shows what the tool actually prints rather than an idealised ticket |
| 08-24 | Ticket logo moved to `public/ticket-logo.png` | One copy feeds both the PDF generator and the front page |
| 08-24 | Public home page at `/`, the tool moved to `/app` | Bio-site and company links land on the root; done before launch so no staff bookmark breaks |
| 08-24 | Home page is static HTML, no React, no JavaScript | 7 KB for a visitor; the 200 KB app bundle only loads for staff at `/app` |
| 08-24 | Home page states plainly that it is private with no sign-up | Visitors arrive from a portfolio and from the club, and should not think it is a product |
| 08-24 | Home page headline set in the ticket's own typeface | Ties the page to the physical object rather than looking like a generic landing page |
| 08-24 | Reference PDFs and the ticket photo moved to `reference/` | They were in `public/`, so they would have been published on the live site |
| 08-24 | Home CSS and the ticket font served from `public/` | Vite serves a linked `src` stylesheet as JS in dev — the page would have been unstyled during `npm run dev` |
| 08-24 | Favicon is a concert ticket in the stock's own orange | Replaces the Vite default; the tab should show what the tool makes |
| 08-24 | The tracking file lives in `.claude/`, and root `CLAUDE.md` points at it | Andy asked for `.claude/`; the root pointer is what a new session actually loads on its own |
| 08-24 | Show times offered in 15-minute steps, 4:00 PM to 11:45 PM | Andy's instruction; real times include 7:15 and 9:45 |
| 08-24 | Long date lines shrink to fit the white area, 60% floor | Adobe let them run onto the orange band — up to 0.6" on a long date. **The one deliberate departure from the reference tickets.** See open question A |
| 08-24 | Ticket prints `+18`; the screen says `18+` | `+18` is what the real tickets show; `18+` is how the office says it out loud |
| 08-24 | An all-ages show prints no age line | Nothing to restrict. See open question C |
| 08-24 | Generated page uses the Adobe page box exactly (899.25 × 327) | Guarantees the existing Concert Ticket print setting behaves identically |
| 08-24 | Font and logo extracted from the office's own reference PDF | Same bytes the current tickets use — no download, no licensing question, exact match |
| 08-24 | Price and age centred on axes solved from the reference, not on the bands | Both reference PDFs agree exactly; reproduces current output |
| 08-24 | Multi-night runs split into one ticket per performance | The website lists a weekend as one entry; each performance needs its own ticket |
| 08-24 | `CLOSED:` events filtered out | Holidays sit in the website's list like any other event |
| ~~08-24~~ | ~~A show with no price blocks Create Tickets~~ | ~~A priceless ticket is a wasted print run. 4 such shows listed right now~~ — overturned 10-23 by Andy's note: it now asks instead |
| 08-24 | Output is one PDF per show, zipped, zip named like the folder | The window prints a stack per show; extracting gives exactly the folder to copy |
| 08-24 | Ticket files numbered `01 -`, `02 -` … | Keeps the folder in show order in Windows Explorer |
| 08-24 | Scraping the events page, not an API | No feed exists — checked the calendar plugin API, the WordPress events endpoint, iCal export, and all 23 published namespaces |
| 08-24 | Deterministic parsing, no AI anywhere in the running app | Andy's instruction: exact data, never inferred. A wrong name on a printed ticket is worse than a loud failure |
| 08-24 | Print alignment nudge saved in the browser, per computer | Lets the office correct a drifting printer with no code change |
| 08-23 | Price is free text, not a number | Real tickets print ranges like `$35-$40` |
| 08-23 | Age defaults to 18+ everywhere | ~9 of 10 shows are 18+; nobody should have to type it |
| 08-23 | Re-clicking a Get button asks before replacing the list | Silently discarding someone's edits is the worst thing this app could do |
| 08-23 | Two buttons only: this week, next 4 weeks | Matches the once-a-week Monday habit |
| 08-23 | Nothing stored between visits except the nudge | No database, no logins, no cleanup |

---

## Open questions

Answering one of these changes what gets built, so they are worth more than
they look.

| # | Question | Doing in the meantime |
| --- | --- | --- |
| A | Long dates: shrink to fit, or keep full size and let them run onto the orange as they do today? | Shrinking, 60% floor — but less often since the block moved under the logo |
| B | Does a test print actually land correctly on the stock? | Untested — measured off the ticket photo, never printed |
| C | Should an all-ages show print something instead of nothing? | Prints nothing |
| D | Are matinees or afternoon shows ever a thing? | Time list runs 4:00 PM to 11:45 PM only |
| E | When the website has no price, is there a house rule, or does someone always know it? | Asks before making them; they can add a price or print it blank (since 10-23) |
| F | How many of each ticket does the window print? Does that ever need to be on screen? | Not tracked at all |
| G | Does anyone besides the one employee ever run this? | Assumes one person, one computer |

---

## Known about the real world

Gathered so far. Correct anything wrong — some of this was inferred rather than
told.

- Tickets are made about once a week, usually Monday.
- One employee makes them, puts them in a folder, and moves that folder to the
  ticket window computer. The window prints from there.
- The developer is remote and not in the office during the week.
- Users are non-technical; one has needed help with double-clicking a file.
- Roughly 2–3 office computers, so the app is a bookmarked web link.
- Shows are cancelled, moved and rescheduled often — sometimes after tickets
  were already made.
- The club's website is the source of truth for what is playing.
- The website currently lists 101 upcoming performances, 4 with no price.
- Printing uses an existing Windows printer setting named **Concert Ticket**.
  That must keep working; it is not being changed.

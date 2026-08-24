import * as cheerio from 'cheerio'

/** One performance as the Comedy Castle website lists it. */
export type SiteShow = {
  headliner: string
  /** Local calendar date, "YYYY-MM-DD". */
  date: string
  /** Display time, e.g. "7:30 PM". */
  time: string
  /** Printed as written, e.g. "$5" or "$26-$31". */
  price: string
  /** "18+", "21+" or "All Ages". */
  age: string
  sourceUrl: string
}

const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
}

const tidy = (text: string) => text.replace(/\s+/g, ' ').trim()

/**
 * The site prints dates without a year ("Wed, Aug 26"); the year comes from the
 * "August 2026" heading above. A run that crosses New Year lands in the next one.
 */
function toDate(text: string, headingYear: number, headingMonth: number): string | null {
  const match = /([A-Za-z]{3,})\.?\s+(\d{1,2})/.exec(text.replace(/^[A-Za-z]{3,},\s*/i, ''))
  if (!match) return null
  const month = MONTHS[match[1].slice(0, 3).toLowerCase()]
  if (!month) return null
  const year = month < headingMonth - 6 ? headingYear + 1 : headingYear
  return `${year}-${String(month).padStart(2, '0')}-${String(Number(match[2])).padStart(2, '0')}`
}

/** "Show | 7:30 pm" -> "7:30 PM", "Show | 7 pm" -> "7:00 PM". Doors times are skipped. */
function toTime(text: string): string | null {
  const showPart = /show\s*\|?\s*([^|]+)/i.exec(text)
  const match = /(\d{1,2})(?::(\d{2}))?\s*([ap])\.?m\.?/i.exec(showPart ? showPart[1] : text)
  if (!match) return null
  return `${Number(match[1])}:${match[2] ?? '00'} ${match[3].toUpperCase()}M`
}

/** "$5 at the door" -> "$5"; "$26 - $31" -> "$26-$31". */
function toPrice(text: string): string {
  const amounts = text.match(/\$\s?\d+(?:\.\d{2})?/g)
  if (!amounts) return ''
  const clean = amounts.map((a) => a.replace(/\s/g, ''))
  const low = clean[0]
  const high = clean[clean.length - 1]
  return low === high ? low : `${low}-${high}`
}

/** "Ages 18 and up" -> "18+". Shows are 18+ unless the site says otherwise. */
function toAge(text: string): string {
  const match = /(\d{2})\s*(?:and up|\+)/i.exec(text)
  if (match) return `${match[1]}+`
  if (/all ages/i.test(text)) return 'All Ages'
  return '18+'
}

/** Days the club is closed are listed as events but are not shows. */
function isRealShow(title: string): boolean {
  return title.length > 0 && !/^closed\b/i.test(title)
}

/**
 * Pull every performance out of a comedycastle.com events page.
 *
 * Two kinds of entry appear. A one-off show carries its own date, time and
 * price. A headliner playing several nights is one "series" entry holding a
 * full performance listing — each of those nights becomes its own record,
 * because each one needs its own ticket.
 *
 * The page renders the whole list twice, once for phones and once for wider
 * screens, so repeats are dropped.
 */
export function parseEvents(html: string, fallbackYear: number): SiteShow[] {
  const $ = cheerio.load(html)
  const shows: SiteShow[] = []
  const seen = new Set<string>()
  let year = fallbackYear
  let month = 1

  const add = (show: SiteShow) => {
    const key = `${show.date} ${show.time} ${show.headliner.toLowerCase()}`
    if (seen.has(key)) return
    seen.add(key)
    shows.push(show)
  }

  $('.rhp-events-list-separator-month, .rhpSingleEvent, .rhpEventSeries').each((_, element) => {
    const node = $(element)

    if (node.hasClass('rhp-events-list-separator-month')) {
      const heading = /([A-Za-z]+)\s+(\d{4})/.exec(tidy(node.text()))
      if (heading) {
        month = MONTHS[heading[1].slice(0, 3).toLowerCase()] ?? month
        year = Number(heading[2])
      }
      return
    }

    const isSeries = node.hasClass('rhpEventSeries')
    const headliner = tidy(
      node.find(isSeries ? '.eventSeriesTitle a' : '#eventTitle h2, .rhp-event__title--list')
        .first()
        .text(),
    )
    if (!isRealShow(headliner)) return

    const sourceUrl = node.find('a.url').first().attr('href') ?? ''
    const age = toAge(tidy(node.find('.rhp-event__age-restriction--list').first().text()))

    if (!isSeries) {
      const date = toDate(tidy(node.find('.singleEventDate').first().text()), year, month)
      const time = toTime(tidy(node.find('.rhp-event__time-text--list').first().text()))
      if (!date || !time) return
      const price = toPrice(tidy(node.find('.rhp-event__cost-text--list').first().text()))
      add({ headliner, date, time, price, age, sourceUrl })
      return
    }

    const price = toPrice(tidy(node.find('.rhp-event-price').first().text()))
    node.find('li.rhp-event-series-individual').each((__, item) => {
      const performance = $(item)
      const date = toDate(tidy(performance.find('.rhp-event-series-date').text()), year, month)
      const time = toTime(tidy(performance.find('.rhp-event-series-time').text()))
      if (!date || !time) return
      add({ headliner, date, time, price, age, sourceUrl })
    })
  })

  return shows.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
}

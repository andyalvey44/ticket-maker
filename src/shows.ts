export type AgeRestriction = '18+' | '21+' | 'All Ages'

export type Show = {
  id: string
  headliner: string
  /** Local calendar date, "YYYY-MM-DD". */
  date: string
  /** Display time, e.g. "8:00 PM". */
  time: string
  /** Printed exactly as written, e.g. "$5" or "$35-$40". */
  price: string
  age: AgeRestriction
}

export const AGE_OPTIONS: AgeRestriction[] = ['18+', '21+', 'All Ages']

export const DEFAULT_AGE: AgeRestriction = '18+'

/** Show times in quarter-hour steps across the evening. */
export const TIME_OPTIONS = (() => {
  const times: string[] = []
  for (let minutes = 16 * 60; minutes <= 23 * 60 + 45; minutes += 15) {
    const hour = Math.floor(minutes / 60)
    const minute = minutes % 60
    times.push(`${hour > 12 ? hour - 12 : hour}:${String(minute).padStart(2, '0')} PM`)
  }
  return times
})()

// --- formatting -------------------------------------------------------------

const DAY_NAMES = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
]

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/** "2026-08-26" -> a Date in local time (avoids UTC shifting the day). */
export function parseDate(date: string): Date {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/** "Wednesday, August 26" */
export function formatDayAndDate(date: string): string {
  const d = parseDate(date)
  if (Number.isNaN(d.getTime())) return date
  return `${DAY_NAMES[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`
}

/** "10:15 PM" -> minutes since midnight, for sorting. */
function timeValue(time: string): number {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(time.trim())
  if (!match) return 0
  const hour = Number(match[1]) % 12
  const minutes = Number(match[2])
  const isPm = match[3].toUpperCase() === 'PM'
  return (isPm ? hour + 12 : hour) * 60 + minutes
}

/** Earliest show first, so an edited date lands back in the right place. */
export function sortShows(shows: Show[]): Show[] {
  return [...shows].sort(
    (a, b) =>
      a.date.localeCompare(b.date) || timeValue(a.time) - timeValue(b.time),
  )
}

// --- picking a date range ---------------------------------------------------

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function addDays(d: Date, days: number): Date {
  const copy = new Date(d)
  copy.setDate(copy.getDate() + days)
  return copy
}

function between(shows: Show[], first: Date, last: Date): Show[] {
  return shows.filter((show) => {
    const d = parseDate(show.date)
    return d >= first && d <= last
  })
}

/**
 * Everything still to come this week, counting the week as ending on Sunday.
 * Run on a quiet Sunday or Monday that can be empty, so it rolls on to the
 * following week rather than showing nothing.
 */
export function thisWeek(shows: Show[], from: Date = new Date()): Show[] {
  const today = startOfDay(from)
  const sunday = addDays(today, (7 - today.getDay()) % 7)
  const found = between(shows, today, sunday)
  if (found.length > 0) return found
  return between(shows, addDays(sunday, 1), addDays(sunday, 7))
}

/** The next four weeks from today. */
export function nextFourWeeks(shows: Show[], from: Date = new Date()): Show[] {
  const today = startOfDay(from)
  return between(shows, today, addDays(today, 27))
}

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

export const TIME_OPTIONS = [
  '6:30 PM',
  '7:00 PM',
  '7:30 PM',
  '8:00 PM',
  '8:30 PM',
  '9:00 PM',
  '9:30 PM',
  '10:00 PM',
  '10:15 PM',
  '10:30 PM',
]

// --- formatting -------------------------------------------------------------

const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

/** "2026-08-26" -> a Date in local time (avoids UTC shifting the day). */
function parseDate(date: string): Date {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function formatKey(d: Date): string {
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${month}-${day}`
}

/** "Wednesday, August 26" */
export function formatDayAndDate(date: string): string {
  const d = parseDate(date)
  if (Number.isNaN(d.getTime())) return date
  return `${DAY_NAMES[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`
}

// --- mock schedule ----------------------------------------------------------

type Slot = { dayOffset: number; time: string; price: string }

/** A typical Comedy Castle week: showcase midweek, headliner Thursday to Saturday. */
const WEEK_SLOTS: Slot[] = [
  { dayOffset: 0, time: '7:30 PM', price: '$5' }, // Wednesday
  { dayOffset: 1, time: '7:30 PM', price: '$25' }, // Thursday
  { dayOffset: 2, time: '7:30 PM', price: '$30-$35' }, // Friday
  { dayOffset: 2, time: '9:45 PM', price: '$30-$35' },
  { dayOffset: 3, time: '7:00 PM', price: '$35-$40' }, // Saturday
  { dayOffset: 3, time: '9:30 PM', price: '$35-$40' },
]

const HEADLINERS = [
  'Marcus Webb',
  'Rita Calloway',
  'Danny Perrone',
  'Simone Yates',
  'Terry Nakashima',
]

let idCounter = 0
function nextId(): string {
  idCounter += 1
  return `show-${idCounter}`
}

function addDays(d: Date, days: number): Date {
  const copy = new Date(d)
  copy.setDate(copy.getDate() + days)
  return copy
}

/** Whole weeks since the epoch, used to keep the mock lineup stable per week. */
function weekNumber(d: Date): number {
  const days = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000
  return Math.floor(days / 7)
}

/** The Wednesday on or before the given day (show weeks run Wednesday to Saturday). */
function showWeekStart(d: Date): Date {
  const offset = (d.getDay() - 3 + 7) % 7
  return addDays(d, -offset)
}

/**
 * Upcoming shows, grouped one week at a time, skipping anything already past.
 * Weeks with nothing left in them are dropped, so the first group is always
 * the next real week of shows.
 */
function upcomingWeeks(weeks: number, from: Date): Show[][] {
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate())
  const groups: Show[][] = []

  // Look a week further ahead than asked, so a spent week can be skipped.
  for (let week = 0; week <= weeks; week += 1) {
    const start = addDays(showWeekStart(today), week * 7)
    // Key the lineup to the calendar week, so the same week always shows the
    // same names no matter which day you ask on.
    const index = weekNumber(start)
    const headliner = HEADLINERS[index % HEADLINERS.length]

    const shows = WEEK_SLOTS.filter(
      (slot) => addDays(start, slot.dayOffset) >= today,
    ).map((slot) => ({
      id: nextId(),
      headliner: slot.dayOffset === 0 ? 'Open Mic Night' : headliner,
      date: formatKey(addDays(start, slot.dayOffset)),
      time: slot.time,
      price: slot.price,
      age: DEFAULT_AGE,
    }))

    if (shows.length > 0) groups.push(shows)
  }

  return groups.slice(0, weeks)
}

export function getThisWeeksShows(from: Date = new Date()): Show[] {
  return upcomingWeeks(1, from).flat()
}

export function getNextFourWeeksShows(from: Date = new Date()): Show[] {
  return upcomingWeeks(4, from).flat()
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

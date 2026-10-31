import type { Show } from '../shows'

const SHORT_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

function parts(date: string) {
  const [, month, day] = date.split('-').map(Number)
  return { month, day }
}

/** Windows rejects \ / : * ? " < > | in file names. */
function safe(text: string): string {
  return text.replace(/[:*?"<>|/\\]/g, '-').replace(/\s+/g, ' ').trim()
}

const twoDigits = (n: number) => String(n).padStart(2, '0')

/** "7:30 PM" -> "730", "10:15 PM" -> "1015". Every show is in the evening, so no PM. */
function fileTime(time: string): string {
  const match = /^(\d{1,2}):(\d{2})/.exec(time.trim())
  return match ? `${Number(match[1])}${match[2]}` : time
}

/**
 * "10.30.26 730 Matt Conn.pdf" — month, day, year, time, then the comedian or
 * show. Windows Explorer sorts the numbers by value, so the folder stays in
 * show order.
 */
export function ticketFileName(show: Show): string {
  const [year, month, day] = show.date.split('-').map(Number)
  const when = `${twoDigits(month)}.${twoDigits(day)}.${twoDigits(year % 100)}`
  return safe(`${when} ${fileTime(show.time)} ${show.headliner}`) + '.pdf'
}

/** "Tickets Oct 23 - Oct 25": the first and last show dates in the folder. */
export function folderName(shows: Show[]): string {
  if (shows.length === 0) return 'Tickets'
  const dates = shows.map((show) => show.date).sort()
  const short = (date: string) => {
    const { month, day } = parts(date)
    return `${SHORT_MONTHS[month - 1]} ${day}`
  }
  const first = short(dates[0])
  const last = short(dates[dates.length - 1])
  return first === last ? `Tickets ${first}` : `Tickets ${first} - ${last}`
}

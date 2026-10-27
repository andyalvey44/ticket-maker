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

/** "7:30 PM" -> "7.30PM", since Windows will not take the colon. */
function fileTime(time: string): string {
  return time.replace(':', '.').replace(/\s+/g, '').toUpperCase()
}

/**
 * "10.23 7.30PM Matt Conn.pdf" — month, day, time, then the comedian or show.
 * Windows Explorer sorts the numbers by value, so the folder stays in show order.
 */
export function ticketFileName(show: Show): string {
  const { month, day } = parts(show.date)
  const when = `${String(month).padStart(2, '0')}.${day}`
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

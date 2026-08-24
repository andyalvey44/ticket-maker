import type { Show } from '../shows'

const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const SHORT_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

function parts(date: string) {
  const [year, month, day] = date.split('-').map(Number)
  return { d: new Date(year, month - 1, day), day }
}

/** Windows rejects \ / : * ? " < > | in file names. */
function safe(text: string): string {
  return text.replace(/[:*?"<>|/\\]/g, '-').replace(/\s+/g, ' ').trim()
}

/** "01 - Sat Aug 29, 9-30 PM - Marcus Webb.pdf" — numbered so the folder stays in show order. */
export function ticketFileName(show: Show, index: number): string {
  const { d, day } = parts(show.date)
  const when = `${SHORT_DAYS[d.getDay()]} ${SHORT_MONTHS[d.getMonth()]} ${day}`
  const number = String(index + 1).padStart(2, '0')
  return safe(`${number} - ${when}, ${show.time} - ${show.headliner}`) + '.pdf'
}

/** "Tickets - Week of Aug 24" / "Tickets - Next 4 Weeks" */
export function folderName(shows: Show[], range: 'week' | 'fourWeeks'): string {
  if (shows.length === 0) return 'Tickets'
  if (range === 'fourWeeks') return 'Tickets - Next 4 Weeks'
  const { d, day } = parts(shows[0].date)
  return `Tickets - Week of ${SHORT_MONTHS[d.getMonth()]} ${day}`
}

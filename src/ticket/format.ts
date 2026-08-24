import type { Show } from '../shows'

const DAYS = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
]

const MONTHS = [
  'JANUARY',
  'FEBRUARY',
  'MARCH',
  'APRIL',
  'MAY',
  'JUNE',
  'JULY',
  'AUGUST',
  'SEPTEMBER',
  'OCTOBER',
  'NOVEMBER',
  'DECEMBER',
]

/** "2026-08-22" -> "SATURDAY, AUGUST 22, 2026", as the reference tickets print it. */
export function ticketDate(date: string): string {
  const [year, month, day] = date.split('-').map(Number)
  const d = new Date(year, month - 1, day)
  return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

/** "9:30 PM" -> "9:30PM" */
export function ticketTime(time: string): string {
  return time.replace(/\s+/g, '').toUpperCase()
}

/** "18+" -> "+18". An all-ages show has nothing to restrict, so it prints nothing. */
export function ticketAge(age: Show['age']): string {
  if (age === 'All Ages') return ''
  return '+' + age.replace('+', '')
}

export function ticketLines(show: Show) {
  return {
    headliner: show.headliner.toUpperCase(),
    date: ticketDate(show.date),
    time: ticketTime(show.time),
    price: show.price.trim(),
    age: ticketAge(show.age),
  }
}

import { NO_NUDGE, type Nudge } from './geometry'

const KEY = 'ticket-maker-nudge'

/** One click moves the printing about a thirtieth of an inch on the ticket. */
export const NUDGE_STEP = 5

/** Page units to inches on the printed stock, measured from a real ticket. */
const INCHES_PER_UNIT = 0.005701

export function nudgeInInches(units: number): string {
  return (Math.abs(units) * INCHES_PER_UNIT).toFixed(2)
}

export function describeNudge(nudge: Nudge): string {
  const moves: string[] = []
  if (nudge.x) moves.push(`${nudgeInInches(nudge.x)}" ${nudge.x > 0 ? 'right' : 'left'}`)
  if (nudge.y) moves.push(`${nudgeInInches(nudge.y)}" ${nudge.y > 0 ? 'up' : 'down'}`)
  return moves.join(' and ')
}

export function loadNudge(): Nudge {
  try {
    const saved = localStorage.getItem(KEY)
    if (!saved) return NO_NUDGE
    const parsed = JSON.parse(saved)
    if (typeof parsed?.x === 'number' && typeof parsed?.y === 'number') return parsed
  } catch {
    // A browser with storage switched off just starts from centre every time.
  }
  return NO_NUDGE
}

export function saveNudge(nudge: Nudge) {
  try {
    localStorage.setItem(KEY, JSON.stringify(nudge))
  } catch {
    // Not being able to remember the nudge is not worth interrupting anyone over.
  }
}

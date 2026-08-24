import type { TicketAssets } from './makeTicket'

/**
 * Both files are served as-is rather than bundled, because the front page
 * uses them too — its ticket drawing is set in the ticket's own face and
 * shows the same logo that gets printed.
 */
const FONT_URL = '/ticket-font.ttf'
const LOGO_URL = '/ticket-logo.png'

let cached: Promise<TicketAssets> | null = null

async function fetchBytes(url: string): Promise<Uint8Array> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Could not load ${url}`)
  return new Uint8Array(await response.arrayBuffer())
}

/** The logo and the ticket font, fetched once and reused. */
export function loadTicketAssets(): Promise<TicketAssets> {
  if (!cached) {
    cached = Promise.all([fetchBytes(FONT_URL), fetchBytes(LOGO_URL)])
      .then(([font, logo]) => ({ font, logo }))
      .catch((error) => {
        cached = null
        throw error
      })
  }
  return cached
}

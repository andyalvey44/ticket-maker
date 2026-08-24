import type { IncomingMessage, ServerResponse } from 'node:http'
import { parseEvents } from './parseEvents'

const EVENTS_URL = 'https://www.comedycastle.com/events/'

/**
 * Reads the Comedy Castle events page and hands back the upcoming performances.
 *
 * This runs on the server because a browser is not allowed to read another
 * site directly. The response is cached briefly so a few clicks in a row do
 * not hammer the club's website.
 */
export default async function handler(_req: IncomingMessage, res: ServerResponse) {
  res.setHeader('content-type', 'application/json; charset=utf-8')
  try {
    const response = await fetch(EVENTS_URL, {
      headers: { 'user-agent': 'ticket-maker (Comedy Castle office tool)' },
    })
    if (!response.ok) throw new Error(`Events page returned ${response.status}`)

    const shows = parseEvents(await response.text(), new Date().getFullYear())
    if (shows.length === 0) throw new Error('No performances found on the events page')

    res.setHeader('cache-control', 'public, max-age=0, s-maxage=300')
    res.end(JSON.stringify({ shows }))
  } catch (error) {
    console.error('Could not read the Comedy Castle events page:', error)
    res.statusCode = 502
    res.end(JSON.stringify({ error: 'Could not read the Comedy Castle website.' }))
  }
}

import type { Show } from '../shows'
import { loadTicketAssets } from './assets'
import { downloadFile } from './download'
import type { Nudge } from './geometry'
import { folderName, ticketFileName } from './naming'
import { makeZip } from './zip'

/** One PDF per show, zipped into a folder the office can copy to the ticket window. */
export async function createTicketsFolder(
  shows: Show[],
  range: 'week' | 'fourWeeks',
  nudge: Nudge,
): Promise<string> {
  // Loaded on demand so the page itself opens instantly on office machines.
  const { createTicketPdf } = await import('./makeTicket')
  const assets = await loadTicketAssets()
  const entries = []
  for (const [index, show] of shows.entries()) {
    entries.push({
      name: ticketFileName(show, index),
      data: await createTicketPdf(show, assets, nudge),
    })
  }
  const folder = folderName(shows, range)
  downloadFile(`${folder}.zip`, makeZip(entries), 'application/zip')
  return folder
}

/** Just one show's ticket, for when a single show changes after the batch was made. */
export async function createOneTicket(show: Show, nudge: Nudge): Promise<string> {
  const { createTicketPdf } = await import('./makeTicket')
  const assets = await loadTicketAssets()
  const name = ticketFileName(show, 0).replace(/^\d+ - /, '')
  downloadFile(name, await createTicketPdf(show, assets, nudge), 'application/pdf')
  return name
}

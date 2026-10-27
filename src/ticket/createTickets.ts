import type { Show } from '../shows'
import { loadTicketAssets } from './assets'
import { downloadFile } from './download'
import type { Nudge } from './geometry'
import { folderName, ticketFileName } from './naming'
import { makeZip } from './zip'

/** One PDF per show, zipped into a folder the office can copy to the ticket window. */
export async function createTicketsFolder(shows: Show[], nudge: Nudge): Promise<string> {
  // Loaded on demand so the page itself opens instantly on office machines.
  const { createTicketPdf } = await import('./makeTicket')
  const assets = await loadTicketAssets()
  const entries = []
  const taken = new Map<string, number>()
  for (const show of shows) {
    // Two identical shows would otherwise overwrite each other when extracted.
    const name = ticketFileName(show)
    const copies = (taken.get(name) ?? 0) + 1
    taken.set(name, copies)
    entries.push({
      name: copies === 1 ? name : name.replace(/\.pdf$/, ` (${copies}).pdf`),
      data: await createTicketPdf(show, assets, nudge),
    })
  }
  const folder = folderName(shows)
  downloadFile(`${folder}.zip`, makeZip(entries), 'application/zip')
  return folder
}

/** Just one show's ticket, for when a single show changes after the batch was made. */
export async function createOneTicket(show: Show, nudge: Nudge): Promise<string> {
  const { createTicketPdf } = await import('./makeTicket')
  const assets = await loadTicketAssets()
  const name = ticketFileName(show)
  downloadFile(name, await createTicketPdf(show, assets, nudge), 'application/pdf')
  return name
}

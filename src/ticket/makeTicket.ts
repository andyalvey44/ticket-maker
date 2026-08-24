import { PDFDocument, rgb, type PDFFont } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import type { Show } from '../shows'
import { ticketLines } from './format'
import {
  AGE,
  LOGO,
  MAIN,
  NO_NUDGE,
  PAGE,
  PRICE,
  SIDE_INK,
  WHITE_AREA,
  type Nudge,
} from './geometry'

export type TicketAssets = { font: Uint8Array; logo: Uint8Array }

/**
 * The largest size this line can use and still sit inside the white area.
 * Adobe's hand-built tickets let long dates run onto the orange band; shrinking
 * keeps them clear of it.
 */
function fittedSize(font: PDFFont, text: string, centreX: number): number {
  const room = Math.min(centreX - WHITE_AREA.left, WHITE_AREA.right - centreX) * 2
  const width = font.widthOfTextAtSize(text, MAIN.size)
  if (width <= room) return MAIN.size
  return Math.max(MAIN.size * MAIN.minScale, (MAIN.size * room) / width)
}

export async function createTicketPdf(
  show: Show,
  assets: TicketAssets,
  nudge: Nudge = NO_NUDGE,
): Promise<Uint8Array> {
  const line = ticketLines(show)

  const pdf = await PDFDocument.create()
  pdf.registerFontkit(fontkit)
  const font = await pdf.embedFont(assets.font, { subset: true })
  const logo = await pdf.embedPng(assets.logo)
  const page = pdf.addPage([PAGE.width, PAGE.height])

  const black = rgb(0, 0, 0)
  const side = rgb(SIDE_INK.r, SIDE_INK.g, SIDE_INK.b)

  page.drawRectangle({
    x: 0,
    y: 0,
    width: PAGE.width,
    height: PAGE.height,
    color: rgb(1, 1, 1),
  })

  page.drawImage(logo, {
    x: LOGO.x + nudge.x,
    y: LOGO.y + nudge.y,
    width: LOGO.width,
    height: LOGO.height,
  })

  const centred = (text: string, baseline: number, size: number, color = black) => {
    if (!text) return
    const width = font.widthOfTextAtSize(text, size)
    page.drawText(text, {
      x: MAIN.centreX - width / 2 + nudge.x,
      y: baseline + nudge.y,
      size,
      font,
      color,
    })
  }

  centred(line.headliner, MAIN.baselines.headliner, fittedSize(font, line.headliner, MAIN.centreX))
  centred(line.date, MAIN.baselines.date, fittedSize(font, line.date, MAIN.centreX))
  centred(line.time, MAIN.baselines.time, MAIN.size)

  for (const item of [
    { text: line.price, centreX: PRICE.centreX, y: PRICE.baseline, size: PRICE.size },
    { text: line.age, centreX: AGE.centreX, y: AGE.baseline, size: AGE.size },
  ]) {
    if (!item.text) continue
    const width = font.widthOfTextAtSize(item.text, item.size)
    page.drawText(item.text, {
      x: item.centreX - width / 2 + nudge.x,
      y: item.y + nudge.y,
      size: item.size,
      font,
      color: side,
    })
  }

  return pdf.save()
}

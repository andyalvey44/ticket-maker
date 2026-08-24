/**
 * Every measurement for the printed ticket lives in this one file.
 *
 * The numbers are in the same coordinate space as the office's existing
 * Adobe Express tickets (see the reference PDFs in `public/`). Generated
 * tickets use the identical page size, so the office's existing "Concert
 * Ticket" print setting lands them on the stock exactly as it does today.
 *
 * Y is measured up from the bottom edge, as PDFs do.
 */

/** Matches the reference PDFs exactly. Do not change without a test print. */
export const PAGE = { width: 899.25, height: 327 }

/**
 * The white information area of the physical ticket, in page units.
 *
 * The stock is 5.375" wide: orange to 1.0000", white to 3.9375", orange to
 * 4.8125", then a white strip to the edge. Printing lands page unit `p` at
 * `0.005701 * p + 0.0396` inches across the stock, measured from a photo of
 * a real printed ticket, so 1.0000" and 3.9375" fall here:
 */
export const WHITE_AREA = { left: 168.5, right: 687 }

/** Logo placement, copied exactly from both reference PDFs. */
export const LOGO = {
  x: 317.3795,
  y: 246.4035,
  width: 264.4845,
  height: 58.2762,
}

/**
 * Headliner, date and time. All three lines share one axis and sit on fixed
 * baselines — both references agree on the baselines.
 *
 * The axis is the centre of the logo, so the block reads as one centred stack.
 * Adobe had the text 0.18" to the right of the logo; lining them up also buys
 * room, so fewer dates need shrinking.
 */
export const MAIN = {
  centreX: LOGO.x + LOGO.width / 2,
  size: 30.0239,
  baselines: { headliner: 191.148, date: 155.117, time: 119.119 },
  /** A long date would otherwise run onto the orange band, so lines shrink to fit. */
  minScale: 0.6,
}

/**
 * Price and age share one axis so they line up with each other over the
 * right-hand band. Both reference PDFs put the price here exactly; Adobe had
 * the age sitting 0.17" further right.
 */
const SIDE_CENTRE_X = 814.3

/** Price, low in the right-hand band. */
export const PRICE = { centreX: SIDE_CENTRE_X, baseline: 39.05, size: 26.804 }

/** Age, high in the right-hand band. */
export const AGE = { centreX: SIDE_CENTRE_X, baseline: 283.847, size: 30.3224 }

/** Near-black, as the references use for the two side items. */
export const SIDE_INK = { r: 0.008, g: 0.102, b: 0.11 }

/** How far to shift everything, when the office needs it nudged on the stock. */
export type Nudge = { x: number; y: number }

export const NO_NUDGE: Nudge = { x: 0, y: 0 }

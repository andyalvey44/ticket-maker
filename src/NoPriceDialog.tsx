import { useEffect, useRef } from 'react'
import { formatDayAndDate, type Show } from './shows'

type Props = {
  /** The shows about to be made that have no price. */
  shows: Show[]
  onBack: () => void
  onContinue: () => void
}

/**
 * Asked before making tickets when some shows have no price. The website
 * leaves a few shows unpriced and those tickets can still go out, so this
 * warns rather than blocks.
 */
export default function NoPriceDialog({ shows, onBack, onContinue }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const choice = useRef<'back' | 'continue'>('back')

  useEffect(() => {
    if (!dialog.current?.open) dialog.current?.showModal()
  }, [])

  // Both buttons and the Esc key end here, once the dialog has closed.
  function finish(which: 'back' | 'continue') {
    choice.current = which
    dialog.current?.close()
  }

  const one = shows.length === 1

  return (
    <dialog
      ref={dialog}
      className="no-price"
      onClose={() => (choice.current === 'continue' ? onContinue() : onBack())}
    >
      <h2>{one ? 'This ticket has no price' : 'Some tickets have no price'}</h2>
      <p>
        The website did not list a price for {one ? 'this show' : 'these shows'}, so{' '}
        {one ? 'its ticket' : 'their tickets'} will print without one:
      </p>
      <ul>
        {shows.map((show) => (
          <li key={show.id}>
            <strong>{show.headliner}</strong>, {formatDayAndDate(show.date)} at {show.time}
          </li>
        ))}
      </ul>
      <p>To add a price, go back and click Change on the show.</p>
      <div className="dialog-actions">
        <button type="button" className="small save" autoFocus onClick={() => finish('back')}>
          {one ? 'Go back and add a price' : 'Go back and add prices'}
        </button>
        <button type="button" className="small" onClick={() => finish('continue')}>
          {one ? 'Continue without a price' : 'Continue without prices'}
        </button>
      </div>
    </dialog>
  )
}

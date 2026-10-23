import { useState } from 'react'
import NoPriceDialog from './NoPriceDialog'
import ShowRow from './ShowRow'
import { fetchShows } from './fetchShows'
import { nextFourWeeks, sortShows, thisWeek, type Show } from './shows'
import { createOneTicket, createTicketsFolder } from './ticket/createTickets'
import type { Nudge } from './ticket/geometry'
import { NUDGE_STEP, describeNudge, loadNudge, saveNudge } from './ticket/nudge'
import './App.css'

type Range = 'week' | 'fourWeeks'

const RANGES = {
  week: { title: "This Week's Shows", pick: thisWeek },
  fourWeeks: { title: 'Next 4 Weeks', pick: nextFourWeeks },
}

export default function App() {
  const [shows, setShows] = useState<Show[] | null>(null)
  const [range, setRange] = useState<Range>('week')
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [problem, setProblem] = useState('')
  const [nudge, setNudge] = useState<Nudge>(loadNudge)
  const [showNudge, setShowNudge] = useState(false)
  const [askNoPrice, setAskNoPrice] = useState<{ shows: Show[]; make: () => void } | null>(
    null,
  )

  const working = loading || busy
  const missingPrice = (shows ?? []).filter((show) => !show.price.trim())

  async function load(which: Range) {
    if (
      shows !== null &&
      !window.confirm('This replaces the list below. Get the shows again?')
    ) {
      return
    }
    setLoading(true)
    setNotice('')
    setProblem('')
    try {
      const upcoming = RANGES[which].pick(await fetchShows())
      setShows(sortShows(upcoming))
      setRange(which)
      if (upcoming.length === 0) {
        setProblem('The Comedy Castle website has no shows listed for those dates.')
      }
    } catch (error) {
      console.error(error)
      setProblem(
        'Could not get the shows from the Comedy Castle website. Please try again in a minute.',
      )
    } finally {
      setLoading(false)
    }
  }

  function updateShow(updated: Show) {
    setShows((current) =>
      sortShows(
        (current ?? []).map((show) => (show.id === updated.id ? updated : show)),
      ),
    )
    setNotice('')
    setProblem('')
  }

  function removeShow(id: string) {
    setShows((current) => (current ?? []).filter((show) => show.id !== id))
    setNotice('')
    setProblem('')
  }

  function moveNudge(x: number, y: number) {
    const next = { x: nudge.x + x, y: nudge.y + y }
    setNudge(next)
    saveNudge(next)
  }

  async function run(job: () => Promise<string>, done: (name: string) => string) {
    setBusy(true)
    setNotice('')
    setProblem('')
    try {
      setNotice(done(await job()))
    } catch (error) {
      console.error(error)
      setProblem('Something went wrong making the tickets. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  /** Make the tickets now, or ask first when some of them have no price. */
  function makeOrAsk(unpriced: Show[], make: () => void) {
    if (unpriced.length > 0) {
      setAskNoPrice({ shows: unpriced, make })
    } else {
      make()
    }
  }

  /** Back from the no-price question: bring the first unpriced show into view. */
  function showWhereToAddPrice(show: Show) {
    const change = document.querySelector<HTMLButtonElement>(
      `[data-show-id="${show.id}"] button.change`,
    )
    change?.scrollIntoView({ block: 'center' })
    change?.focus({ preventScroll: true })
  }

  function createTickets() {
    makeOrAsk(missingPrice, () =>
      run(
        () => createTicketsFolder(shows ?? [], range, nudge),
        (folder) =>
          `Your tickets are ready. Look in this computer's Downloads for ${folder}. Right-click it, choose Extract All, then copy the folder to the ticket window computer.`,
      ),
    )
  }

  const createOne = (show: Show) => {
    makeOrAsk(show.price.trim() ? [] : [show], () =>
      run(
        () => createOneTicket(show, nudge),
        (name) => `One ticket is ready: ${name}. It is in this computer's Downloads.`,
      ),
    )
  }

  return (
    <main>
      <header>
        <img src="/comedycastlelogo.png" alt="" className="logo" />
        <h1>Ticket Maker</h1>
        <p className="lead">Pick the shows you need tickets for.</p>
      </header>

      <div className="pick-buttons">
        <button type="button" disabled={working} onClick={() => load('week')}>
          Get This Week's Shows
        </button>
        <button type="button" disabled={working} onClick={() => load('fourWeeks')}>
          Get Next 4 Weeks
        </button>
      </div>

      {loading && <p className="count loading">Getting the shows…</p>}

      {shows !== null && !loading && (
        <section className="review">
          <h2>{RANGES[range].title}</h2>

          {shows.length === 0 ? (
            <p className="empty">
              No shows to make tickets for. Use a button above to look again.
            </p>
          ) : (
            <>
              <p className="count">
                {shows.length} {shows.length === 1 ? 'show' : 'shows'}. Check
                each one and fix anything that is wrong.
              </p>

              <ul className="show-list">
                {shows.map((show) => (
                  <ShowRow
                    key={show.id}
                    show={show}
                    busy={busy}
                    onChange={updateShow}
                    onRemove={removeShow}
                    onMakeOne={createOne}
                  />
                ))}
              </ul>

              <button
                type="button"
                className="create"
                disabled={busy}
                onClick={createTickets}
              >
                {busy ? 'Making tickets…' : 'Create Tickets'}
              </button>
            </>
          )}
        </section>
      )}

      {notice && <p className="notice done">{notice}</p>}
      {problem && <p className="notice problem">{problem}</p>}

      {askNoPrice && (
        <NoPriceDialog
          shows={askNoPrice.shows}
          onBack={() => {
            setAskNoPrice(null)
            showWhereToAddPrice(askNoPrice.shows[0])
          }}
          onContinue={() => {
            setAskNoPrice(null)
            askNoPrice.make()
          }}
        />
      )}

      {shows !== null && (
        <div className="fit">
          <button
            type="button"
            className="link"
            onClick={() => setShowNudge((open) => !open)}
          >
            Printing not lining up on the ticket?
          </button>

          {showNudge && (
            <div className="fit-panel">
              <p>
                Move the printing a little, then make the tickets again and try
                one on the printer.
              </p>
              <div className="arrows">
                <button type="button" onClick={() => moveNudge(0, NUDGE_STEP)}>
                  Up
                </button>
                <div>
                  <button type="button" onClick={() => moveNudge(-NUDGE_STEP, 0)}>
                    Left
                  </button>
                  <button type="button" onClick={() => moveNudge(NUDGE_STEP, 0)}>
                    Right
                  </button>
                </div>
                <button type="button" onClick={() => moveNudge(0, -NUDGE_STEP)}>
                  Down
                </button>
              </div>
              <p className="fit-state">
                {nudge.x === 0 && nudge.y === 0
                  ? 'Printing is where it has always been.'
                  : `Printing moved ${describeNudge(nudge)}.`}
              </p>
              {(nudge.x !== 0 || nudge.y !== 0) && (
                <button
                  type="button"
                  className="small"
                  onClick={() => {
                    setNudge({ x: 0, y: 0 })
                    saveNudge({ x: 0, y: 0 })
                  }}
                >
                  Put it back
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </main>
  )
}

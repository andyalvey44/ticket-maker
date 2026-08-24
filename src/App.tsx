import { useState } from 'react'
import ShowRow from './ShowRow'
import {
  getNextFourWeeksShows,
  getThisWeeksShows,
  sortShows,
  type Show,
} from './shows'
import './App.css'

export default function App() {
  const [shows, setShows] = useState<Show[] | null>(null)
  const [listTitle, setListTitle] = useState('')
  const [notice, setNotice] = useState('')

  function load(title: string, getShows: () => Show[]) {
    if (
      shows !== null &&
      !window.confirm('This replaces the list below. Get the shows again?')
    ) {
      return
    }
    setShows(sortShows(getShows()))
    setListTitle(title)
    setNotice('')
  }

  function updateShow(updated: Show) {
    setShows((current) =>
      sortShows(
        (current ?? []).map((show) => (show.id === updated.id ? updated : show)),
      ),
    )
    setNotice('')
  }

  function removeShow(id: string) {
    setShows((current) => (current ?? []).filter((show) => show.id !== id))
    setNotice('')
  }

  function createTickets() {
    setNotice(
      `Ticket printing is not turned on yet. When it is, this button will make tickets for all ${shows?.length} shows below.`,
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
        <button type="button" onClick={() => load("This Week's Shows", getThisWeeksShows)}>
          Get This Week's Shows
        </button>
        <button type="button" onClick={() => load('Next 4 Weeks', getNextFourWeeksShows)}>
          Get Next 4 Weeks
        </button>
      </div>

      {shows !== null && (
        <section className="review">
          <h2>{listTitle}</h2>

          {shows.length === 0 ? (
            <p className="empty">
              You removed every show. Use a button above to get the shows again.
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
                    onChange={updateShow}
                    onRemove={removeShow}
                  />
                ))}
              </ul>

              <button type="button" className="create" onClick={createTickets}>
                Create Tickets
              </button>
            </>
          )}

          {notice && <p className="notice">{notice}</p>}
        </section>
      )}
    </main>
  )
}

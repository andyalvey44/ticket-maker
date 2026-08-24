import { DEFAULT_AGE, sortShows, type AgeRestriction, type Show } from './shows'

type SiteShow = {
  headliner: string
  date: string
  time: string
  price: string
  age: string
}

function toAge(age: string): AgeRestriction {
  if (age === '21+') return '21+'
  if (age === 'All Ages') return 'All Ages'
  return DEFAULT_AGE
}

/** Every upcoming performance the Comedy Castle website is listing right now. */
export async function fetchShows(): Promise<Show[]> {
  const response = await fetch('/api/shows')
  const text = await response.text()

  // The screen only ever says "could not get the shows"; the detail goes to the
  // console so the cause is visible when this is looked at from outside the office.
  if (!response.ok) {
    console.error(`/api/shows returned ${response.status}`, text.slice(0, 400))
    throw new Error(`Shows request failed: ${response.status}`)
  }

  let body: { shows?: SiteShow[] }
  try {
    body = JSON.parse(text) as { shows?: SiteShow[] }
  } catch {
    // HTML here means the server never ran the shows endpoint at all.
    console.error('/api/shows did not return JSON:', text.slice(0, 400))
    throw new Error('Shows request did not return show data')
  }
  if (!body.shows) throw new Error('Shows request returned nothing usable')

  return sortShows(
    body.shows.map((show, index) => ({
      id: `show-${index}-${show.date}-${show.time}`,
      headliner: show.headliner,
      date: show.date,
      time: show.time,
      price: show.price,
      age: toAge(show.age),
    })),
  )
}

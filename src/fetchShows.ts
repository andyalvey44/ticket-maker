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
  if (!response.ok) throw new Error(`Shows request failed: ${response.status}`)

  const body = (await response.json()) as { shows?: SiteShow[] }
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

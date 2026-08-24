import { useState } from 'react'
import {
  AGE_OPTIONS,
  TIME_OPTIONS,
  formatDayAndDate,
  type Show,
} from './shows'

type Props = {
  show: Show
  busy: boolean
  onChange: (show: Show) => void
  onRemove: (id: string) => void
  onMakeOne: (show: Show) => void
}

export default function ShowRow({
  show,
  busy,
  onChange,
  onRemove,
  onMakeOne,
}: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(show)

  function startEditing() {
    setDraft(show)
    setEditing(true)
  }

  function save() {
    onChange({
      ...draft,
      headliner: draft.headliner.trim() || show.headliner,
      price: draft.price.trim() || show.price,
    })
    setEditing(false)
  }

  if (!editing) {
    return (
      <li className="show">
        <div className="show-details">
          <p className="show-headliner">{show.headliner}</p>
          <p className="show-when">
            {formatDayAndDate(show.date)} at {show.time}
          </p>
          <p className="show-extra">
            {show.price.trim() ? (
              show.price
            ) : (
              <span className="needs-price">Needs a price</span>
            )}{' '}
            &middot; {show.age}
          </p>
        </div>
        <div className="show-actions">
          <button
            type="button"
            className="small"
            disabled={busy}
            onClick={startEditing}
          >
            Change
          </button>
          <button
            type="button"
            className="small remove"
            disabled={busy}
            onClick={() => onRemove(show.id)}
          >
            Remove
          </button>
          <button
            type="button"
            className="small one"
            disabled={busy}
            onClick={() => onMakeOne(show)}
          >
            Just this ticket
          </button>
        </div>
      </li>
    )
  }

  return (
    <li className="show editing">
      <div className="fields">
        <label>
          Who is performing
          <input
            type="text"
            value={draft.headliner}
            onChange={(e) => setDraft({ ...draft, headliner: e.target.value })}
          />
        </label>

        <label>
          Date
          <input
            type="date"
            value={draft.date}
            onChange={(e) => setDraft({ ...draft, date: e.target.value })}
          />
        </label>

        <label>
          Show time
          <select
            value={draft.time}
            onChange={(e) => setDraft({ ...draft, time: e.target.value })}
          >
            {(TIME_OPTIONS.includes(draft.time)
              ? TIME_OPTIONS
              : [draft.time, ...TIME_OPTIONS]
            ).map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </label>

        <label>
          Price
          <input
            type="text"
            className="price-input"
            value={draft.price}
            onChange={(e) => setDraft({ ...draft, price: e.target.value })}
          />
        </label>

        <label>
          Age
          <select
            value={draft.age}
            onChange={(e) =>
              setDraft({ ...draft, age: e.target.value as Show['age'] })
            }
          >
            {AGE_OPTIONS.map((age) => (
              <option key={age} value={age}>
                {age}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="show-actions">
        <button type="button" className="small save" onClick={save}>
          Save
        </button>
        <button
          type="button"
          className="small"
          onClick={() => setEditing(false)}
        >
          Cancel
        </button>
      </div>
    </li>
  )
}

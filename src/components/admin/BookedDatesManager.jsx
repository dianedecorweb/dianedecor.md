'use client'

import { useRouter } from 'next/navigation'
import { CalendarPlus, Loader2, Trash2 } from 'lucide-react'
import { useState } from 'react'

const monthFormatter = new Intl.DateTimeFormat('ro-RO', { month: 'long', year: 'numeric', timeZone: 'UTC' })
const dayFormatter = new Intl.DateTimeFormat('ro-RO', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })

/** Adaugă și scoate zile ocupate. Lista vine de pe server, grupată pe luni. */
export default function BookedDatesManager({ dates, today, readOnly }) {
  const router = useRouter()
  const [date, setDate] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [removing, setRemoving] = useState(null)
  const [error, setError] = useState(null)

  const add = async (event) => {
    event.preventDefault()
    if (!date || busy) return
    setBusy(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/booked-dates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, note }),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok) throw new Error(result?.message ?? 'Salvarea a eșuat.')
      setDate('')
      setNote('')
      router.refresh()
    } catch (addError) {
      setError(addError.message)
    } finally {
      setBusy(false)
    }
  }

  const remove = async (id) => {
    setRemoving(id)
    setError(null)
    try {
      const response = await fetch(`/api/admin/booked-dates/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Ștergerea a eșuat.')
      router.refresh()
    } catch (removeError) {
      setError(removeError.message)
      setRemoving(null)
    }
  }

  const groups = []
  for (const entry of dates) {
    const label = monthFormatter.format(new Date(entry.date))
    const last = groups.at(-1)
    if (last?.label === label) last.items.push(entry)
    else groups.push({ label, items: [entry] })
  }

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={add} className="flex flex-wrap items-end gap-3 border border-line bg-paper p-4 md:p-5">
        <span className="flex flex-col gap-1">
          <label htmlFor="booked-date" className="text-sm text-ink">
            Zi ocupată
          </label>
          <input
            id="booked-date"
            type="date"
            required
            min={today}
            value={date}
            onChange={(event) => setDate(event.target.value)}
            disabled={readOnly || busy}
            className="h-11 rounded-[3px] border border-field-line bg-paper px-3 text-sm text-ink"
          />
        </span>
        <span className="flex min-w-0 flex-1 basis-56 flex-col gap-1">
          <label htmlFor="booked-note" className="text-sm text-ink">
            Notă <span className="text-muted">(doar pentru voi)</span>
          </label>
          <input
            id="booked-note"
            type="text"
            maxLength={160}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Nuntă Ana și Roman, Orhei"
            disabled={readOnly || busy}
            className="h-11 w-full rounded-[3px] border border-field-line bg-paper px-3 text-sm text-ink"
          />
        </span>
        <button
          type="submit"
          disabled={readOnly || busy || !date}
          className="inline-flex h-11 items-center gap-2 rounded-[3px] bg-ink px-5 text-sm font-medium text-ivory transition-colors duration-200 ease-out hover:bg-accent-deep disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? <Loader2 size={16} aria-hidden="true" className="animate-spin" /> : <CalendarPlus size={16} aria-hidden="true" />}
          Marchează
        </button>
      </form>

      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}

      {groups.length === 0 ? (
        <p className="text-sm text-muted">Nicio zi ocupată de azi încolo. Toate datele apar libere pe site.</p>
      ) : (
        groups.map((group) => (
          <section key={group.label}>
            <h2 className="font-display text-2xl capitalize">{group.label}</h2>
            <ul className="mt-3 border border-line bg-paper">
              {group.items.map((entry) => (
                <li key={entry.id} className="flex items-center gap-4 border-b border-line px-4 py-3 last:border-b-0">
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm text-ink first-letter:uppercase">
                      {dayFormatter.format(new Date(entry.date))}
                    </span>
                    {entry.note ? <span className="block text-sm text-muted">{entry.note}</span> : null}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(entry.id)}
                    disabled={readOnly || removing === entry.id}
                    aria-label={`Eliberează ziua ${dayFormatter.format(new Date(entry.date))}`}
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[3px] border border-line text-muted transition-colors duration-200 ease-out hover:border-danger hover:text-danger disabled:opacity-40"
                  >
                    {removing === entry.id ? <Loader2 size={16} aria-hidden="true" className="animate-spin" /> : <Trash2 size={16} aria-hidden="true" />}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  )
}

'use client'

import { useRouter } from 'next/navigation'
import {
  BellRing,
  CalendarDays,
  ChevronDown,
  Loader2,
  MapPin,
  Phone,
  StickyNote,
  Trash2,
  Users,
} from 'lucide-react'
import { useState } from 'react'

import { SOURCE_LABELS, STATUS_LABELS } from '@/lib/message-status'
import { formatDateTime, formatEventDate } from '@/lib/format'
import { cn, truncate } from '@/lib/utils'

const STATUS_TONES = {
  NEW: 'border-accent text-accent',
  READ: 'border-line text-muted',
  CONTACTED: 'border-sage text-sage',
  ARCHIVED: 'border-line text-muted',
}

/** `YYYY-MM-DD` for <input type="date">, from a date stored at UTC midnight. */
const toDayInput = (value) => (value ? new Date(value).toISOString().slice(0, 10) : '')

export default function MessageRow({ message, today }) {
  const router = useRouter()
  const [status, setStatus] = useState(message.status)
  const [serverStatus, setServerStatus] = useState(message.status)
  const [isExpanded, setIsExpanded] = useState(false)
  const [note, setNote] = useState(message.note ?? '')
  const [followUp, setFollowUp] = useState(toDayInput(message.followUpAt))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState(null)

  // `useState` citește starea doar la montare. Când LiveRefresh aduce o stare
  // nouă de pe server (o apăsare în Telegram, de pildă), rândul rămânea pe cea
  // veche; o preluăm aici, în timpul randării.
  if (message.status !== serverStatus) {
    setServerStatus(message.status)
    setStatus(message.status)
  }

  const isFallback = String(message.id).startsWith('local-')
  const savedFollowUp = toDayInput(message.followUpAt)
  const isDue = Boolean(savedFollowUp) && savedFollowUp <= today && status !== 'ARCHIVED'
  const dirty = note.trim() !== (message.note ?? '').trim() || followUp !== savedFollowUp

  const patch = (body) =>
    fetch(`/api/admin/messages/${message.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(async (response) => {
      if (!response.ok) {
        const result = await response.json().catch(() => null)
        throw new Error(result?.message ?? 'Salvarea a eșuat.')
      }
    })

  const changeStatus = async (nextStatus) => {
    const previousStatus = status
    setStatus(nextStatus)
    setError(null)
    try {
      await patch({ status: nextStatus })
    } catch {
      setStatus(previousStatus)
      setError('Statusul nu a putut fi salvat.')
    }
  }

  const saveNote = async () => {
    setSaving(true)
    setSaved(false)
    setError(null)
    try {
      await patch({ note, followUpAt: followUp || null })
      setSaved(true)
      router.refresh()
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!window.confirm(`Ștergi definitiv cererea de la ${message.name}? Nu se poate anula.`)) return
    setDeleting(true)
    setError(null)
    try {
      const response = await fetch(`/api/admin/messages/${message.id}`, { method: 'DELETE' })
      if (!response.ok) {
        const result = await response.json().catch(() => null)
        throw new Error(result?.message ?? 'Ștergerea a eșuat.')
      }
      router.refresh()
    } catch (deleteError) {
      setError(deleteError.message)
      setDeleting(false)
    }
  }

  return (
    <li className={cn('border-b border-line last:border-b-0', deleting && 'opacity-50')}>
      <div className="flex flex-col gap-4 px-4 py-5 md:flex-row md:items-start md:gap-6">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="font-display text-xl text-ink">{message.name}</span>
            <span
              className={cn(
                'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs tracking-[0.14em] uppercase',
                STATUS_TONES[status]
              )}
            >
              {STATUS_LABELS[status]}
            </span>
            {message.locale === 'ru' ? (
              <span className="inline-flex items-center rounded-full bg-ivory px-2.5 py-0.5 text-xs text-ink-soft">
                în rusă
              </span>
            ) : null}
            {message.source && message.source !== 'site' ? (
              <span className="text-xs text-muted">{SOURCE_LABELS[message.source]}</span>
            ) : null}
            {savedFollowUp ? (
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs',
                  isDue ? 'bg-danger/10 text-danger' : 'bg-ivory text-ink-soft'
                )}
              >
                <BellRing size={12} aria-hidden="true" />
                {isDue ? 'De revenit: ' : 'Revino pe '}
                {formatEventDate(message.followUpAt)}
              </span>
            ) : null}
            {message.note ? (
              <span className="inline-flex items-center gap-1 text-xs text-muted" title={message.note}>
                <StickyNote size={12} aria-hidden="true" />
                are notă
              </span>
            ) : null}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-soft">
            <a
              href={`tel:${message.phone.replace(/[\s\-.()]/g, '')}`}
              className="inline-flex items-center gap-2 hover:text-accent-deep"
            >
              <Phone size={14} aria-hidden="true" />
              {message.phone}
            </a>
            <span className="inline-flex items-center gap-2">{message.eventType}</span>
            {message.eventDate ? (
              <span className="inline-flex items-center gap-2">
                <CalendarDays size={14} aria-hidden="true" />
                {formatEventDate(message.eventDate)}
              </span>
            ) : null}
            {message.location ? (
              <span className="inline-flex items-center gap-2">
                <MapPin size={14} aria-hidden="true" />
                {message.location}
              </span>
            ) : null}
            {message.guestCount ? (
              <span className="inline-flex items-center gap-2">
                <Users size={14} aria-hidden="true" />
                {message.guestCount} invitați
              </span>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded((value) => !value)}
            aria-expanded={isExpanded}
            className="mt-3 flex w-full items-start gap-2 text-left text-sm text-ink-soft hover:text-ink"
          >
            <ChevronDown
              size={16}
              aria-hidden="true"
              className={cn('mt-1 shrink-0 transition-transform duration-200', isExpanded && 'rotate-180')}
            />
            <span className={cn('min-w-0 break-words', !isExpanded && 'line-clamp-1')}>
              {isExpanded ? message.message : truncate(message.message, 110)}
            </span>
          </button>

          {isExpanded && !isFallback ? (
            <div className="mt-4 flex flex-col gap-3 border-t border-line pt-4">
              <label htmlFor={`note-${message.id}`} className="text-xs tracking-[0.14em] text-muted uppercase">
                Notă internă
              </label>
              <textarea
                id={`note-${message.id}`}
                value={note}
                onChange={(event) => {
                  setNote(event.target.value)
                  setSaved(false)
                }}
                rows={3}
                maxLength={1000}
                placeholder="De exemplu: sunat marți, vrea paletă pudrată, revine după ce vede sala."
                className="w-full rounded-[3px] border border-field-line bg-paper px-3 py-2 text-sm text-ink"
              />

              <div className="flex flex-wrap items-end gap-3">
                <span className="flex flex-col gap-1">
                  <label htmlFor={`follow-${message.id}`} className="text-xs text-muted">
                    Revino pe
                  </label>
                  <input
                    id={`follow-${message.id}`}
                    type="date"
                    value={followUp}
                    onChange={(event) => {
                      setFollowUp(event.target.value)
                      setSaved(false)
                    }}
                    className="h-11 rounded-[3px] border border-field-line bg-paper px-3 text-sm text-ink"
                  />
                </span>
                {followUp ? (
                  <button
                    type="button"
                    onClick={() => {
                      setFollowUp('')
                      setSaved(false)
                    }}
                    className="h-11 px-2 text-sm text-muted underline-offset-4 hover:text-ink hover:underline"
                  >
                    Fără dată
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={saveNote}
                  disabled={saving || !dirty}
                  className="inline-flex h-11 items-center gap-2 rounded-[3px] bg-ink px-5 text-sm font-medium text-ivory transition-colors duration-200 ease-out hover:bg-accent-deep disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {saving ? <Loader2 size={15} aria-hidden="true" className="animate-spin" /> : null}
                  Salvează nota
                </button>
                {saved && !dirty ? (
                  <span role="status" className="h-11 content-center text-sm text-sage">
                    Salvat.
                  </span>
                ) : null}

                <button
                  type="button"
                  onClick={remove}
                  disabled={deleting}
                  className="ml-auto inline-flex h-11 items-center gap-2 rounded-[3px] border border-line px-4 text-sm text-muted transition-colors duration-200 ease-out hover:border-danger hover:text-danger disabled:opacity-40"
                >
                  <Trash2 size={15} aria-hidden="true" />
                  Șterge cererea
                </button>
              </div>
            </div>
          ) : null}

          {error ? (
            <p role="alert" className="mt-2 text-sm text-danger">
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col gap-2 md:items-end">
          <span className="text-xs text-muted">{formatDateTime(message.createdAt)}</span>

          <label className="sr-only" htmlFor={`status-${message.id}`}>
            Schimbă statusul pentru {message.name}
          </label>
          <select
            id={`status-${message.id}`}
            value={status}
            onChange={(event) => changeStatus(event.target.value)}
            className="h-10 rounded-[3px] border border-line bg-paper px-3 text-sm text-ink"
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          {message.email ? (
            <a href={`mailto:${message.email}`} className="text-xs text-muted hover:text-accent-deep">
              {message.email}
            </a>
          ) : null}
        </div>
      </div>
    </li>
  )
}

'use client'

import { CalendarDays, ChevronDown, MapPin, Phone, Users } from 'lucide-react'

import { STATUS_LABELS } from '@/lib/message-status'
import { useState } from 'react'

import { formatDateTime, formatEventDate } from '@/lib/format'
import { cn, truncate } from '@/lib/utils'

const STATUS_TONES = {
  NEW: 'border-accent text-accent',
  READ: 'border-line text-muted',
  CONTACTED: 'border-sage text-sage',
  ARCHIVED: 'border-line text-muted',
}

export default function MessageRow({ message }) {
  const [status, setStatus] = useState(message.status)
  const [isExpanded, setIsExpanded] = useState(false)
  const [error, setError] = useState(null)

  const changeStatus = async (nextStatus) => {
    const previousStatus = status
    setStatus(nextStatus)
    setError(null)

    try {
      const response = await fetch(`/api/admin/messages/${message.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })

      if (!response.ok) throw new Error('Request failed')
    } catch {
      setStatus(previousStatus)
      setError('Statusul nu a putut fi salvat.')
    }
  }

  return (
    <li className="border-b border-line last:border-b-0">
      <div className="flex flex-col gap-4 px-4 py-5 md:flex-row md:items-start md:gap-6">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-display text-xl text-ink">{message.name}</span>
            <span
              className={cn(
                'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs tracking-[0.14em] uppercase',
                STATUS_TONES[status]
              )}
            >
              {STATUS_LABELS[status]}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-soft">
            <a href={`tel:${message.phone.replace(/\s/g, '')}`} className="inline-flex items-center gap-2 hover:text-accent-deep">
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
            <span className={cn(!isExpanded && 'line-clamp-1')}>
              {isExpanded ? message.message : truncate(message.message, 110)}
            </span>
          </button>

          {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
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

'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { testimonialMessages } from '@/lib/testimonial-schema'
import { cn, truncate } from '@/lib/utils'

/** One review in the admin list, with show/hide, edit and delete. */
export default function TestimonialRow({ testimonial, readOnly }) {
  const router = useRouter()
  const [published, setPublished] = useState(testimonial.published)
  const [serverPublished, setServerPublished] = useState(testimonial.published)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState(null)

  // Same trap as the message rows: `useState` reads the prop once. Pick up a
  // value that changed on the server, e.g. from another tab.
  if (testimonial.published !== serverPublished) {
    setServerPublished(testimonial.published)
    setPublished(testimonial.published)
  }

  const togglePublished = async () => {
    const next = !published
    setPublished(next)
    setError(null)
    try {
      const response = await fetch(`/api/admin/testimonials/${testimonial.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: next }),
      })
      if (!response.ok) throw new Error('failed')
      router.refresh()
    } catch {
      setPublished(!next)
      setError(testimonialMessages.error)
    }
  }

  const remove = async () => {
    if (!window.confirm(`Ștergi definitiv recenzia lui ${testimonial.authorName}?`)) return
    setIsDeleting(true)
    setError(null)
    try {
      const response = await fetch(`/api/admin/testimonials/${testimonial.id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('failed')
      router.refresh()
    } catch {
      setError(testimonialMessages.error)
      setIsDeleting(false)
    }
  }

  const action =
    'inline-flex h-11 w-11 items-center justify-center rounded-[3px] border border-line text-muted transition-colors duration-200 ease-out hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-40'

  return (
    <li className={cn('border-b border-line last:border-b-0', !published && 'bg-ivory/60')}>
      <div className="flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-start sm:gap-6">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-display text-xl text-ink">{testimonial.authorName}</span>
            <span className="text-sm text-muted">{testimonial.eventType}</span>
            {!published ? (
              <span className="rounded-full border border-line px-2.5 py-0.5 text-xs tracking-[0.14em] text-muted uppercase">
                Ascunsă
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            {truncate(testimonial.content, 180)}
          </p>
          {error ? (
            <p role="alert" className="mt-2 text-sm text-danger">
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={togglePublished}
            disabled={readOnly || isDeleting}
            aria-pressed={published}
            aria-label={published ? 'Ascunde de pe site' : 'Arată pe site'}
            title={published ? 'Ascunde de pe site' : 'Arată pe site'}
            className={action}
          >
            {published ? <Eye size={16} aria-hidden="true" /> : <EyeOff size={16} aria-hidden="true" />}
          </button>
          <Link
            href={`/admin/recenzii/${testimonial.id}`}
            aria-label={`Editează recenzia lui ${testimonial.authorName}`}
            aria-disabled={readOnly ? 'true' : undefined}
            className={cn(action, 'aria-disabled:pointer-events-none aria-disabled:opacity-40')}
          >
            <Pencil size={16} aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={remove}
            disabled={readOnly || isDeleting}
            aria-label={`Șterge recenzia lui ${testimonial.authorName}`}
            className={cn(action, 'hover:border-danger hover:text-danger')}
          >
            {isDeleting ? (
              <Loader2 size={16} aria-hidden="true" className="animate-spin" />
            ) : (
              <Trash2 size={16} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </li>
  )
}

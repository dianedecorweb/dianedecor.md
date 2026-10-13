'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { formatPriceFrom } from '@/lib/format'
import { PRICE_UNITS, rentalMessages } from '@/lib/rental-schema'
import { cn } from '@/lib/utils'

/** One catalogue item in the panel: show/hide, edit, delete. */
export default function RentalRow({ item }) {
  const router = useRouter()
  const [published, setPublished] = useState(item.published)
  const [serverPublished, setServerPublished] = useState(item.published)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState(null)

  // `useState` reads the prop once; pick up a value changed on the server.
  if (item.published !== serverPublished) {
    setServerPublished(item.published)
    setPublished(item.published)
  }

  const toggle = async () => {
    const next = !published
    setPublished(next)
    setError(null)
    try {
      const response = await fetch(`/api/admin/rental/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: next }),
      })
      if (!response.ok) throw new Error('failed')
      router.refresh()
    } catch {
      setPublished(!next)
      setError(rentalMessages.error)
    }
  }

  const remove = async () => {
    if (!window.confirm(`Ștergi definitiv „${item.name}” din catalog?`)) return
    setIsDeleting(true)
    setError(null)
    try {
      const response = await fetch(`/api/admin/rental/${item.id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('failed')
      router.refresh()
    } catch {
      setError(rentalMessages.error)
      setIsDeleting(false)
    }
  }

  const action =
    'inline-flex h-11 w-11 items-center justify-center rounded-[3px] border border-line text-muted transition-colors duration-200 ease-out hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-40'

  return (
    <li className={cn('border-b border-line last:border-b-0', !published && 'bg-ivory/60')}>
      <div className="flex flex-wrap items-center gap-4 px-4 py-4">
        <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[3px] bg-line">
          <Image src={item.image} alt="" fill sizes="64px" className="object-cover" />
        </span>
        <span className="min-w-0 flex-1 basis-40">
          <span className="flex flex-wrap items-baseline gap-x-3">
            <span className="font-display text-xl text-ink">{item.name}</span>
            {!published ? <span className="text-xs text-muted">ascuns</span> : null}
          </span>
          <span className="block text-sm text-ink-soft">
            {item.priceFrom !== null && item.priceFrom !== undefined
              ? `${formatPriceFrom(item.priceFrom)} ${PRICE_UNITS[item.priceUnit]}`
              : 'Preț la cerere'}
          </span>
          {error ? (
            <span role="alert" className="block text-sm text-danger">
              {error}
            </span>
          ) : null}
        </span>
        <span className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={toggle}
            disabled={isDeleting}
            aria-pressed={published}
            aria-label={published ? 'Ascunde din catalog' : 'Arată în catalog'}
            className={action}
          >
            {published ? <Eye size={16} aria-hidden="true" /> : <EyeOff size={16} aria-hidden="true" />}
          </button>
          <Link href={`/admin/chirie/${item.id}`} aria-label={`Editează ${item.name}`} className={action}>
            <Pencil size={16} aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={remove}
            disabled={isDeleting}
            aria-label={`Șterge ${item.name}`}
            className={cn(action, 'hover:border-danger hover:text-danger')}
          >
            {isDeleting ? <Loader2 size={16} aria-hidden="true" className="animate-spin" /> : <Trash2 size={16} aria-hidden="true" />}
          </button>
        </span>
      </div>
    </li>
  )
}

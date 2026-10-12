'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, TriangleAlert } from 'lucide-react'
import { useState } from 'react'

import DatabaseNotice from '@/components/admin/DatabaseNotice'
import Input, { FieldError, FieldHint, FieldLabel } from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import { testimonialMessages } from '@/lib/testimonial-schema'

const EMPTY = { authorName: '', eventType: '', content: '', published: true, order: 0 }
const MAX_CONTENT = 800

/** Create and edit share one form. `testimonial` absent means create. */
export default function TestimonialForm({ testimonial, readOnly }) {
  const router = useRouter()
  const [values, setValues] = useState(testimonial ? { ...EMPTY, ...testimonial } : EMPTY)
  const [errors, setErrors] = useState({})
  const [banner, setBanner] = useState(null)
  const [isPending, setIsPending] = useState(false)
  const disabled = isPending || readOnly

  const set = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    setValues((current) => ({ ...current, [field]: value }))
    if (errors[field]) setErrors((current) => ({ ...current, [field]: null }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (isPending) return
    setIsPending(true)
    setBanner(null)

    const payload = {
      authorName: values.authorName,
      eventType: values.eventType,
      content: values.content,
      published: values.published,
      order: Number(values.order) || 0,
    }

    const { testimonialSchema, toTestimonialFieldErrors } = await import(
      '@/lib/testimonial-schema'
    )
    const parsed = testimonialSchema.safeParse(payload)
    if (!parsed.success) {
      setErrors(toTestimonialFieldErrors(parsed.error))
      setIsPending(false)
      return
    }

    try {
      const response = await fetch(
        testimonial ? `/api/admin/testimonials/${testimonial.id}` : '/api/admin/testimonials',
        {
          method: testimonial ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed.data),
        }
      )
      const body = await response.json().catch(() => ({}))

      if (response.ok && body.ok) {
        router.push('/admin/recenzii')
        router.refresh()
        return
      }

      if (body.errors) setErrors(body.errors)
      setBanner(body.message ?? testimonialMessages.error)
    } catch {
      setBanner(testimonialMessages.error)
    }
    setIsPending(false)
  }

  const field = (name) => ({
    id: name,
    name,
    value: values[name],
    onChange: set(name),
    disabled,
    'aria-invalid': errors[name] ? 'true' : undefined,
    'aria-describedby': errors[name] ? `${name}-error` : undefined,
  })

  return (
    <form onSubmit={handleSubmit} className="flex max-w-3xl flex-col gap-8">
      {readOnly ? <DatabaseNotice /> : null}

      {banner ? (
        <p
          role="alert"
          className="flex items-start gap-3 border border-danger/40 bg-danger/5 px-4 py-3 text-sm text-danger"
        >
          <TriangleAlert size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
          {banner}
        </p>
      ) : null}

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <FieldLabel htmlFor="authorName">Numele clientului</FieldLabel>
          <Input {...field('authorName')} type="text" className="mt-2" placeholder="Ana M." />
          <FieldError id="authorName-error">{errors.authorName}</FieldError>
        </div>

        <div>
          <FieldLabel htmlFor="eventType">Evenimentul</FieldLabel>
          <Input {...field('eventType')} type="text" className="mt-2" placeholder="Nuntă, Chișinău" />
          <FieldError id="eventType-error">{errors.eventType}</FieldError>
        </div>

        <div className="md:col-span-2">
          <FieldLabel htmlFor="content">Recenzia</FieldLabel>
          <Textarea {...field('content')} rows={6} maxLength={MAX_CONTENT} className="mt-2" />
          <div className="mt-1 flex justify-between gap-4">
            <FieldError id="content-error">{errors.content}</FieldError>
            <span className="ml-auto text-xs text-muted tabular-nums">
              {values.content.length} / {MAX_CONTENT}
            </span>
          </div>
        </div>

        <div>
          <FieldLabel htmlFor="order" optional>
            Ordine
          </FieldLabel>
          <Input
            {...field('order')}
            type="number"
            min="0"
            max="9999"
            className="mt-2"
            aria-describedby="order-hint"
          />
          <FieldHint id="order-hint">Numărul mai mic apare mai sus pe prima pagină.</FieldHint>
          <FieldError id="order-error">{errors.order}</FieldError>
        </div>

        <label className="flex items-center gap-3 self-end pb-3 text-sm text-ink">
          <input
            type="checkbox"
            name="published"
            checked={values.published}
            onChange={set('published')}
            disabled={disabled}
            className="h-5 w-5 accent-ink"
          />
          Afișată pe site
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-4 border-t border-line pt-6">
        <button
          type="submit"
          disabled={disabled}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-[3px] bg-ink px-7 text-sm font-medium text-ivory transition-colors duration-200 ease-out hover:bg-accent-deep disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? (
            <>
              <Loader2 size={16} aria-hidden="true" className="animate-spin" />
              Se salvează...
            </>
          ) : (
            'Salvează'
          )}
        </button>
        <Link
          href="/admin/recenzii"
          className="inline-flex h-12 items-center rounded-[3px] border border-line px-6 text-sm text-ink transition-colors duration-200 ease-out hover:border-ink"
        >
          Renunță
        </Link>
      </div>
    </form>
  )
}

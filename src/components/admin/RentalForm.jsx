'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ImageOff, Loader2, TriangleAlert } from 'lucide-react'
import { useState } from 'react'

import ImageUploadButton from '@/components/admin/ImageUploadButton'
import RussianFields from '@/components/admin/RussianFields'
import Input, { FieldError, FieldHint, FieldLabel } from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import { PRICE_UNITS, rentalMessages } from '@/lib/rental-schema'

const EMPTY = { name: '', description: '', image: '', priceFrom: '', priceUnit: 'zi', published: true, order: 0 }

/** Create and edit share one form. `item` absent means create. */
export default function RentalForm({ item }) {
  const router = useRouter()
  const [values, setValues] = useState(item ? { ...EMPTY, ...item, priceFrom: item.priceFrom ?? '' } : EMPTY)
  const [errors, setErrors] = useState({})
  const [banner, setBanner] = useState(null)
  const [isPending, setIsPending] = useState(false)

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

    const { rentalSchema, toRentalFieldErrors } = await import('@/lib/rental-schema')
    const { id: _id, slug: _slug, ...fields } = values
    const parsed = rentalSchema.safeParse(fields)
    if (!parsed.success) {
      setErrors(toRentalFieldErrors(parsed.error))
      setIsPending(false)
      return
    }

    try {
      const response = await fetch(item ? `/api/admin/rental/${item.id}` : '/api/admin/rental', {
        method: item ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      })
      const body = await response.json().catch(() => ({}))
      if (response.ok && body.ok) {
        router.push('/admin/chirie')
        router.refresh()
        return
      }
      if (body.errors) setErrors(body.errors)
      setBanner(body.message ?? rentalMessages.error)
    } catch {
      setBanner(rentalMessages.error)
    }
    setIsPending(false)
  }

  const field = (name) => ({
    id: name,
    name,
    value: values[name],
    onChange: set(name),
    disabled: isPending,
    'aria-invalid': errors[name] ? 'true' : undefined,
    'aria-describedby': errors[name] ? `${name}-error` : undefined,
  })

  return (
    <form onSubmit={handleSubmit} className="flex max-w-3xl flex-col gap-8">
      {banner ? (
        <p role="alert" className="flex items-start gap-3 border border-danger/40 bg-danger/5 px-4 py-3 text-sm text-danger">
          <TriangleAlert size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
          {banner}
        </p>
      ) : null}

      <div className="grid gap-8 md:grid-cols-2">
        <div className="md:col-span-2">
          <FieldLabel htmlFor="name">Numele obiectului</FieldLabel>
          <Input {...field('name')} type="text" className="mt-2" placeholder="Arcadă rotundă aurie, 2 m" />
          <FieldError id="name-error">{errors.name}</FieldError>
        </div>

        <div className="md:col-span-2">
          <FieldLabel htmlFor="description">Descriere scurtă</FieldLabel>
          <Textarea
            {...field('description')}
            rows={3}
            maxLength={300}
            className="mt-2"
            placeholder="Dimensiuni, material, câte bucăți aveți."
          />
          <FieldError id="description-error">{errors.description}</FieldError>
        </div>

        <RussianFields
          field={field}
          errors={errors}
          fields={[
            { name: 'nameRu', label: 'Numele obiectului' },
            { name: 'descriptionRu', label: 'Descriere scurtă', rows: 3 },
          ]}
        />

        <div>
          <FieldLabel htmlFor="priceFrom" optional>
            Preț „de la”, în lei
          </FieldLabel>
          <Input {...field('priceFrom')} type="number" min="0" step="1" inputMode="numeric" className="mt-2" aria-describedby="priceFrom-hint" />
          <FieldHint id="priceFrom-hint">Lasă gol pentru „preț la cerere”.</FieldHint>
          <FieldError id="priceFrom-error">{errors.priceFrom}</FieldError>
        </div>

        <div>
          <FieldLabel htmlFor="priceUnit">Prețul este</FieldLabel>
          <Select {...field('priceUnit')} className="mt-2">
            {Object.entries(PRICE_UNITS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <FieldError id="priceUnit-error">{errors.priceUnit}</FieldError>
        </div>

        <div className="md:col-span-2">
          <FieldLabel htmlFor="image">Poza</FieldLabel>
          <div className="mt-2 flex items-start gap-4">
            <span className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[3px] bg-line">
              {values.image ? (
                <Image src={values.image} alt="" fill sizes="96px" className="object-cover" unoptimized />
              ) : (
                <ImageOff size={20} aria-hidden="true" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-muted" />
              )}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <ImageUploadButton
                label={values.image ? 'Schimbă poza' : 'Încarcă poza'}
                disabled={isPending}
                onUploaded={({ url }) => {
                  setValues((current) => ({ ...current, image: url }))
                  setErrors((current) => ({ ...current, image: null }))
                }}
              />
              <Input {...field('image')} type="text" placeholder="sau un link https" />
              <FieldError id="image-error">{errors.image}</FieldError>
            </div>
          </div>
        </div>

        <div>
          <FieldLabel htmlFor="order" optional>
            Ordine
          </FieldLabel>
          <Input {...field('order')} type="number" min="0" max="9999" className="mt-2" />
          <FieldError id="order-error">{errors.order}</FieldError>
        </div>

        <label className="flex items-center gap-3 self-end pb-3 text-sm text-ink">
          <input type="checkbox" name="published" checked={values.published} onChange={set('published')} disabled={isPending} className="h-5 w-5 accent-ink" />
          Afișat în catalog
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-4 border-t border-line pt-6">
        <button
          type="submit"
          disabled={isPending}
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
        <Link href="/admin/chirie" className="inline-flex h-12 items-center rounded-[3px] border border-line px-6 text-sm text-ink transition-colors duration-200 ease-out hover:border-ink">
          Renunță
        </Link>
      </div>
    </form>
  )
}

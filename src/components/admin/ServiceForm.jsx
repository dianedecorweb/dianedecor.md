'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, TriangleAlert } from 'lucide-react'
import { useState } from 'react'

import DatabaseNotice from '@/components/admin/DatabaseNotice'
import RussianFields from '@/components/admin/RussianFields'
import ImageUploadButton from '@/components/admin/ImageUploadButton'
import Input, { FieldError, FieldHint, FieldLabel } from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import { serviceMessages } from '@/lib/service-schema'

/** Edits one existing service. Services are not created or deleted from the panel. */
export default function ServiceForm({ service, readOnly }) {
  const router = useRouter()
  const [values, setValues] = useState({
    title: service.title,
    shortDescription: service.shortDescription,
    description: service.description,
    features: service.features.join('\n'),
    titleRu: service.titleRu ?? '',
    shortDescriptionRu: service.shortDescriptionRu ?? '',
    descriptionRu: service.descriptionRu ?? '',
    featuresRu: (service.featuresRu ?? []).join('\n'),
    priceFrom: service.priceFrom ?? '',
    coverImage: service.coverImage ?? '',
    published: service.published,
    order: service.order ?? 0,
  })
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

    const { serviceSchema, toServiceFieldErrors } = await import('@/lib/service-schema')
    const parsed = serviceSchema.safeParse(values)
    if (!parsed.success) {
      setErrors(toServiceFieldErrors(parsed.error))
      setIsPending(false)
      return
    }

    try {
      const response = await fetch(`/api/admin/services/${service.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      })
      const body = await response.json().catch(() => ({}))
      if (response.ok && body.ok) {
        router.push('/admin/servicii')
        router.refresh()
        return
      }
      if (body.errors) setErrors(body.errors)
      setBanner(body.message ?? serviceMessages.error)
    } catch {
      setBanner(serviceMessages.error)
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
        <div className="md:col-span-2">
          <FieldLabel htmlFor="title">Titlu</FieldLabel>
          <Input {...field('title')} type="text" className="mt-2" />
          <FieldError id="title-error">{errors.title}</FieldError>
        </div>

        <div>
          <FieldLabel htmlFor="priceFrom" optional>
            Preț „de la”, în lei
          </FieldLabel>
          <Input
            {...field('priceFrom')}
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            className="mt-2"
            aria-describedby="priceFrom-hint"
          />
          <FieldHint id="priceFrom-hint">Lasă gol ca pe site să scrie „preț la cerere”.</FieldHint>
          <FieldError id="priceFrom-error">{errors.priceFrom}</FieldError>
        </div>

        <div>
          <FieldLabel htmlFor="order" optional>
            Ordine
          </FieldLabel>
          <Input {...field('order')} type="number" min="0" max="9999" className="mt-2" aria-describedby="order-hint" />
          <FieldHint id="order-hint">Numărul mai mic apare mai sus.</FieldHint>
          <FieldError id="order-error">{errors.order}</FieldError>
        </div>

        <div className="md:col-span-2">
          <FieldLabel htmlFor="shortDescription">Descriere scurtă</FieldLabel>
          <Textarea {...field('shortDescription')} rows={2} className="mt-2" />
          <FieldError id="shortDescription-error">{errors.shortDescription}</FieldError>
        </div>

        <div className="md:col-span-2">
          <FieldLabel htmlFor="description">Descriere completă</FieldLabel>
          <Textarea {...field('description')} rows={8} className="mt-2" placeholder="Separă paragrafele cu un rând gol." />
          <FieldError id="description-error">{errors.description}</FieldError>
        </div>

        <div className="md:col-span-2">
          <FieldLabel htmlFor="features">Ce include</FieldLabel>
          <Textarea {...field('features')} rows={7} className="mt-2" aria-describedby="features-hint" />
          <FieldHint id="features-hint">Câte un lucru pe rând, cel mult 12. Apar ca listă pe pagina serviciului.</FieldHint>
          <FieldError id="features-error">{errors.features}</FieldError>
        </div>

        <RussianFields
          field={field}
          errors={errors}
          fields={[
            { name: 'titleRu', label: 'Titlu' },
            { name: 'shortDescriptionRu', label: 'Descriere scurtă', rows: 2 },
            { name: 'descriptionRu', label: 'Descriere completă', rows: 8 },
            { name: 'featuresRu', label: 'Ce include', rows: 7, hint: 'Câte un lucru pe rând, în aceeași ordine ca în română.' },
          ]}
        />

        <div className="md:col-span-2">
          <FieldLabel htmlFor="coverImage">Imagine de copertă</FieldLabel>
          <Input {...field('coverImage')} type="text" className="mt-2" />
          <FieldError id="coverImage-error">{errors.coverImage}</FieldError>
          <div className="mt-3">
            <ImageUploadButton
              label="Încarcă coperta"
              disabled={disabled}
              onUploaded={({ url }) => setValues((current) => ({ ...current, coverImage: url }))}
            />
          </div>
        </div>

        <label className="flex items-center gap-3 text-sm text-ink">
          <input
            type="checkbox"
            name="published"
            checked={values.published}
            onChange={set('published')}
            disabled={disabled}
            className="h-5 w-5 accent-ink"
          />
          Afișat pe site
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
          href="/admin/servicii"
          className="inline-flex h-12 items-center rounded-[3px] border border-line px-6 text-sm text-ink transition-colors duration-200 ease-out hover:border-ink"
        >
          Renunță
        </Link>
        <Link
          href={`/servicii/${service.slug}`}
          target="_blank"
          className="text-sm text-muted underline-offset-4 hover:text-ink hover:underline"
        >
          Vezi pe site
        </Link>
      </div>
    </form>
  )
}

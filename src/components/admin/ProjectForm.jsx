'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, TriangleAlert } from 'lucide-react'
import { useState } from 'react'

import DatabaseNotice from '@/components/admin/DatabaseNotice'
import ImageListField from '@/components/admin/ImageListField'
import ImageUploadButton from '@/components/admin/ImageUploadButton'
import Input, { FieldError, FieldHint, FieldLabel } from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import { projectMessages } from '@/lib/project-schema'
import { slugify } from '@/lib/slug'

const EMPTY = {
  title: '',
  slug: '',
  categorySlug: '',
  clientNames: '',
  location: '',
  eventDate: '',
  shortDescription: '',
  description: '',
  coverImage: '',
  images: [''],
  featured: false,
  published: true,
  order: 0,
}

/**
 * Create and edit share one form. `project` absent means create.
 *
 * The zod schema is imported on demand — it is only needed once the studio
 * submits, and keeping it out of the initial chunk matches how the public
 * contact form does it.
 */
export default function ProjectForm({ project, categories, readOnly }) {
  const router = useRouter()
  const [values, setValues] = useState(project ? { ...EMPTY, ...project } : EMPTY)
  const [errors, setErrors] = useState({})
  const [banner, setBanner] = useState(null)
  const [status, setStatus] = useState('idle')

  const isPending = status === 'pending'
  const disabled = isPending || readOnly

  const set = (field) => (event) => {
    const value =
      event.target.type === 'checkbox' ? event.target.checked : event.target.value
    setValues((current) => ({ ...current, [field]: value }))
    if (errors[field]) setErrors((current) => ({ ...current, [field]: null }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (isPending) return

    setStatus('pending')
    setBanner(null)

    const payload = {
      ...values,
      slug: values.slug || slugify(values.title),
      images: values.images.filter(Boolean),
      order: Number(values.order) || 0,
    }

    const { projectSchema, toProjectFieldErrors } = await import('@/lib/project-schema')
    const parsed = projectSchema.safeParse(payload)

    if (!parsed.success) {
      setErrors(toProjectFieldErrors(parsed.error))
      setStatus('idle')
      return
    }

    try {
      const response = await fetch(
        project ? `/api/admin/projects/${project.id}` : '/api/admin/projects',
        {
          method: project ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed.data),
        }
      )

      const body = await response.json()

      if (response.ok && body.ok) {
        router.push('/admin/portofoliu')
        router.refresh()
        return
      }

      if (body.errors) setErrors(body.errors)
      setBanner(body.message ?? projectMessages.error)
      setStatus('idle')
    } catch {
      setBanner(projectMessages.error)
      setStatus('idle')
    }
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
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
          <FieldLabel htmlFor="slug" optional>
            Slug (se generează din titlu)
          </FieldLabel>
          <Input
            {...field('slug')}
            type="text"
            className="mt-2"
            placeholder={slugify(values.title) || 'nunta-ana-roman'}
          />
          <FieldError id="slug-error">{errors.slug}</FieldError>
        </div>

        <div>
          <FieldLabel htmlFor="categorySlug">Categorie</FieldLabel>
          <Select {...field('categorySlug')} className="mt-2">
            <option value="">Alege...</option>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </Select>
          <FieldError id="categorySlug-error">{errors.categorySlug}</FieldError>
        </div>

        <div>
          <FieldLabel htmlFor="clientNames" optional>
            Numele clienților
          </FieldLabel>
          <Input {...field('clientNames')} type="text" className="mt-2" placeholder="Ana & Roman" />
          <FieldError id="clientNames-error">{errors.clientNames}</FieldError>
        </div>

        <div>
          <FieldLabel htmlFor="location" optional>
            Locația
          </FieldLabel>
          <Input {...field('location')} type="text" className="mt-2" placeholder="Chișinău" />
          <FieldError id="location-error">{errors.location}</FieldError>
        </div>

        <div>
          <FieldLabel htmlFor="eventDate" optional>
            Data evenimentului
          </FieldLabel>
          <Input {...field('eventDate')} type="date" className="mt-2" />
          <FieldError id="eventDate-error">{errors.eventDate}</FieldError>
        </div>

        <div>
          <FieldLabel htmlFor="order" optional>
            Ordine în listă
          </FieldLabel>
          <Input
            {...field('order')}
            type="number"
            min="0"
            max="9999"
            className="mt-2"
            aria-describedby="order-hint"
          />
          <FieldHint id="order-hint">
            Poziția în portofoliu. Numărul mai mic apare mai sus: 0 e primul proiect din listă.
          </FieldHint>
          <FieldError id="order-error">{errors.order}</FieldError>
        </div>

        <div className="md:col-span-2">
          <FieldLabel htmlFor="shortDescription">Descriere scurtă</FieldLabel>
          <Textarea {...field('shortDescription')} rows={2} className="mt-2" />
          <FieldError id="shortDescription-error">{errors.shortDescription}</FieldError>
        </div>

        <div className="md:col-span-2">
          <FieldLabel htmlFor="description">Descriere completă</FieldLabel>
          <Textarea
            {...field('description')}
            rows={10}
            className="mt-2"
            placeholder="Separă paragrafele cu un rând gol."
          />
          <FieldError id="description-error">{errors.description}</FieldError>
        </div>

        <div className="md:col-span-2">
          <FieldLabel htmlFor="coverImage">Imagine de copertă</FieldLabel>
          <Input
            {...field('coverImage')}
            type="text"
            className="mt-2"
            placeholder="/images/portfolio/nume-proiect-cover.jpg"
          />
          <FieldError id="coverImage-error">{errors.coverImage}</FieldError>

          <div className="mt-3">
            <ImageUploadButton
              label="Încarcă coperta"
              disabled={disabled}
              onUploaded={({ url }) =>
                setValues((current) => ({ ...current, coverImage: url }))
              }
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <ImageListField
            values={values.images}
            errors={errors}
            disabled={disabled}
            onChange={(images) => setValues((current) => ({ ...current, images }))}
          />
        </div>

        <div className="flex flex-col gap-4 md:col-span-2">
          <label className="flex items-center gap-3 text-sm text-ink">
            <input
              type="checkbox"
              name="published"
              checked={values.published}
              onChange={set('published')}
              disabled={disabled}
              className="h-5 w-5 accent-ink"
            />
            Publicat pe site
          </label>

          <label className="flex items-center gap-3 text-sm text-ink">
            <input
              type="checkbox"
              name="featured"
              checked={values.featured}
              onChange={set('featured')}
              disabled={disabled}
              className="h-5 w-5 accent-ink"
            />
            Afișat pe pagina principală
          </label>
        </div>
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
          href="/admin/portofoliu"
          className="inline-flex h-12 items-center rounded-[3px] border border-line px-6 text-sm text-ink transition-colors duration-200 ease-out hover:border-ink"
        >
          Renunță
        </Link>
      </div>
    </form>
  )
}

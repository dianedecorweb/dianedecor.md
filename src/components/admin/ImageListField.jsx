'use client'

import Image from 'next/image'
import { ArrowDown, ArrowUp, ImageOff, Plus, Star, Trash2 } from 'lucide-react'

import ImageUploadButton from '@/components/admin/ImageUploadButton'
import Input, { FieldError, FieldLabel } from '@/components/ui/Input'
import { cn } from '@/lib/utils'

const MAX_IMAGES = 20

/** Prima casetă goală primește poza; altfel se adaugă un rând nou la final. */
function placeImage(images, url) {
  const empty = images.findIndex((value) => value.trim() === '')
  if (empty === -1) return [...images, url]
  const next = [...images]
  next[empty] = url
  return next
}

/**
 * The gallery editor: a list of image paths with a live thumbnail, so the
 * studio sees immediately whether a path resolves.
 *
 * The order here is the order on the site, so rows move up and down. Any photo
 * can also become the cover in one click. `onChange` takes the next list or an
 * updater function: several uploads land one after another, and each has to
 * build on the list the previous one left, not on the one it started from.
 */
export default function ImageListField({ values, errors, disabled, coverImage, onSetCover, onChange }) {
  const update = (index, value) => {
    onChange((current) => current.map((item, position) => (position === index ? value : item)))
  }

  const remove = (index) => {
    onChange((current) => {
      const next = current.filter((_, position) => position !== index)
      return next.length > 0 ? next : ['']
    })
  }

  const move = (index, delta) => {
    onChange((current) => {
      const target = index + delta
      if (target < 0 || target >= current.length) return current
      const next = [...current]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  const filled = values.filter((value) => value.trim() !== '').length
  const room = MAX_IMAGES - filled

  const iconButton =
    'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[3px] border border-line text-muted transition-colors duration-200 ease-out hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-30'

  return (
    <div>
      <FieldLabel htmlFor="images.0">Galerie foto</FieldLabel>
      <p className="mt-1 text-sm text-muted">
        Ordinea de aici e ordinea de pe site. Poți alege mai multe poze deodată. {filled} din{' '}
        {MAX_IMAGES}.
      </p>

      <ul className="mt-3 flex flex-col gap-4">
        {values.map((value, index) => {
          const isCover = Boolean(value) && value === coverImage
          return (
            // The index is the identity here: rows have no id, and the inputs are
            // controlled, so a moved row simply shows the value now at its index.
            <li key={index} className="flex items-start gap-3">
              <span className="relative mt-0.5 h-16 w-16 shrink-0 overflow-hidden rounded-[3px] bg-line">
                {value ? (
                  <Image src={value} alt="" fill sizes="64px" className="object-cover" unoptimized />
                ) : (
                  <ImageOff
                    size={18}
                    aria-hidden="true"
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-muted"
                  />
                )}
                {isCover ? (
                  <span className="absolute inset-x-0 bottom-0 bg-ink/75 py-0.5 text-center text-[10px] tracking-[0.12em] text-ivory uppercase">
                    Copertă
                  </span>
                ) : null}
              </span>

              <span className="flex min-w-0 flex-1 flex-col gap-2">
                <Input
                  id={`images.${index}`}
                  name={`images.${index}`}
                  type="text"
                  value={value}
                  disabled={disabled}
                  placeholder="/images/portfolio/nume-proiect-01.jpg"
                  onChange={(event) => update(index, event.target.value)}
                  aria-invalid={errors?.[`images.${index}`] ? 'true' : undefined}
                  aria-label={`Imaginea ${index + 1}`}
                />
                <FieldError id={`images.${index}-error`}>{errors?.[`images.${index}`]}</FieldError>

                <span className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={disabled || index === 0}
                    aria-label={`Mută imaginea ${index + 1} mai sus`}
                    className={iconButton}
                  >
                    <ArrowUp size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={disabled || index === values.length - 1}
                    aria-label={`Mută imaginea ${index + 1} mai jos`}
                    className={iconButton}
                  >
                    <ArrowDown size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onSetCover(value)}
                    disabled={disabled || !value || isCover}
                    aria-pressed={isCover}
                    className={cn(
                      'inline-flex h-11 items-center gap-2 rounded-[3px] border px-3 text-sm transition-colors duration-200 ease-out disabled:cursor-not-allowed',
                      isCover
                        ? 'border-ink bg-ink text-ivory'
                        : 'border-line text-ink-soft hover:border-ink hover:text-ink disabled:opacity-30'
                    )}
                  >
                    <Star size={15} aria-hidden="true" className={cn(isCover && 'fill-current')} />
                    {isCover ? 'E coperta' : 'Fă copertă'}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    disabled={disabled || (values.length === 1 && !value)}
                    aria-label={`Șterge imaginea ${index + 1}`}
                    className={cn(iconButton, 'hover:border-danger hover:text-danger')}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </span>
              </span>
            </li>
          )
        })}
      </ul>

      <FieldError id="images-error">{errors?.images}</FieldError>

      <div className="mt-5 flex flex-wrap items-start gap-3">
        <ImageUploadButton
          label="Încarcă poze"
          multiple
          maxFiles={room}
          disabled={disabled || room <= 0}
          onUploaded={({ url }) => onChange((current) => placeImage(current, url))}
        />

        <button
          type="button"
          onClick={() => onChange((current) => [...current, ''])}
          disabled={disabled || values.length >= MAX_IMAGES}
          className="inline-flex h-11 items-center gap-2 rounded-[3px] border border-line px-4 text-sm text-ink transition-colors duration-200 ease-out hover:border-ink disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus size={16} aria-hidden="true" />
          Adaugă rând pentru link
        </button>
      </div>
    </div>
  )
}

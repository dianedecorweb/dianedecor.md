'use client'

import Image from 'next/image'
import { ImageOff, Plus, Trash2 } from 'lucide-react'

import ImageUploadButton from '@/components/admin/ImageUploadButton'
import Input, { FieldError, FieldLabel } from '@/components/ui/Input'

/**
 * The gallery editor: a repeatable list of image paths with a live thumbnail,
 * so the studio sees immediately whether a path resolves.
 */
export default function ImageListField({ values, errors, disabled, onChange }) {
  const update = (index, value) => {
    const next = [...values]
    next[index] = value
    onChange(next)
  }

  const remove = (index) => {
    onChange(values.filter((_, position) => position !== index))
  }

  return (
    <div>
      <FieldLabel htmlFor="images.0">Galerie foto</FieldLabel>

      <ul className="mt-3 flex flex-col gap-3">
        {values.map((value, index) => (
          // The index is the identity here: rows have no id and never reorder.
          <li key={index} className="flex items-start gap-3">
            <span className="relative mt-1 h-14 w-14 shrink-0 overflow-hidden rounded-[3px] bg-line">
              {value ? (
                <Image
                  src={value}
                  alt=""
                  fill
                  sizes="56px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <ImageOff
                  size={18}
                  aria-hidden="true"
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-muted"
                />
              )}
            </span>

            <span className="flex-1">
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
            </span>

            <button
              type="button"
              onClick={() => remove(index)}
              disabled={disabled || values.length === 1}
              aria-label={`Șterge imaginea ${index + 1}`}
              className="mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[3px] border border-line text-muted transition-colors duration-200 ease-out hover:border-danger hover:text-danger disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Trash2 size={16} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>

      <FieldError id="images-error">{errors?.images}</FieldError>

      <div className="mt-4 flex flex-wrap items-start gap-3">
        <button
          type="button"
          onClick={() => onChange([...values, ''])}
          disabled={disabled || values.length >= 20}
          className="inline-flex h-11 items-center gap-2 rounded-[3px] border border-line px-4 text-sm text-ink transition-colors duration-200 ease-out hover:border-ink disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus size={16} aria-hidden="true" />
          Adaugă rând
        </button>

        <ImageUploadButton
          label="Încarcă poză"
          disabled={disabled || values.length >= 20}
          onUploaded={({ url }) => {
            // Prima casetă goală primește poza; altfel se adaugă un rând nou.
            const empty = values.findIndex((value) => value.trim() === '')
            if (empty === -1) {
              onChange([...values, url])
              return
            }
            const next = [...values]
            next[empty] = url
            onChange(next)
          }}
        />
      </div>
    </div>
  )
}

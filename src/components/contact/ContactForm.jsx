'use client'

import Link from 'next/link'
import { CalendarCheck, CalendarX, CircleCheck, Loader2, TriangleAlert } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import Input, { FieldError, FieldLabel } from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import { eventTypeOptions, formMessages } from '@/lib/site-config'

const EMPTY_FORM = {
  name: '',
  phone: '',
  email: '',
  eventType: '',
  eventTypeOther: '',
  eventDate: '',
  location: '',
  guestCount: '',
  message: '',
  website: '',
}

/**
 * The zod schema is the same module the API route validates with, but it is
 * imported on demand rather than at module load: it is roughly a third of this
 * page's JavaScript and nothing needs it until the visitor touches a field.
 */
async function validate(values) {
  const { contactSchema, toFieldErrors } = await import('@/lib/validation')
  const result = contactSchema.safeParse(values)
  return result.success ? null : toFieldErrors(result.error)
}

/**
 * Spune imediat dacă ziua aleasă e deja rezervată. Întoarce null cât nu știm
 * (nicio dată, se verifică, bază de date lipsă), ca formularul să nu afișeze
 * nimic în loc de un răspuns greșit.
 */
function useAvailability(day) {
  const [result, setResult] = useState({ day: null, booked: null })

  useEffect(() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return undefined
    const controller = new AbortController()
    fetch(`/api/availability?data=${day}`, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((body) => setResult({ day, booked: body?.booked ?? null }))
      .catch(() => {})
    return () => controller.abort()
  }, [day])

  // Un răspuns pentru altă zi decât cea aleasă acum nu mai e valabil.
  return result.day === day ? result.booked : null
}

export default function ContactForm({ initialEventType = '', source = 'site' }) {
  const [values, setValues] = useState({ ...EMPTY_FORM, eventType: initialEventType })
  const booked = useAvailability(values.eventDate)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')
  const [bannerMessage, setBannerMessage] = useState(null)
  // Set after mount: reading the clock during render is not a pure operation.
  const renderedAtRef = useRef(null)

  useEffect(() => {
    renderedAtRef.current = Date.now()
  }, [])

  const update = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }))
    if (errors[field]) setErrors((current) => ({ ...current, [field]: null }))
  }

  const handleBlur = (field) => async () => {
    if (!values[field]) return
    const fieldErrors = await validate(values)
    setErrors((current) => ({ ...current, [field]: fieldErrors?.[field] ?? null }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (status === 'pending') return

    setBannerMessage(null)
    setStatus('pending')

    const fieldErrors = await validate(values)
    if (fieldErrors) {
      setErrors(fieldErrors)
      setStatus('idle')
      return
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, source, renderedAt: renderedAtRef.current }),
      })

      const body = await response.json()

      if (response.ok && body.ok) {
        setStatus('success')
        return
      }

      if (body.errors) setErrors(body.errors)
      setBannerMessage(body.message ?? formMessages.error)
      setStatus('idle')
    } catch {
      setBannerMessage(formMessages.error)
      setStatus('idle')
    }
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-start gap-5 border border-line bg-paper p-8">
        <CircleCheck size={32} strokeWidth={1.25} aria-hidden="true" className="text-sage" />
        <h2 className="text-2xl">Cererea a fost trimisă</h2>
        <p className="text-ink-soft" role="status">
          {formMessages.success}
        </p>
        <button
          type="button"
          onClick={() => {
            setValues({ ...EMPTY_FORM, eventType: initialEventType })
            setErrors({})
            setStatus('idle')
          }}
          className="group inline-flex flex-col items-start text-sm text-ink transition-colors duration-200 ease-out hover:text-accent-deep"
        >
          Trimite altă cerere
          <span className="mt-1 block h-px w-0 bg-accent-deep transition-[width] duration-200 ease-out group-hover:w-full" />
        </button>
      </div>
    )
  }

  const isPending = status === 'pending'

  const fieldProps = (field) => ({
    id: field,
    name: field,
    value: values[field],
    onChange: update(field),
    onBlur: handleBlur(field),
    'aria-invalid': errors[field] ? 'true' : undefined,
    'aria-describedby': errors[field] ? `${field}-error` : undefined,
    disabled: isPending,
  })

  return (
    <form onSubmit={handleSubmit} noValidate method="post" action="/contact" className="relative flex flex-col gap-8">
      {bannerMessage ? (
        <p
          role="alert"
          className="flex items-start gap-3 border border-danger/40 bg-danger/5 px-4 py-3 text-sm text-danger"
        >
          <TriangleAlert size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
          {bannerMessage}
        </p>
      ) : null}

      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <FieldLabel htmlFor="name">Nume și prenume</FieldLabel>
          <Input {...fieldProps('name')} type="text" autoComplete="name" className="mt-2" />
          <FieldError id="name-error">{errors.name}</FieldError>
        </div>

        <div>
          <FieldLabel htmlFor="phone">Telefon</FieldLabel>
          <Input {...fieldProps('phone')} type="tel" autoComplete="tel" className="mt-2" />
          <FieldError id="phone-error">{errors.phone}</FieldError>
        </div>

        <div>
          <FieldLabel htmlFor="email" optional>
            Email (opțional)
          </FieldLabel>
          <Input {...fieldProps('email')} type="email" autoComplete="email" className="mt-2" />
          <FieldError id="email-error">{errors.email}</FieldError>
        </div>

        <div>
          <FieldLabel htmlFor="eventType">Tipul evenimentului</FieldLabel>
          <Select {...fieldProps('eventType')} className="mt-2">
            <option value="">Alege...</option>
            {eventTypeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
          <FieldError id="eventType-error">{errors.eventType}</FieldError>
        </div>

        {values.eventType === 'Altceva' ? (
          <div>
            <FieldLabel htmlFor="eventTypeOther">Descrie evenimentul</FieldLabel>
            <Input
              {...fieldProps('eventTypeOther')}
              type="text"
              placeholder="De exemplu: petrecere de firmă, botez..."
              className="mt-2"
            />
            <FieldError id="eventTypeOther-error">{errors.eventTypeOther}</FieldError>
          </div>
        ) : null}

        <div>
          <FieldLabel htmlFor="eventDate" optional>
            Data evenimentului
          </FieldLabel>
          <Input {...fieldProps('eventDate')} type="date" className="mt-2" />
          <FieldError id="eventDate-error">{errors.eventDate}</FieldError>
          {!errors.eventDate && booked === false ? (
            <p role="status" className="mt-2 flex items-center gap-2 text-sm text-sage">
              <CalendarCheck size={16} aria-hidden="true" />
              Data e liberă la noi.
            </p>
          ) : null}
          {!errors.eventDate && booked === true ? (
            <p role="status" className="mt-2 flex items-start gap-2 text-sm text-accent-deep">
              <CalendarX size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
              Avem deja un eveniment în ziua asta. Scrie-ne totuși: uneori putem prelua și un
              decor mai mic sau te ajutăm cu o zi apropiată.
            </p>
          ) : null}
        </div>

        <div>
          <FieldLabel htmlFor="location" optional>
            Locația evenimentului
          </FieldLabel>
          <Input {...fieldProps('location')} type="text" className="mt-2" />
          <FieldError id="location-error">{errors.location}</FieldError>
        </div>

        <div className="sm:col-span-2">
          <FieldLabel htmlFor="guestCount" optional>
            Număr aproximativ de invitați
          </FieldLabel>
          <Input
            {...fieldProps('guestCount')}
            type="number"
            inputMode="numeric"
            min="1"
            max="2000"
            className="mt-2 sm:max-w-xs"
          />
          <FieldError id="guestCount-error">{errors.guestCount}</FieldError>
        </div>

        <div className="sm:col-span-2">
          <FieldLabel htmlFor="message">Mesaj</FieldLabel>
          <Textarea
            {...fieldProps('message')}
            rows={5}
            placeholder="Spune-ne pe scurt ce îți dorești: sala, paleta de culori, ce zone vrei decorate."
            className="mt-2"
          />
          <FieldError id="message-error">{errors.message}</FieldError>
        </div>
      </div>

      {/* Honeypot: hidden with CSS only, so bots that ignore styling still fill it. */}
      <div aria-hidden="true" className="pointer-events-none absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="website">Nu completa acest câmp</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={update('website')}
        />
      </div>

      <div className="flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-[3px] bg-ink px-7 text-sm font-medium tracking-[0.02em] text-ivory transition-colors duration-200 ease-out hover:bg-accent-deep disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? (
            <>
              <Loader2 size={16} aria-hidden="true" className="animate-spin" />
              Se trimite...
            </>
          ) : (
            'Trimite cererea'
          )}
        </button>

        <p className="text-sm text-muted">
          Trimițând formularul ești de acord să te contactăm pe telefon sau email. Vezi{' '}
          <Link href="/despre" className="underline underline-offset-2 hover:text-accent-deep">
            cum lucrăm
          </Link>
          .
        </p>
      </div>
    </form>
  )
}

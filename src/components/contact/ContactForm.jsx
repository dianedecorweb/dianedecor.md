'use client'

import { CalendarCheck, CalendarX, CircleCheck, Loader2, TriangleAlert } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import Input, { FieldError, FieldLabel } from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import { Link, useDictionary } from '@/i18n/client'
import { serviceEventTypes } from '@/lib/site-config'

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

/**
 * Formularul precompletat din adresă: `?tip=decor-nunta` alege tipul,
 * `?din=` spune de unde vine vizitatorul, iar `?din=chirie&obiecte=a,b` scrie
 * în mesaj obiectele alese din catalog. Citit în browser, ca pagina de contact
 * să poată fi statică; numele obiectelor vin de pe server, nu din adresă.
 */
export function ContactFormFromUrl({ rentalNames }) {
  const { form: t } = useDictionary()
  const params = useSearchParams()
  const tip = params.get('tip')
  const din = params.get('din') ?? 'site'
  let initialEventType = tip && Object.hasOwn(serviceEventTypes, tip) ? serviceEventTypes[tip] : ''
  let initialMessage = ''

  const picked = din === 'chirie' ? [...new Set((params.get('obiecte') ?? '').split(','))].slice(0, 40) : []
  const names = picked.filter((slug) => Object.hasOwn(rentalNames, slug)).map((slug) => rentalNames[slug])
  if (names.length > 0) {
    initialEventType ||= serviceEventTypes['chirie-decor']
    initialMessage = `${t.rentalIntro}\n${names.map((name) => `• ${name}`).join('\n')}\n\n`
  }

  return <ContactForm initialEventType={initialEventType} initialMessage={initialMessage} source={din} />
}

export default function ContactForm({ initialEventType = '', initialMessage = '', source = 'site' }) {
  const { lang, form: t } = useDictionary()
  const [values, setValues] = useState({
    ...EMPTY_FORM,
    eventType: initialEventType,
    message: initialMessage,
  })
  const booked = useAvailability(values.eventDate)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')
  const [bannerMessage, setBannerMessage] = useState(null)
  // Set after mount: reading the clock during render is not a pure operation.
  const renderedAtRef = useRef(null)

  useEffect(() => {
    renderedAtRef.current = Date.now()
  }, [])

  // Schema dă mesajele în română; pe /ru se înlocuiesc cu traducerea lor.
  const localize = (fieldErrors) =>
    fieldErrors &&
    Object.fromEntries(
      Object.entries(fieldErrors).map(([field, message]) => [field, t.validation?.[message] ?? message])
    )

  const update = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }))
    if (errors[field]) setErrors((current) => ({ ...current, [field]: null }))
  }

  const handleBlur = (field) => async () => {
    if (!values[field]) return
    const fieldErrors = localize(await validate(values))
    setErrors((current) => ({ ...current, [field]: fieldErrors?.[field] ?? null }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (status === 'pending') return

    setBannerMessage(null)
    setStatus('pending')

    const fieldErrors = localize(await validate(values))
    if (fieldErrors) {
      setErrors(fieldErrors)
      setStatus('idle')
      return
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, source, locale: lang, renderedAt: renderedAtRef.current }),
      })

      const body = await response.json()

      if (response.ok && body.ok) {
        setStatus('success')
        return
      }

      if (body.errors) setErrors(localize(body.errors))
      // Mesajul serverului e în română; aici se alege după cod, în limba paginii.
      setBannerMessage(response.status === 429 ? t.messages.rateLimited : t.messages.error)
      setStatus('idle')
    } catch {
      setBannerMessage(t.messages.error)
      setStatus('idle')
    }
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-start gap-5 border border-line bg-paper p-8">
        <CircleCheck size={32} strokeWidth={1.25} aria-hidden="true" className="text-sage" />
        <h2 className="text-2xl">{t.successTitle}</h2>
        <p className="text-ink-soft" role="status">
          {t.messages.success}
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
          {t.another}
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
          <FieldLabel htmlFor="name">{t.name}</FieldLabel>
          <Input {...fieldProps('name')} type="text" autoComplete="name" className="mt-2" />
          <FieldError id="name-error">{errors.name}</FieldError>
        </div>

        <div>
          <FieldLabel htmlFor="phone">{t.phone}</FieldLabel>
          <Input {...fieldProps('phone')} type="tel" autoComplete="tel" className="mt-2" />
          <FieldError id="phone-error">{errors.phone}</FieldError>
        </div>

        <div>
          <FieldLabel htmlFor="email" optional>
            {t.email}
          </FieldLabel>
          <Input {...fieldProps('email')} type="email" autoComplete="email" className="mt-2" />
          <FieldError id="email-error">{errors.email}</FieldError>
        </div>

        <div>
          <FieldLabel htmlFor="eventType">{t.eventType}</FieldLabel>
          <Select {...fieldProps('eventType')} className="mt-2">
            <option value="">{t.choose}</option>
            {/* Valoarea rămâne cea românească, pe care o validează serverul; se traduce doar eticheta. */}
            {Object.entries(t.eventTypes).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <FieldError id="eventType-error">{errors.eventType}</FieldError>
        </div>

        {values.eventType === 'Altceva' ? (
          <div>
            <FieldLabel htmlFor="eventTypeOther">{t.eventTypeOther}</FieldLabel>
            <Input
              {...fieldProps('eventTypeOther')}
              type="text"
              placeholder={t.eventTypeOtherPlaceholder}
              className="mt-2"
            />
            <FieldError id="eventTypeOther-error">{errors.eventTypeOther}</FieldError>
          </div>
        ) : null}

        <div>
          <FieldLabel htmlFor="eventDate" optional>
            {t.eventDate}
          </FieldLabel>
          <Input {...fieldProps('eventDate')} type="date" className="mt-2" />
          <FieldError id="eventDate-error">{errors.eventDate}</FieldError>
          {!errors.eventDate && booked === false ? (
            <p role="status" className="mt-2 flex items-center gap-2 text-sm text-sage">
              <CalendarCheck size={16} aria-hidden="true" />
              {t.dateFree}
            </p>
          ) : null}
          {!errors.eventDate && booked === true ? (
            <p role="status" className="mt-2 flex items-start gap-2 text-sm text-accent-deep">
              <CalendarX size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
              {t.dateBooked}
            </p>
          ) : null}
        </div>

        <div>
          <FieldLabel htmlFor="location" optional>
            {t.location}
          </FieldLabel>
          <Input {...fieldProps('location')} type="text" className="mt-2" />
          <FieldError id="location-error">{errors.location}</FieldError>
        </div>

        <div className="sm:col-span-2">
          <FieldLabel htmlFor="guestCount" optional>
            {t.guestCount}
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
          <FieldLabel htmlFor="message">{t.message}</FieldLabel>
          <Textarea
            {...fieldProps('message')}
            rows={5}
            placeholder={t.messagePlaceholder}
            className="mt-2"
          />
          <FieldError id="message-error">{errors.message}</FieldError>
        </div>
      </div>

      {/* Honeypot: hidden with CSS only, so bots that ignore styling still fill it. */}
      <div aria-hidden="true" className="pointer-events-none absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="website">{t.honeypot}</label>
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
              {t.sending}
            </>
          ) : (
            t.submit
          )}
        </button>

        <p className="text-sm text-muted">
          {t.consent}{' '}
          <Link href="/despre" className="underline underline-offset-2 hover:text-accent-deep">
            {t.consentLink}
          </Link>
          .
        </p>
      </div>
    </form>
  )
}

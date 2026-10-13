'use client'

import { TriangleAlert } from 'lucide-react'

import Container from '@/components/layout/Container'
import Button from '@/components/ui/Button'
import { useDictionary } from '@/i18n/client'

/**
 * Shared body for every `error.js` boundary. `onRetry` receives the boundary's
 * `reset`, so the caller stays a two-line client component.
 */
export default function ErrorState({ title, description, onRetry }) {
  const { errors, common } = useDictionary()

  return (
    <Container className="flex flex-col items-center gap-6 py-28 text-center md:py-36">
      <TriangleAlert size={32} strokeWidth={1.25} aria-hidden="true" className="text-muted" />
      <h1>{title ?? errors.title}</h1>
      <p className="max-w-[52ch] text-ink-soft">{description ?? errors.text}</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        {onRetry ? (
          <Button onClick={onRetry} variant="primary">
            {errors.retry}
          </Button>
        ) : null}
        <Button href="/" variant="secondary">
          {common.backHome}
        </Button>
      </div>
    </Container>
  )
}

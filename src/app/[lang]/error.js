'use client'

import ErrorState from '@/components/ui/ErrorState'

export default function GlobalError({ error, reset }) {
  console.error('[app]', error)

  return <ErrorState onRetry={reset} />
}

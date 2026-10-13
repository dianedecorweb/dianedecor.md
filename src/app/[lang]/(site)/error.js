'use client'

import ErrorState from '@/components/ui/ErrorState'

export default function SiteError({ error, reset }) {
  console.error('[site]', error)

  return <ErrorState onRetry={reset} />
}

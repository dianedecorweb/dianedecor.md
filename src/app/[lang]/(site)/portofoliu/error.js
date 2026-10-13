'use client'

import ErrorState from '@/components/ui/ErrorState'

export default function PortfolioError({ error, reset }) {
  console.error('[portofoliu]', error)

  return (
    <ErrorState
      title="Nu am putut încărca portofoliul"
      description="A apărut o problemă la încărcarea proiectelor. Încearcă din nou sau sună-ne direct."
      onRetry={reset}
    />
  )
}

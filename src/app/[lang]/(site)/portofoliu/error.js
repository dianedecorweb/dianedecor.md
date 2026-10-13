'use client'

import ErrorState from '@/components/ui/ErrorState'
import { useDictionary } from '@/i18n/client'

export default function PortfolioError({ error, reset }) {
  const { errors } = useDictionary()
  console.error('[portofoliu]', error)

  return <ErrorState title={errors.portfolioTitle} description={errors.portfolioText} onRetry={reset} />
}

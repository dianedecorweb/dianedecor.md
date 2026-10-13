'use client'

import { useDictionary, usePagePath } from '@/i18n/client'
import { LOCALES, localePath } from '@/i18n/config'
import { cn } from '@/lib/utils'

/**
 * RO / RU, spre aceeași pagină în cealaltă limbă. Etichetele sunt cu litere
 * latine, ca paginile românești să nu ceară fonturile chirilice.
 *
 * Link simplu, nu navigare pe client: schimbarea limbii reîncarcă pagina, iar
 * `<html lang>` și fonturile se schimbă odată cu ea, fără stări intermediare.
 */
export default function LanguageSwitch({ className }) {
  const { lang, layout } = useDictionary()
  const path = usePagePath()

  return (
    <ul aria-label={layout.languageLabel} className={cn('flex items-center', className)}>
      {LOCALES.map((code) => (
        <li key={code}>
          <a
            href={localePath(code, path)}
            hrefLang={code}
            lang={code}
            aria-current={code === lang ? 'true' : undefined}
            className="inline-flex h-11 min-w-10 items-center justify-center text-sm tracking-[0.08em] opacity-60 transition-opacity duration-200 ease-out hover:opacity-100 aria-[current=true]:underline aria-[current=true]:underline-offset-[6px] aria-[current=true]:opacity-100"
          >
            {code.toUpperCase()}
          </a>
        </li>
      ))}
    </ul>
  )
}

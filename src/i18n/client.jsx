'use client'

import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
import { createContext, use } from 'react'

import { localePath, stripLocale } from './config'
import roClient from './ro.client'
import ruClient from './ru.client'

// ponytail: ambele dicționare de client ajung în browser (~4 KB gzip); separă-le
// pe limbă dacă vreodată cresc mult.
const DICTIONARIES = { ro: roClient, ru: ruClient }

// Implicit româna: panoul de admin nu are provider și folosește tot Button.
const LocaleContext = createContext(roClient)

export function LocaleProvider({ lang, children }) {
  return <LocaleContext value={DICTIONARIES[lang] ?? roClient}>{children}</LocaleContext>
}

/** Textele componentelor de client, în limba paginii. */
export function useDictionary() {
  return use(LocaleContext)
}

/** Calea paginii fără prefixul de limbă: `/ru/servicii` și `/servicii` dau `/servicii`. */
export function usePagePath() {
  return stripLocale(usePathname())
}

/**
 * `next/link` care ține vizitatorul în limba lui: pe paginile rusești,
 * `/contact` devine `/ru/contact`. Adresele externe și ancorele trec neschimbate.
 */
export function Link({ href, ...props }) {
  const { lang } = use(LocaleContext)
  const localized = typeof href === 'string' && href.startsWith('/') ? localePath(lang, href) : href
  return <NextLink href={localized} {...props} />
}

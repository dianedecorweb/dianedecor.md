/**
 * Downloads the site's two typefaces from Google Fonts, subset to the character
 * set Romanian actually uses, and writes them to `src/fonts` for `next/font/local`.
 *
 *   node scripts/fetch-fonts.js
 *
 * Why not `next/font/google`: its `latin-ext` subset covers every Eastern
 * European language, which cost 202 KB of render-blocking font data for a site
 * that only needs ă â î ș ț. Subsetting takes that to a fraction of the size.
 *
 * Run this again only if the glyph set below needs to grow (a new currency
 * symbol, say). The generated files are committed.
 */

import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

/** Every character the site can render: Latin letters, Romanian diacritics,
 *  digits, punctuation and the few symbols used in the UI. */
const GLYPHS = [
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  'abcdefghijklmnopqrstuvwxyz',
  '0123456789',
  'ĂÂÎȘȚăâîșț',
  // Legacy cedilla forms, in case older content uses them.
  'ŞŢşţ',
  ' .,;:!?\'"„”‘’()[]{}',
  '-–—_/\\|@#&*+=<>%$€',
  '·•…©®°',
].join('')

/**
 * Only the Russian letters and the punctuation Russian typography adds. These
 * files sit first in the font stack on /ru pages: Cyrillic comes from them,
 * digits and Latin characters from the files above. Romanian pages never ask
 * for a Cyrillic glyph, so the browser never downloads these there.
 */
const CYRILLIC = [
  'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ',
  'абвгдеёжзийклмнопрстуфхцчшщъыьэюя',
  '«»№',
].join('')

const FONTS = [
  { family: 'Cormorant Garamond', weight: 400, file: 'cormorant-400.woff2' },
  { family: 'Cormorant Garamond', weight: 600, file: 'cormorant-600.woff2' },
  { family: 'Inter', weight: 400, file: 'inter-400.woff2' },
  { family: 'Inter', weight: 500, file: 'inter-500.woff2' },
  { family: 'Cormorant Garamond', weight: 400, file: 'cormorant-400-cyr.woff2', glyphs: CYRILLIC, dir: 'public/fonts' },
  { family: 'Cormorant Garamond', weight: 600, file: 'cormorant-600-cyr.woff2', glyphs: CYRILLIC, dir: 'public/fonts' },
  { family: 'Inter', weight: 400, file: 'inter-400-cyr.woff2', glyphs: CYRILLIC, dir: 'public/fonts' },
  { family: 'Inter', weight: 500, file: 'inter-500-cyr.woff2', glyphs: CYRILLIC, dir: 'public/fonts' },
]

// A modern UA is required, otherwise Google serves TTF instead of WOFF2.
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'

async function fetchSubset({ family, weight, file, glyphs = GLYPHS, dir = 'src/fonts' }) {
  const url =
    `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}` +
    `&text=${encodeURIComponent(glyphs)}&display=swap`

  const cssResponse = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
  if (!cssResponse.ok) throw new Error(`${family} ${weight}: CSS request failed (${cssResponse.status})`)

  const css = await cssResponse.text()
  // Subset responses point at /l/font?kit=… rather than a .woff2 filename.
  const match = css.match(/url\((https:\/\/[^)]+)\)\s*format\('woff2'\)/)
  if (!match) throw new Error(`${family} ${weight}: no woff2 URL in the returned CSS`)

  const fontResponse = await fetch(match[1])
  if (!fontResponse.ok) throw new Error(`${family} ${weight}: font download failed`)

  const buffer = Buffer.from(await fontResponse.arrayBuffer())
  await writeFile(path.join(dir, file), buffer)

  return { file, kilobytes: Math.round(buffer.byteLength / 1024) }
}

async function main() {
  await mkdir('src/fonts', { recursive: true })
  await mkdir('public/fonts', { recursive: true })

  const results = []
  for (const font of FONTS) {
    results.push(await fetchSubset(font))
  }

  const total = results.reduce((sum, result) => sum + result.kilobytes, 0)
  for (const result of results) {
    console.log(`  ${result.file.padEnd(22)} ${result.kilobytes} KB`)
  }
  console.log(`  ${'total'.padEnd(22)} ${total} KB`)
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})

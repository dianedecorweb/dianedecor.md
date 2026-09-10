import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import sharp from 'sharp'

import { isAuthenticated } from '@/lib/auth'
import { slugify } from '@/lib/slug'

/** Peste asta clientul primește 413 înainte să se atingă sharp de fișier. */
const MAX_UPLOAD_BYTES = 15 * 1024 * 1024

/** Lățimea peste care nicio poză de portofoliu nu are ce câștiga. */
const MAX_WIDTH = 2000

const ACCEPTED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'])

const messages = {
  unauthorized: 'Neautorizat.',
  noFile: 'Nu ai ales niciun fișier.',
  tooLarge: 'Fișierul depășește 15 MB.',
  badType: 'Format neacceptat. Folosește JPG, PNG, WebP, AVIF sau GIF.',
  notConfigured: 'Stocarea de imagini nu e configurată (BLOB_READ_WRITE_TOKEN lipsește).',
  error: 'Încărcarea a eșuat. Încearcă din nou.',
}

/**
 * Primește o poză din admin, o trece prin sharp și o urcă în Vercel Blob.
 *
 * Baza de date păstrează doar linkul întors de aici — fișierul nu intră
 * niciodată în Mongo. Conversia în WebP la lățime maximă 2000px scoate de
 * obicei 80-90% din greutatea unei poze venite direct de pe telefon.
 */
export async function POST(request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ ok: false, message: messages.unauthorized }, { status: 401 })
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ ok: false, message: messages.notConfigured }, { status: 503 })
  }

  let file

  try {
    const form = await request.formData()
    file = form.get('file')
  } catch {
    return NextResponse.json({ ok: false, message: messages.error }, { status: 400 })
  }

  if (!file || typeof file === 'string' || typeof file.arrayBuffer !== 'function') {
    return NextResponse.json({ ok: false, message: messages.noFile }, { status: 400 })
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ ok: false, message: messages.tooLarge }, { status: 413 })
  }

  if (!ACCEPTED.has(file.type)) {
    return NextResponse.json({ ok: false, message: messages.badType }, { status: 415 })
  }

  try {
    const input = Buffer.from(await file.arrayBuffer())
    const image = sharp(input, { animated: file.type === 'image/gif' })
    const { width, height } = await image.metadata()

    // `withoutEnlargement` ca o poză mică să nu fie umflată degeaba.
    const optimized = await image
      .rotate()
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: 82, effort: 5 })
      .toBuffer()

    const base = slugify(file.name.replace(/\.[^.]+$/, '')) || 'imagine'

    // `addRandomSuffix` evită coliziunile fără să pierdem numele recognoscibil.
    const blob = await put(`portofoliu/${base}.webp`, optimized, {
      access: 'public',
      contentType: 'image/webp',
      addRandomSuffix: true,
      cacheControlMaxAge: 31536000,
    })

    return NextResponse.json({
      ok: true,
      url: blob.url,
      originalBytes: file.size,
      bytes: optimized.byteLength,
      width: Math.min(width ?? MAX_WIDTH, MAX_WIDTH),
      height: height ?? null,
    })
  } catch (error) {
    console.error('[api/admin/upload] failed:', error.message)
    return NextResponse.json({ ok: false, message: messages.error }, { status: 500 })
  }
}

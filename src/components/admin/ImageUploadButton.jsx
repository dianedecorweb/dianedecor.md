'use client'

import { Loader2, Upload } from 'lucide-react'
import { useId, useRef, useState } from 'react'

/**
 * Vercel respinge orice cerere spre o funcție mai mare de 4.5 MB, înainte ca
 * ea să ajungă la codul nostru. O poză de telefon trece des de atât.
 */
const SEND_AS_IS_BYTES = 4 * 1024 * 1024

/** Aceeași lățime maximă ca pe server: o poză mai lată nu are ce câștiga. */
const MAX_WIDTH = 2000

/**
 * Micșorează în browser doar pozele care n-ar trece de limita platformei.
 *
 * Restul pleacă neatinse: optimizarea finală rămâne pe server, unde sharp dă
 * același rezultat indiferent de dispozitivul de pe care se încarcă. Primul pas
 * de aici e la calitate 0.92, practic fără pierderi vizibile; serverul face
 * apoi conversia definitivă. GIF-urile nu se ating, ar pierde animația.
 */
async function shrinkForUpload(file) {
  if (file.size <= SEND_AS_IS_BYTES || file.type === 'image/gif') return file

  let canvas
  try {
    // createImageBitmap aplică orientarea din EXIF, deci poza nu iese culcată.
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_WIDTH / bitmap.width)
    canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()
  } catch {
    return file
  }

  const encode = (type, quality) =>
    new Promise((resolve) => canvas.toBlob(resolve, type, quality))

  for (const quality of [0.92, 0.85, 0.75]) {
    let blob = await encode('image/webp', quality)
    // Safari mai vechi nu scrie WebP și întoarce PNG; atunci trecem pe JPEG.
    if (!blob || blob.type !== 'image/webp') blob = await encode('image/jpeg', quality)

    if (blob && blob.size <= SEND_AS_IS_BYTES) {
      const extension = blob.type === 'image/webp' ? 'webp' : 'jpg'
      return new File([blob], `${file.name.replace(/\.[^.]+$/, '')}.${extension}`, {
        type: blob.type,
      })
    }
  }

  return file
}

/** Trimite un fișier și întoarce rezultatul serverului, sau aruncă un mesaj pe românește. */
async function uploadOne(file) {
  const body = new FormData()
  body.append('file', await shrinkForUpload(file))

  let response
  try {
    response = await fetch('/api/admin/upload', { method: 'POST', body })
  } catch {
    throw new Error('Încărcarea a eșuat. Verifică conexiunea.')
  }

  const result = await response.json().catch(() => null)
  if (response.ok && result?.ok) return result

  // Un 413 vine de la Vercel, nu de la noi, deci fără mesaj în JSON.
  throw new Error(
    result?.message ??
      (response.status === 413
        ? 'Poza e prea mare chiar și după micșorare. Încearcă alta.'
        : 'Încărcarea a eșuat.')
  )
}

/**
 * Alege una sau mai multe poze, le trimite pe rând la /api/admin/upload și
 * predă fiecare link din Blob imediat ce e gata.
 *
 * Pe rând, nu în paralel: fiecare poză mare e decodată în memoria browserului
 * pentru micșorare, iar zece deodată pot bloca un telefon. `maxFiles` taie
 * selecția la cât mai încape în galerie.
 */
export default function ImageUploadButton({
  disabled,
  label = 'Încarcă',
  multiple = false,
  maxFiles = Infinity,
  onUploaded,
}) {
  const inputRef = useRef(null)
  const inputId = useId()
  const [progress, setProgress] = useState(null)
  const [error, setError] = useState(null)
  const busy = progress !== null

  const handleChange = async (event) => {
    const picked = [...(event.target.files ?? [])]
    // Golim inputul imediat, ca aceleași poze să poată fi realese după o eroare.
    event.target.value = ''
    if (picked.length === 0) return

    const files = picked.slice(0, Math.max(0, maxFiles))
    const failures = []
    setError(null)

    for (const [index, file] of files.entries()) {
      setProgress({ done: index, total: files.length })
      try {
        onUploaded(await uploadOne(file))
      } catch (uploadError) {
        failures.push(`${file.name}: ${uploadError.message}`)
      }
    }

    setProgress(null)

    const notes = []
    if (picked.length > files.length) {
      notes.push(`Galeria are loc doar pentru încă ${files.length}; restul n-au fost încărcate.`)
    }
    if (failures.length > 0) notes.push(...failures)
    if (notes.length > 0) setError(notes.join(' '))
  }

  const busyLabel =
    progress && progress.total > 1
      ? `Se încarcă ${progress.done + 1} din ${progress.total}…`
      : 'Se încarcă…'

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
        multiple={multiple}
        className="sr-only"
        disabled={disabled || busy}
        onChange={handleChange}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || busy}
        aria-busy={busy ? 'true' : undefined}
        className="inline-flex h-11 items-center gap-2 rounded-[3px] border border-line px-4 text-sm text-ink transition-colors duration-200 ease-out hover:border-ink disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy ? (
          <Loader2 size={16} aria-hidden="true" className="animate-spin" />
        ) : (
          <Upload size={16} aria-hidden="true" />
        )}
        {busy ? busyLabel : label}
      </button>

      {error ? (
        <span role="alert" className="max-w-prose text-sm text-danger">
          {error}
        </span>
      ) : null}
    </span>
  )
}

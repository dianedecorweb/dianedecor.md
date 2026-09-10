'use client'

import { Loader2, Upload } from 'lucide-react'
import { useId, useRef, useState } from 'react'

/**
 * Alege un fișier, îl trimite la /api/admin/upload și întoarce linkul din Blob.
 *
 * Optimizarea se face pe server, nu aici: browserul ar putea reduce poza, dar
 * atunci calitatea ar depinde de dispozitivul studioului. sharp dă același
 * rezultat de fiecare dată.
 */
export default function ImageUploadButton({ disabled, label = 'Încarcă', onUploaded }) {
  const inputRef = useRef(null)
  const inputId = useId()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = async (event) => {
    const file = event.target.files?.[0]
    // Golim inputul imediat, ca aceeași poză să poată fi realeasă după o eroare.
    event.target.value = ''
    if (!file) return

    setBusy(true)
    setError(null)

    try {
      const body = new FormData()
      body.append('file', file)

      const response = await fetch('/api/admin/upload', { method: 'POST', body })
      const result = await response.json().catch(() => null)

      if (!response.ok || !result?.ok) {
        setError(result?.message ?? 'Încărcarea a eșuat.')
        return
      }

      onUploaded(result)
    } catch {
      setError('Încărcarea a eșuat. Verifică conexiunea.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
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
        {busy ? 'Se încarcă…' : label}
      </button>

      {error ? (
        <span role="alert" className="text-sm text-danger">
          {error}
        </span>
      ) : null}
    </span>
  )
}

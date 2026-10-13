'use client'

import Image from 'next/image'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { useDictionary } from '@/i18n/client'

/**
 * Gallery grid plus the full-screen overlay it opens. Kept together because the
 * thumbnails are the overlay's triggers — splitting them would mean lifting the
 * open index into a second client component for no gain.
 */
export default function Lightbox({ images, projectTitle }) {
  const { lightbox: t } = useDictionary()
  const [openIndex, setOpenIndex] = useState(null)
  const triggersRef = useRef([])
  const overlayRef = useRef(null)
  const closeButtonRef = useRef(null)
  const isOpen = openIndex !== null

  const close = useCallback(() => {
    const index = openIndex
    setOpenIndex(null)
    triggersRef.current[index]?.focus()
  }, [openIndex])

  const step = useCallback(
    (delta) => {
      setOpenIndex((index) => (index + delta + images.length) % images.length)
    },
    [images.length]
  )

  useEffect(() => {
    if (!isOpen) return undefined

    const { body } = document
    const previousOverflow = body.style.overflow
    body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        close()
        return
      }
      if (event.key === 'ArrowRight') {
        step(1)
        return
      }
      if (event.key === 'ArrowLeft') {
        step(-1)
        return
      }
      if (event.key !== 'Tab') return

      // Only the overlay's own controls are reachable while it is open.
      const focusable = Array.from(
        overlayRef.current?.querySelectorAll('button:not([tabindex="-1"])') ?? []
      )
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      body.style.overflow = previousOverflow
    }
  }, [isOpen, close, step])

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
        {images.map((image, index) => (
          <li key={image}>
            <button
              type="button"
              ref={(node) => {
                triggersRef.current[index] = node
              }}
              onClick={() => setOpenIndex(index)}
              aria-label={t.open(index + 1, images.length)}
              className="group relative block aspect-square w-full overflow-hidden bg-line"
            >
              <Image
                src={image}
                alt={t.image(projectTitle, index + 1)}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                quality={85}
                className="object-cover"
              />
            </button>
          </li>
        ))}
      </ul>

      {isOpen ? (
        <div
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          aria-label={t.gallery(projectTitle)}
          className="fixed inset-0 z-[80] flex flex-col bg-ink/95"
        >
          <div className="flex items-center justify-between px-4 py-4 text-ivory md:px-8">
            <p className="text-xs tracking-[0.14em] uppercase">
              {openIndex + 1} / {images.length}
            </p>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={close}
              aria-label={t.close}
              className="inline-flex h-11 w-11 items-center justify-center"
            >
              <X size={24} strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>

          <div className="relative flex flex-1 items-center justify-center px-2 pb-4 md:px-16">
            <button
              type="button"
              aria-label={t.close}
              tabIndex={-1}
              onClick={close}
              className="absolute inset-0 h-full w-full cursor-default"
            />

            <div className="relative h-full w-full max-w-5xl">
              <Image
                src={images[openIndex]}
                alt={t.image(projectTitle, openIndex + 1)}
                fill
                sizes="100vw"
                quality={85}
                className="object-contain"
              />
            </div>

            <button
              type="button"
              onClick={() => step(-1)}
              aria-label={t.previous}
              className="absolute top-1/2 left-2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center border border-ivory/40 text-ivory transition-colors duration-200 ease-out hover:bg-ivory hover:text-ink md:left-4"
            >
              <ChevronLeft size={22} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label={t.next}
              className="absolute top-1/2 right-2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center border border-ivory/40 text-ivory transition-colors duration-200 ease-out hover:bg-ivory hover:text-ink md:right-4"
            >
              <ChevronRight size={22} aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}
    </>
  )
}

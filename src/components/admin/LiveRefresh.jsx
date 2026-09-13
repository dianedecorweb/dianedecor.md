'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Reîmprospătează lista de mesaje din când în când, ca o apăsare pe butoanele
 * din Telegram să se vadă în panou fără să reîncarci pagina.
 *
 * Interogare la interval, nu conexiune deschisă: pagina e randată pe server și
 * `router.refresh()` aduce doar datele, nu tot documentul. O conexiune
 * permanentă ar însemna infrastructură în plus pentru un panou pe care se uită
 * una-două persoane.
 *
 * Ceasul stă cât fila e ascunsă — un panou lăsat deschis peste noapte nu are de
 * ce să bată la baza de date, iar la revenire se împrospătează imediat.
 */
export default function LiveRefresh({ intervalMs = 15000 }) {
  const router = useRouter()

  useEffect(() => {
    let timer = null

    const stop = () => {
      if (timer) clearInterval(timer)
      timer = null
    }

    const start = () => {
      stop()
      timer = setInterval(() => router.refresh(), intervalMs)
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        router.refresh()
        start()
      } else {
        stop()
      }
    }

    if (document.visibilityState === 'visible') start()
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      stop()
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [router, intervalMs])

  return null
}

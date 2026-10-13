import { isDatabaseConfigured, prisma } from '@/lib/prisma'
import { checkRateLimit, getClientIp, recordRateLimitHit } from '@/lib/rate-limit'

const CLICK_CHANNELS = ['phone', 'instagram']
const CLICK_SOURCES = ['fereastra', 'buton']

/** Destul pentru oricine apasă de câteva ori, puțin pentru cine ar umfla cifrele. */
const RATE_LIMIT = { limit: 20, windowMs: 10 * 60 * 1000 }

/** Ziua în Chișinău, nu în UTC: un apel de la 01:00 ține de ziua aceea. */
function chisinauDay() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Chisinau' }).format(new Date())
}

/**
 * Numără o apăsare pe telefon sau pe Instagram din fereastra de la intrare ori
 * din butonul flotant, ca statisticile să arate dacă ele aduc clienți.
 *
 * Nu ține nimic despre vizitator: doar un contor pe zi, canal și loc. Răspunde
 * mereu 204, fiindcă `sendBeacon` oricum nu citește răspunsul, iar o eroare
 * aici nu are de ce să-l privească pe vizitator.
 */
export async function POST(request) {
  const empty = new Response(null, { status: 204 })

  let payload
  try {
    payload = JSON.parse(await request.text())
  } catch {
    return empty
  }

  const { channel, source } = payload ?? {}
  if (!CLICK_CHANNELS.includes(channel) || !CLICK_SOURCES.includes(source)) return empty
  if (!isDatabaseConfigured()) return empty

  const key = `track:${getClientIp(request)}`
  if (!checkRateLimit(key, RATE_LIMIT).allowed) return empty
  recordRateLimitHit(key)

  const day = chisinauDay()
  try {
    await prisma.channelClick.upsert({
      where: { day_channel_source: { day, channel, source } },
      update: { count: { increment: 1 } },
      create: { day, channel, source, count: 1 },
    })
  } catch (error) {
    console.error('[api/track]', error.message)
  }

  return empty
}

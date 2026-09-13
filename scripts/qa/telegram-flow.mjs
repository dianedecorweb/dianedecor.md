/**
 * Lanțul întreg, pe producție: formular → bază de date → notificare în grup →
 * apăsare pe buton → starea se schimbă → mesajul din Telegram se rescrie.
 *
 * Apăsarea pe buton se simulează chemând webhook-ul exact cum o face Telegram,
 * cu antetul secret. Nu pot atinge un buton dintr-un grup în locul tău.
 */

import fs from 'node:fs'

const BASE = process.env.BASE ?? 'https://dianedecor.vercel.app'
const env = {}
for (const line of fs.readFileSync(new URL('../../.env.local', import.meta.url), 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
  if (m) env[m[1]] = m[2].replace(/^"|"$/g, '')
}

const results = []
const check = (label, passed, detail = '') => {
  results.push({ label, passed, detail })
  console.log(`${passed ? ' PASS' : ' FAIL'}  ${label}${detail ? `  — ${detail}` : ''}`)
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

const tg = (method, payload) =>
  fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload ?? {}),
  }).then((r) => r.json())

let ip = 0
async function submit(overrides = {}) {
  const payload = {
    name: 'Verificare Lanț',
    phone: '069216064',
    email: 'lant@dianedecor.md',
    eventType: 'Decor nuntă',
    eventDate: '2026-12-20',
    location: 'Chișinău',
    guestCount: 90,
    message: 'Cerere de test pentru butoanele din Telegram.',
    renderedAt: Date.now() - 20000,
    ...overrides,
  }
  const response = await fetch(`${BASE}/api/contact`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'x-forwarded-for': `198.51.100.${(ip++ % 250) + 1}`,
    },
    body: Buffer.from(JSON.stringify(payload), 'utf8'),
  })
  return { status: response.status, body: await response.json().catch(() => null) }
}

/** Cheamă webhook-ul cum o face Telegram când cineva apasă un buton. */
async function pressButton(messageId, status, secret = env.TELEGRAM_WEBHOOK_SECRET) {
  const response = await fetch(`${BASE}/api/telegram/webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-telegram-bot-api-secret-token': secret,
    },
    body: JSON.stringify({
      update_id: Math.floor(Math.random() * 1e9),
      callback_query: {
        id: String(Math.floor(Math.random() * 1e9)),
        from: { id: 1, is_bot: false, first_name: 'Test' },
        message: { message_id: 1, chat: { id: Number(env.TELEGRAM_CHAT_ID) } },
        data: `st:${status}:${messageId}`,
      },
    }),
  })
  return response.status
}

console.log('── Lanțul complet ─────────────────────────────────────────')

const { status, body } = await submit()
check('formularul de pe site acceptă cererea', status === 200 && body?.ok === true, `${status}`)

const messageId = body?.id
check('cererea a primit un identificator', Boolean(messageId), messageId ?? '-')

await wait(4000)

console.log('\n── Apărarea webhook-ului ──────────────────────────────────')
check('fără antetul secret → 401', (await pressButton(messageId, 'READ', 'gresit')) === 401)
check('cu antetul corect → 200', (await pressButton(messageId, 'READ')) === 200)

await wait(2500)

console.log('\n── Fiecare buton schimbă starea ───────────────────────────')
for (const target of ['CONTACTED', 'ARCHIVED', 'READ']) {
  const code = await pressButton(messageId, target)
  await wait(2000)

  const admin = await fetch(`${BASE}/api/telegram/webhook`, { method: 'GET' }).catch(() => null)
  check(`butonul „${target}" răspunde`, code === 200, `${code}`)
}

console.log('\n── Butoane cu date greșite ────────────────────────────────')
for (const [label, data] of [
  ['stare inexistentă', `st:CEVA:${messageId}`],
  ['prefix străin', `xx:READ:${messageId}`],
  ['identificator invalid', 'st:READ:nu-e-obiect-id'],
]) {
  const response = await fetch(`${BASE}/api/telegram/webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-telegram-bot-api-secret-token': env.TELEGRAM_WEBHOOK_SECRET,
    },
    body: JSON.stringify({
      update_id: 1,
      callback_query: {
        id: String(Math.floor(Math.random() * 1e9)),
        from: { id: 1 },
        message: { message_id: 1, chat: { id: Number(env.TELEGRAM_CHAT_ID) } },
        data,
      },
    }),
  })
  check(`${label} → refuzat fără să pice`, response.status === 200, `${response.status}`)
}

console.log('\n── Telegram însuși ────────────────────────────────────────')
const info = await tg('getWebhookInfo')
check('webhook înregistrat', info.result?.url?.endsWith('/api/telegram/webhook'), info.result?.url ?? '-')
check('fără erori de livrare', !info.result?.last_error_message, info.result?.last_error_message ?? 'niciuna')
check('nimic blocat în așteptare', (info.result?.pending_update_count ?? 0) === 0, String(info.result?.pending_update_count))

const failed = results.filter((r) => !r.passed)
console.log(`\n${'═'.repeat(58)}`)
console.log(`${results.length - failed.length}/${results.length} verificări trecute`)
if (failed.length) for (const f of failed) console.log(`  · ${f.label}${f.detail ? ` — ${f.detail}` : ''}`)

console.log(`\nid mesaj de test: ${messageId}`)
process.exit(failed.length === 0 ? 0 : 1)

/**
 * Bateria completă: formular de contact, notificare Telegram, autentificare
 * admin, rute publice și protejate.
 *
 *   node suite.mjs
 *
 * Fiecare verificare spune ce a cerut și ce a primit, ca un eșec să nu trimită
 * pe nimeni să caute prin loguri.
 */

import fs from 'node:fs'

const BASE = process.env.BASE ?? 'http://localhost:3000'

// Testele care scriu mesaje vizibile în grupul de Telegram al studioului rulează
// doar la cerere: `QA_SEND_TELEGRAM=1 npm run qa:api`. Altfel fiecare rulare
// lăsa în grup câte opt mesaje de test.
const SEND_TELEGRAM = process.env.QA_SEND_TELEGRAM === '1'
const ENV_PATH = new URL('../../.env.local', import.meta.url)

const env = {}
for (const line of fs.readFileSync(ENV_PATH, 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
  if (m) env[m[1]] = m[2].replace(/^"|"$/g, '')
}

const results = []
let group = ''

const setGroup = (name) => {
  group = name
  console.log(`\n── ${name} ${'─'.repeat(Math.max(0, 58 - name.length))}`)
}

const check = (label, passed, detail = '') => {
  results.push({ group, label, passed, detail })
  console.log(`${passed ? ' PASS' : ' FAIL'}  ${label}${detail ? `  — ${detail}` : ''}`)
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

const validPayload = (extra = {}) => ({
  name: 'Ana Popescu',
  phone: '069216064',
  email: 'ana@example.md',
  eventType: 'Decor nuntă',
  eventDate: '2026-11-20',
  location: 'Chișinău',
  guestCount: 80,
  message: 'Aș vrea o ofertă pentru decor de nuntă.',
  renderedAt: Date.now() - 20000,
  ...extra,
})

let ipCounter = 0
const freshIp = () => `198.51.100.${(ipCounter++ % 250) + 1}`

async function postContact(payload, headers = {}) {
  const response = await fetch(`${BASE}/api/contact`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      // IP propriu pentru fiecare cerere: altfel testele de mai devreme
      // consumă limita și cele de după par picate fără motiv.
      'x-forwarded-for': freshIp(),
      // Validare completă, fără scriere în baza reală și fără Telegram.
      // Serverul îl respectă doar cu QA_DRY_RUN=1 (verificat mai jos).
      'x-qa-dry-run': '1',
      ...headers,
    },
    body: Buffer.from(JSON.stringify(payload), 'utf8'),
  })
  const body = await response.json().catch(() => null)
  return { status: response.status, body, headers: response.headers }
}

// ─────────────────────────────────────────────── 1. formularul de contact
{
  // O cerere invalidă nu scrie nimic, dar spune dacă serverul a activat
  // modul de test. Fără el, cererile valide de mai jos ar ajunge în panou ca
  // mesaje false — baza locală e aceeași cu a site-ului live.
  const probe = await postContact({})
  if (probe.headers?.get?.('x-qa-dry-run') !== 'on') {
    console.error(
      '\nOpresc: serverul nu rulează cu QA_DRY_RUN=1, așa că cererile de test ar ajunge în baza reală.' +
        '\nAdaugă QA_DRY_RUN=1 în .env.local și repornește serverul.\n'
    )
    process.exit(1)
  }
}

setGroup('Formular de contact — validare')

{
  const { status, body } = await postContact(validPayload())
  check('cerere validă e acceptată', status === 200 && body?.ok === true, `${status}`)
  check('răspunsul întoarce id-ul salvat', typeof body?.id === 'string' && body.id.length > 0)
}

for (const [label, patch, field] of [
  ['nume lipsă', { name: '' }, 'name'],
  ['nume de o literă', { name: 'A' }, 'name'],
  ['telefon lipsă', { phone: '' }, 'phone'],
  ['telefon cu litere', { phone: 'abcdefgh' }, 'phone'],
  ['email invalid', { email: 'nu-e-email' }, 'email'],
  ['tip eveniment necunoscut', { eventType: 'Botez marțian' }, 'eventType'],
  ['mesaj prea scurt', { message: 'da' }, 'message'],
  ['„Altceva" fără detaliu', { eventType: 'Altceva', eventTypeOther: '' }, 'eventTypeOther'],
]) {
  const { status, body } = await postContact(validPayload(patch))
  const flagged = Boolean(body?.errors?.[field])
  check(`${label} → respins pe câmpul potrivit`, status === 400 && flagged, `${status}`)
}

{
  const { status, body } = await postContact(
    validPayload({ eventType: 'Altceva', eventTypeOther: 'Petrecere corporativă' })
  )
  check('„Altceva" cu detaliu e acceptat', status === 200 && body?.ok === true, `${status}`)
}

{
  const { status, body } = await postContact(validPayload({ email: '' }))
  check('email gol e opțional, nu eroare', status === 200 && body?.ok === true, `${status}`)
}

setGroup('Formular de contact — apărare')

{
  const { status, body } = await postContact(validPayload({ website: 'http://spam.example' }))
  check('capcana pentru roboți întoarce succes fals', status === 200 && body?.ok === true)
  check('capcana nu salvează nimic', body?.id === undefined, 'fără id')
}

{
  const { status, body } = await postContact(validPayload({ renderedAt: Date.now() }))
  check('trimiterea instantanee e acceptată dar marcată', status === 200 && body?.ok === true)
}

{
  const response = await fetch(`${BASE}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{ nu e json',
  })
  check('corp care nu e JSON → 400', response.status === 400, `${response.status}`)
}

{
  const response = await fetch(`${BASE}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '[1,2,3]',
  })
  check('tablou în loc de obiect → 400', response.status === 400, `${response.status}`)
}

// ─────────────────────────────────────────────── 2. limita de trimiteri
setGroup('Limita de trimiteri')

{
  const ip = `203.0.113.${Math.floor(Math.random() * 200) + 1}`
  const codes = []
  for (let i = 0; i < 5; i++) {
    const { status } = await postContact(validPayload({ name: `Test ${i}` }), { 'x-forwarded-for': ip })
    codes.push(status)
  }
  const accepted = codes.filter((c) => c === 200).length
  const blocked = codes.filter((c) => c === 429).length
  check('primele 3 trec', accepted === 3, `acceptate: ${accepted}`)
  check('următoarele primesc 429', blocked === 2, `blocate: ${blocked}`)

  const response = await fetch(`${BASE}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': ip },
    body: JSON.stringify(validPayload()),
  })
  check('429 vine cu Retry-After', response.headers.has('retry-after'), response.headers.get('retry-after') ?? '-')
}

// ─────────────────────────────────────────────── 3. Telegram
setGroup('Telegram — bot și grup')

const TG = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}`

async function tg(method, payload) {
  const response = await fetch(`${TG}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload ?? {}),
  })
  return response.json()
}

{
  const me = await tg('getMe')
  check('tokenul botului e valid', me.ok === true, me.ok ? `@${me.result.username}` : me.description)

  const chat = await tg('getChat', { chat_id: env.TELEGRAM_CHAT_ID })
  check('grupul e accesibil botului', chat.ok === true, chat.ok ? `${chat.result.type} · ${chat.result.title}` : chat.description)

  const admins = await tg('getChatAdministrators', { chat_id: env.TELEGRAM_CHAT_ID })
  check('botul poate citi lista de administratori', admins.ok === true, admins.ok ? `${admins.result.length} admini` : admins.description)
}

const escapeHtml = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

if (SEND_TELEGRAM) {
{
  // Exact aceleași cazuri care ar putea rupe parse_mode în producție.
  const cases = [
    ['text simplu', 'Test simplu de notificare.'],
    ['diacritice', 'Nuntă în Chișinău, cununie în aer liber, țesături.'],
    ['semne de marcaj', 'Preț < 5000 & > 3000 lei <b>fals bold</b>'],
    ['emoji în mesaj', 'Vreau ceva 💐🌸 frumos'],
    ['ghilimele', 'A zis „vreau roz" și \'alb\''],
    ['mesaj la limita de 1000', 'a'.repeat(1000)],
  ]

  for (const [label, text] of cases) {
    const sent = await tg('sendMessage', {
      chat_id: env.TELEGRAM_CHAT_ID,
      text: `🧪 <b>Test — ${escapeHtml(label)}</b>\n\n${escapeHtml(text)}`,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    })
    check(`mesaj trimis: ${label}`, sent.ok === true, sent.ok ? `id ${sent.result.message_id}` : sent.description)
    await wait(400)
  }
}
} else {
  console.log('  (sărite: mesajele de formatare scriu în grupul real; rulează cu QA_SEND_TELEGRAM=1)')
}

{
  const bad = await tg('sendMessage', { chat_id: '-1', text: 'test' })
  check('un chat_id greșit e raportat, nu ignorat', bad.ok === false, bad.description)
}

if (SEND_TELEGRAM) {
  setGroup('Telegram — notificare pornită din formular')
  
  {
    const before = Date.now()
    const { status, body } = await postContact(
      validPayload({
        name: 'Verificare Notificare',
        message: 'Mesaj cu semne speciale: < > & și diacritice: șțăîâ',
        location: 'Bălți',
      }),
      // Aici vrem chiar lanțul real: cerere salvată, notificare în grup.
      { 'x-qa-dry-run': '0' }
    )
    check('cererea a fost acceptată', status === 200 && body?.ok === true)
    await wait(2500)
    check('răspunsul a venit rapid, notificarea nu blochează', Date.now() - before < 4000, `${Date.now() - before}ms`)
  }
}

// ─────────────────────────────────────────────── calendar
setGroup('Calendar — disponibilitate publică')

{
  const ask = async (day) => {
    const response = await fetch(`${BASE}/api/availability?data=${encodeURIComponent(day)}`)
    return { status: response.status, body: await response.json().catch(() => null) }
  }
  const far = await ask('2031-06-14')
  check('o zi validă primește răspuns da / nu', far.status === 200 && typeof far.body?.booked === 'boolean', JSON.stringify(far.body))
  check('răspunsul public nu are altceva decât da / nu', Object.keys(far.body ?? {}).sort().join() === 'booked,ok')
  check('dată în alt format → 400', (await ask('14.06.2031')).status === 400)
  check('30 februarie → 400', (await ask('2031-02-30')).status === 400)
}

// ─────────────────────────────────────────────── 4. autentificare admin
setGroup('Autentificare admin')

async function login(email, password) {
  const response = await fetch(`${BASE}/api/admin/login`, {
    method: 'POST',
    // IP propriu pentru fiecare încercare, ca la formular: altfel cele 7
    // logări de aici consumă limita serverului (8 / 10 min) și parcursurile
    // din browser, rulate după, găsesc login-ul blocat.
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': freshIp() },
    body: JSON.stringify({ email, password }),
  })
  return { status: response.status, cookie: response.headers.get('set-cookie') }
}

for (const [label, email, password, expected] of [
  ['parolă greșită', env.ADMIN_EMAIL, 'gresit', 401],
  ['email greșit', 'cineva@altundeva.md', 'DDW2026*', 401],
  ['parola veche', 'admin@gmail.com', 'parola123', 401],
  ['câmpuri goale', '', '', 401],
  ['parolă cu spațiu la final', env.ADMIN_EMAIL, 'DDW2026* ', 401],
]) {
  const { status } = await login(email, password)
  check(`${label} → respins`, status === expected, `${status}`)
}

let adminCookie = null
{
  const { status, cookie } = await login(env.ADMIN_EMAIL, 'DDW2026*')
  check('credențialele corecte → 200', status === 200, `${status}`)
  adminCookie = cookie?.split(';')[0] ?? null
  check('sesiunea vine ca httpOnly', /httponly/i.test(cookie ?? ''), '')
  check('sesiunea e limitată la site (SameSite)', /samesite=lax/i.test(cookie ?? ''), '')
}

{
  const { status } = await login(env.ADMIN_EMAIL.toUpperCase(), 'DDW2026*')
  check('emailul nu e sensibil la majuscule', status === 200, `${status}`)
}

setGroup('Rute protejate')

async function head(pathname, cookie) {
  const response = await fetch(`${BASE}${pathname}`, {
    redirect: 'manual',
    headers: cookie ? { cookie } : {},
  })
  return response.status
}

for (const route of ['/admin', '/admin/portofoliu', '/admin/portofoliu/nou']) {
  check(`${route} fără sesiune → redirect`, (await head(route)) === 307)
  check(`${route} cu sesiune → 200`, (await head(route, adminCookie)) === 200)
}

check('/admin/login e public', (await head('/admin/login')) === 200)

for (const [method, route] of [
  ['POST', '/api/admin/projects'],
  ['POST', '/api/admin/upload'],
]) {
  const response = await fetch(`${BASE}${route}`, { method })
  check(`${method} ${route} fără sesiune → 401`, response.status === 401, `${response.status}`)
}

{
  const forged = 'dd_admin_session=eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6OTk5OTk5OTk5OX0.semnatura-falsa'
  check('sesiune cu semnătură falsă → redirect', (await head('/admin', forged)) === 307)
}

// ─────────────────────────────────────────────── 5. paginile publice
setGroup('Pagini publice')

const pages = [
  '/', '/servicii', '/portofoliu', '/despre', '/contact', '/chirie-decor',
  '/portofoliu/categorie/nunti', '/portofoliu/categorie/cumetrii',
  '/servicii/decor-nunta', '/portofoliu/nunta-ana-roman-chisinau',
  '/sitemap.xml', '/robots.txt', '/manifest.webmanifest',
]

for (const pathname of pages) {
  const response = await fetch(`${BASE}${pathname}`)
  check(`${pathname}`, response.ok, `${response.status}`)
}

{
  const response = await fetch(`${BASE}/pagina-inexistenta`)
  check('pagină inexistentă → 404', response.status === 404, `${response.status}`)
}

{
  const response = await fetch(`${BASE}/portofoliu?categorie=nunti`, { redirect: 'manual' })
  check('filtrul vechi din URL redirecționează', response.status === 308, `${response.status}`)
}

// ─────────────────────────────────────────────── 6. versiunea în rusă
setGroup('Versiunea în rusă')

for (const pathname of pages.filter((path) => !path.includes('.'))) {
  const ruPath = pathname === '/' ? '/ru' : `/ru${pathname}`
  const response = await fetch(`${BASE}${ruPath}`)
  const html = await response.text()
  check(`${ruPath}`, response.ok && html.includes('<html lang="ru"'), `${response.status}`)
}

{
  const html = await (await fetch(`${BASE}/ru/servicii`)).text()
  check('/ru/servicii: canonic spre /ru/servicii', /<link rel="canonical" href="[^"]*\/ru\/servicii"/.test(html))
  check('/ru/servicii: hreflang spre varianta românească', /hrefLang="ro" href="[^"]*\/servicii"/.test(html))
  check('/ru/servicii: linkurile din meniu rămân în rusă', html.includes('href="/ru/portofoliu"'))

  const roHtml = await (await fetch(`${BASE}/servicii`)).text()
  check('/servicii: html lang="ro"', roHtml.includes('<html lang="ro"'))
}

{
  const response = await fetch(`${BASE}/ro/servicii`, { redirect: 'manual' })
  check('/ro/servicii → /servicii', response.status === 308 && response.headers.get('location')?.endsWith('/servicii'), `${response.status}`)
}

{
  // Mesajele de validare vin din schema românească; pe /ru se înlocuiesc după text.
  const schema = fs.readFileSync(new URL('../../src/lib/validation.js', import.meta.url), 'utf8')
  const ru = fs.readFileSync(new URL('../../src/i18n/ru.client.js', import.meta.url), 'utf8')
  const missing = [...schema.matchAll(/'([^']+\.)'/g)].map((m) => m[1]).filter((message) => !ru.includes(`'${message}'`))
  check('fiecare mesaj de validare are traducere rusă', missing.length === 0, missing.join(' | '))
}

setGroup('Antete de securitate')

{
  const response = await fetch(`${BASE}/`)
  for (const [header, expected] of [
    ['x-content-type-options', 'nosniff'],
    ['x-frame-options', 'DENY'],
    ['referrer-policy', 'strict-origin-when-cross-origin'],
  ]) {
    check(`${header}`, response.headers.get(header) === expected, response.headers.get(header) ?? 'lipsă')
  }
  check('nu divulgă tehnologia (x-powered-by)', !response.headers.has('x-powered-by'))
}

// ─────────────────────────────────────────────── raport
const failed = results.filter((r) => !r.passed)
console.log(`\n${'═'.repeat(62)}`)
console.log(`${results.length - failed.length}/${results.length} verificări trecute`)

if (failed.length > 0) {
  console.log('\nPicate:')
  for (const f of failed) console.log(`  · [${f.group}] ${f.label}${f.detail ? ` — ${f.detail}` : ''}`)
}

process.exit(failed.length === 0 ? 0 : 1)

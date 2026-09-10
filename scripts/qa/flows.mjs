/**
 * Parcurge site-ul așa cum o face un om: meniul pe telefon, galeria, formularul
 * de contact, autentificarea în admin și meniul lateral al panoului.
 *
 *   node flows.mjs
 */

import { connect, reporter } from './cdp.mjs'

const BASE = process.env.BASE ?? 'http://localhost:3000'
const page = await connect()
const report = reporter()

const click = (selector) => page.evaluate(`document.querySelector(${JSON.stringify(selector)})?.click(), true`)
const text = (selector) =>
  page.evaluate(`document.querySelector(${JSON.stringify(selector)})?.textContent?.trim() ?? null`)
const exists = (selector) => page.evaluate(`!!document.querySelector(${JSON.stringify(selector)})`)
const count = (selector) => page.evaluate(`document.querySelectorAll(${JSON.stringify(selector)}).length`)

// ──────────────────────────────────────────── meniul pe telefon
report.group('Meniul pe telefon (390×844)')
await page.device(390, 844, 3)
await page.goto(`${BASE}/servicii`, 2000)

report.check('butonul de meniu există', await exists('button[aria-label="Deschide meniul"]'))
await click('button[aria-label="Deschide meniul"]')
await page.wait(500)

report.check('meniul se deschide', await exists('[role="dialog"][aria-label="Meniu"]'))
report.check('scroll blocat cât e deschis', (await page.evaluate('document.body.style.overflow')) === 'hidden')

{
  const box = await page.evaluate(`(() => {
    const panel = document.querySelector('[role="dialog"][aria-label="Meniu"]')
    if (!panel) return null
    const r = panel.getBoundingClientRect()
    return { left: Math.round(r.left), top: Math.round(r.top), width: Math.round(r.width), height: Math.round(r.height), vw: innerWidth, vh: innerHeight }
  })()`)
  report.check(
    'panoul acoperă tot ecranul',
    box && box.left === 0 && box.top === 0 && box.width === box.vw && box.height >= box.vh - 1,
    box ? `${box.width}×${box.height} la (${box.left},${box.top}) pe ${box.vw}×${box.vh}` : 'lipsă'
  )

  const opaque = await page.evaluate(`(() => {
    const panel = document.querySelector('[role="dialog"][aria-label="Meniu"] > *')
    if (!panel) return null
    const bg = getComputedStyle(panel).backgroundColor
    const m = bg.match(/[\\d.]+/g)
    return { bg, alpha: m && m.length === 4 ? Number(m[3]) : 1 }
  })()`)
  report.check('panoul e opac, nu transparent', opaque && opaque.alpha === 1, opaque?.bg ?? 'lipsă')
}

report.check('meniul are toate linkurile', (await count('[role="dialog"][aria-label="Meniu"] nav a')) === 5)
report.check('are și numărul de telefon', await exists('[role="dialog"][aria-label="Meniu"] a[href^="tel:"]'))

await page.key('Escape', 'Escape', 27)
report.check('Esc închide meniul', !(await exists('[role="dialog"][aria-label="Meniu"]')))
report.check('scroll restaurat', (await page.evaluate('document.body.style.overflow')) !== 'hidden')

await click('button[aria-label="Deschide meniul"]')
await page.wait(400)
await click('[role="dialog"][aria-label="Meniu"] nav a[href="/portofoliu"]')
await page.wait(1800)
report.check('un link din meniu navighează', (await page.evaluate('location.pathname')) === '/portofoliu')
report.check('meniul se închide după navigare', !(await exists('[role="dialog"][aria-label="Meniu"]')))

// ──────────────────────────────────────────── galeria
report.group('Galeria unui proiect (1440×900)')
await page.device(1440, 900, 1)
await page.goto(`${BASE}/portofoliu/nunta-ana-roman-chisinau`, 2200)

const thumbs = await count('button[aria-label^="Deschide imaginea"]')
report.check('galeria are miniaturi', thumbs > 0, `${thumbs} imagini`)

await click('button[aria-label^="Deschide imaginea"]')
await page.wait(500)
report.check('se deschide la click', await exists('[role="dialog"][aria-modal="true"]'))
report.check('scroll blocat', (await page.evaluate('document.body.style.overflow')) === 'hidden')
report.check('arată poziția 1 / n', (await text('[role="dialog"] p')) === `1 / ${thumbs}`)

await page.key('ArrowRight', 'ArrowRight', 39)
report.check('săgeata dreapta avansează', (await text('[role="dialog"] p')) === `2 / ${thumbs}`)

await page.key('ArrowLeft', 'ArrowLeft', 37)
await page.key('ArrowLeft', 'ArrowLeft', 37)
report.check('trece circular la ultima', (await text('[role="dialog"] p')) === `${thumbs} / ${thumbs}`)

await page.key('Escape', 'Escape', 27)
report.check('Esc închide galeria', !(await exists('[role="dialog"][aria-modal="true"]')))
report.check('scroll restaurat', (await page.evaluate('document.body.style.overflow')) !== 'hidden')

// ──────────────────────────────────────────── formularul de contact
report.group('Formularul de contact (390×844)')
await page.device(390, 844, 3)
await page.goto(`${BASE}/contact`, 2200)

report.check('capcana pentru roboți e ascunsă vizual', await page.evaluate(`(() => {
  const el = document.querySelector('input[name="website"]')
  if (!el) return false
  const r = el.getBoundingClientRect()
  return r.right < 0 || r.left > innerWidth
})()`))

report.check('câmpul „altceva" apare doar când trebuie', !(await exists('#eventTypeOther')))

await page.evaluate(`(() => {
  const select = document.querySelector('#eventType')
  const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set
  setter.call(select, 'Altceva')
  select.dispatchEvent(new Event('change', { bubbles: true }))
  return true
})()`)
await page.wait(500)
report.check('alegând „Altceva" apare câmpul suplimentar', await exists('#eventTypeOther'))

report.check('data are selector nativ', (await page.evaluate(`document.querySelector('#eventDate')?.type`)) === 'date')
report.check(
  'numărul de invitați deschide tastatura numerică',
  (await page.evaluate(`document.querySelector('#guestCount')?.inputMode`)) === 'numeric'
)

// ──────────────────────────────────────────── admin
report.group('Admin — autentificare și meniu lateral')
// Profilul de browser păstrează cookie-urile între rulări; fără curățare,
// sesiunea rămasă din rularea anterioară ar face testul să treacă degeaba.
await page.send('Network.enable')
await page.send('Network.clearBrowserCookies')
await page.goto(`${BASE}/admin`, 1800)
report.check('fără sesiune duce la login', (await page.evaluate('location.pathname')) === '/admin/login')
report.check('pagina de login nu are meniu lateral', !(await exists('aside')))

await page.evaluate(`(() => {
  const setValue = (selector, value) => {
    const el = document.querySelector(selector)
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
    setter.call(el, value)
    el.dispatchEvent(new Event('input', { bubbles: true }))
  }
  setValue('#email', 'diane.decor.web@gmail.com')
  setValue('#password', 'DDW2026*')
  document.querySelector('form').requestSubmit()
  return true
})()`)
await page.wait(3000)

report.check('autentificarea intră în panou', (await page.evaluate('location.pathname')) === '/admin')
report.check('acum apare meniul lateral', await exists('aside'))

report.check('pe telefon meniul lateral are buton', await exists('button[aria-controls]'))
{
  const before = await page.evaluate(`(() => {
    const btn = document.querySelector('button[aria-controls]')
    return btn ? btn.getAttribute('aria-expanded') : null
  })()`)
  await click('button[aria-controls]')
  await page.wait(500)
  const after = await page.evaluate(`(() => {
    const btn = document.querySelector('button[aria-controls]')
    return btn ? btn.getAttribute('aria-expanded') : null
  })()`)
  report.check('butonul deschide meniul lateral', before !== after, `${before} → ${after}`)
}

await page.goto(`${BASE}/admin/portofoliu`, 2200)
report.check('lista de lucrări se încarcă', (await count('a[href^="/admin/portofoliu/"], tr')) > 0)

await page.goto(`${BASE}/admin/portofoliu/nou`, 2200)
report.check('formularul de proiect nou se deschide', await exists('form'))
report.check('are buton de încărcare pentru copertă', await page.evaluate(`
  [...document.querySelectorAll('button')].some((b) => b.textContent.includes('Încarcă coperta'))
`))
report.check('are buton de încărcare în galerie', await page.evaluate(`
  [...document.querySelectorAll('button')].some((b) => b.textContent.includes('Încarcă poză'))
`))
report.check('selectorul de fișiere acceptă doar imagini', await page.evaluate(`
  document.querySelector('input[type=file]')?.getAttribute('accept')?.startsWith('image/')
`))

const failed = report.finish()
await page.close()
process.exit(failed === 0 ? 0 : 1)

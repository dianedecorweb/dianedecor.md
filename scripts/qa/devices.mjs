/**
 * Verifică fiecare pagină pe lățimile reale ale telefoanelor, tabletelor și
 * ecranelor de birou: scroll orizontal, ținte de atins prea mici, text prea mic.
 *
 *   node devices.mjs
 */

import { connect, reporter } from './cdp.mjs'

const BASE = process.env.BASE ?? 'http://localhost:3000'

const DEVICES = [
  ['Galaxy A / iPhone SE', 360, 800, 3],
  ['iPhone SE 3', 375, 667, 2],
  ['iPhone 14 / 15', 390, 844, 3],
  ['Pixel 8', 412, 915, 2.6],
  ['iPhone 15 Pro Max', 430, 932, 3],
  ['iPad mini', 768, 1024, 2],
  ['iPad Air', 820, 1180, 2],
  ['iPad Pro 12.9', 1024, 1366, 2],
  ['Laptop', 1280, 800, 1],
  ['Desktop', 1440, 900, 1],
  ['Desktop lat', 1920, 1080, 1],
]

const PAGES = [
  '/',
  '/servicii',
  '/servicii/decor-nunta',
  '/portofoliu',
  '/portofoliu/categorie/nunti',
  '/portofoliu/nunta-ana-roman-chisinau',
  '/despre',
  '/contact',
  '/admin/login',
]

/** Rulează în pagină: caută ce depășește ecranul și ce e prea mic de atins. */
const AUDIT = `(() => {
  const viewport = document.documentElement.clientWidth
  const problems = []

  if (document.documentElement.scrollWidth > viewport + 1) {
    const guilty = [...document.querySelectorAll('body *')]
      .map((el) => ({ el, rect: el.getBoundingClientRect() }))
      .filter(({ rect }) => rect.width > 0 && rect.right > viewport + 1)
      .sort((a, b) => b.rect.right - a.rect.right)
      .slice(0, 3)
      .map(({ el, rect }) => \`<\${el.tagName.toLowerCase()}\${el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : ''}> până la \${Math.round(rect.right)}px\`)
    problems.push(\`scroll orizontal: \${document.documentElement.scrollWidth}/\${viewport} — \${guilty.join(', ')}\`)
  }

  // 44px e pragul recomandat de Apple și Google pentru orice țintă atinsă cu
  // degetul. Nu se aplică la: elemente ascunse pentru cititoarele de ecran,
  // câmpuri scoase din tabulare (capcana pentru roboți) și linkuri din
  // interiorul unui paragraf, care se ating în contextul textului.
  const exempt = (el) => {
    if (el.closest('[aria-hidden="true"]')) return true
    if (el.getAttribute('tabindex') === '-1') return true
    if (el.matches('.sr-only, .sr-only *')) return true
    if (el.tagName === 'A' && el.closest('p')) return true
    return false
  }

  if (window.innerWidth < 768) {
    const small = [...document.querySelectorAll('a[href], button, input, select, textarea')]
      .filter((el) => {
        const rect = el.getBoundingClientRect()
        if (rect.width === 0 || rect.height === 0) return false
        if (exempt(el)) return false
        const style = getComputedStyle(el)
        if (style.visibility === 'hidden' || style.display === 'none') return false
        return rect.height < 40 || rect.width < 24
      })
      .slice(0, 3)
      .map((el) => \`<\${el.tagName.toLowerCase()}> "\${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 22)}" \${Math.round(el.getBoundingClientRect().width)}x\${Math.round(el.getBoundingClientRect().height)}\`)
    if (small.length) problems.push('ținte prea mici: ' + small.join(', '))
  }

  const tiny = [...document.querySelectorAll('p, li, span, a, dd, dt')]
    .filter((el) => {
      if (!el.textContent.trim()) return false
      const size = parseFloat(getComputedStyle(el).fontSize)
      return size > 0 && size < 11
    })
    .slice(0, 2)
    .map((el) => \`"\${el.textContent.trim().slice(0, 20)}" \${getComputedStyle(el).fontSize}\`)
  if (tiny.length) problems.push('text sub 11px: ' + tiny.join(', '))

  const broken = [...document.images].filter((i) => {
    if (i.naturalWidth !== 0 || !i.getAttribute('src')) return false
    const rect = i.getBoundingClientRect()
    // Doar imaginile din ecran sau imediat sub el: cele leneșe de mai jos nu
    // s-au încărcat pentru că nu trebuiau încă.
    return rect.top < window.innerHeight * 1.5 && rect.bottom > -200
  })
  if (broken.length) {
    problems.push(\`\${broken.length} imagini din ecran nu s-au încărcat: \` +
      broken.slice(0, 2).map((i) => i.getAttribute('src').slice(0, 50)).join(', '))
  }

  return problems
})()`

const page = await connect()
const report = reporter()

for (const [name, width, height, scale] of DEVICES) {
  report.group(`${name} — ${width}×${height} @${scale}x`)
  await page.device(width, height, scale)

  for (const pathname of PAGES) {
    await page.goto(`${BASE}${pathname}`)
    const problems = await page.evaluate(AUDIT)
    report.check(pathname, problems.length === 0, problems.join(' | '))
  }
}

const failed = report.finish()
await page.close()
process.exit(failed === 0 ? 0 : 1)

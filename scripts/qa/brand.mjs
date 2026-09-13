/** Verifică logo-ul și fotografia de hero fără să mă uit la capturi. */

import { connect, reporter } from './cdp.mjs'

const BASE = process.env.BASE ?? 'http://localhost:3000'
const page = await connect()
const report = reporter()

/** Media culorii într-un dreptunghi din pagină, citită din captură. */
async function averageColor(rect) {
  const { data } = await page.send('Page.captureScreenshot', {
    format: 'png',
    clip: { ...rect, scale: 1 },
  })
  return page.evaluate(`(async () => {
    const img = new Image()
    img.src = 'data:image/png;base64,${data}'
    await img.decode()
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)
    const px = ctx.getImageData(0, 0, canvas.width, canvas.height).data
    const lums = []
    for (let i = 0; i < px.length; i += 4) {
      lums.push((px[i] + px[i+1] + px[i+2]) / 3)
    }
    lums.sort((a, b) => a - b)
    const at = (q) => Math.round(lums[Math.floor(lums.length * q)])
    return { intunecat: at(0.05), mediu: at(0.5), luminos: at(0.95) }
  })()`)
}

/**
 * Decupajul capturii se socotește în coordonatele paginii, iar
 * getBoundingClientRect raportează la fereastră. Fără scrollY, după derulare
 * am măsura cu totul altă zonă.
 */
const logoRect = () =>
  page.evaluate(`(() => {
    const el = document.querySelector('header img.site-logo')
    if (!el) return null
    const r = el.getBoundingClientRect()
    return {
      x: Math.round(r.x + scrollX),
      y: Math.round(r.y + scrollY),
      width: Math.round(r.width),
      height: Math.round(r.height),
    }
  })()`)

// ─────────────────────────────────────────── antet peste hero
report.group('Logo în antet, peste hero (1440px)')
await page.device(1440, 900, 1)
await page.goto(`${BASE}/`, 2200)

{
  const box = await logoRect()
  report.check('logo prezent în antet', Boolean(box), box ? `${box.width}×${box.height}` : 'lipsă')
  report.check('destul de mare ca să se citească', box?.height >= 44, `${box?.height}px înălțime`)

  const filter = await page.evaluate(`getComputedStyle(document.querySelector('header img.site-logo')).filter`)
  report.check('inversat peste fotografie', filter.includes('invert'), filter)

  const tones = await averageColor(box)
  // Desenul inversat trebuie să fie aproape alb; fotografia din spate e închisă.
  report.check(
    'desenul e luminos peste fotografia întunecată',
    tones.luminos > 200 && tones.luminos - tones.intunecat > 90,
    `desen ${tones.luminos}, fundal ${tones.intunecat}`
  )
}

// ─────────────────────────────────────────── antet după derulare
report.group('Logo în antet, după derulare')
await page.evaluate('window.scrollTo(0, 600)')
await page.wait(900)

{
  const filter = await page.evaluate(`getComputedStyle(document.querySelector('header img.site-logo')).filter`)
  report.check('revine la culorile lui', filter === 'none', filter)

  const box = await logoRect()
  const tones = await averageColor(box)
  report.check(
    'desenul e închis pe ivoriu',
    tones.intunecat < 120 && tones.luminos - tones.intunecat > 90,
    `desen ${tones.intunecat}, fundal ${tones.luminos}`
  )
}

// ─────────────────────────────────────────── pagină fără hero
report.group('Logo pe o pagină obișnuită')
await page.goto(`${BASE}/servicii`, 2000)
{
  const filter = await page.evaluate(`getComputedStyle(document.querySelector('header img.site-logo')).filter`)
  report.check('fără inversare', filter === 'none', filter)
}

// ─────────────────────────────────────────── subsol
report.group('Logo în subsol')
{
  const footer = await page.evaluate(`(() => {
    const el = document.querySelector('footer img.site-logo')
    if (!el) return null
    const r = el.getBoundingClientRect()
    return { src: el.getAttribute('src'), height: Math.round(r.height), filter: getComputedStyle(el).filter }
  })()`)
  report.check('folosește varianta colorată pentru fundal închis', footer?.src?.includes('logo-light'), footer?.src ?? 'lipsă')
  report.check('fără filtru care ar albi floarea', footer?.filter === 'none', footer?.filter ?? '-')
  report.check('destul de mare', (footer?.height ?? 0) >= 44, `${footer?.height}px`)
}

// ─────────────────────────────────────────── fotografia de hero
report.group('Fotografia de hero, pe fiecare lățime')
for (const [name, width, height, expected] of [
  ['telefon mic', 360, 800, 'hero-portret'],
  ['iPhone 14', 390, 844, 'hero-portret'],
  ['iPhone Pro Max', 430, 932, 'hero-portret'],
  ['tabletă verticală', 768, 1024, 'hero-portret'],
  ['tabletă orizontală', 1024, 768, 'hero.jpg'],
  ['laptop', 1280, 800, 'hero.jpg'],
  ['desktop', 1920, 1080, 'hero.jpg'],
]) {
  await page.device(width, height, 2)
  await page.goto(`${BASE}/`, 1800)

  const chosen = await page.evaluate(`(() => {
    const img = document.querySelector('#hero picture img')
    if (!img) return null
    const r = img.getBoundingClientRect()
    return {
      ales: img.currentSrc || img.src,
      latime: Math.round(r.width),
      inaltime: Math.round(r.height),
      natural: img.naturalWidth + 'x' + img.naturalHeight,
      viewport: innerWidth + 'x' + innerHeight,
    }
  })()`)

  report.check(
    `${name} (${width}px) → ${expected}`,
    Boolean(chosen?.ales?.includes(expected)),
    chosen ? `${chosen.ales.split('/').pop()} · natural ${chosen.natural}` : 'lipsă'
  )

  if (chosen) {
    // Cât din fotografie se pierde la tăiere: raportul dintre laturi.
    const [nw, nh] = chosen.natural.split('x').map(Number)
    const boxRatio = chosen.latime / chosen.inaltime
    const imgRatio = nw / nh
    const waste = Math.abs(1 - boxRatio / imgRatio)
    report.check(`${name}: cadrul se potrivește`, waste < 0.5, `nepotrivire ${(waste * 100).toFixed(0)}%`)
  }
}

const failed = report.finish()
await page.close()
process.exit(failed === 0 ? 0 : 1)

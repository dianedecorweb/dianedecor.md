/**
 * Obiectele bifate în catalogul de chirie, ținute în browserul vizitatorului.
 *
 * Citite prin `useSyncExternalStore`: valoarea e un șir („arcada,suport"),
 * deci React o compară simplu și nu randează degeaba. Evenimentul `storage`
 * ține selecția la zi între file, iar cel propriu în fila curentă.
 */

const KEY = 'dd-chirie'
const EVENT = 'dd-chirie-change'

/** Cât încape în mesajul de 1000 de caractere al formularului. */
export const MAX_SELECTED = 20

export function subscribe(callback) {
  window.addEventListener('storage', callback)
  window.addEventListener(EVENT, callback)
  return () => {
    window.removeEventListener('storage', callback)
    window.removeEventListener(EVENT, callback)
  }
}

export function getSnapshot() {
  try {
    return localStorage.getItem(KEY) ?? ''
  } catch {
    return ''
  }
}

/** Pe server nu există selecție; pagina se randează goală, apoi se completează. */
export function getServerSnapshot() {
  return ''
}

export function parseSelection(snapshot) {
  return snapshot ? snapshot.split(',').filter(Boolean) : []
}

function write(slugs) {
  try {
    if (slugs.length) localStorage.setItem(KEY, slugs.join(','))
    else localStorage.removeItem(KEY)
  } catch {
    // fără stocare: selecția nu se poate ține, dar pagina merge mai departe
  }
  window.dispatchEvent(new Event(EVENT))
}

/** Bifează sau debifează. Întoarce false dacă s-a atins limita. */
export function toggleSelected(slug) {
  const current = parseSelection(getSnapshot())
  if (current.includes(slug)) {
    write(current.filter((entry) => entry !== slug))
    return true
  }
  if (current.length >= MAX_SELECTED) return false
  write([...current, slug])
  return true
}

export function clearSelected() {
  write([])
}

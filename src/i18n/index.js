import ro from './ro'
import ru from './ru'

/** Dicționarul complet al unei limbi. Doar pentru server; clientul folosește useDictionary. */
export function getDictionary(lang) {
  return lang === 'ru' ? ru : ro
}

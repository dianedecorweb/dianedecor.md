import { revalidatePath } from 'next/cache'

/**
 * Reîmprospătează tot site-ul public, în ambele limbi, după o modificare din
 * panou.
 *
 * Tot, nu pagină cu pagină: un proiect apare pe prima pagină, în portofoliu, în
 * categoria lui, la vecinii lui („anterior / următor") și la serviciile
 * înrudite, iar listele pe pagini ratau mereu câte una. Site-ul are câteva zeci
 * de pagini, iar ele se regenerează doar la prima vizită după modificare.
 */
export function revalidatePublicSite() {
  revalidatePath('/[lang]', 'layout')
}

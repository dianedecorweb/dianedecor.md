import { MESSAGE_STATUSES, STATUS_LABELS } from '@/lib/message-status'

/**
 * Notificarea din grupul de Telegram și butoanele ei de stare.
 *
 * Butoanele trimit înapoi `status:<stare>:<id mesaj>` prin `callback_data`, pe
 * care le primește `/api/telegram/webhook`. Starea se ține tot în baza de date,
 * Telegram e doar o altă telecomandă spre același comutator ca panoul.
 */

const API = 'https://api.telegram.org'

/** Cât așteptăm Telegram înainte să renunțăm. Formularul nu poate atârna. */
const TIMEOUT_MS = 5000

/** Telegram limitează `callback_data` la 64 de octeți, iar un ObjectId are 24. */
export const CALLBACK_PREFIX = 'st'

const ICONS = {
  NEW: '🆕',
  READ: '👀',
  CONTACTED: '📞',
  ARCHIVED: '📁',
}

function escapeHtml(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function isConfigured() {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID)
}

async function call(method, payload) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN lipsește')

  const response = await fetch(`${API}/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })

  const body = await response.json().catch(() => null)

  if (!body?.ok) {
    throw new Error(`${method}: ${body?.description ?? response.status}`)
  }

  return body.result
}

/** Tastatura de sub mesaj. Starea curentă e bifată și nu se mai trimite. */
export function statusKeyboard(messageId, currentStatus) {
  const buttons = MESSAGE_STATUSES.filter((status) => status !== 'NEW').map((status) => ({
    text: `${status === currentStatus ? '✅ ' : `${ICONS[status]} `}${STATUS_LABELS[status]}`,
    callback_data: `${CALLBACK_PREFIX}:${status}:${messageId}`,
  }))

  return { inline_keyboard: [buttons] }
}

/** Corpul notificării. Aceleași date pe care le arată și panoul. */
export function formatMessage(message, status = 'NEW') {
  const lines = [
    `💐 <b>Cerere nouă — ${escapeHtml(message.eventType)}</b>`,
    '',
    `👤 <b>Nume:</b> ${escapeHtml(message.name)}`,
    `📞 <b>Telefon:</b> ${escapeHtml(message.phone)}`,
    message.email ? `✉️ <b>Email:</b> ${escapeHtml(message.email)}` : null,
    message.eventDate
      ? `📅 <b>Data:</b> ${new Date(message.eventDate).toISOString().slice(0, 10)}`
      : null,
    message.location ? `📍 <b>Locație:</b> ${escapeHtml(message.location)}` : null,
    message.guestCount ? `👥 <b>Invitați:</b> ${message.guestCount}` : null,
    '',
    `💬 ${escapeHtml(message.message)}`,
    '',
    `<b>Stare:</b> ${ICONS[status]} ${STATUS_LABELS[status]}`,
  ].filter(Boolean)

  return lines.join('\n')
}

/** Trimite notificarea. Întoarce id-ul mesajului din Telegram, sau null. */
export async function sendNotification(message, messageId) {
  if (!isConfigured()) return null

  const result = await call('sendMessage', {
    chat_id: process.env.TELEGRAM_CHAT_ID,
    text: formatMessage(message, 'NEW'),
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    reply_markup: messageId ? statusKeyboard(messageId, 'NEW') : undefined,
  })

  return result?.message_id ?? null
}

/**
 * Aduce mesajul din Telegram la starea curentă.
 *
 * Apelat din ambele direcții: după o apăsare pe buton în Telegram și după o
 * schimbare în panou, ca cele două să arate mereu la fel.
 */
export async function syncStatus(telegramMessageId, message, status) {
  if (!isConfigured() || !telegramMessageId) return

  await call('editMessageText', {
    chat_id: process.env.TELEGRAM_CHAT_ID,
    message_id: telegramMessageId,
    text: formatMessage(message, status),
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    reply_markup: statusKeyboard(message.id, status),
  })
}

/** Închide rotița de pe butonul apăsat; fără asta rămâne învârtindu-se. */
export async function answerCallback(callbackQueryId, text) {
  if (!process.env.TELEGRAM_BOT_TOKEN) return
  await call('answerCallbackQuery', { callback_query_id: callbackQueryId, text })
}

/** Desface `st:<stare>:<id>`; întoarce null pentru orice altceva. */
export function parseCallbackData(data) {
  if (typeof data !== 'string') return null

  const parts = data.split(':')
  if (parts.length !== 3 || parts[0] !== CALLBACK_PREFIX) return null

  const [, status, messageId] = parts
  if (!MESSAGE_STATUSES.includes(status)) return null

  return { status, messageId }
}

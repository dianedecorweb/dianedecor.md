/** Un client CDP minimal, refolosit de scripturile de verificare din browser. */

const CDP_PORT = process.env.CDP_PORT ?? '9334'

export async function connect() {
  const response = await fetch(`http://127.0.0.1:${CDP_PORT}/json/new?about:blank`, {
    method: 'PUT',
  })
  const { webSocketDebuggerUrl, id } = await response.json()

  const socket = await new Promise((resolve, reject) => {
    const ws = new WebSocket(webSocketDebuggerUrl)
    ws.onopen = () => resolve(ws)
    ws.onerror = reject
  })

  let messageId = 0
  const pending = new Map()

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data)
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id)
      pending.delete(message.id)
      if (message.error) reject(new Error(message.error.message))
      else resolve(message.result)
    }
  }

  const send = (method, params = {}) => {
    const nextId = ++messageId
    socket.send(JSON.stringify({ id: nextId, method, params }))
    return new Promise((resolve, reject) => pending.set(nextId, { resolve, reject }))
  }

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

  const evaluate = async (expression) => {
    const { result, exceptionDetails } = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    })
    if (exceptionDetails) throw new Error(exceptionDetails.text ?? 'eroare în pagină')
    return result.value
  }

  const goto = async (url, settle = 1400) => {
    await send('Page.navigate', { url })
    await wait(settle)
  }

  const device = (width, height, scale = 2) =>
    send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: scale,
      mobile: width < 768,
    })

  const key = async (name, code, vk) => {
    for (const type of ['keyDown', 'keyUp']) {
      await send('Input.dispatchKeyEvent', {
        type,
        key: name,
        code,
        windowsVirtualKeyCode: vk,
        nativeVirtualKeyCode: vk,
      })
    }
    await wait(300)
  }

  await send('Page.enable')
  await send('Runtime.enable')

  const close = async () => {
    socket.close()
    await fetch(`http://127.0.0.1:${CDP_PORT}/json/close/${id}`).catch(() => {})
  }

  return { send, evaluate, goto, device, key, wait, close }
}

export function reporter() {
  const results = []
  let group = ''

  return {
    group(name) {
      group = name
      console.log(`\n── ${name} ${'─'.repeat(Math.max(0, 56 - name.length))}`)
    },
    check(label, passed, detail = '') {
      results.push({ group, label, passed, detail })
      console.log(`${passed ? ' PASS' : ' FAIL'}  ${label}${detail ? `  — ${detail}` : ''}`)
    },
    finish() {
      const failed = results.filter((r) => !r.passed)
      console.log(`\n${'═'.repeat(60)}`)
      console.log(`${results.length - failed.length}/${results.length} verificări trecute`)
      if (failed.length) {
        console.log('\nPicate:')
        for (const f of failed) console.log(`  · [${f.group}] ${f.label}${f.detail ? ` — ${f.detail}` : ''}`)
      }
      return failed.length
    },
  }
}

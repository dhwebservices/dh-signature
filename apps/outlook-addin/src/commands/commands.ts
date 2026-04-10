/* global Office */

export {}

const SIGNATURE_MARKER = 'DH_SIGNATURE_V1'
const FALLBACK_SIGNATURE = `
  <div style="font-family:Inter,Arial,sans-serif;color:#1f2430;">
    <!-- ${SIGNATURE_MARKER} -->
    <strong>DH Website Services</strong><br />
    <a href="https://dhwebsiteservices.co.uk" style="color:#3b67f2;text-decoration:none;">dhwebsiteservices.co.uk</a><br />
    <a href="tel:02920024218" style="color:#3b67f2;text-decoration:none;">02920 024218</a>
  </div>
`.trim()

function normalizeEmail(value: unknown) {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

function extractEmailAddress(value: unknown) {
  if (typeof value !== 'string' || !value) return ''
  const match = value.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)
  return normalizeEmail(match ? match[0] : value)
}

function resolveSenderEmail(item: Record<string, any> | null | undefined) {
  const candidates = [
    Office.context?.mailbox?.userProfile?.emailAddress,
    'from' in (item || {}) ? item?.from?.emailAddress : '',
    'sender' in (item || {}) ? item?.sender?.emailAddress : '',
    'organizer' in (item || {}) ? item?.organizer?.emailAddress : '',
    'from' in (item || {}) ? item?.from?.displayName : '',
    'sender' in (item || {}) ? item?.sender?.displayName : '',
  ]

  for (const candidate of candidates) {
    const email = extractEmailAddress(candidate)
    if (email) return email
  }

  return ''
}

async function fetchRenderedSignature(email: string) {
  const response = await fetch(`/api/signature?email=${encodeURIComponent(email)}`, {
    credentials: 'same-origin',
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error((payload as { error?: string }).error || 'Could not load rendered signature.')
  }

  return response.json() as Promise<{ rendered?: { html?: string } }>
}

function applySignature(html: string, event: Office.AddinCommands.Event) {
  const item = Office.context?.mailbox?.item
  if (!item || !('body' in item) || typeof item.body?.setSignatureAsync !== 'function') {
    event.completed()
    return
  }

  item.body.setSignatureAsync(
    html,
    { coercionType: Office.CoercionType.Html },
    () => event.completed(),
  )
}

function getCurrentBodyHtml(item: any) {
  return new Promise<string>((resolve) => {
    if (!item || !('body' in item) || typeof item.body?.getAsync !== 'function') {
      resolve('')
      return
    }

    item.body.getAsync(Office.CoercionType.Html, (result: Office.AsyncResult<string>) => {
      if (result.status === Office.AsyncResultStatus.Succeeded) {
        resolve(result.value || '')
        return
      }

      resolve('')
    })
  })
}

function removeExistingSignature(html: string) {
  if (!html || !html.includes(SIGNATURE_MARKER)) return html || ''

  const markerComment = new RegExp(`<!--\\s*${SIGNATURE_MARKER}\\s*-->[\\s\\S]*$`, 'i')
  if (markerComment.test(html)) {
    return html.replace(markerComment, '').trim()
  }

  const markerText = new RegExp(`\\[${SIGNATURE_MARKER}\\][\\s\\S]*$`, 'i')
  return html.replace(markerText, '').trim()
}

async function onNewMessageComposeHandler(event: Office.AddinCommands.Event) {
  try {
    const item = Office.context?.mailbox?.item
    const existingBody = await getCurrentBodyHtml(item)
    if (existingBody && existingBody.includes(SIGNATURE_MARKER)) {
      applySignature(removeExistingSignature(existingBody), event)
      return
    }

    const email = resolveSenderEmail(item as Record<string, any> | null | undefined)
    if (!email) {
      applySignature(FALLBACK_SIGNATURE, event)
      return
    }

    const payload = await fetchRenderedSignature(email)
    applySignature(payload?.rendered?.html || FALLBACK_SIGNATURE, event)
  } catch {
    applySignature(FALLBACK_SIGNATURE, event)
  }
}

Office.onReady(() => {
  Office.actions.associate('onNewMessageComposeHandler', onNewMessageComposeHandler)
})

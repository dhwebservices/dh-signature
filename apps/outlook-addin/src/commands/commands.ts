/* global Office */

export {}

const SIGNATURE_MARKER = 'DH_SIGNATURE_V1'
const FALLBACK_SIGNATURE = `
  <div style="font-family:Arial,sans-serif;color:#1f2430;">
    <!-- ${SIGNATURE_MARKER} -->
    <strong>DH Website Services</strong><br />
    <a href="https://dhwebsiteservices.co.uk" style="color:#3b67f2;text-decoration:none;">dhwebsiteservices.co.uk</a><br />
    <a href="tel:02920024218" style="color:#3b67f2;text-decoration:none;">02920 024218</a>
  </div>
`.trim()

const NOTIFICATION_KEY = 'dh_signature_status'

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

function resolveSenderEmailAsync(item: Record<string, any> | null | undefined) {
  return new Promise<string>((resolve) => {
    const directEmail = resolveSenderEmail(item)
    if (directEmail) {
      resolve(directEmail)
      return
    }

    if (item?.from && typeof item.from.getAsync === 'function') {
      item.from.getAsync((result: Office.AsyncResult<Office.EmailAddressDetails>) => {
        if (result.status === Office.AsyncResultStatus.Succeeded) {
          resolve(extractEmailAddress(result.value?.emailAddress || result.value?.displayName))
          return
        }

        resolve('')
      })
      return
    }

    resolve('')
  })
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

function addNotification(item: any, message: string, icon = 'Icon.16x16') {
  return new Promise<void>((resolve) => {
    if (!item?.notificationMessages || typeof item.notificationMessages.addAsync !== 'function') {
      resolve()
      return
    }

    item.notificationMessages.addAsync(
      NOTIFICATION_KEY,
      {
        type: Office.MailboxEnums.ItemNotificationMessageType.InformationalMessage,
        message,
        icon,
        persistent: false,
      },
      () => resolve(),
    )
  })
}

function disableClientSignature(item: any) {
  return new Promise<void>((resolve) => {
    if (!item || typeof item.disableClientSignatureAsync !== 'function') {
      resolve()
      return
    }

    item.disableClientSignatureAsync(() => resolve())
  })
}

function applySignature(item: any, html: string) {
  return new Promise<void>((resolve, reject) => {
    if (!item || !('body' in item) || typeof item.body?.setSignatureAsync !== 'function') {
      reject(new Error('setSignatureAsync is unavailable.'))
      return
    }

    item.body.setSignatureAsync(
      html,
      { coercionType: Office.CoercionType.Html },
      (result: Office.AsyncResult<void>) => {
        if (result.status === Office.AsyncResultStatus.Succeeded) {
          resolve()
          return
        }

        reject(result.error || new Error('Could not apply signature.'))
      },
    )
  })
}

function complete(event: Office.AddinCommands.Event) {
  try {
    event.completed()
  } catch {
    // Ignore completion errors.
  }
}

async function onNewMessageComposeHandler(event: Office.AddinCommands.Event) {
  const item = Office.context?.mailbox?.item as any

  try {
    await disableClientSignature(item)

    const existingBody = await getCurrentBodyHtml(item)
    if (existingBody && existingBody.includes(SIGNATURE_MARKER)) {
      await applySignature(item, removeExistingSignature(existingBody))
      await addNotification(item, 'DH signature refreshed.')
      complete(event)
      return
    }

    const email = await resolveSenderEmailAsync(item)
    let html = FALLBACK_SIGNATURE
    let usedFallback = true

    if (email) {
      try {
        const payload = await fetchRenderedSignature(email)
        if (payload?.rendered?.html) {
          html = payload.rendered.html
          usedFallback = false
        }
      } catch {
        usedFallback = true
      }
    }

    await applySignature(item, html)
    await addNotification(item, usedFallback ? 'DH fallback signature added.' : 'DH signature added.')
    complete(event)
  } catch {
    try {
      await applySignature(item, FALLBACK_SIGNATURE)
      await addNotification(item, 'DH fallback signature added.')
    } catch {
      await addNotification(item, 'DH signature failed to load.')
    }
    complete(event)
  }
}

;(globalThis as any).onNewMessageComposeHandler = onNewMessageComposeHandler

if (typeof Office !== 'undefined' && Office.actions && typeof Office.actions.associate === 'function') {
  Office.actions.associate('onNewMessageComposeHandler', onNewMessageComposeHandler)
}

if (typeof Office !== 'undefined' && typeof Office.onReady === 'function') {
  Office.onReady(() => {
    if (Office.actions && typeof Office.actions.associate === 'function') {
      Office.actions.associate('onNewMessageComposeHandler', onNewMessageComposeHandler)
    }
  })
}

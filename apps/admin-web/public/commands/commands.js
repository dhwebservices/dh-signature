/* global Office */

(function () {
  const SIGNATURE_MARKER = 'DH_SIGNATURE_V1'
  const FALLBACK_SIGNATURE = `
    <div style="font-family:Inter,Arial,sans-serif;color:#1f2430;">
      <!-- ${SIGNATURE_MARKER} -->
      <strong>DH Website Services</strong><br />
      <a href="https://dhwebsiteservices.co.uk" style="color:#3b67f2;text-decoration:none;">dhwebsiteservices.co.uk</a><br />
      <a href="tel:02920024218" style="color:#3b67f2;text-decoration:none;">02920 024218</a>
    </div>
  `.trim()

  function normalizeEmail(value) {
    return typeof value === 'string' ? value.trim().toLowerCase() : ''
  }

  function extractEmailAddress(value) {
    if (!value || typeof value !== 'string') return ''
    const match = value.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)
    return normalizeEmail(match ? match[0] : value)
  }

  function resolveSenderEmail(item) {
    const candidates = [
      Office.context?.mailbox?.userProfile?.emailAddress,
      item?.from?.emailAddress,
      item?.sender?.emailAddress,
      item?.organizer?.emailAddress,
      item?.from?.displayName,
      item?.sender?.displayName,
    ]

    for (var index = 0; index < candidates.length; index += 1) {
      const email = extractEmailAddress(candidates[index])
      if (email) return email
    }

    return ''
  }

  async function fetchRenderedSignature(email) {
    const response = await fetch(`/api/signature?email=${encodeURIComponent(email)}`, {
      credentials: 'same-origin',
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) {
      throw new Error('Could not load rendered signature.')
    }

    return response.json()
  }

  function applySignature(html, event) {
    const item = Office.context?.mailbox?.item
    if (!item || !item.body || typeof item.body.setSignatureAsync !== 'function') {
      event.completed()
      return
    }

    item.body.setSignatureAsync(
      html,
      { coercionType: Office.CoercionType.Html },
      function () {
        event.completed()
      },
    )
  }

  function getCurrentBodyHtml(item) {
    return new Promise(function (resolve) {
      if (!item || !item.body || typeof item.body.getAsync !== 'function') {
        resolve('')
        return
      }

      item.body.getAsync(Office.CoercionType.Html, function (result) {
        if (result.status === Office.AsyncResultStatus.Succeeded) {
          resolve(result.value || '')
          return
        }

        resolve('')
      })
    })
  }

  async function onNewMessageComposeHandler(event) {
    try {
      const item = Office.context?.mailbox?.item
      const existingBody = await getCurrentBodyHtml(item)
      if (existingBody && existingBody.includes(SIGNATURE_MARKER)) {
        event.completed()
        return
      }
      const email = resolveSenderEmail(item)
      if (!email) {
        applySignature(FALLBACK_SIGNATURE, event)
        return
      }

      const payload = await fetchRenderedSignature(email)
      applySignature(payload?.rendered?.html || FALLBACK_SIGNATURE, event)
    } catch (_error) {
      applySignature(FALLBACK_SIGNATURE, event)
    }
  }

  window.onNewMessageComposeHandler = onNewMessageComposeHandler

  if (typeof Office !== 'undefined' && Office.actions && typeof Office.actions.associate === 'function') {
    Office.actions.associate('onNewMessageComposeHandler', onNewMessageComposeHandler)
  }

  if (typeof Office !== 'undefined' && typeof Office.onReady === 'function') {
    Office.onReady(function () {
      if (Office.actions && typeof Office.actions.associate === 'function') {
        Office.actions.associate('onNewMessageComposeHandler', onNewMessageComposeHandler)
      }
    })
  }
})()

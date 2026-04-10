/* global Office */

(function () {
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

  function resolveSenderEmailAsync(item) {
    return new Promise(function (resolve) {
      const directEmail = resolveSenderEmail(item)
      if (directEmail) {
        resolve(directEmail)
        return
      }

      if (item?.from && typeof item.from.getAsync === 'function') {
        item.from.getAsync(function (result) {
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

  async function fetchRenderedSignature(email) {
    const response = await fetch(`/api/signature?email=${encodeURIComponent(email)}`, {
      credentials: 'same-origin',
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) {
      const payload = await response.json().catch(function () {
        return {}
      })
      throw new Error(payload?.error || 'Could not load rendered signature.')
    }

    return response.json()
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

  function removeExistingSignature(html) {
    if (!html || html.indexOf(SIGNATURE_MARKER) === -1) return html || ''

    const markerComment = new RegExp(`<!--\\s*${SIGNATURE_MARKER}\\s*-->[\\s\\S]*$`, 'i')
    if (markerComment.test(html)) {
      return html.replace(markerComment, '').trim()
    }

    const markerText = new RegExp(`\\[${SIGNATURE_MARKER}\\][\\s\\S]*$`, 'i')
    return html.replace(markerText, '').trim()
  }

  function addNotification(item, message, icon) {
    return new Promise(function (resolve) {
      if (!item?.notificationMessages || typeof item.notificationMessages.addAsync !== 'function') {
        resolve()
        return
      }

      item.notificationMessages.addAsync(
        NOTIFICATION_KEY,
        {
          type: Office.MailboxEnums.ItemNotificationMessageType.InformationalMessage,
          message: message,
          icon: icon || 'Icon.16x16',
          persistent: false,
        },
        function () {
          resolve()
        },
      )
    })
  }

  function disableClientSignature(item) {
    return new Promise(function (resolve) {
      if (!item || typeof item.disableClientSignatureAsync !== 'function') {
        resolve()
        return
      }

      item.disableClientSignatureAsync(function () {
        resolve()
      })
    })
  }

  function applySignature(item, html) {
    return new Promise(function (resolve, reject) {
      if (!item || !item.body || typeof item.body.setSignatureAsync !== 'function') {
        reject(new Error('setSignatureAsync is unavailable.'))
        return
      }

      item.body.setSignatureAsync(
        html,
        { coercionType: Office.CoercionType.Html },
        function (result) {
          if (result.status === Office.AsyncResultStatus.Succeeded) {
            resolve()
            return
          }

          reject(result.error || new Error('Could not apply signature.'))
        },
      )
    })
  }

  function complete(event) {
    try {
      event.completed()
    } catch (_error) {
      // Ignore completion issues.
    }
  }

  async function onNewMessageComposeHandler(event) {
    const item = Office.context?.mailbox?.item

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
          const renderedHtml = payload?.rendered?.html
          if (renderedHtml) {
            html = renderedHtml
            usedFallback = false
          }
        } catch (_error) {
          usedFallback = true
        }
      }

      await applySignature(item, html)
      await addNotification(item, usedFallback ? 'DH fallback signature added.' : 'DH signature added.')
      complete(event)
    } catch (_error) {
      try {
        await applySignature(item, FALLBACK_SIGNATURE)
        await addNotification(item, 'DH fallback signature added.')
      } catch (_innerError) {
        await addNotification(item, 'DH signature failed to load.')
      }
      complete(event)
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

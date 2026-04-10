/* global Office */

(function () {
  const SIGNATURE_MARKER = 'DH_SIGNATURE_V1'
  const FALLBACK_SIGNATURE = [
    '<div style="font-family:Inter,Arial,sans-serif;color:#1f2430;">',
    `<!-- ${SIGNATURE_MARKER} -->`,
    '<strong>DH Website Services</strong><br />',
    '<a href="https://dhwebsiteservices.co.uk" style="color:#3b67f2;text-decoration:none;">dhwebsiteservices.co.uk</a><br />',
    '<a href="tel:02920024218" style="color:#3b67f2;text-decoration:none;">02920 024218</a>',
    '</div>',
  ].join('')

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
      const payload = await response.json().catch(function () {
        return {}
      })
      throw new Error(payload?.error || 'Could not fetch signature.')
    }

    return response.json()
  }

  function setStatus(meta, message, isError) {
    meta.textContent = message
    meta.style.color = isError ? '#b42318' : '#67748d'
  }

  function setSignatureHtml(item, html) {
    return new Promise(function (resolve, reject) {
      if (!item || !item.body || typeof item.body.setSignatureAsync !== 'function') {
        reject(new Error('This Outlook client does not support setting signatures from the add-in.'))
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

          reject(new Error(result.error?.message || 'Could not apply signature in Outlook.'))
        },
      )
    })
  }

  Office.onReady(function () {
    const preview = document.getElementById('preview')
    const meta = document.getElementById('meta')
    const previewButton = document.getElementById('previewSignature')
    const applyButton = document.getElementById('applySignature')

    if (!preview || !meta || !previewButton || !applyButton) return

    const item = Office.context?.mailbox?.item
    const senderEmail = resolveSenderEmail(item)
    setStatus(meta, senderEmail ? `Sender detected: ${senderEmail}` : 'Could not resolve sender email yet.', !senderEmail)

    async function loadSignature() {
      const email = resolveSenderEmail(Office.context?.mailbox?.item)
      if (!email) {
        preview.innerHTML = FALLBACK_SIGNATURE
        throw new Error('No sender email was available in Outlook, so the fallback signature is shown.')
      }

      const payload = await fetchRenderedSignature(email)
      const html = payload?.rendered?.html || FALLBACK_SIGNATURE
      preview.innerHTML = html
      return { email: email, html: html }
    }

    previewButton.addEventListener('click', async function () {
      preview.textContent = 'Loading…'
      setStatus(meta, 'Loading signature preview…', false)

      try {
        const signature = await loadSignature()
        setStatus(meta, `Preview loaded for ${signature.email}.`, false)
      } catch (error) {
        setStatus(meta, error instanceof Error ? error.message : 'Could not load signature preview.', true)
      }
    })

    applyButton.addEventListener('click', async function () {
      preview.textContent = 'Loading…'
      setStatus(meta, 'Loading signature for this draft…', false)

      try {
        const signature = await loadSignature().catch(function () {
          preview.innerHTML = FALLBACK_SIGNATURE
          return { email: senderEmail, html: FALLBACK_SIGNATURE }
        })

        await setSignatureHtml(Office.context?.mailbox?.item, signature.html)
        setStatus(meta, `Signature applied${signature.email ? ` for ${signature.email}` : ''}.`, false)
      } catch (error) {
        setStatus(meta, error instanceof Error ? error.message : 'Could not apply signature in Outlook.', true)
      }
    })
  })
})()

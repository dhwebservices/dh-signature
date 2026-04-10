/* global Office */

export {}

const SIGNATURE_MARKER = 'DH_SIGNATURE_V1'
const FALLBACK_SIGNATURE = [
  '<div style="font-family:Inter,Arial,sans-serif;color:#1f2430;">',
  `<!-- ${SIGNATURE_MARKER} -->`,
  '<strong>DH Website Services</strong><br />',
  '<a href="https://dhwebsiteservices.co.uk" style="color:#3b67f2;text-decoration:none;">dhwebsiteservices.co.uk</a><br />',
  '<a href="tel:02920024218" style="color:#3b67f2;text-decoration:none;">02920 024218</a>',
  '</div>',
].join('')

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
    throw new Error((payload as { error?: string }).error || 'Could not fetch signature.')
  }

  return response.json() as Promise<{ rendered?: { html?: string } }>
}

function setStatus(meta: HTMLElement, message: string, isError = false) {
  meta.textContent = message
  meta.style.color = isError ? '#b42318' : '#67748d'
}

function setSignatureHtml(item: any, html: string) {
  return new Promise<void>((resolve, reject) => {
    if (!item || !('body' in item) || typeof item.body?.setSignatureAsync !== 'function') {
      reject(new Error('This Outlook client does not support setting signatures from the add-in.'))
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

        reject(new Error(result.error?.message || 'Could not apply signature in Outlook.'))
      },
    )
  })
}

Office.onReady(() => {
  const root = document.getElementById('app')
  if (!root) return

  root.innerHTML = `
    <div style="font-family:Inter,Arial,sans-serif;padding:20px;color:#172033;">
      <div style="font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#6b7a92;">DH Signature</div>
      <h1 style="font-size:28px;letter-spacing:-.04em;margin:8px 0 10px;">Outlook compose add-in</h1>
      <p style="margin:0 0 16px;color:#5c687f;">Preview the live signature for the current sender, then apply it straight into the draft.</p>
      <div style="display:flex;gap:10px;flex-wrap:wrap;">
        <button id="previewSignature" style="height:42px;padding:0 16px;border-radius:999px;border:0;background:#3b67f2;color:#fff;font-weight:600;">Preview my signature</button>
        <button id="applySignature" style="height:42px;padding:0 16px;border-radius:999px;border:0;background:#1d7d63;color:#fff;font-weight:600;">Apply to draft</button>
      </div>
      <div id="meta" style="margin-top:10px;font-size:12px;color:#67748d;"></div>
      <div id="preview" style="margin-top:18px;padding-top:18px;border-top:1px solid rgba(20,31,61,.08);"></div>
    </div>
  `

  const preview = document.getElementById('preview') as HTMLElement | null
  const meta = document.getElementById('meta') as HTMLElement | null
  const previewButton = document.getElementById('previewSignature')
  const applyButton = document.getElementById('applySignature')

  if (!preview || !meta || !previewButton || !applyButton) return

  const previewEl = preview
  const metaEl = meta

  const senderEmail = resolveSenderEmail(Office.context?.mailbox?.item as Record<string, any> | null | undefined)
  setStatus(metaEl, senderEmail ? `Sender detected: ${senderEmail}` : 'Could not resolve sender email yet.', !senderEmail)

  async function loadSignature() {
    const email = resolveSenderEmail(Office.context?.mailbox?.item as Record<string, any> | null | undefined)
    if (!email) {
      previewEl.innerHTML = FALLBACK_SIGNATURE
      throw new Error('No sender email was available in Outlook, so the fallback signature is shown.')
    }

    const payload = await fetchRenderedSignature(email)
    const html = payload?.rendered?.html || FALLBACK_SIGNATURE
    previewEl.innerHTML = html
    return { email, html }
  }

  previewButton.addEventListener('click', async () => {
    previewEl.textContent = 'Loading…'
    setStatus(metaEl, 'Loading signature preview…')

    try {
      const signature = await loadSignature()
      setStatus(metaEl, `Preview loaded for ${signature.email}.`)
    } catch (error) {
      setStatus(metaEl, error instanceof Error ? error.message : 'Could not load signature preview.', true)
    }
  })

  applyButton.addEventListener('click', async () => {
    previewEl.textContent = 'Loading…'
    setStatus(metaEl, 'Loading signature for this draft…')

    try {
      const signature = await loadSignature().catch(() => {
        previewEl.innerHTML = FALLBACK_SIGNATURE
        return { email: senderEmail, html: FALLBACK_SIGNATURE }
      })

      await setSignatureHtml(Office.context?.mailbox?.item, signature.html)
      setStatus(metaEl, `Signature applied${signature.email ? ` for ${signature.email}` : ''}.`)
    } catch (error) {
      setStatus(metaEl, error instanceof Error ? error.message : 'Could not apply signature in Outlook.', true)
    }
  })
})

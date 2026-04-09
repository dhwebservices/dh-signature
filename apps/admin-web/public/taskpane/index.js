/* global Office */

(function () {
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

  Office.onReady(function () {
    const preview = document.getElementById('preview')
    const meta = document.getElementById('meta')
    const button = document.getElementById('loadSignature')

    if (!preview || !meta || !button) return

    const senderEmail = Office.context?.mailbox?.userProfile?.emailAddress || ''
    meta.textContent = senderEmail ? `Signed in as ${senderEmail}` : 'Could not resolve sender email yet.'

    button.addEventListener('click', async function () {
      preview.textContent = 'Loading…'

      try {
        const payload = await fetchRenderedSignature(senderEmail)
        preview.innerHTML = payload?.rendered?.html || 'No signature returned.'
      } catch (error) {
        preview.textContent = error instanceof Error ? error.message : 'Could not load signature.'
      }
    })
  })
})()

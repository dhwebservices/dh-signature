/* global Office */

async function fetchSignature(email: string) {
  const response = await fetch(`http://localhost:4188/api/signature?email=${encodeURIComponent(email)}`)
  if (!response.ok) throw new Error('Could not fetch signature')
  return response.json() as Promise<{ rendered: { html: string } }>
}

Office.onReady(() => {
  const root = document.getElementById('app')
  if (!root) return

  root.innerHTML = `
    <div style="font-family:Inter,Arial,sans-serif;padding:20px;color:#172033;">
      <div style="font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#6b7a92;">DH Signature</div>
      <h1 style="font-size:28px;letter-spacing:-.04em;margin:8px 0 10px;">Outlook compose add-in</h1>
      <p style="margin:0 0 16px;color:#5c687f;">This pane will preview the rendered signature and eventually manage sender-aware compose insertion.</p>
      <button id="loadSignature" style="height:42px;padding:0 16px;border-radius:999px;border:0;background:#3b67f2;color:#fff;font-weight:600;">Load sample signature</button>
      <div id="preview" style="margin-top:18px;padding-top:18px;border-top:1px solid rgba(20,31,61,.08);"></div>
    </div>
  `

  document.getElementById('loadSignature')?.addEventListener('click', async () => {
    const preview = document.getElementById('preview')
    if (!preview) return
    preview.textContent = 'Loading…'
    try {
      const data = await fetchSignature('david@dhwebsiteservices.co.uk')
      preview.innerHTML = data.rendered.html
    } catch (error) {
      preview.textContent = error instanceof Error ? error.message : 'Could not load signature'
    }
  })
})

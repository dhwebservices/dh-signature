import type { AdminOverviewResponse, RenderedSignature, SignatureActivity, SignatureAssignments, SignatureCampaign, TenantBranding } from '@dh-signature/shared-types'

export async function fetchOverview() {
  const response = await fetch('/api/admin/overview')
  const payload = await response.json()
  if (!response.ok) throw new Error(payload?.error || 'Could not load tenant overview.')
  return payload as AdminOverviewResponse & { branding: TenantBranding }
}

export async function fetchRenderedSignature(email: string) {
  const response = await fetch(`/api/signature?email=${encodeURIComponent(email)}`)
  const payload = await response.json()
  if (!response.ok) throw new Error(payload?.error || 'Could not load signature preview.')
  return payload as { rendered: RenderedSignature }
}

export async function saveAdminState(state: {
  branding: TenantBranding
  campaigns: SignatureCampaign[]
  activity: SignatureActivity[]
  publishedTemplateId: string
  assignments: SignatureAssignments
  profiles: Array<{
    id: string
    email: string
    signatureEnabled: boolean
    forceRefreshRequired: boolean
    lastSyncedAt: string
  }>
}) {
  const response = await fetch('/api/admin/state', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(state),
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload?.error || 'Could not save admin state.')
  return payload as { ok: true }
}

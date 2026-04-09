import type { AdminOverviewResponse, RenderedSignature, TenantBranding } from '@dh-signature/shared-types'

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

import type { SignatureAssignment } from '@dh-signature/shared-types'
import { signatureProfiles, signatureTemplates, tenantBranding } from '@dh-signature/shared-types'

export function getAssignmentByEmail(email: string): SignatureAssignment {
  const profile = signatureProfiles.find((item) => item.email.toLowerCase() === email.toLowerCase()) ?? signatureProfiles[0]
  const template = signatureTemplates[0]
  return {
    profile,
    template,
    branding: tenantBranding,
  }
}

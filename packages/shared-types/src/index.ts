export type SocialPlatform = 'instagram' | 'facebook' | 'linkedin' | 'whatsapp'

export interface SocialLink {
  platform: SocialPlatform
  label: string
  href: string
}

export interface SignatureProfile {
  id: string
  email: string
  fullName: string
  title: string
  department: string
  workPhone: string
  businessLandline: string
  websiteUrl: string
  workplaceUrl: string
  bookingUrl: string
  socialLinks: SocialLink[]
  signatureEnabled: boolean
  forceRefreshRequired: boolean
  lastSyncedAt: string
}

export interface SignatureTemplate {
  id: string
  name: string
  tone: 'clean' | 'sales' | 'executive'
  accentColor: string
  secondaryColor: string
  showDepartmentChip: boolean
  showBookingCta: boolean
  showWorkplaceLink: boolean
}

export interface TenantBranding {
  companyName: string
  companyWebsiteLabel: string
  workplaceLabel: string
  bookingLabel: string
  privacyPolicyLabel: string
  privacyPolicyUrl: string
  logoUrl: string
  logoMark: string
}

export interface RenderedSignature {
  html: string
  plainText: string
}

export interface SignatureAssignment {
  profile: SignatureProfile
  template: SignatureTemplate
  branding: TenantBranding
}

export interface AdminUser {
  email: string
  name: string
  role: 'SignatureAdmin' | 'Viewer'
}

export interface SignatureCampaign {
  id: string
  name: string
  ctaLabel: string
  audience: string
  status: 'Draft' | 'Live' | 'Paused'
}

export interface SignatureActivity {
  id: string
  title: string
  body: string
  createdAt: string
}

export interface SignatureAssignments {
  publishedTemplateId: string
  departmentTemplates: Record<string, string>
  profileTemplates: Record<string, string>
}

export interface AdminOverviewResponse {
  profiles: SignatureProfile[]
  templates: SignatureTemplate[]
  campaigns: SignatureCampaign[]
  activity: SignatureActivity[]
  assignments: SignatureAssignments
  controls: {
    canActivateTenantWide: boolean
    canForceRefresh: boolean
    authProvider: string
    publishedTemplateId?: string
  }
}

export * from './mockData'

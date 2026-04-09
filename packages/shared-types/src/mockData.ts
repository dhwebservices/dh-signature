import type { AdminUser, SignatureProfile, SignatureTemplate, TenantBranding } from './index'

export const tenantBranding: TenantBranding = {
  companyName: 'DH Website Services',
  companyWebsiteLabel: 'dhwebsiteservices.co.uk',
  workplaceLabel: 'DH Workplace',
  bookingLabel: 'Book a call',
  logoMark: 'DH',
}

export const signatureTemplates: SignatureTemplate[] = [
  {
    id: 'signature-clean',
    name: 'Clean executive',
    tone: 'executive',
    accentColor: '#3b67f2',
    secondaryColor: '#12203f',
    showDepartmentChip: true,
    showBookingCta: true,
    showWorkplaceLink: true,
  },
  {
    id: 'signature-sales',
    name: 'Growth CTA',
    tone: 'sales',
    accentColor: '#0f9f7f',
    secondaryColor: '#1d3557',
    showDepartmentChip: true,
    showBookingCta: true,
    showWorkplaceLink: true,
  },
  {
    id: 'signature-minimal',
    name: 'Minimal compact',
    tone: 'clean',
    accentColor: '#243047',
    secondaryColor: '#3b67f2',
    showDepartmentChip: false,
    showBookingCta: false,
    showWorkplaceLink: true,
  },
]

export const signatureProfiles: SignatureProfile[] = [
  {
    id: 'profile-david',
    email: 'david@dhwebsiteservices.co.uk',
    fullName: 'David Hooper',
    title: 'Director',
    department: 'Directors Office',
    workPhone: '02920 024218',
    businessLandline: '02920 024218',
    websiteUrl: 'https://dhwebsiteservices.co.uk',
    workplaceUrl: 'https://workplace.dhwebsiteservices.co.uk',
    bookingUrl: 'https://dhwebsiteservices.co.uk/contact',
    signatureEnabled: true,
    forceRefreshRequired: false,
    lastSyncedAt: '2026-04-09T16:10:00.000Z',
    socialLinks: [
      { platform: 'instagram', label: 'Instagram', href: 'https://instagram.com/dhwebsiteservices' },
      { platform: 'facebook', label: 'Facebook', href: 'https://facebook.com/dhwebsiteservices' },
      { platform: 'linkedin', label: 'LinkedIn', href: 'https://linkedin.com/company/dhwebsiteservices' },
      { platform: 'whatsapp', label: 'WhatsApp', href: 'https://wa.me/442920024218' },
    ],
  },
  {
    id: 'profile-mac',
    email: 'mac@dhwebsiteservices.co.uk',
    fullName: 'Mac Confield',
    title: 'Head of Client Operations',
    department: 'Client Operations',
    workPhone: '02920 024218',
    businessLandline: '02920 024218',
    websiteUrl: 'https://dhwebsiteservices.co.uk',
    workplaceUrl: 'https://workplace.dhwebsiteservices.co.uk',
    bookingUrl: 'https://dhwebsiteservices.co.uk/contact',
    signatureEnabled: true,
    forceRefreshRequired: true,
    lastSyncedAt: '2026-04-09T15:42:00.000Z',
    socialLinks: [
      { platform: 'instagram', label: 'Instagram', href: 'https://instagram.com/dhwebsiteservices' },
      { platform: 'facebook', label: 'Facebook', href: 'https://facebook.com/dhwebsiteservices' },
      { platform: 'linkedin', label: 'LinkedIn', href: 'https://linkedin.com/company/dhwebsiteservices' },
      { platform: 'whatsapp', label: 'WhatsApp', href: 'https://wa.me/442920024218' },
    ],
  },
]

export const adminUsers: AdminUser[] = [
  {
    email: 'david@dhwebsiteservices.co.uk',
    name: 'David Hooper',
    role: 'SignatureAdmin',
  },
]

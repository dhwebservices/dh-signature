import type { AdminUser, SignatureProfile, SignatureTemplate, TenantBranding } from './index'

export const tenantBranding: TenantBranding = {
  companyName: 'DH Website Services',
  companyWebsiteLabel: 'dhwebsiteservices.co.uk',
  workplaceLabel: 'DH Workplace',
  bookingLabel: 'Book a call',
  privacyPolicyLabel: 'Privacy Policy',
  privacyPolicyUrl: 'https://dhwebsiteservices.co.uk/privacy/',
  logoUrl: 'https://sig.dhwebsiteservices.co.uk/icons/dh-mark.png',
  logoMark: 'DH',
  awardTitle: 'Web Design Service of the Year',
  awardSubtitle: 'Wales Prestige Awards 2027/28',
  awardUrl: 'https://dhwebsiteservices.co.uk/',
  awardImageUrl: 'https://sig.dhwebsiteservices.co.uk/icons/prestige-2027-28.png',
  legalLine:
    'DH Website Services is a trading name of David Hooper Home Limited, registered in England and Wales, company number 17018784. Registered office: 36b Coedpenmaen Road, Trallwn, Pontypridd CF37 4LP. VAT No. GB 517 076 395.',
}

export const signatureTemplates: SignatureTemplate[] = [
  {
    id: 'signature-clean',
    name: 'Clean executive',
    tone: 'executive',
    accentColor: '#1f8fd1',
    secondaryColor: '#1d1d1f',
    showDepartmentChip: true,
    showBookingCta: true,
    showWorkplaceLink: false,
  },
  {
    id: 'signature-sales',
    name: 'Growth CTA',
    tone: 'sales',
    accentColor: '#0f9f7f',
    secondaryColor: '#1d3557',
    showDepartmentChip: true,
    showBookingCta: true,
    showWorkplaceLink: false,
  },
  {
    id: 'signature-minimal',
    name: 'Minimal compact',
    tone: 'clean',
    accentColor: '#243047',
    secondaryColor: '#3b67f2',
    showDepartmentChip: false,
    showBookingCta: false,
    showWorkplaceLink: false,
  },
]

export const signatureProfiles: SignatureProfile[] = [
  {
    id: 'profile-david',
    email: 'david@dhwebsiteservices.co.uk',
    fullName: 'David Hooper',
    title: 'Director',
    department: 'Directors Office',
    workPhone: '01443 805303',
    businessLandline: '01443 805303',
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
    workPhone: '01443 805303',
    businessLandline: '01443 805303',
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

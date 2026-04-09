import type {
  AdminOverviewResponse,
  SignatureAssignment,
  SignatureProfile,
  SignatureTemplate,
  TenantBranding,
} from '@dh-signature/shared-types'
import { signatureTemplates, tenantBranding } from '@dh-signature/shared-types'

interface Env {
  SUPABASE_URL?: string
  SUPABASE_SERVICE_ROLE_KEY?: string
  DH_BUSINESS_LANDLINE?: string
  DH_WEBSITE_URL?: string
  DH_WORKPLACE_URL?: string
  DH_BOOKING_URL?: string
  DH_PRIVACY_POLICY_URL?: string
  DH_LOGO_URL?: string
  DH_INSTAGRAM_URL?: string
  DH_FACEBOOK_URL?: string
  DH_LINKEDIN_URL?: string
  DH_WHATSAPP_URL?: string
}

interface HrProfileRow {
  id?: string | number
  user_email?: string
  full_name?: string
  role?: string
  department?: string
  phone?: string
  updated_at?: string
  created_at?: string
}

const normalizeEmail = (value = '') => value.trim().toLowerCase()

const firstNonEmpty = (...values: Array<string | null | undefined>) => {
  for (const value of values) {
    if (!value) continue
    const trimmed = value.trim()
    if (trimmed) return trimmed
  }
  return ''
}

const pickBestProfileRow = (rows: HrProfileRow[]) =>
  rows
    .slice()
    .sort((a, b) => {
      const aLower = a.user_email === normalizeEmail(a.user_email) ? 1 : 0
      const bLower = b.user_email === normalizeEmail(b.user_email) ? 1 : 0
      if (aLower !== bLower) return bLower - aLower

      const aClean = a.full_name && !a.full_name.includes('(') ? 1 : 0
      const bClean = b.full_name && !b.full_name.includes('(') ? 1 : 0
      if (aClean !== bClean) return bClean - aClean

      return new Date(b.updated_at || b.created_at || 0).getTime() - new Date(a.updated_at || a.created_at || 0).getTime()
    })[0] || null

function buildBranding(env: Env): TenantBranding {
  return {
    ...tenantBranding,
    companyWebsiteLabel: env.DH_WEBSITE_URL ? new URL(env.DH_WEBSITE_URL).host.replace(/^www\./, '') : tenantBranding.companyWebsiteLabel,
    privacyPolicyUrl: env.DH_PRIVACY_POLICY_URL || tenantBranding.privacyPolicyUrl,
    logoUrl: env.DH_LOGO_URL || tenantBranding.logoUrl,
  }
}

function getGlobalLinks(env: Env) {
  return {
    websiteUrl: env.DH_WEBSITE_URL || 'https://dhwebsiteservices.co.uk',
    workplaceUrl: env.DH_WORKPLACE_URL || 'https://workplace.dhwebsiteservices.co.uk',
    bookingUrl: env.DH_BOOKING_URL || 'https://dhwebsiteservices.co.uk/contact',
    businessLandline: env.DH_BUSINESS_LANDLINE || '02920 024218',
    socialLinks: [
      {
        platform: 'instagram' as const,
        label: 'Instagram',
        href: env.DH_INSTAGRAM_URL || 'https://instagram.com/dhwebsiteservices',
      },
      {
        platform: 'facebook' as const,
        label: 'Facebook',
        href: env.DH_FACEBOOK_URL || 'https://facebook.com/dhwebsiteservices',
      },
      {
        platform: 'linkedin' as const,
        label: 'LinkedIn',
        href: env.DH_LINKEDIN_URL || 'https://linkedin.com/company/dhwebsiteservices',
      },
      {
        platform: 'whatsapp' as const,
        label: 'WhatsApp',
        href: env.DH_WHATSAPP_URL || 'https://wa.me/442920024218',
      },
    ],
  }
}

async function fetchHrProfiles(env: Env): Promise<HrProfileRow[]> {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in Cloudflare Pages environment variables.')
  }

  const url = new URL('/rest/v1/hr_profiles', env.SUPABASE_URL)
  url.searchParams.set('select', 'id,user_email,full_name,role,department,phone,updated_at,created_at')
  url.searchParams.set('order', 'updated_at.desc.nullslast,created_at.desc.nullslast')

  const response = await fetch(url.toString(), {
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    },
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(`Could not load hr_profiles from Supabase: ${response.status} ${message}`)
  }

  return (await response.json()) as HrProfileRow[]
}

function mapProfiles(rows: HrProfileRow[], env: Env): SignatureProfile[] {
  const byEmail = new Map<string, HrProfileRow[]>()

  for (const row of rows) {
    const email = normalizeEmail(row.user_email)
    if (!email || !email.includes('@')) continue
    if (!byEmail.has(email)) byEmail.set(email, [])
    byEmail.get(email)?.push(row)
  }

  const globalLinks = getGlobalLinks(env)

  return Array.from(byEmail.entries())
    .map(([email, candidates]) => {
      const row = pickBestProfileRow(candidates)
      if (!row) return null

      return {
        id: `profile-${email}`,
        email,
        fullName: firstNonEmpty(row.full_name, email.split('@')[0]),
        title: firstNonEmpty(row.role, 'Staff member'),
        department: firstNonEmpty(row.department, 'Unassigned department'),
        workPhone: firstNonEmpty(row.phone, globalLinks.businessLandline),
        businessLandline: globalLinks.businessLandline,
        websiteUrl: globalLinks.websiteUrl,
        workplaceUrl: globalLinks.workplaceUrl,
        bookingUrl: globalLinks.bookingUrl,
        socialLinks: globalLinks.socialLinks,
        signatureEnabled: true,
        forceRefreshRequired: false,
        lastSyncedAt: row.updated_at || row.created_at || new Date().toISOString(),
      } satisfies SignatureProfile
    })
    .filter((profile): profile is SignatureProfile => Boolean(profile))
    .sort((a, b) => a.fullName.localeCompare(b.fullName))
}

export async function buildOverview(env: Env): Promise<AdminOverviewResponse & { branding: TenantBranding }> {
  const rows = await fetchHrProfiles(env)
  const profiles = mapProfiles(rows, env)

  return {
    profiles,
    templates: signatureTemplates,
    branding: buildBranding(env),
    controls: {
      canActivateTenantWide: true,
      canForceRefresh: true,
      authProvider: 'Microsoft Entra ID',
    },
  }
}

export async function buildAssignmentByEmail(email: string, env: Env): Promise<SignatureAssignment> {
  const overview = await buildOverview(env)
  const normalizedEmail = normalizeEmail(email)
  const profile = overview.profiles.find((item) => item.email === normalizedEmail)

  if (!profile) {
    throw new Error(`No signature profile found for ${normalizedEmail}.`)
  }

  return {
    profile,
    template: overview.templates[0],
    branding: overview.branding,
  }
}

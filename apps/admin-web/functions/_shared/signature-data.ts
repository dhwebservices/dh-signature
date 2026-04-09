import type {
  AdminOverviewResponse,
  SignatureActivity,
  SignatureAssignments,
  SignatureAssignment,
  SignatureCampaign,
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

interface PortalSettingRow {
  key?: string
  value?: unknown
}

interface StoredAdminState {
  branding?: Partial<TenantBranding>
  campaigns?: SignatureCampaign[]
  activity?: SignatureActivity[]
  publishedTemplateId?: string
  assignments?: Partial<SignatureAssignments>
  profiles?: Array<{
    id?: string
    email?: string
    signatureEnabled?: boolean
    forceRefreshRequired?: boolean
    lastSyncedAt?: string
  }>
}

const ADMIN_STATE_KEY = 'dh_signature:admin_state'

const normalizeEmail = (value = '') => value.trim().toLowerCase()

const firstNonEmpty = (...values: Array<string | null | undefined>) => {
  for (const value of values) {
    if (!value) continue
    const trimmed = value.trim()
    if (trimmed) return trimmed
  }
  return ''
}

const defaultCampaigns: SignatureCampaign[] = [
  {
    id: 'launch-consistency',
    name: 'Signature consistency launch',
    headline: 'Need help with your website or digital growth?',
    body: 'Book a call with DH Website Services and speak to the right team.',
    ctaLabel: 'Book a call',
    audience: 'All staff mailboxes',
    status: 'Live',
  },
  {
    id: 'client-ops-cta',
    name: 'Client Ops follow-up CTA',
    headline: 'Need support with your live website or client workspace?',
    body: 'Speak to DH Website Services and get routed to the right support team.',
    ctaLabel: 'DH Workplace',
    audience: 'Client Operations',
    status: 'Draft',
  },
]

function buildDefaultAssignments(): SignatureAssignments {
  return {
    publishedTemplateId: signatureTemplates[0]?.id || 'signature-clean',
    departmentTemplates: {},
    profileTemplates: {},
  }
}

function buildDefaultActivity(profileCount: number): SignatureActivity[] {
  return [
    {
      id: 'tenant-data-synced',
      title: 'Tenant data synced',
      body: `Loaded ${profileCount} staff records from the live signature data source.`,
      createdAt: new Date().toISOString(),
    },
  ]
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

function createSupabaseHeaders(env: Env) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in Cloudflare Pages environment variables.')
  }

  return {
    apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
  }
}

function buildBranding(env: Env, stored?: StoredAdminState): TenantBranding {
  const configuredLogoUrl = env.DH_LOGO_URL || tenantBranding.logoUrl
  const normalizedLogoUrl = configuredLogoUrl.endsWith('/icons/dh-logo.png')
    ? configuredLogoUrl.replace('/icons/dh-logo.png', '/icons/dh-logo-icon.png')
    : configuredLogoUrl

  return {
    ...tenantBranding,
    ...stored?.branding,
    companyWebsiteLabel: env.DH_WEBSITE_URL ? new URL(env.DH_WEBSITE_URL).host.replace(/^www\./, '') : stored?.branding?.companyWebsiteLabel || tenantBranding.companyWebsiteLabel,
    privacyPolicyUrl: env.DH_PRIVACY_POLICY_URL || stored?.branding?.privacyPolicyUrl || tenantBranding.privacyPolicyUrl,
    logoUrl: stored?.branding?.logoUrl || normalizedLogoUrl,
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
  const headers = createSupabaseHeaders(env)
  const url = new URL('/rest/v1/hr_profiles', env.SUPABASE_URL)
  url.searchParams.set('select', 'id,user_email,full_name,role,department,phone,updated_at,created_at')
  url.searchParams.set('order', 'updated_at.desc.nullslast,created_at.desc.nullslast')

  const response = await fetch(url.toString(), { headers })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(`Could not load hr_profiles from Supabase: ${response.status} ${message}`)
  }

  return (await response.json()) as HrProfileRow[]
}

async function fetchStoredState(env: Env): Promise<StoredAdminState | null> {
  const headers = createSupabaseHeaders(env)
  const url = new URL('/rest/v1/portal_settings', env.SUPABASE_URL)
  url.searchParams.set('select', 'key,value')
  url.searchParams.set('key', `eq.${ADMIN_STATE_KEY}`)
  url.searchParams.set('limit', '1')

  const response = await fetch(url.toString(), { headers })
  if (!response.ok) return null

  const rows = (await response.json()) as PortalSettingRow[]
  const value = rows[0]?.value
  if (!value || typeof value !== 'object') return null
  return value as StoredAdminState
}

function mapProfiles(rows: HrProfileRow[], env: Env, stored?: StoredAdminState | null): SignatureProfile[] {
  const byEmail = new Map<string, HrProfileRow[]>()

  for (const row of rows) {
    const email = normalizeEmail(row.user_email)
    if (!email || !email.includes('@')) continue
    if (!byEmail.has(email)) byEmail.set(email, [])
    byEmail.get(email)?.push(row)
  }

  const globalLinks = getGlobalLinks(env)
  const storedProfiles = new Map(
    (stored?.profiles || [])
      .filter((profile) => profile.email)
      .map((profile) => [normalizeEmail(profile.email || ''), profile]),
  )

  return Array.from(byEmail.entries())
    .map(([email, candidates]) => {
      const row = pickBestProfileRow(candidates)
      if (!row) return null
      const saved = storedProfiles.get(email)

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
        signatureEnabled: saved?.signatureEnabled ?? true,
        forceRefreshRequired: saved?.forceRefreshRequired ?? false,
        lastSyncedAt: saved?.lastSyncedAt || row.updated_at || row.created_at || new Date().toISOString(),
      } satisfies SignatureProfile
    })
    .filter((profile): profile is SignatureProfile => Boolean(profile))
    .sort((a, b) => a.fullName.localeCompare(b.fullName))
}

export async function buildOverview(env: Env): Promise<AdminOverviewResponse & { branding: TenantBranding }> {
  const [rows, stored] = await Promise.all([fetchHrProfiles(env), fetchStoredState(env)])
  const profiles = mapProfiles(rows, env, stored)
  const defaultAssignments = buildDefaultAssignments()
  const assignments: SignatureAssignments = {
    publishedTemplateId: stored?.assignments?.publishedTemplateId || stored?.publishedTemplateId || defaultAssignments.publishedTemplateId,
    departmentTemplates: stored?.assignments?.departmentTemplates || {},
    profileTemplates: stored?.assignments?.profileTemplates || {},
  }

  return {
    profiles,
    templates: signatureTemplates,
    campaigns: stored?.campaigns?.length ? stored.campaigns : defaultCampaigns,
    activity: stored?.activity?.length ? stored.activity : buildDefaultActivity(profiles.length),
    assignments,
    branding: buildBranding(env, stored),
    controls: {
      canActivateTenantWide: true,
      canForceRefresh: true,
      authProvider: 'Microsoft Entra ID',
      publishedTemplateId: assignments.publishedTemplateId,
    },
  }
}

export async function saveAdminState(env: Env, state: StoredAdminState) {
  const headers = createSupabaseHeaders(env)
  const url = new URL('/rest/v1/portal_settings', env.SUPABASE_URL)
  url.searchParams.set('on_conflict', 'key')

  const payload = [
    {
      key: ADMIN_STATE_KEY,
      value: state,
    },
  ]

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      ...headers,
      'content-type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(`Could not save signature admin state: ${response.status} ${message}`)
  }
}

export async function buildAssignmentByEmail(email: string, env: Env): Promise<SignatureAssignment> {
  const overview = await buildOverview(env)
  const normalizedEmail = normalizeEmail(email)
  const profile = overview.profiles.find((item) => item.email === normalizedEmail)
  const assignedTemplateId =
    overview.assignments.profileTemplates[normalizedEmail] ||
    overview.assignments.departmentTemplates[profile?.department || ''] ||
    overview.assignments.publishedTemplateId
  const activeTemplate =
    overview.templates.find((template) => template.id === assignedTemplateId) ||
    overview.templates[0]
  const normalizedDepartment = (profile?.department || '').trim().toLowerCase()
  const activeCampaign =
    overview.campaigns.find((campaign) => {
      if (campaign.status !== 'Live') return false
      const audience = campaign.audience.trim().toLowerCase()
      return audience === 'all staff mailboxes' || audience === normalizedDepartment || audience.includes(normalizedDepartment)
    }) || null

  if (!profile) {
    throw new Error(`No signature profile found for ${normalizedEmail}.`)
  }

  return {
    profile,
    template: activeTemplate,
    branding: overview.branding,
    banner: activeCampaign
      ? {
          headline: activeCampaign.headline,
          body: activeCampaign.body,
          ctaLabel: activeCampaign.ctaLabel,
          ctaHref: activeCampaign.ctaLabel.toLowerCase().includes('workplace') ? profile.workplaceUrl : profile.bookingUrl,
        }
      : null,
  }
}

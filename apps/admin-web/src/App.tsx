import { AuthenticatedTemplate, MsalProvider, UnauthenticatedTemplate, useMsal } from '@azure/msal-react'
import { PublicClientApplication } from '@azure/msal-browser'
import { useEffect, useMemo, useState } from 'react'
import { Sidebar, type AdminSection } from './components/Sidebar'
import { Topbar } from './components/Topbar'
import { PreviewCard } from './components/PreviewCard'
import { TemplateLibrary } from './components/TemplateLibrary'
import { ControlPanel } from './components/ControlPanel'
import { signatureTemplates, tenantBranding, type AdminOverviewResponse, type TenantBranding } from '@dh-signature/shared-types'
import { LoginScreen } from './components/LoginScreen'
import { UserRoster } from './components/UserRoster'
import { msalConfig } from './authConfig'
import { AuditView, AssignmentsView, BrandKitView, CampaignsView, DeploymentView } from './components/SectionViews'
import { fetchOverview } from './lib/api'

const msalInstance = new PublicClientApplication(msalConfig)

export function App() {
  return (
    <MsalProvider instance={msalInstance}>
      <AuthenticatedTemplate>
        <AuthedApp />
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <LoginScreen />
      </UnauthenticatedTemplate>
    </MsalProvider>
  )
}

function AuthedApp() {
  const { accounts, instance } = useMsal()
  const [activeSection, setActiveSection] = useState<AdminSection>('Templates')
  const [searchValue, setSearchValue] = useState('')
  const [overview, setOverview] = useState<(AdminOverviewResponse & { branding?: TenantBranding }) | null>(null)
  const [activeMicrosoftEmails, setActiveMicrosoftEmails] = useState<Set<string> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [templateId, setTemplateId] = useState(signatureTemplates[0].id)
  const [profileId, setProfileId] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadMicrosoftDirectoryEmails() {
      const account = accounts[0]
      if (!account) return null

      try {
        const token = await instance
          .acquireTokenSilent({ scopes: ['https://graph.microsoft.com/User.Read.All'], account })
          .catch(() => instance.acquireTokenPopup({ scopes: ['https://graph.microsoft.com/User.Read.All'], account }))

        const response = await fetch('https://graph.microsoft.com/v1.0/users?$select=userPrincipalName,accountEnabled&$top=999', {
          headers: { Authorization: `Bearer ${token.accessToken}` },
        })

        if (!response.ok) return null
        const data = await response.json()
        const emails = new Set<string>()

        for (const row of data.value || []) {
          const email = String(row.userPrincipalName || '').trim().toLowerCase()
          if (!email || row.accountEnabled === false) continue
          emails.add(email)
        }

        return emails
      } catch {
        return null
      }
    }

    async function loadOverview() {
      try {
        setLoading(true)
        setError('')
        const [response, microsoftEmails] = await Promise.all([fetchOverview(), loadMicrosoftDirectoryEmails()])
        if (cancelled) return
        setOverview(response)
        setActiveMicrosoftEmails(microsoftEmails)
        setTemplateId((current) => response.templates.find((template) => template.id === current)?.id ?? response.templates[0]?.id ?? current)
        setProfileId((current) => response.profiles.find((profile) => profile.id === current)?.id ?? response.profiles[0]?.id ?? '')
      } catch (loadError) {
        if (cancelled) return
        setError(loadError instanceof Error ? loadError.message : 'Could not load tenant overview.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadOverview()
    return () => {
      cancelled = true
    }
  }, [])

  const profiles = useMemo(() => {
    const baseProfiles = overview?.profiles ?? []
    if (!activeMicrosoftEmails || activeMicrosoftEmails.size === 0) return baseProfiles

    return baseProfiles.filter((profile) => activeMicrosoftEmails.has(profile.email.toLowerCase()))
  }, [overview, activeMicrosoftEmails])
  const templates = useMemo(() => overview?.templates ?? signatureTemplates, [overview])
  const branding = overview?.branding ?? tenantBranding

  const filteredProfiles = useMemo(() => {
    const query = searchValue.trim().toLowerCase()
    if (!query) return profiles

    return profiles.filter((profile) =>
      [profile.fullName, profile.email, profile.department, profile.title]
        .join(' ')
        .toLowerCase()
        .includes(query),
    )
  }, [profiles, searchValue])

  const activeTemplate = useMemo(
    () => templates.find((template) => template.id === templateId) ?? templates[0],
    [templateId, templates],
  )
  const activeProfile = useMemo(
    () => filteredProfiles.find((profile) => profile.id === profileId) ?? filteredProfiles[0] ?? profiles[0] ?? null,
    [filteredProfiles, profileId, profiles],
  )
  const currentAdminName = accounts[0]?.name || accounts[0]?.username?.split('@')[0] || 'Admin'
  const mailboxCount = profiles.length

  const hero = useMemo(() => {
    if (loading) return { title: 'Loading tenant signature data...', body: 'Pulling your staff roster and signature controls from the live environment.' }
    if (error) return { title: 'Tenant data needs attention', body: error }

    const sectionCopy: Record<AdminSection, { title: string; body: string }> = {
      Templates: {
        title: 'Design, preview, and deploy a premium Outlook signature across the whole tenant.',
        body: 'Staff see the signature while they type. Signature admins can activate layouts tenant-wide and force refreshes when staff details are wrong.',
      },
      Assignments: {
        title: 'See who is covered, who needs cleanup, and where direct details are missing.',
        body: 'Use real staff rows from the portal to review signature coverage before rolling updates out tenant-wide.',
      },
      'Brand kit': {
        title: 'Keep every mailbox on the same branded contact system.',
        body: 'Global brand links, CTA labels, and social links feed every rendered DH signature from one place.',
      },
      Campaigns: {
        title: 'Timed signature promos will live here once publishing rules are wired.',
        body: 'This area is now real app chrome, ready for campaign banners and department-specific CTA launches next.',
      },
      Deployment: {
        title: 'Monitor tenant rollout and know how many staff rows are actually being covered.',
        body: 'This view now reflects the live staff roster instead of mock mailbox counts, so rollout decisions are based on real people.',
      },
      Audit: {
        title: 'Track coverage, readiness, and future compliance checkpoints in one place.',
        body: 'Audit will expand into export, force-refresh, and publish history as the next backend phases land.',
      },
    }

    return sectionCopy[activeSection]
  }, [activeSection, error, loading])

  const templatesLive = templates.length
  const selectedAdminLabel = currentAdminName.split(' ')[0]

  return (
    <div className="app-shell">
      <Sidebar activeSection={activeSection} mailboxCount={mailboxCount} onChange={setActiveSection} />
      <div className="shell-main">
        <Topbar activeSection={activeSection} searchValue={searchValue} onSearchChange={setSearchValue} />
        <main className="page-grid">
          <div className="page-primary">
            <section className="hero-panel">
              <div className="hero-copy">
                <h2>{hero.title}</h2>
                <p>{hero.body}</p>
              </div>
              <div className="hero-metrics">
                <Metric label="Templates live" value={String(templatesLive)} tone="blue" />
                <Metric label="Staff rows covered" value={loading ? '...' : String(mailboxCount)} tone="green" />
                <Metric label="Signed in admin" value={selectedAdminLabel} tone="dark" />
              </div>
            </section>

            {error ? (
              <section className="panel status-panel error">
                <div className="panel-title">Live tenant data could not be loaded</div>
                <p>{error}</p>
              </section>
            ) : loading ? (
              <section className="panel status-panel">
                <div className="panel-title">Loading staff roster</div>
                <p>Pulling real people and department data into the signature platform now.</p>
              </section>
            ) : activeProfile ? (
              <PreviewCard profile={activeProfile} template={activeTemplate} branding={branding} />
            ) : (
              <section className="panel status-panel">
                <div className="panel-title">No staff rows found</div>
                <p>No staff profiles were returned from the live data source yet.</p>
              </section>
            )}

            {activeSection === 'Templates' ? (
              <TemplateLibrary templates={templates} activeTemplateId={templateId} onSelect={setTemplateId} />
            ) : null}
            {activeSection === 'Assignments' ? <AssignmentsView profiles={filteredProfiles} /> : null}
            {activeSection === 'Brand kit' ? <BrandKitView branding={branding} /> : null}
            {activeSection === 'Campaigns' ? <CampaignsView /> : null}
            {activeSection === 'Deployment' ? <DeploymentView profiles={profiles} /> : null}
            {activeSection === 'Audit' ? <AuditView profiles={profiles} templates={templates} /> : null}
          </div>

          <div className="page-secondary">
            <UserRoster profiles={filteredProfiles} activeProfileId={activeProfile?.id || ''} onSelect={setProfileId} />
            {activeProfile ? <ControlPanel profile={activeProfile} template={activeTemplate} branding={branding} /> : null}
          </div>
        </main>
      </div>
    </div>
  )
}

function Metric({ label, value, tone }: { label: string; value: string; tone: 'blue' | 'green' | 'dark' }) {
  return (
    <div className={`metric-card tone-${tone}`}>
      <div className="metric-value">{value}</div>
      <div className="metric-label">{label}</div>
    </div>
  )
}

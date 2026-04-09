import { AuthenticatedTemplate, MsalProvider, UnauthenticatedTemplate, useMsal } from '@azure/msal-react'
import { PublicClientApplication } from '@azure/msal-browser'
import { useEffect, useMemo, useState } from 'react'
import { renderSignature } from '@dh-signature/signature-renderer'
import type { SignatureActivity, SignatureAssignments, SignatureCampaign, SignatureProfile, SignatureTemplate, TenantBranding } from '@dh-signature/shared-types'
import { signatureTemplates, tenantBranding } from '@dh-signature/shared-types'
import { Sidebar, type AdminSection } from './components/Sidebar'
import { Topbar } from './components/Topbar'
import { PreviewCard, type PreviewMode } from './components/PreviewCard'
import { TemplateLibrary } from './components/TemplateLibrary'
import { ControlPanel } from './components/ControlPanel'
import { LoginScreen } from './components/LoginScreen'
import { UserRoster } from './components/UserRoster'
import { loginRequest, msalConfig } from './authConfig'
import { AuditView, AssignmentsView, BrandKitView, CampaignsView, DeploymentView } from './components/SectionViews'
import { fetchOverview, saveAdminState } from './lib/api'

const msalInstance = new PublicClientApplication(msalConfig)

type CampaignStatus = 'Draft' | 'Live' | 'Paused'
type CampaignItem = SignatureCampaign & { status: CampaignStatus }

const initialCampaigns: CampaignItem[] = [
  {
    id: 'launch-consistency',
    name: 'Signature consistency launch',
    ctaLabel: 'Book a call',
    audience: 'All staff mailboxes',
    status: 'Live',
  },
  {
    id: 'client-ops-cta',
    name: 'Client Ops follow-up CTA',
    ctaLabel: 'DH Workplace',
    audience: 'Client Operations',
    status: 'Draft',
  },
]

function nowIso() {
  return new Date().toISOString()
}

function buildActivity(title: string, body: string): SignatureActivity {
  return {
    id: `${title}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    body,
    createdAt: nowIso(),
  }
}

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
  const [profilesState, setProfilesState] = useState<SignatureProfile[]>([])
  const [templatesState, setTemplatesState] = useState<SignatureTemplate[]>(signatureTemplates)
  const [brandingState, setBrandingState] = useState<TenantBranding>(tenantBranding)
  const [campaigns, setCampaigns] = useState<SignatureCampaign[]>(initialCampaigns)
  const [activityFeed, setActivityFeed] = useState<SignatureActivity[]>([])
  const [assignments, setAssignments] = useState<SignatureAssignments>({
    publishedTemplateId: signatureTemplates[0].id,
    departmentTemplates: {},
    profileTemplates: {},
  })
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [publishOpen, setPublishOpen] = useState(false)
  const [publishTitle, setPublishTitle] = useState('Spring rollout update')
  const [publishBody, setPublishBody] = useState('Signature styling and directory sync rules have been updated for all active staff profiles.')
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop')
  const [toast, setToast] = useState('')
  const [activeMicrosoftEmails, setActiveMicrosoftEmails] = useState<Set<string> | null>(null)
  const [directorySyncError, setDirectorySyncError] = useState('')
  const [loading, setLoading] = useState(true)
  const [hydrated, setHydrated] = useState(false)
  const [savingState, setSavingState] = useState(false)
  const [error, setError] = useState('')
  const [templateId, setTemplateId] = useState(signatureTemplates[0].id)
  const [publishedTemplateId, setPublishedTemplateId] = useState(signatureTemplates[0].id)
  const [profileId, setProfileId] = useState('')

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(''), 2800)
    return () => window.clearTimeout(timeout)
  }, [toast])

  useEffect(() => {
    let cancelled = false

    async function loadMicrosoftDirectoryEmails() {
      const account = accounts[0]
      if (!account) return { emails: null, error: 'No signed-in Entra account was available for directory sync.' }

      try {
        const token = await instance
          .acquireTokenSilent({ scopes: loginRequest.scopes, account })
          .catch(() => instance.acquireTokenPopup({ scopes: loginRequest.scopes, account }))

        const response = await fetch('https://graph.microsoft.com/v1.0/users?$select=userPrincipalName,mail,accountEnabled&$top=999', {
          headers: { Authorization: `Bearer ${token.accessToken}` },
        })

        if (!response.ok) {
          return { emails: null, error: 'Microsoft directory sync is unavailable right now, so stale deleted users may still appear until Graph access is granted.' }
        }
        const data = await response.json()
        const emails = new Set<string>()

        for (const row of data.value || []) {
          const candidates = [row.userPrincipalName, row.mail]
            .map((value: string | undefined) => String(value || '').trim().toLowerCase())
            .filter(Boolean)

          if (row.accountEnabled === false) continue
          for (const email of candidates) emails.add(email)
        }

        return { emails, error: '' }
      } catch {
        return { emails: null, error: 'Microsoft directory sync could not complete. Sign out and back in if deleted users are still showing.' }
      }
    }

    async function loadOverview() {
      try {
        setLoading(true)
        setError('')
        const [response, directorySync] = await Promise.all([fetchOverview(), loadMicrosoftDirectoryEmails()])
        if (cancelled) return
        setTemplatesState(response.templates)
        setBrandingState(response.branding ?? tenantBranding)
        setCampaigns(response.campaigns?.length ? response.campaigns : initialCampaigns)
        setAssignments(response.assignments || {
          publishedTemplateId: response.controls?.publishedTemplateId || response.templates[0]?.id || signatureTemplates[0].id,
          departmentTemplates: {},
          profileTemplates: {},
        })
        setActiveMicrosoftEmails(directorySync.emails)
        setDirectorySyncError(directorySync.error)
        setProfileId((current) => response.profiles.find((profile) => profile.id === current)?.id ?? response.profiles[0]?.id ?? '')
        setActivityFeed(
          response.activity?.length
            ? response.activity
            : [
                buildActivity('Tenant data synced', `Loaded ${response.profiles.length} staff records from the live signature data source.`),
                buildActivity('Admin session started', 'Microsoft Entra sign-in completed and signature controls are available.'),
              ],
        )
        setProfilesState(() => {
          if (!directorySync.emails || directorySync.emails.size === 0) return response.profiles
          return response.profiles.filter((profile) => directorySync.emails.has(profile.email.toLowerCase()))
        })
        setTemplateId((current) => response.templates.find((template) => template.id === current)?.id ?? response.templates[0]?.id ?? current)
        setPublishedTemplateId(response.controls?.publishedTemplateId || response.templates[0]?.id || signatureTemplates[0].id)
        setHydrated(true)
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
  }, [accounts, instance])

  useEffect(() => {
    if (!hydrated || loading || error) return

    const timeout = window.setTimeout(async () => {
      try {
        setSavingState(true)
        await saveAdminState({
          branding: brandingState,
          campaigns,
          activity: activityFeed,
          publishedTemplateId,
          assignments: {
            ...assignments,
            publishedTemplateId,
          },
          profiles: profilesState.map((profile) => ({
            id: profile.id,
            email: profile.email,
            signatureEnabled: profile.signatureEnabled,
            forceRefreshRequired: profile.forceRefreshRequired,
            lastSyncedAt: profile.lastSyncedAt,
          })),
        })
      } catch {
        setToast('Could not save admin state')
      } finally {
        setSavingState(false)
      }
    }, 450)

    return () => window.clearTimeout(timeout)
  }, [brandingState, campaigns, activityFeed, profilesState, publishedTemplateId, assignments, hydrated, loading, error])

  const profiles = useMemo(() => {
    if (!activeMicrosoftEmails || activeMicrosoftEmails.size === 0) return profilesState
    return profilesState.filter((profile) => activeMicrosoftEmails.has(profile.email.toLowerCase()))
  }, [profilesState, activeMicrosoftEmails])

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
    () => templatesState.find((template) => template.id === templateId) ?? templatesState[0],
    [templateId, templatesState],
  )
  const activeProfile = useMemo(
    () => filteredProfiles.find((profile) => profile.id === profileId) ?? filteredProfiles[0] ?? profiles[0] ?? null,
    [filteredProfiles, profileId, profiles],
  )
  const currentAdminName = accounts[0]?.name || accounts[0]?.username?.split('@')[0] || 'Admin'
  const mailboxCount = profiles.length
  const unreadNotifications = activityFeed.length

  useEffect(() => {
    if (!activeProfile && profiles[0]) {
      setProfileId(profiles[0].id)
    }
  }, [activeProfile, profiles])

  const hero = useMemo(() => {
    if (loading) return { title: 'Loading tenant signature data...', body: 'Pulling your staff roster and signature controls from the live environment.' }
    if (error) return { title: 'Tenant data needs attention', body: error }

    const sectionCopy: Record<AdminSection, { title: string; body: string }> = {
      Templates: {
        title: 'Build the signature every staff member actually sends.',
        body: 'Switch layouts, preview real staff records, and publish a tenant-wide refresh from one place.',
      },
      Assignments: {
        title: 'Manage who is covered and who needs intervention.',
        body: 'Queue fixes, disable broken records, and review signature readiness across live staff rows.',
      },
      'Brand kit': {
        title: 'Control the global DH identity every mailbox uses.',
        body: 'Update the shared logo, labels, booking CTA, and linked destinations without touching each user profile.',
      },
      Campaigns: {
        title: 'Launch timed banners and signature CTA variants.',
        body: 'Stage department-specific campaigns and decide which ones go live before the next publish event.',
      },
      Deployment: {
        title: 'Operate rollout health from the same admin console.',
        body: 'Track how many live rows are active, queue tenant refreshes, and copy deployment assets without leaving the app.',
      },
      Audit: {
        title: 'Keep a visible trail of tenant signature actions.',
        body: 'See the latest publishes, refresh requests, and roster changes instead of static placeholder metrics.',
      },
    }

    return sectionCopy[activeSection]
  }, [activeSection, error, loading])

  function pushActivity(title: string, body: string) {
    setActivityFeed((current) => [buildActivity(title, body), ...current].slice(0, 12))
  }

  function updateProfile(profileIdToUpdate: string, updater: (profile: SignatureProfile) => SignatureProfile) {
    setProfilesState((current) => current.map((profile) => (profile.id === profileIdToUpdate ? updater(profile) : profile)))
  }

  function handleToggleSignature(profileIdToUpdate: string) {
    const target = profiles.find((profile) => profile.id === profileIdToUpdate)
    if (!target) return
    updateProfile(profileIdToUpdate, (profile) => ({ ...profile, signatureEnabled: !profile.signatureEnabled }))
    pushActivity(
      target.signatureEnabled ? 'Signature disabled' : 'Signature activated',
      `${target.fullName} was ${target.signatureEnabled ? 'removed from' : 'added to'} the tenant rollout queue.`,
    )
    setToast(`${target.fullName} updated`)
  }

  function handleQueueRefresh(profileIdToUpdate: string) {
    const target = profiles.find((profile) => profile.id === profileIdToUpdate)
    if (!target) return
    updateProfile(profileIdToUpdate, (profile) => ({ ...profile, forceRefreshRequired: true, lastSyncedAt: nowIso() }))
    pushActivity('Force refresh queued', `${target.fullName} has been queued for the next Outlook signature refresh.`)
    setToast(`Refresh queued for ${target.fullName}`)
  }

  function handleActivateAllUsers() {
    setProfilesState((current) => current.map((profile) => ({ ...profile, signatureEnabled: true })))
    pushActivity('Tenant activation run', 'All currently loaded staff rows were marked active for signature rollout.')
    setToast('All users activated')
  }

  function handleForceTenantRefresh() {
    setProfilesState((current) => current.map((profile) => ({ ...profile, forceRefreshRequired: true, lastSyncedAt: nowIso() })))
    pushActivity('Tenant refresh requested', 'A tenant-wide Outlook signature refresh has been queued for every active row.')
    setToast('Tenant refresh queued')
  }

  function handleSaveBranding(nextBranding: TenantBranding) {
    setBrandingState(nextBranding)
    pushActivity('Brand kit updated', 'Shared company labels and signature destinations were updated in the admin app.')
    setToast('Brand kit saved')
  }

  function handleAssignProfileTemplate(profileEmail: string, nextTemplateId: string) {
    setAssignments((current) => ({
      ...current,
      profileTemplates: {
        ...current.profileTemplates,
        [profileEmail.toLowerCase()]: nextTemplateId,
      },
    }))
    const matched = profiles.find((profile) => profile.email.toLowerCase() === profileEmail.toLowerCase())
    pushActivity('Profile template assigned', `${matched?.fullName || profileEmail} now uses ${templatesState.find((template) => template.id === nextTemplateId)?.name || nextTemplateId}.`)
    setToast('Profile template saved')
  }

  function handleAssignDepartmentTemplate(department: string, nextTemplateId: string) {
    setAssignments((current) => ({
      ...current,
      departmentTemplates: {
        ...current.departmentTemplates,
        [department]: nextTemplateId,
      },
    }))
    pushActivity('Department template assigned', `${department} now defaults to ${templatesState.find((template) => template.id === nextTemplateId)?.name || nextTemplateId}.`)
    setToast('Department template saved')
  }

  function handlePublishUpdate() {
    const title = publishTitle.trim()
    const body = publishBody.trim()
    if (!title || !body) {
      setToast('Add a title and message first')
      return
    }
    pushActivity(title, body)
    setPublishedTemplateId(templateId)
    setAssignments((current) => ({ ...current, publishedTemplateId: templateId }))
    setPublishOpen(false)
    setNotificationOpen(true)
    setToast('Update published')
  }

  function handleAddCampaign(name: string, ctaLabel: string, audience: string) {
    setCampaigns((current) => [
      {
        id: `${name}-${Date.now()}`,
        name,
        ctaLabel,
        audience,
        status: 'Draft',
      },
      ...current,
    ])
    pushActivity('Campaign drafted', `${name} was added as a new signature campaign for ${audience}.`)
    setToast('Campaign created')
  }

  function handleToggleCampaign(campaignId: string) {
    setCampaigns((current) =>
      current.map((campaign) => {
        if (campaign.id !== campaignId) return campaign
        const nextStatus: CampaignStatus =
          campaign.status === 'Live' ? 'Paused' : campaign.status === 'Paused' ? 'Draft' : 'Live'
        pushActivity('Campaign status updated', `${campaign.name} is now ${nextStatus.toLowerCase()}.`)
        return { ...campaign, status: nextStatus }
      }),
    )
    setToast('Campaign updated')
  }

  async function handleCopyManifestUrl() {
    await navigator.clipboard.writeText(`${window.location.origin}/manifest.xml`)
    pushActivity('Manifest copied', 'The Outlook add-in manifest URL was copied from the deployment view.')
    setToast('Manifest URL copied')
  }

  async function handleCopySignatureHtml() {
    if (!activeProfile || !activeTemplate) return
    const rendered = renderSignature({ profile: activeProfile, template: activeTemplate, branding: brandingState })
    await navigator.clipboard.writeText(rendered.html)
    pushActivity('Signature HTML copied', `Copied the ${activeTemplate.name} signature markup for ${activeProfile.fullName}.`)
    setToast('Signature HTML copied')
  }

  const templatesLive = templatesState.length
  const selectedAdminLabel = currentAdminName.split(' ')[0]

  return (
    <div className="app-shell">
      <Sidebar activeSection={activeSection} mailboxCount={mailboxCount} onChange={setActiveSection} />
      <div className="shell-main">
        <Topbar
          activeSection={activeSection}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          unreadNotifications={unreadNotifications}
          onToggleNotifications={() => setNotificationOpen((current) => !current)}
          onPublishClick={() => setPublishOpen(true)}
        />
        {toast ? <div className="toast-banner">{toast}</div> : null}
        {savingState ? <div className="save-indicator">Saving tenant changes…</div> : null}
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
              <PreviewCard
                profile={activeProfile}
                template={activeTemplate}
                branding={brandingState}
                mode={previewMode}
                onModeChange={setPreviewMode}
              />
            ) : (
              <section className="panel status-panel">
                <div className="panel-title">No staff rows found</div>
                <p>No staff profiles were returned from the live data source yet.</p>
              </section>
            )}

            {directorySyncError ? (
              <section className="panel status-panel">
                <div className="panel-title">Microsoft directory sync needs attention</div>
                <p>{directorySyncError}</p>
              </section>
            ) : null}

            {activeSection === 'Templates' ? (
              <TemplateLibrary templates={templatesState} activeTemplateId={templateId} onSelect={setTemplateId} />
            ) : null}
            {activeSection === 'Assignments' ? (
              <AssignmentsView
                profiles={filteredProfiles}
                templates={templatesState}
                assignments={assignments}
                onQueueRefresh={handleQueueRefresh}
                onToggleSignature={handleToggleSignature}
                onAssignDepartmentTemplate={handleAssignDepartmentTemplate}
                onAssignProfileTemplate={handleAssignProfileTemplate}
              />
            ) : null}
            {activeSection === 'Brand kit' ? (
              <BrandKitView branding={brandingState} onSave={handleSaveBranding} />
            ) : null}
            {activeSection === 'Campaigns' ? (
              <CampaignsView campaigns={campaigns} onCreate={handleAddCampaign} onToggle={handleToggleCampaign} />
            ) : null}
            {activeSection === 'Deployment' ? (
              <DeploymentView
                profiles={profiles}
                publishedTemplateName={templatesState.find((template) => template.id === publishedTemplateId)?.name || activeTemplate?.name || 'None'}
                onActivateAll={handleActivateAllUsers}
                onForceRefreshAll={handleForceTenantRefresh}
                onCopyManifestUrl={handleCopyManifestUrl}
              />
            ) : null}
            {activeSection === 'Audit' ? <AuditView activities={activityFeed} profiles={profiles} templates={templatesState} /> : null}
          </div>

          <div className="page-secondary">
            {notificationOpen ? (
              <section className="panel notification-panel">
                <div className="panel-header">
                  <div>
                    <div className="panel-kicker">Notifications</div>
                    <div className="panel-title">Recent admin events</div>
                  </div>
                  <button className="secondary-btn compact" onClick={() => setNotificationOpen(false)}>Close</button>
                </div>
                <div className="activity-feed">
                  {activityFeed.length ? activityFeed.map((item) => (
                    <div key={item.id} className="activity-row">
                      <div className="activity-title">{item.title}</div>
                      <div className="activity-body">{item.body}</div>
                      <div className="activity-time">{new Date(item.createdAt).toLocaleString('en-GB')}</div>
                    </div>
                  )) : <div className="empty-copy">No admin alerts yet.</div>}
                </div>
              </section>
            ) : null}
            <UserRoster profiles={filteredProfiles} activeProfileId={activeProfile?.id || ''} onSelect={setProfileId} />
            {activeProfile ? (
              <ControlPanel
                profile={activeProfile}
                template={activeTemplate}
                branding={brandingState}
                publishedTemplateName={templatesState.find((template) => template.id === publishedTemplateId)?.name || activeTemplate?.name || 'None'}
                onActivateAllUsers={handleActivateAllUsers}
                onForceTenantRefresh={handleForceTenantRefresh}
                onCopySignatureHtml={handleCopySignatureHtml}
                onQueueUserRefresh={() => handleQueueRefresh(activeProfile.id)}
              />
            ) : null}
          </div>
        </main>
      </div>

      {publishOpen ? (
        <div className="modal-shell" role="presentation">
          <div className="modal-card">
            <div className="panel-header">
              <div>
                <div className="panel-kicker">Publish update</div>
                <div className="panel-title">Send a tenant-wide admin update</div>
              </div>
              <button className="secondary-btn compact" onClick={() => setPublishOpen(false)}>Close</button>
            </div>
            <div className="field-grid">
              <label className="input-card">
                <span className="field-label">Title</span>
                <input value={publishTitle} onChange={(event) => setPublishTitle(event.target.value)} />
              </label>
              <label className="input-card">
                <span className="field-label">Message</span>
                <textarea rows={5} value={publishBody} onChange={(event) => setPublishBody(event.target.value)} />
              </label>
            </div>
            <div className="action-row">
              <button className="primary-btn" onClick={handlePublishUpdate}>Publish update</button>
              <button className="secondary-btn" onClick={() => setPublishOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      ) : null}
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

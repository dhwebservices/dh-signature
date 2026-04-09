import { AuthenticatedTemplate, MsalProvider, UnauthenticatedTemplate, useMsal } from '@azure/msal-react'
import { PublicClientApplication } from '@azure/msal-browser'
import { useMemo, useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { Topbar } from './components/Topbar'
import { PreviewCard } from './components/PreviewCard'
import { TemplateLibrary } from './components/TemplateLibrary'
import { ControlPanel } from './components/ControlPanel'
import { adminUsers, signatureProfiles, signatureTemplates, tenantBranding } from '@dh-signature/shared-types'
import { LoginScreen } from './components/LoginScreen'
import { UserRoster } from './components/UserRoster'
import { msalConfig } from './authConfig'

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
  const { accounts } = useMsal()
  const [templateId, setTemplateId] = useState(signatureTemplates[0].id)
  const [profileId, setProfileId] = useState(signatureProfiles[0].id)

  const activeTemplate = useMemo(
    () => signatureTemplates.find((template) => template.id === templateId) ?? signatureTemplates[0],
    [templateId],
  )
  const activeProfile = useMemo(
    () => signatureProfiles.find((profile) => profile.id === profileId) ?? signatureProfiles[0],
    [profileId],
  )
  const currentAdmin = adminUsers.find((item) => item.email.toLowerCase() === accounts[0]?.username?.toLowerCase()) ?? adminUsers[0]

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="shell-main">
        <Topbar />
        <main className="page-grid">
          <div className="page-primary">
            <section className="hero-panel">
              <div className="hero-copy">
                <div className="hero-kicker">DH-owned WiseStamp replacement</div>
                <h2>Design, preview, and deploy a premium Outlook signature across the whole tenant.</h2>
                <p>
                  Staff see the signature while they type. Signature admins can activate layouts tenant-wide and force refreshes if staff details in Outlook signatures are wrong.
                </p>
              </div>
              <div className="hero-metrics">
                <Metric label="Templates live" value="3" tone="blue" />
                <Metric label="Mailboxes covered" value="118" tone="green" />
                <Metric label="Signed in admin" value={currentAdmin.name.split(' ')[0]} tone="dark" />
              </div>
            </section>

            <PreviewCard profile={activeProfile} template={activeTemplate} branding={tenantBranding} />
            <TemplateLibrary templates={signatureTemplates} activeTemplateId={templateId} onSelect={setTemplateId} />
          </div>

          <div className="page-secondary">
            <UserRoster profiles={signatureProfiles} activeProfileId={profileId} onSelect={setProfileId} />
            <ControlPanel profile={activeProfile} template={activeTemplate} branding={tenantBranding} />
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

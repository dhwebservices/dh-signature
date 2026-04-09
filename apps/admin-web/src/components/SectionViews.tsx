import type { SignatureProfile, SignatureTemplate, TenantBranding } from '@dh-signature/shared-types'

export function AssignmentsView({ profiles }: { profiles: SignatureProfile[] }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <div className="panel-kicker">Assignments</div>
          <div className="panel-title">Active user coverage</div>
        </div>
      </div>
      <div className="table-shell">
        <table className="data-table">
          <thead>
            <tr>
              <th>Staff member</th>
              <th>Department</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Refresh</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((profile) => (
              <tr key={profile.id}>
                <td>
                  <div className="table-main">{profile.fullName || profile.email}</div>
                  <div className="table-sub">{profile.title || profile.email}</div>
                </td>
                <td>{profile.department || 'Unassigned'}</td>
                <td>{profile.workPhone || 'Missing'}</td>
                <td>{profile.signatureEnabled ? 'Active' : 'Inactive'}</td>
                <td>{profile.forceRefreshRequired ? 'Force update queued' : 'Healthy'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export function BrandKitView({ branding }: { branding: TenantBranding }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <div className="panel-kicker">Brand kit</div>
          <div className="panel-title">Global signature assets</div>
        </div>
      </div>
      <div className="field-grid">
        <Field label="Company" value={branding.companyName} />
        <Field label="Website label" value={branding.companyWebsiteLabel} />
        <Field label="Workplace label" value={branding.workplaceLabel} />
        <Field label="Booking label" value={branding.bookingLabel} />
        <Field label="Privacy policy" value={branding.privacyPolicyUrl} />
        <Field label="Logo asset" value={branding.logoUrl} />
      </div>
    </section>
  )
}

export function CampaignsView() {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <div className="panel-kicker">Campaigns</div>
          <div className="panel-title">Signature promos and timed callouts</div>
        </div>
      </div>
      <div className="empty-copy">Campaign banners and scheduled CTAs will live here once signature publishing is connected to saved template variants.</div>
    </section>
  )
}

export function DeploymentView({ profiles }: { profiles: SignatureProfile[] }) {
  const active = profiles.filter((profile) => profile.signatureEnabled).length
  const queued = profiles.filter((profile) => profile.forceRefreshRequired).length
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <div className="panel-kicker">Deployment</div>
          <div className="panel-title">Tenant rollout health</div>
        </div>
      </div>
      <div className="field-grid">
        <Field label="Staff rows loaded" value={String(profiles.length)} />
        <Field label="Signatures active" value={String(active)} />
        <Field label="Force refresh queued" value={String(queued)} />
        <Field label="Outlook add-in" value="Configured" />
      </div>
    </section>
  )
}

export function AuditView({ profiles, templates }: { profiles: SignatureProfile[]; templates: SignatureTemplate[] }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <div className="panel-kicker">Audit</div>
          <div className="panel-title">Signature control checkpoints</div>
        </div>
      </div>
      <div className="audit-list">
        <div className="audit-row"><span>Templates available</span><strong>{templates.length}</strong></div>
        <div className="audit-row"><span>Users loaded from tenant directory</span><strong>{profiles.length}</strong></div>
        <div className="audit-row"><span>Profiles with direct numbers</span><strong>{profiles.filter((item) => item.workPhone).length}</strong></div>
        <div className="audit-row"><span>Profiles requiring forced refresh</span><strong>{profiles.filter((item) => item.forceRefreshRequired).length}</strong></div>
      </div>
    </section>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="field-card">
      <div className="field-label">{label}</div>
      <div className="field-value">{value}</div>
    </div>
  )
}

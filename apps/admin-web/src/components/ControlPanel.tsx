import type { SignatureProfile, SignatureTemplate, TenantBranding } from '@dh-signature/shared-types'

export function ControlPanel({
  profile,
  template,
  branding,
  publishedTemplateName,
  onActivateAllUsers,
  onForceTenantRefresh,
  onCopySignatureHtml,
  onQueueUserRefresh,
}: {
  profile: SignatureProfile
  template: SignatureTemplate
  branding: TenantBranding
  publishedTemplateName: string
  onActivateAllUsers: () => void
  onForceTenantRefresh: () => void
  onCopySignatureHtml: () => void | Promise<void>
  onQueueUserRefresh: () => void
}) {
  return (
    <section className="panel control-panel">
      <div className="panel-header">
        <div>
          <div className="panel-kicker">Signature controls</div>
          <div className="panel-title">Content and deployment rules</div>
        </div>
      </div>

      <div className="control-section">
        <div className="section-title">Admin enforcement</div>
        <div className="field-grid">
          <Field label="Signature status" value={profile.signatureEnabled ? 'Active for this user' : 'Not active'} />
          <Field label="Force refresh" value={profile.forceRefreshRequired ? 'Pending next Outlook sync' : 'No refresh pending'} />
          <Field label="Last synced" value={new Date(profile.lastSyncedAt).toLocaleString('en-GB')} />
        </div>
        <div className="action-row">
          <button className="primary-btn compact" onClick={onActivateAllUsers}>Activate for all users</button>
          <button className="secondary-btn compact" onClick={onForceTenantRefresh}>Force tenant refresh</button>
          <button className="secondary-btn compact" onClick={() => void onQueueUserRefresh()}>Refresh this user</button>
          <button className="secondary-btn compact" onClick={() => void onCopySignatureHtml()}>Copy signature HTML</button>
        </div>
      </div>

      <div className="control-section">
        <div className="section-title">Mapped staff fields</div>
        <div className="field-grid">
          <Field label="Name" value={profile.fullName} />
          <Field label="Title" value={profile.title} />
          <Field label="Department" value={profile.department} />
          <Field label="Signature number" value={profile.businessLandline} />
        </div>
      </div>

      <div className="control-section">
        <div className="section-title">Global links</div>
        <div className="field-grid">
          <Field label="Website" value={branding.companyWebsiteLabel} />
          <Field label="DH Workplace" value={branding.workplaceLabel} />
          <Field label="Book a call" value={branding.bookingLabel} />
          <Field label="Social buttons" value={`${profile.socialLinks.length} active`} />
        </div>
      </div>

      <div className="control-section">
        <div className="section-title">Deployment</div>
        <div className="deployment-list">
          <div className="deployment-row"><span>Compose-time Outlook add-in</span><strong>Enabled</strong></div>
          <div className="deployment-row"><span>Tenant scope</span><strong>All mailboxes</strong></div>
          <div className="deployment-row"><span>Reply and forward coverage</span><strong>Handled by compose event</strong></div>
          <div className="deployment-row"><span>Published template</span><strong>{publishedTemplateName}</strong></div>
          <div className="deployment-row"><span>Previewing now</span><strong>{template.name}</strong></div>
        </div>
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

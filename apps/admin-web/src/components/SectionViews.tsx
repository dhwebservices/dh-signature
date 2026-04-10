import { useMemo, useState } from 'react'
import { PauseCircle, PlayCircle, RefreshCcw, ShieldCheck } from 'lucide-react'
import type { SignatureAssignments, SignatureCampaign, SignatureProfile, SignatureTemplate, TenantBranding } from '@dh-signature/shared-types'

type CampaignItem = SignatureCampaign

export function AssignmentsView({
  profiles,
  templates,
  assignments,
  onToggleSignature,
  onQueueRefresh,
  onAssignProfileTemplate,
  onAssignDepartmentTemplate,
}: {
  profiles: SignatureProfile[]
  templates: SignatureTemplate[]
  assignments: SignatureAssignments
  onToggleSignature: (profileId: string) => void
  onQueueRefresh: (profileId: string) => void
  onAssignProfileTemplate: (profileEmail: string, templateId: string) => void
  onAssignDepartmentTemplate: (department: string, templateId: string) => void
}) {
  const departmentRows = useMemo(() => {
    const departments = new Map<string, number>()
    for (const profile of profiles) {
      const key = profile.department || 'Unassigned department'
      departments.set(key, (departments.get(key) || 0) + 1)
    }
    return Array.from(departments.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [profiles])

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <div className="panel-kicker">Assignments</div>
          <div className="panel-title">Active user coverage</div>
        </div>
      </div>
      <div className="assignment-groups">
        {departmentRows.map(([department, count]) => (
          <div key={department} className="assignment-card">
            <div>
              <div className="table-main">{department}</div>
              <div className="table-sub">{count} staff rows</div>
            </div>
            <label className="assignment-select">
              <span className="field-label">Department template</span>
              <select
                value={assignments.departmentTemplates[department] || assignments.publishedTemplateId}
                onChange={(event) => onAssignDepartmentTemplate(department, event.target.value)}
              >
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>{template.name}</option>
                ))}
              </select>
            </label>
          </div>
        ))}
      </div>
      <div className="table-shell">
        <table className="data-table">
          <thead>
            <tr>
              <th>Staff member</th>
              <th>Department</th>
              <th>Template</th>
              <th>Status</th>
              <th>Refresh</th>
              <th>Actions</th>
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
                <td>
                  <label className="assignment-select inline">
                    <select
                      value={
                        assignments.profileTemplates[profile.email.toLowerCase()] ||
                        assignments.departmentTemplates[profile.department] ||
                        assignments.publishedTemplateId
                      }
                      onChange={(event) => onAssignProfileTemplate(profile.email, event.target.value)}
                    >
                      {templates.map((template) => (
                        <option key={template.id} value={template.id}>{template.name}</option>
                      ))}
                    </select>
                  </label>
                </td>
                <td>{profile.signatureEnabled ? 'Active' : 'Inactive'}</td>
                <td>{profile.forceRefreshRequired ? 'Force update queued' : 'Healthy'}</td>
                <td>
                  <div className="table-actions">
                    <button className="table-btn" onClick={() => onToggleSignature(profile.id)}>
                      {profile.signatureEnabled ? 'Disable' : 'Activate'}
                    </button>
                    <button className="table-btn secondary" onClick={() => onQueueRefresh(profile.id)}>
                      Queue refresh
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export function BrandKitView({
  branding,
  onSave,
}: {
  branding: TenantBranding
  onSave: (branding: TenantBranding) => void
}) {
  const [draft, setDraft] = useState(branding)

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <div className="panel-kicker">Brand kit</div>
          <div className="panel-title">Global signature assets</div>
        </div>
      </div>
      <div className="editable-grid">
        <InputField label="Company" value={draft.companyName} onChange={(value) => setDraft((current) => ({ ...current, companyName: value }))} />
        <InputField label="Website label" value={draft.companyWebsiteLabel} onChange={(value) => setDraft((current) => ({ ...current, companyWebsiteLabel: value }))} />
        <InputField label="Workplace label" value={draft.workplaceLabel} onChange={(value) => setDraft((current) => ({ ...current, workplaceLabel: value }))} />
        <InputField label="Booking label" value={draft.bookingLabel} onChange={(value) => setDraft((current) => ({ ...current, bookingLabel: value }))} />
        <InputField label="Privacy policy" value={draft.privacyPolicyUrl} onChange={(value) => setDraft((current) => ({ ...current, privacyPolicyUrl: value }))} />
        <InputField label="Logo asset" value={draft.logoUrl} onChange={(value) => setDraft((current) => ({ ...current, logoUrl: value }))} />
      </div>
      <div className="action-row">
        <button className="primary-btn compact" onClick={() => onSave(draft)}>Save brand kit</button>
      </div>
    </section>
  )
}

export function CampaignsView({
  campaigns,
  templates,
  onCreate,
  onToggle,
  onUpdate,
}: {
  campaigns: CampaignItem[]
  templates: SignatureTemplate[]
  onCreate: (campaign: Omit<SignatureCampaign, 'id' | 'status'>) => void
  onToggle: (campaignId: string) => void
  onUpdate: (campaignId: string, patch: Partial<SignatureCampaign>) => void
}) {
  const [name, setName] = useState('')
  const [headline, setHeadline] = useState('Need help with your website or digital growth?')
  const [body, setBody] = useState('Book a call with DH Website Services and speak to the right team.')
  const [ctaLabel, setCtaLabel] = useState('Book a call')
  const [ctaMode, setCtaMode] = useState<NonNullable<SignatureCampaign['ctaMode']>>('booking')
  const [ctaHref, setCtaHref] = useState('')
  const [audience, setAudience] = useState('All staff mailboxes')
  const [startAt, setStartAt] = useState('')
  const [endAt, setEndAt] = useState('')
  const [suppressedTemplateIds, setSuppressedTemplateIds] = useState<string[]>([])

  function toggleSuppressedTemplate(templateId: string, currentValues: string[], commit?: (values: string[]) => void) {
    const nextValues = currentValues.includes(templateId)
      ? currentValues.filter((value) => value !== templateId)
      : [...currentValues, templateId]

    commit?.(nextValues)
    return nextValues
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <div className="panel-kicker">Campaigns</div>
          <div className="panel-title">Signature promos and timed callouts</div>
        </div>
      </div>
      <div className="campaign-builder">
        <InputField label="Campaign name" value={name} onChange={setName} placeholder="Quarterly booking push" />
        <InputField label="Banner headline" value={headline} onChange={setHeadline} />
        <InputField label="Banner body" value={body} onChange={setBody} />
        <InputField label="CTA label" value={ctaLabel} onChange={setCtaLabel} />
        <label className="input-card">
          <span className="field-label">CTA destination</span>
          <select value={ctaMode} onChange={(event) => setCtaMode(event.target.value as NonNullable<SignatureCampaign['ctaMode']>)}>
            <option value="booking">Book a call</option>
            <option value="workplace">DH Workplace</option>
            <option value="custom">Custom URL</option>
          </select>
        </label>
        {ctaMode === 'custom' ? (
          <InputField label="Custom CTA URL" value={ctaHref} onChange={setCtaHref} placeholder="https://dhwebsiteservices.co.uk/contact" />
        ) : null}
        <InputField label="Audience" value={audience} onChange={setAudience} />
        <InputField label="Start at" type="datetime-local" value={startAt} onChange={setStartAt} />
        <InputField label="End at" type="datetime-local" value={endAt} onChange={setEndAt} />
        <div className="input-card input-card-wide">
          <span className="field-label">Hide banner on templates</span>
          <div className="checkbox-grid">
            {templates.map((template) => (
              <label key={template.id} className="checkbox-chip">
                <input
                  type="checkbox"
                  checked={suppressedTemplateIds.includes(template.id)}
                  onChange={() => setSuppressedTemplateIds((current) => toggleSuppressedTemplate(template.id, current))}
                />
                <span>{template.name}</span>
              </label>
            ))}
          </div>
        </div>
        <button
          className="primary-btn compact"
          onClick={() => {
            if (!name.trim()) return
            onCreate({
              name: name.trim(),
              headline: headline.trim(),
              body: body.trim(),
              ctaLabel: ctaLabel.trim(),
              ctaMode,
              ctaHref: ctaMode === 'custom' ? ctaHref.trim() : '',
              audience: audience.trim(),
              startAt: startAt.trim() || null,
              endAt: endAt.trim() || null,
              suppressedTemplateIds,
            })
            setName('')
            setCtaHref('')
            setStartAt('')
            setEndAt('')
            setSuppressedTemplateIds([])
          }}
        >
          Add campaign
        </button>
      </div>
      <div className="campaign-list">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="campaign-row">
            <div>
              <div className="table-main">{campaign.name}</div>
              <div className="table-sub">{campaign.audience} · CTA: {campaign.ctaLabel}</div>
              <div className="table-sub" style={{ marginTop: 6 }}>{campaign.headline}</div>
              <div className="table-sub" style={{ marginTop: 6 }}>
                {campaign.startAt ? `Starts ${new Date(campaign.startAt).toLocaleString('en-GB')}` : 'Starts immediately'}
                {' · '}
                {campaign.endAt ? `Ends ${new Date(campaign.endAt).toLocaleString('en-GB')}` : 'No end date'}
              </div>
              {campaign.suppressedTemplateIds?.length ? (
                <div className="table-sub" style={{ marginTop: 6 }}>
                  Hidden on {campaign.suppressedTemplateIds
                    .map((templateId) => templates.find((template) => template.id === templateId)?.name || templateId)
                    .join(', ')}
                </div>
              ) : null}
            </div>
            <div className="campaign-actions">
              <span className={`status-chip status-${campaign.status.toLowerCase()}`}>{campaign.status}</span>
              <button className="table-btn secondary" onClick={() => onToggle(campaign.id)}>
                {campaign.status === 'Live' ? <PauseCircle size={14} /> : <PlayCircle size={14} />}
                {campaign.status === 'Live' ? 'Pause' : campaign.status === 'Paused' ? 'Draft' : 'Go live'}
              </button>
            </div>
            <div className="campaign-inline-grid">
              <label className="assignment-select inline">
                <span className="field-label">CTA target</span>
                <select
                  value={campaign.ctaMode || 'booking'}
                  onChange={(event) => onUpdate(campaign.id, { ctaMode: event.target.value as NonNullable<SignatureCampaign['ctaMode']> })}
                >
                  <option value="booking">Book a call</option>
                  <option value="workplace">DH Workplace</option>
                  <option value="custom">Custom URL</option>
                </select>
              </label>
              {(campaign.ctaMode || 'booking') === 'custom' ? (
                <label className="input-card input-card-compact">
                  <span className="field-label">Custom URL</span>
                  <input
                    value={campaign.ctaHref || ''}
                    onChange={(event) => onUpdate(campaign.id, { ctaHref: event.target.value })}
                    placeholder="https://..."
                  />
                </label>
              ) : null}
              <label className="input-card input-card-compact">
                <span className="field-label">Start</span>
                  <input
                    type="datetime-local"
                    value={campaign.startAt || ''}
                    onChange={(event) => onUpdate(campaign.id, { startAt: event.target.value || null })}
                  />
                </label>
              <label className="input-card input-card-compact">
                <span className="field-label">End</span>
                <input
                  type="datetime-local"
                  value={campaign.endAt || ''}
                  onChange={(event) => onUpdate(campaign.id, { endAt: event.target.value || null })}
                />
              </label>
              <div className="input-card input-card-wide">
                <span className="field-label">Hide on templates</span>
                <div className="checkbox-grid">
                  {templates.map((template) => (
                    <label key={template.id} className="checkbox-chip">
                      <input
                        type="checkbox"
                        checked={(campaign.suppressedTemplateIds || []).includes(template.id)}
                        onChange={() => onUpdate(campaign.id, {
                          suppressedTemplateIds: toggleSuppressedTemplate(template.id, campaign.suppressedTemplateIds || []),
                        })}
                      />
                      <span>{template.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function DeploymentView({
  profiles,
  publishedTemplateName,
  onActivateAll,
  onForceRefreshAll,
  onCopyManifestUrl,
}: {
  profiles: SignatureProfile[]
  publishedTemplateName: string
  onActivateAll: () => void
  onForceRefreshAll: () => void
  onCopyManifestUrl: () => void | Promise<void>
}) {
  const active = profiles.filter((profile) => profile.signatureEnabled).length
  const queued = profiles.filter((profile) => profile.forceRefreshRequired).length
  const healthy = profiles.length - queued

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <div className="panel-kicker">Deployment</div>
          <div className="panel-title">Tenant rollout health</div>
        </div>
      </div>
      <div className="deployment-metrics">
        <Field label="Staff rows loaded" value={String(profiles.length)} />
        <Field label="Signatures active" value={String(active)} />
        <Field label="Healthy rows" value={String(healthy)} />
        <Field label="Refresh queued" value={String(queued)} />
      </div>
      <div className="deployment-list">
        <div className="deployment-row"><span>Outlook add-in</span><strong>Deployed</strong></div>
        <div className="deployment-row"><span>Published template</span><strong>{publishedTemplateName}</strong></div>
        <div className="deployment-row"><span>Manifest</span><strong>Live on sig.dhwebsiteservices.co.uk</strong></div>
        <div className="deployment-row"><span>Reply and forward coverage</span><strong>Handled by compose event</strong></div>
      </div>
      <div className="action-row">
        <button className="primary-btn compact" onClick={onActivateAll}>
          <ShieldCheck size={14} />
          Activate all users
        </button>
        <button className="secondary-btn compact" onClick={onForceRefreshAll}>
          <RefreshCcw size={14} />
          Force tenant refresh
        </button>
        <button className="secondary-btn compact" onClick={() => void onCopyManifestUrl()}>
          Copy manifest URL
        </button>
      </div>
    </section>
  )
}

export function AuditView({
  activities,
  profiles,
  templates,
}: {
  activities: Array<{ id: string; title: string; body: string; createdAt: string }>
  profiles: SignatureProfile[]
  templates: SignatureTemplate[]
}) {
  const totals = useMemo(() => ({
    rowsWithRefresh: profiles.filter((item) => item.forceRefreshRequired).length,
    activeUsers: profiles.filter((item) => item.signatureEnabled).length,
    templateCount: templates.length,
  }), [profiles, templates])

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <div className="panel-kicker">Audit</div>
          <div className="panel-title">Signature control checkpoints</div>
        </div>
      </div>
      <div className="audit-summary">
        <Field label="Templates available" value={String(totals.templateCount)} />
        <Field label="Active users" value={String(totals.activeUsers)} />
        <Field label="Queued refreshes" value={String(totals.rowsWithRefresh)} />
      </div>
      <div className="activity-feed">
        {activities.map((item) => (
          <div key={item.id} className="activity-row">
            <div className="activity-title">{item.title}</div>
            <div className="activity-body">{item.body}</div>
            <div className="activity-time">{new Date(item.createdAt).toLocaleString('en-GB')}</div>
          </div>
        ))}
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

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <label className="input-card">
      <span className="field-label">{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  )
}

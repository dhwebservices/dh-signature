import { renderSignature } from '@dh-signature/signature-renderer'
import type { SignatureProfile, SignatureTemplate, TenantBranding } from '@dh-signature/shared-types'

export function PreviewCard({
  profile,
  template,
  branding,
}: {
  profile: SignatureProfile
  template: SignatureTemplate
  branding: TenantBranding
}) {
  const rendered = renderSignature({ profile, template, branding })

  return (
    <section className="preview-card">
      <div className="panel-header">
        <div>
          <div className="panel-kicker">Live signature preview</div>
          <div className="panel-title">{template.name}</div>
        </div>
        <div className="preview-pills">
          <span className="pill selected">Desktop</span>
          <span className="pill">Mobile</span>
          <span className="pill">Reply</span>
        </div>
      </div>
      <div className="preview-surface">
        <div className="mail-shell">
          <div className="mail-toolbar">
            <span />
            <span />
            <span />
          </div>
          <div className="mail-compose">
            <div className="mail-meta">To: client@example.com</div>
            <div className="mail-meta">Subject: Signature rollout preview</div>
            <div className="mail-body">
              <p>Hi there,</p>
              <p>Here’s how the new DH tenant-wide signature will appear in Outlook while staff are composing emails.</p>
              <div className="signature-preview" dangerouslySetInnerHTML={{ __html: rendered.html }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

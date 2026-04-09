import { renderSignature } from '@dh-signature/signature-renderer'
import type { SignatureProfile, SignatureTemplate, TenantBranding } from '@dh-signature/shared-types'

export type PreviewMode = 'desktop' | 'mobile' | 'reply'

export function PreviewCard({
  profile,
  template,
  branding,
  mode,
  onModeChange,
}: {
  profile: SignatureProfile
  template: SignatureTemplate
  branding: TenantBranding
  mode: PreviewMode
  onModeChange: (mode: PreviewMode) => void
}) {
  const rendered = renderSignature({ profile, template, branding })
  const intro = mode === 'reply'
    ? 'Here’s the latest update below. Keeping the reply context intact while the DH signature stays clean.'
    : 'Here’s how the new DH tenant-wide signature will appear in Outlook while staff are composing emails.'

  return (
    <section className="preview-card">
      <div className="panel-header">
        <div>
          <div className="panel-kicker">Live signature preview</div>
          <div className="panel-title">{template.name}</div>
        </div>
        <div className="preview-pills">
          <button className={`pill${mode === 'desktop' ? ' selected' : ''}`} onClick={() => onModeChange('desktop')}>Desktop</button>
          <button className={`pill${mode === 'mobile' ? ' selected' : ''}`} onClick={() => onModeChange('mobile')}>Mobile</button>
          <button className={`pill${mode === 'reply' ? ' selected' : ''}`} onClick={() => onModeChange('reply')}>Reply</button>
        </div>
      </div>
      <div className="preview-surface">
        <div className={`mail-shell preview-${mode}`}>
          <div className="mail-toolbar">
            <span />
            <span />
            <span />
          </div>
          <div className="mail-compose">
            <div className="mail-meta">To: client@example.com</div>
            <div className="mail-meta">Subject: {mode === 'reply' ? 'Re: Signature rollout preview' : 'Signature rollout preview'}</div>
            <div className="mail-body">
              <p>Hi there,</p>
              <p>{intro}</p>
              {mode === 'reply' ? (
                <div className="reply-shell">
                  <div className="reply-label">Previous message</div>
                  <div className="reply-copy">Thanks for the update. Please use the new DH tenant-wide signature on the next send.</div>
                </div>
              ) : null}
              <div className="signature-preview" dangerouslySetInnerHTML={{ __html: rendered.html }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

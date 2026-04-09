import type { SignatureProfile } from '@dh-signature/shared-types'
import { RefreshCcw, ShieldCheck } from 'lucide-react'

export function UserRoster({
  profiles,
  activeProfileId,
  onSelect,
}: {
  profiles: SignatureProfile[]
  activeProfileId: string
  onSelect: (profileId: string) => void
}) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <div className="panel-kicker">Tenant controls</div>
          <div className="panel-title">User signature rollout</div>
        </div>
      </div>
      <div className="roster-list">
        {profiles.map((profile) => (
          <button
            key={profile.id}
            className={`roster-row${profile.id === activeProfileId ? ' active' : ''}`}
            onClick={() => onSelect(profile.id)}
          >
            <div className="roster-main">
              <div className="roster-name">{profile.fullName}</div>
              <div className="roster-meta">{profile.title} · {profile.department}</div>
            </div>
            <div className="roster-badges">
              {profile.signatureEnabled ? (
                <span className="roster-pill success"><ShieldCheck size={13} /> Active</span>
              ) : (
                <span className="roster-pill muted">Inactive</span>
              )}
              {profile.forceRefreshRequired ? (
                <span className="roster-pill alert"><RefreshCcw size={13} /> Force update</span>
              ) : null}
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}

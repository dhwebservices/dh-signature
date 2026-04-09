import { Activity, BadgeCheck, BrushCleaning, LayoutTemplate, Mail, Settings2, ShieldCheck } from 'lucide-react'

export type AdminSection = 'Templates' | 'Assignments' | 'Brand kit' | 'Campaigns' | 'Deployment' | 'Audit'

const items: Array<{ icon: typeof LayoutTemplate; label: AdminSection }> = [
  { icon: LayoutTemplate, label: 'Templates' },
  { icon: Mail, label: 'Assignments' },
  { icon: BrushCleaning, label: 'Brand kit' },
  { icon: Activity, label: 'Campaigns' },
  { icon: ShieldCheck, label: 'Deployment' },
  { icon: BadgeCheck, label: 'Audit' },
]

export function Sidebar({
  activeSection,
  mailboxCount,
  onChange,
}: {
  activeSection: AdminSection
  mailboxCount: number
  onChange: (section: AdminSection) => void
}) {
  return (
    <aside className="shell-sidebar">
      <div className="brand-lockup">
        <div className="brand-mark">DH</div>
        <div>
          <div className="brand-title">DH Signature</div>
          <div className="brand-subtitle">Tenant-wide email identity</div>
        </div>
      </div>
      <nav className="sidebar-nav">
        {items.map(({ icon: Icon, label }) => (
          <button key={label} className={`nav-item${activeSection === label ? ' active' : ''}`} onClick={() => onChange(label)}>
            <Icon size={17} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-card">
          <div className="sidebar-card-title">Microsoft 365</div>
          <div className="sidebar-card-copy">Signature coverage currently maps to {mailboxCount} staff profiles.</div>
          <button className="ghost-link" onClick={() => onChange('Deployment')}>
            <Settings2 size={14} />
            Deployment settings
          </button>
        </div>
      </div>
    </aside>
  )
}

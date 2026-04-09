import { Activity, BadgeCheck, BrushCleaning, LayoutTemplate, Mail, Settings2, ShieldCheck } from 'lucide-react'

const items = [
  { icon: LayoutTemplate, label: 'Templates', active: true },
  { icon: Mail, label: 'Assignments' },
  { icon: BrushCleaning, label: 'Brand kit' },
  { icon: Activity, label: 'Campaigns' },
  { icon: ShieldCheck, label: 'Deployment' },
  { icon: BadgeCheck, label: 'Audit' },
]

export function Sidebar() {
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
        {items.map(({ icon: Icon, label, active }) => (
          <button key={label} className={`nav-item${active ? ' active' : ''}`}>
            <Icon size={17} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-card">
          <div className="sidebar-card-title">Microsoft 365</div>
          <div className="sidebar-card-copy">Add-in deployed to 118 staff mailboxes</div>
          <button className="ghost-link">
            <Settings2 size={14} />
            Deployment settings
          </button>
        </div>
      </div>
    </aside>
  )
}

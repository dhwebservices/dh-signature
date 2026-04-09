import { Bell, Search, Sparkles } from 'lucide-react'
import type { AdminSection } from './Sidebar'

export function Topbar({
  activeSection,
  searchValue,
  onSearchChange,
  unreadNotifications,
  onToggleNotifications,
  onPublishClick,
}: {
  activeSection: AdminSection
  searchValue: string
  onSearchChange: (value: string) => void
  unreadNotifications: number
  onToggleNotifications: () => void
  onPublishClick: () => void
}) {
  const titleBySection: Record<AdminSection, string> = {
    Templates: 'Build the signature every staff member actually sends',
    Assignments: 'Manage who gets which signature and who needs a refresh',
    'Brand kit': 'Control the global DH identity every mailbox uses',
    Campaigns: 'Schedule banners, announcements, and timed CTAs',
    Deployment: 'See rollout health and tenant-wide signature coverage',
    Audit: 'Track signature controls, activity, and compliance checkpoints',
  }

  return (
    <header className="shell-topbar">
      <div>
        <div className="eyebrow">Signature platform</div>
        <h1>{titleBySection[activeSection]}</h1>
      </div>
      <div className="topbar-actions">
        <label className="search-shell">
          <Search size={16} />
          <input
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search templates, staff, departments..."
          />
        </label>
        <button className="icon-btn notification-btn" aria-label="Notifications" onClick={onToggleNotifications}>
          <Bell size={16} />
          {unreadNotifications ? <span className="notification-badge">{Math.min(unreadNotifications, 9)}</span> : null}
        </button>
        <button className="primary-btn" type="button" onClick={onPublishClick}>
          <Sparkles size={16} />
          Publish update
        </button>
      </div>
    </header>
  )
}

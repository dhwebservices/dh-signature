import { Bell, Search, Sparkles } from 'lucide-react'

export function Topbar() {
  return (
    <header className="shell-topbar">
      <div>
        <div className="eyebrow">Signature platform</div>
        <h1>Build the signature every staff member actually sends</h1>
      </div>
      <div className="topbar-actions">
        <label className="search-shell">
          <Search size={16} />
          <input placeholder="Search templates, staff, departments..." />
        </label>
        <button className="icon-btn" aria-label="Notifications">
          <Bell size={16} />
        </button>
        <button className="primary-btn">
          <Sparkles size={16} />
          Publish update
        </button>
      </div>
    </header>
  )
}

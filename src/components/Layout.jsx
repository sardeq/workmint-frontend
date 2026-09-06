import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import Icon from './Icon';
import { Avatar } from './Shared';
import { timeAgo } from '../data/helpers';

const NAV = {
  client: [
    { key: 'Overview', icon: 'grid' },
    { key: 'My Projects', icon: 'briefcase' },
    { key: 'Proposals', icon: 'inbox' },
    { key: 'Post a Job', icon: 'plus' },
    { key: 'Find Freelancers', icon: 'search' },
    { key: 'Messages', icon: 'chat' },
    { key: 'Payments', icon: 'wallet' },
  ],
  freelancer: [
    { key: 'Overview', icon: 'grid' },
    { key: 'My Orders', icon: 'briefcase' },
    { key: 'Available Jobs', icon: 'search' },
    { key: 'My Proposals', icon: 'send' },
    { key: 'Messages', icon: 'chat' },
    { key: 'Earnings', icon: 'wallet' },
    { key: 'Portfolio', icon: 'layers' },
    { key: 'Profile', icon: 'user' },
  ],
  admin: [
    { key: 'Overview', icon: 'grid' },
    { key: 'Disputes', icon: 'alert' },
    { key: 'Approvals', icon: 'check' },
    { key: 'Users', icon: 'user' },
    { key: 'Jobs', icon: 'briefcase' },
    { key: 'Analytics', icon: 'trend' },
  ],
};

const Layout = ({
  user,
  onLogout,
  title,
  subtitle,
  activeTab,
  setActiveTab,
  badges = {},
  notifications = [],
  children,
}) => {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleSignOut = () => {
    onLogout();
    navigate('/login');
  };

  const navItems = NAV[user.role] || NAV.freelancer;

  const go = (key) => {
    setActiveTab(key);
    setDrawerOpen(false);
  };

  return (
    <div className="wm-dashboard-layout">
      {drawerOpen && <div className="wm-scrim" onClick={() => setDrawerOpen(false)} />}

      <aside className={`wm-sidebar ${drawerOpen ? 'open' : ''}`}>
        <div className="wm-sidebar-logo">Workmint.</div>

        <div className="wm-workspace-chip">
          <Avatar name={user.name} size={34} />
          <div style={{ minWidth: 0 }}>
            <small>Workspace</small>
            <strong>{user.role}</strong>
          </div>
        </div>

        <nav className="d-flex flex-column flex-grow-1">
          {navItems.map((item) => (
            <button
              type="button"
              key={item.key}
              className={`wm-nav-item ${activeTab === item.key ? 'active' : ''}`}
              onClick={() => go(item.key)}
            >
              <Icon name={item.icon} size={16} />
              {item.key}
              {badges[item.key] > 0 && <span className="wm-nav-item__badge">{badges[item.key]}</span>}
            </button>
          ))}

          <div className="wm-nav-footer">
            <button type="button" className="wm-nav-item wm-nav-item--danger" onClick={handleSignOut}>
              <Icon name="logout" size={16} />
              Sign out
            </button>
          </div>
        </nav>
      </aside>

      <main className="wm-main-content">
        <header className="wm-topbar">
          <div className="d-flex align-items-center gap-2" style={{ minWidth: 0 }}>
            <button
              type="button"
              className="wm-icon-btn wm-sidebar-toggle"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
            >
              <Icon name="menu" size={18} />
            </button>
            <div style={{ minWidth: 0 }}>
              <h2>{title}</h2>
              {subtitle && <p className="wm-topbar__sub">{subtitle}</p>}
            </div>
          </div>

          <div className="wm-topbar__actions">
            <Dropdown align="end">
              <Dropdown.Toggle as="button" className="wm-icon-btn" aria-label="Notifications">
                <Icon name="bell" size={17} />
                {notifications.length > 0 && <span className="wm-icon-btn__dot" />}
              </Dropdown.Toggle>
              <Dropdown.Menu style={{ width: 320, padding: 0, borderRadius: 14, border: '1px solid var(--border-color)' }}>
                <div className="px-3 py-2 border-bottom d-flex justify-content-between align-items-center">
                  <strong style={{ fontSize: '0.85rem' }}>Notifications</strong>
                  <span className="text-muted" style={{ fontSize: '0.75rem' }}>{notifications.length} new</span>
                </div>
                <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                  {notifications.length === 0 && (
                    <div className="px-3 py-4 text-center text-muted" style={{ fontSize: '0.85rem' }}>
                      Nothing yet. Activity on your contracts shows up here.
                    </div>
                  )}
                  {notifications.slice(0, 8).map((item) => (
                    <div key={item.id} className="px-3 py-2 border-bottom" style={{ fontSize: '0.83rem' }}>
                      <div style={{ color: 'var(--slate-dark)' }}>{item.text}</div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>{timeAgo(item.at)}</div>
                    </div>
                  ))}
                </div>
              </Dropdown.Menu>
            </Dropdown>

            <div className="d-none d-sm-flex align-items-center gap-2">
              <div className="text-end lh-sm">
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-dark)' }}>{user.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.role}</div>
              </div>
              <Avatar name={user.name} size={38} />
            </div>
          </div>
        </header>

        <div className="wm-page">{children}</div>
      </main>
    </div>
  );
};

export default Layout;

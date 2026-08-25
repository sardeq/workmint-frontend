import React from 'react';
import { useNavigate } from 'react-router-dom';

const Layout = ({ user, title, children }) => {
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="wm-dashboard-layout" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className="wm-card text-center">
          <h3>Access Denied</h3>
          <p className="text-muted">Please authenticate to access this workspace.</p>
          <button className="wm-btn wm-btn-primary mt-3" onClick={() => navigate('/')}>Return to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="wm-dashboard-layout">
      {/* Custom CSS Sidebar */}
      <aside className="wm-sidebar">
        <div className="wm-sidebar-logo">Workmint.</div>
        
        <div className="mb-4 pb-4 border-bottom border-secondary">
          <small className="text-uppercase" style={{ color: '#64748b', fontSize: '0.75rem' }}>Workspace</small>
          <div className="fw-bold mt-1 text-white">{user.role}</div>
        </div>

        <nav className="d-flex flex-column h-100">
          <div className="wm-nav-item active">Overview</div>
          <div className="wm-nav-item">Active Projects</div>
          <div className="wm-nav-item">Financials</div>
          <div className="wm-nav-item">Settings</div>
          
          <div className="wm-nav-item danger" onClick={() => navigate('/')}>Sign Out</div>
        </nav>
      </aside>
      
      {/* Main Content Area */}
      <main className="wm-main-content">
        <header className="d-flex justify-content-between align-items-center mb-5">
          <h2 className="fw-bold m-0" style={{ color: 'var(--slate-dark)' }}>{title}</h2>
          <div className="d-flex align-items-center gap-3">
            <span style={{ color: 'var(--text-muted)' }}>Welcome, {user.name}</span>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--mint-primary)' }}></div>
          </div>
        </header>
        
        {children}
      </main>
    </div>
  );
};

export default Layout;
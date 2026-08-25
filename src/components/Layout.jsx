import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../App';

// Add activeTab and setActiveTab to props
const Layout = ({ title, activeTab, setActiveTab, children }) => {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useContext(UserContext); //[cite: 2]

  const handleSignOut = () => { //[cite: 2]
    setCurrentUser(null);
    navigate('/');
  };

  if (!currentUser) { //[cite: 2]
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

  const getNavItems = () => { //[cite: 2]
    const base = ['Overview', 'Projects', 'Financials', 'Settings'];
    if (currentUser.role === 'client') {
      return ['Overview', 'My Projects', 'Find Freelancers', 'Post Job', 'Messages']; //[cite: 2]
    } else if (currentUser.role === 'freelancer') {
      return ['Overview', 'My Orders', 'Available Jobs', 'My Proposals', 'Portfolio', 'Messages']; //[cite: 2]
    } else if (currentUser.role === 'admin') {
      return ['Overview', 'Disputes', 'Freelancer Approvals', 'User Management', 'Analytics']; //[cite: 2]
    }
    return base;
  };

  const navItems = getNavItems(); //[cite: 2]

  return (
    <div className="wm-dashboard-layout">
      <aside className="wm-sidebar">
        <div className="wm-sidebar-logo">Workmint.</div>
        <div className="mb-4 pb-4 border-bottom border-secondary">
          <small className="text-uppercase" style={{ color: '#64748b', fontSize: '0.75rem' }}>Workspace</small>
          <div className="fw-bold mt-1 text-white">{currentUser.role}</div>
        </div>

        <nav className="d-flex flex-column h-100">
          {navItems.map((item, idx) => (
            <div 
              // Apply active class dynamically and attach click handler[cite: 2, 7]
              className={`wm-nav-item ${activeTab === item ? 'active' : ''}`} 
              key={idx}
              onClick={() => setActiveTab && setActiveTab(item)}
            >
              {item}
            </div>
          ))}
          <div className="wm-nav-item text-danger" onClick={handleSignOut}>Sign Out</div>
        </nav>
      </aside>

      <main className="wm-main-content">
        <header className="d-flex justify-content-between align-items-center mb-5">
          <h2 className="fw-bold m-0" style={{ color: 'var(--slate-dark)' }}>{title}</h2>
          <div className="d-flex align-items-center gap-3">
            <span style={{ color: 'var(--text-muted)' }}>Welcome, {currentUser.name}</span>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--mint-primary)' }}></div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
};

export default Layout;
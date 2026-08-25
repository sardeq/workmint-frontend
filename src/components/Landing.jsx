import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/landing.css';

const Landing = ({ onLogin }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const topServices = [
    { title: 'Application Dev', desc: 'Custom software solutions' },
    { title: 'UI/UX Design', desc: 'Modern interfaces' },
    { title: 'System Architecture', desc: 'Scalable backends' },
    { title: 'Technical Writing', desc: 'Clear documentation' }
  ];

  const categories = [
    'Web Development', 'Mobile Apps', 'AI/ML', 'DevOps', 'Design', 'Writing'
  ];

  const bottomFeatures = [
    { title: 'Escrow Payments', detail: 'Funds are held securely until you approve the final milestones.' },
    { title: 'Verified Talent', detail: 'Every freelancer is vetted for technical capability and professionalism.' },
    { title: 'Seamless Revisions', detail: 'Manage feedback and file handoffs directly within your workspace.' }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      alert(`Routing to search results for: ${searchQuery}`);
    }
  };

  const loginAs = (role) => {
    onLogin(role);
    navigate(`/${role}`);
  };

  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <div className="brand-logo">Workmint.</div>
        <div className="nav-actions">
          <button className="wm-btn wm-btn-outline" onClick={() => loginAs('client')}>Client Portal</button>
          <button className="wm-btn wm-btn-dark" onClick={() => loginAs('freelancer')}>Freelancer Login</button>
          <button className="wm-btn wm-btn-primary" onClick={() => loginAs('admin')}>Admin</button>
        </div>
      </nav>

      <section className="hero-container">
        <h1 className="hero-title">
          Freelancing, <span>Refined.</span>
        </h1>
        <p className="hero-subtitle">
          Connect with top-tier technical and creative talent to build your next big idea securely and efficiently.
        </p>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search for 'C++ Developer' or 'React Expert'..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="search-btn">Find Talent</button>
        </form>
      </section>

      {/* Categories */}
      <section className="services-grid" style={{ marginTop: '1rem', marginBottom: '2rem' }}>
        {categories.map((cat, idx) => (
          <div className="service-card" key={idx} style={{ borderTopColor: '#6c63ff', background: '#f1f5f9' }}>
            <h5>{cat}</h5>
            <p className="text-muted">Explore {cat} experts</p>
          </div>
        ))}
      </section>

      <section className="features-section">
        <div className="features-header">
          <h2>How Workmint Protects You</h2>
        </div>
        <div className="features-list">
          {bottomFeatures.map((feature, index) => (
            <div className="feature-item" key={index}>
              <div className="feature-icon-wrapper">{index + 1}</div>
              <h4 style={{ color: '#0f172a', marginBottom: '0.5rem' }}>{feature.title}</h4>
              <p style={{ color: '#64748b', lineHeight: '1.6' }}>{feature.detail}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Landing;
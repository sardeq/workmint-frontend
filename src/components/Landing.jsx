import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Landing = ({ onLogin }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const topServices = ['Application Dev', 'UI/UX Design', 'System Architecture', 'Technical Writing'];
  const bottomFeatures = ['Escrow Payments', 'Verified Engineering Talent', 'Zero-Friction Revisions'];

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
  };

  const loginAs = (role) => {
    onLogin(role);
    navigate(`/${role}`);
  };

  return (
    <div>
      {/* Modern Custom Navbar */}
      <nav className="d-flex justify-content-between align-items-center p-4 bg-white border-bottom">
        <div className="fw-bold fs-4" style={{ color: 'var(--mint-primary)' }}>Workmint.</div>
        <div className="d-flex gap-3">
          <button className="wm-btn wm-btn-outline" onClick={() => loginAs('client')}>Client Portal</button>
          <button className="wm-btn wm-btn-dark" onClick={() => loginAs('freelancer')}>Freelancer Login</button>
          <button className="wm-btn wm-btn-primary" onClick={() => loginAs('admin')}>Admin</button>
        </div>
      </nav>

      {/* Hero Section using Custom CSS */}
      <section className="wm-hero-section">
        <h1 className="fw-bold mb-4" style={{ fontSize: '3rem', color: 'var(--slate-dark)' }}>
          Freelancing, <span style={{ color: 'var(--mint-primary)' }}>Refined.</span>
        </h1>
        <p className="mb-5 text-muted fs-5">Connect with top-tier talent to build your next big idea.</p>
        
        <form onSubmit={handleSearch} className="d-flex justify-content-center mx-auto" style={{ maxWidth: '600px', gap: '10px' }}>
          <input 
            type="text" 
            placeholder="Search for 'C++ Developer' or 'React Expert'..." 
            className="form-control px-4 py-3 shadow-sm border-0 rounded-pill"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ fontSize: '1.1rem' }}
          />
          <button className="wm-btn wm-btn-primary rounded-pill px-4" type="submit">Search</button>
        </form>

        {/* Semantic Grid instead of Bootstrap Cols */}
        <div className="wm-grid-4 mx-auto" style={{ maxWidth: '1000px' }}>
          {topServices.map((service, index) => (
            <div className="wm-card text-center" key={index} style={{ borderTop: '4px solid var(--mint-primary)' }}>
              <h5 className="m-0 fw-semibold">{service}</h5>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5 mx-auto" style={{ maxWidth: '1000px' }}>
        <div className="d-flex justify-content-between gap-4 mt-5">
          {bottomFeatures.map((feature, index) => (
            <div className="d-flex align-items-start w-100" key={index}>
              <div className="rounded-circle d-flex align-items-center justify-content-center me-3" 
                   style={{ width: '48px', height: '48px', backgroundColor: 'var(--mint-light)', color: 'var(--mint-primary)' }}>
                <span className="fw-bold">{index + 1}</span>
              </div>
              <div>
                <h6 className="fw-bold mb-1">{feature}</h6>
                <p className="text-muted small">Optimized workflows designed to keep your project moving forward smoothly.</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Landing;
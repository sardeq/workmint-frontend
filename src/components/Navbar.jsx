import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ onLogin }) => {
  const navigate = useNavigate();

  const loginAs = (role) => {
    onLogin(role);
    navigate(`/${role}`);
  };

  return (
    <nav className="landing-nav">
      <div className="brand-logo">Workmint.</div>
      <div className="nav-actions">
        <button className="wm-btn wm-btn-outline" onClick={() => loginAs('client')}>Client Portal</button>
        <button className="wm-btn wm-btn-dark" onClick={() => loginAs('freelancer')}>Freelancer Login</button>
        <button className="wm-btn wm-btn-primary" onClick={() => loginAs('admin')}>Admin</button>
      </div>
    </nav>
  );
};

export default Navbar;
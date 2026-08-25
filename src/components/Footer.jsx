import React from 'react';

const Footer = () => {
  return (
    <footer className="wm-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <h3>Workmint.</h3>
          <p>Elevating the freelance experience for technical professionals and visionary clients worldwide.</p>
        </div>
        
        <div className="footer-links">
          <h4>Platform</h4>
          <ul>
            <li><a href="#how-it-works">How it Works</a></li>
            <li><a href="#escrow">Escrow Security</a></li>
            <li><a href="#talent">Browse Talent</a></li>
            <li><a href="#pricing">Pricing & Fees</a></li>
          </ul>
        </div>
        
        <div className="footer-links">
          <h4>Company</h4>
          <ul>
            <li><a href="#about">About Us</a></li>
            <li><a href="#mission">Our Mission</a></li>
            <li><a href="#support">Help & Support</a></li>
            <li><a href="#terms">Terms of Service</a></li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Workmint. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
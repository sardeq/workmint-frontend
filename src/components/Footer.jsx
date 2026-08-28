import React from 'react';

const COLUMNS = [
  {
    heading: 'Platform',
    links: [
      { href: '#how-it-works', label: 'How it works' },
      { href: '#pricing', label: 'Pricing and fees' },
      { href: '#escrow', label: 'Escrow security' },
      { href: '#talent', label: 'Browse talent' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { href: '#mission', label: 'Our mission' },
      { href: '#why', label: 'Why Workmint' },
      { href: '#support', label: 'Help and support' },
      { href: '#terms', label: 'Terms of service' },
    ],
  },
  {
    heading: 'Talent',
    links: [
      { href: '#talent', label: 'Developers' },
      { href: '#talent', label: 'Designers' },
      { href: '#talent', label: 'Data engineers' },
      { href: '#talent', label: 'Systems engineers' },
    ],
  },
];

const Footer = () => (
  <footer className="wm-footer">
    <div className="wm-container">
      <div className="footer-grid">
        <div className="footer-brand">
          <h3>Workmint.</h3>
          <p>
            Milestone escrow for technical freelance work. Funded up front, released on approval,
            recorded end to end.
          </p>
        </div>

        {COLUMNS.map((column) => (
          <div className="footer-links" key={column.heading}>
            <h4>{column.heading}</h4>
            <ul>
              {column.links.map((link) => (
                <li key={link.label}><a href={link.href}>{link.label}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Workmint. All rights reserved.</p>
        <p>Built in Amman, Jordan.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
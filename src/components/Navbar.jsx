import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon';

const LINKS = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#why', label: 'Why Workmint' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#talent', label: 'Browse talent' },
];

const Navbar = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const go = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  return (
    <nav className={`landing-nav ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="wm-container landing-nav__inner">
        <a href="#top" className="brand-logo" style={{ textDecoration: 'none' }}>Workmint.</a>

        <div className="nav-links">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href}>{link.label}</a>
          ))}
        </div>

        <div className="nav-actions">
          <button type="button" className="wm-btn wm-btn-outline" onClick={() => go('/login')}>Sign in</button>
          <button type="button" className="wm-btn wm-btn-primary" onClick={() => go('/register')}>Get started</button>
        </div>

        <button
          type="button"
          className="nav-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <Icon name={menuOpen ? 'close' : 'menu'} size={18} />
        </button>
      </div>

      <div className={`nav-drawer ${menuOpen ? 'open' : ''}`}>
        {LINKS.map((link) => (
          <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>{link.label}</a>
        ))}
        <div className="nav-drawer__actions">
          <button type="button" className="wm-btn wm-btn-primary" onClick={() => go('/register')}>Get started</button>
          <button type="button" className="wm-btn wm-btn-outline" onClick={() => go('/login')}>Sign in</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
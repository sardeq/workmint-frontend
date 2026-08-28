import React from 'react';
import Icon from './Icon';
import { initials } from '../data/freelancerData';

/* Small building blocks shared by every freelancer screen, so a status pill
   or an empty state looks identical wherever it shows up. */

export const Pill = ({ tone = 'muted', children, className = '' }) => (
  <span className={`wm-pill wm-pill--${tone} ${className}`}>{children}</span>
);

export const Avatar = ({ name, size = 38, tone = 'mint' }) => (
  <span
    className={`wm-avatar wm-avatar--${tone}`}
    style={{ width: size, height: size, fontSize: size * 0.38 }}
    title={name}
  >
    {initials(name)}
  </span>
);

export const SectionTitle = ({ eyebrow, title, sub, right }) => (
  <div className="wm-section-title">
    <div>
      {eyebrow && <div className="wm-eyebrow">{eyebrow}</div>}
      <h5>{title}</h5>
      {sub && <p>{sub}</p>}
    </div>
    {right && <div className="wm-section-title__right">{right}</div>}
  </div>
);

export const StatCard = ({ label, value, sub, tone = 'muted', icon }) => (
  <div className="wm-stat">
    <div className="wm-stat__head">
      <span className="wm-stat__label">{label}</span>
      {icon && <span className={`wm-stat__icon wm-stat__icon--${tone}`}><Icon name={icon} size={15} /></span>}
    </div>
    <div className="wm-num wm-stat__value">{value}</div>
    {sub && <div className={`wm-stat__sub wm-stat__sub--${tone}`}>{sub}</div>}
  </div>
);

export const EmptyState = ({ icon = 'inbox', title, body, action }) => (
  <div className="wm-empty">
    <span className="wm-empty__icon"><Icon name={icon} size={22} /></span>
    <h6>{title}</h6>
    {body && <p>{body}</p>}
    {action}
  </div>
);

/* A segmented bar: released money on the left, escrow on the right.
   Used on the overview, the orders list and the workspace header. */
export const EscrowBar = ({ released, total }) => {
  const pct = total === 0 ? 0 : Math.round((released / total) * 100);
  return (
    <div className="wm-escrow-bar" role="img" aria-label={`${pct}% released`}>
      <div className="wm-escrow-bar__fill" style={{ width: `${pct}%` }} />
    </div>
  );
};

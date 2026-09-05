import React from 'react';
import Icon from './Icon';
import { money } from '../data/freelancerData';

const RECEIPT = {
  id: 'ORD-892',
  project: 'C++ systems architecture',
  client: 'TechCorp',
  milestones: [
    { id: 1, title: 'Architecture & schema', note: 'Approved 12 Sep', amount: 800, state: 'approved' },
    { id: 2, title: 'Core service refactor', note: 'Approved 28 Sep', amount: 1200, state: 'approved' },
    { id: 3, title: 'Load testing & handover', note: 'In progress', amount: 1400, state: 'active' },
  ],
};

const STATE_ICON = { approved: 'check', active: 'clock', pending: 'lock' };

const Hero = ({ searchQuery, setSearchQuery, handleSearch }) => {
  const total = RECEIPT.milestones.reduce((sum, m) => sum + m.amount, 0);
  const released = RECEIPT.milestones
    .filter((m) => m.state === 'approved')
    .reduce((sum, m) => sum + m.amount, 0);
  const held = total - released;

  return (
    <header className="hero" id="top">
      <div className="wm-container hero__grid">
        <div>
          <span className="wm-eyebrow-line reveal reveal--1">
            <Icon name="lock" size={12} /> Milestone escrow
          </span>

          <h1 className="wm-display reveal reveal--1">
            Freelancing, <em>settled.</em>
          </h1>

          <p className="wm-lead hero__subtitle reveal reveal--2">
            Hire technical talent and pay in milestones. The money is funded up front, held
            by Workmint, and released the moment you approve the work. No chasing invoices,
            no scope creep, no awkward conversations.
          </p>

          <form onSubmit={handleSearch} className="search-form reveal reveal--2">
            <input
              type="text"
              className="search-input"
              placeholder="Try 'C++ systems engineer' or 'React'"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search for talent"
            />
            <button type="submit" className="search-btn">Find talent</button>
          </form>

          <dl className="hero__trust reveal reveal--3">
            <div>
              <dt className="wm-figure">$2.4M</dt>
              <dd>held in escrow</dd>
            </div>
            <div>
              <dt className="wm-figure">1,900</dt>
              <dd>vetted freelancers</dd>
            </div>
            <div>
              <dt className="wm-figure">2 days</dt>
              <dd>average approval time</dd>
            </div>
          </dl>
        </div>

        <aside className="receipt reveal reveal--3" aria-label="Example order">
          <div className="receipt__head">
            <div>
              <span className="receipt__id">{RECEIPT.id}</span>
              <div className="receipt__project">{RECEIPT.project}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>for {RECEIPT.client}</div>
            </div>
            <span className="track__state track__state--mint">On track</span>
          </div>

          <div className="receipt__body">
            {RECEIPT.milestones.map((m) => (
              <div className="receipt__row" key={m.id}>
                <span className={`receipt__dot receipt__dot--${m.state}`}>
                  <Icon name={STATE_ICON[m.state]} size={11} strokeWidth={2.5} />
                </span>
                <span className="receipt__label">
                  {m.title}
                  <small>{m.note}</small>
                </span>
                <span className="wm-figure receipt__amount">{money(m.amount)}</span>
              </div>
            ))}
          </div>

          <div className="receipt__foot">
            <div className="receipt__split">
              <span>
                Released to freelancer
                <strong className="wm-figure">{money(released)}</strong>
              </span>
              <span style={{ textAlign: 'right' }}>
                Still in escrow
                <strong className="wm-figure" style={{ color: 'var(--amber)' }}>{money(held)}</strong>
              </span>
            </div>
            <div className="receipt__bar">
              <span style={{ width: `${Math.round((released / total) * 100)}%` }} />
            </div>
          </div>
        </aside>
      </div>
    </header>
  );
};

export default Hero;
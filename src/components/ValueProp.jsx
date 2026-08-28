import React from 'react';
import Icon from './Icon';

const SIDES = [
  {
    tone: 'mint',
    icon: 'briefcase',
    title: 'For freelancers',
    body: 'Stop chasing invoices. The budget is already funded before you write a line of code, and every approved milestone pays out the same day.',
    points: [
      'See the full contract value sitting in escrow before you start',
      'Deliver, get reviewed and get paid one milestone at a time',
      'Revision allowances make scope creep a billable conversation',
      'One workspace for files, messages, deadlines and payouts',
    ],
  },
  {
    tone: 'slate',
    icon: 'user',
    title: 'For clients',
    body: 'Hire from a pool of vetted technical talent and keep control of the budget. Nothing is released until you have seen the work and said yes.',
    points: [
      'Compare proposals with real milestone plans, not just a price',
      'Approve or send back each delivery with notes attached',
      'Scope changes come to you as a request, never as a surprise bill',
      'Full audit trail of every approval, message and release',
    ],
  },
];

const ValueProp = () => (
  <section className="wm-section" id="why">
    <div className="wm-container">
      <div className="wm-section-head wm-section-head--center">
        <h2 className="wm-h2">One process, both sides protected</h2>
        <p className="wm-lead">
          The same escrow rules apply to everyone, which is what makes them worth trusting.
        </p>
      </div>

      <div className="wm-grid wm-grid--2">
        {SIDES.map((side) => (
          <article className="wm-tile wm-tile--hover value-card" key={side.title}>
            <span className={`value-card__icon value-card__icon--${side.tone}`}>
              <Icon name={side.icon} size={19} />
            </span>
            <h3>{side.title}</h3>
            <p>{side.body}</p>
            <ul className="value-list">
              {side.points.map((point) => (
                <li key={point}>
                  <Icon name="check" size={15} strokeWidth={2.5} />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export default ValueProp;
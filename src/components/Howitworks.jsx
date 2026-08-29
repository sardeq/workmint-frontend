import React from 'react';
import Icon from './Icon';


const STEPS = [
  {
    icon: 'file',
    tone: 'mint',
    title: 'Agree the milestones',
    body: 'The freelancer proposes a bid, a timeline and a split. You accept the ones you want to pay for separately.',
    state: 'Nothing charged yet',
    stateTone: 'muted',
  },
  {
    icon: 'lock',
    tone: 'amber',
    title: 'Fund the escrow',
    body: 'You pay the full amount once. Workmint holds it. The freelancer can see it is there, which is why good ones start immediately.',
    state: 'Held by Workmint',
    stateTone: 'amber',
  },
  {
    icon: 'upload',
    tone: 'amber',
    title: 'Review each delivery',
    body: 'Work arrives one milestone at a time. Approve it, or send it back with notes. Revisions are counted, so scope creep has a price tag.',
    state: 'Still held',
    stateTone: 'amber',
  },
  {
    icon: 'check',
    tone: 'mint',
    title: 'Release the money',
    body: 'Approval releases that milestone instantly, minus the platform fee. Anything left in escrow stays yours until you approve it.',
    state: 'Paid out',
    stateTone: 'mint',
  },
];

const HowItWorks = () => (
  <section className="wm-section wm-section--surface" id="how-it-works">
    <div className="wm-container">
      <div className="wm-section-head">
        <h2 className="wm-h2">Where your money is, at every step</h2>
        <p className="wm-lead">
          Most freelance disputes are really payment disputes. Workmint splits a project into
          funded milestones so both sides always know what has been paid for and what has not.
        </p>
      </div>

      <div className="track">
        {STEPS.map((step, index) => (
          <div className="track__step" key={step.title}>
            <span className={`track__node track__node--${step.tone}`}>
              <Icon name={step.icon} size={19} />
            </span>
            <span className="track__index">STEP {index + 1}</span>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
            <span className={`track__state track__state--${step.stateTone}`}>{step.state}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
import Icon from './Icon';
import { money } from '../data/helpers';


const RECEIPT = {
  id: 'CON-892',
  project: 'C++ systems architecture',
  client: 'TechCorp',
  amount: 3400,
  steps: [
    { id: 1, title: 'Client funds the escrow', note: 'Paid 12 Sep', state: 'approved' },
    { id: 2, title: 'Freelancer delivers the work', note: 'Delivered 28 Sep', state: 'approved' },
    { id: 3, title: 'Client approves and money is released', note: 'Waiting on review', state: 'active' },
  ],
};

const STATE_ICON = { approved: 'check', active: 'clock', pending: 'lock' };

const Hero = ({ searchQuery, setSearchQuery, handleSearch }) => {
  const done = RECEIPT.steps.filter((step) => step.state === 'approved').length;
  const progress = Math.round((done / RECEIPT.steps.length) * 100);

  return (
    <header className="hero" id="top">
      <div className="wm-container hero__grid">
        <div>
          <span className="wm-eyebrow-line reveal reveal--1">
            <Icon name="lock" size={12} /> Escrow protected
          </span>

          <h1 className="wm-display reveal reveal--1">
            Freelancing, <em>settled.</em>
          </h1>

          <p className="wm-lead hero__subtitle reveal reveal--2">
            Hire technical talent without paying up front and hoping. The money is funded
            into escrow, held by Workmint, and released the moment you approve the work.
            No chasing invoices, no awkward conversations.
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
            {RECEIPT.steps.map((step) => (
              <div className="receipt__row" key={step.id}>
                <span className={`receipt__dot receipt__dot--${step.state}`}>
                  <Icon name={STATE_ICON[step.state]} size={11} strokeWidth={2.5} />
                </span>
                <span className="receipt__label">
                  {step.title}
                  <small>{step.note}</small>
                </span>
              </div>
            ))}
          </div>

          <div className="receipt__foot">
            <div className="receipt__split">
              <span>
                Contract value
                <strong className="wm-figure">{money(RECEIPT.amount)}</strong>
              </span>
              <span style={{ textAlign: 'right' }}>
                Still in escrow
                <strong className="wm-figure" style={{ color: 'var(--amber)' }}>{money(RECEIPT.amount)}</strong>
              </span>
            </div>
            <div className="receipt__bar">
              <span style={{ width: `${progress}%` }} />
            </div>
          </div>
        </aside>
      </div>
    </header>
  );
};

export default Hero;

const Mission = ({ onJoin }) => (
  <section className="closing" id="mission">
    <div className="wm-container closing__grid">
      <div>
        <h2>
          Building software should not come with a <em>collections problem.</em>
        </h2>
        <p>
          Workmint exists because the hard part of freelancing is rarely the work. It is the
          unpaid invoice, the sixth free revision, the brief that grew by half. We put the
          money in escrow, put every approval on the record, and give both sides one place to
          watch the project move. What is left is the part you actually signed up for.
        </p>
      </div>

      <div className="closing__actions">
        <button type="button" className="wm-btn wm-btn-primary wm-btn--lg" onClick={() => onJoin('freelancer')}>
          Start earning as a freelancer
        </button>
        <button type="button" className="wm-btn wm-btn-dark wm-btn--lg" style={{ border: '1px solid #334155' }} onClick={() => onJoin('client')}>
          Hire technical talent
        </button>
        <p className="closing__note">Free to join. Nothing is charged until you fund a contract.</p>
      </div>
    </div>
  </section>
);

export default Mission;
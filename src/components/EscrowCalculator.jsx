import { useState, useEffect } from 'react';
import { getRates, CURRENCIES } from '../api/exchange';
import { FEE_RATE, CLIENT_FEE_RATE } from '../data/helpers';


const PRESETS = [500, 1500, 3000, 7500];

const usd = (n) =>
  `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const EscrowCalculator = () => {
  const [budget, setBudget] = useState(1500);
  const [currency, setCurrency] = useState('JOD');
  const [rates, setRates] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getRates()
      .then((data) => setRates(data))
      .catch(() => setError('Live exchange rates are unavailable right now.'));
  }, []);

  const amount = Math.max(0, Number(budget) || 0);
  const clientFee = amount * CLIENT_FEE_RATE;
  const clientPays = amount + clientFee;
  const platformFee = amount * FEE_RATE;
  const freelancerGets = amount - platformFee;

  const rate = rates ? rates[currency] : null;
  const converted = rate ? clientPays * rate : null;

  return (
    <section className="wm-section wm-section--surface" id="pricing">
      <div className="wm-container">
        <div className="wm-section-head wm-section-head--center" id="escrow">
          <h2 className="wm-h2">Know the number before you commit</h2>
          <p className="wm-lead">
            One fee on each side, shown up front. Nothing is deducted twice and nothing
            appears later.
          </p>
        </div>

        <div className="wm-tile escrow-widget">
          <div className="escrow-widget__inputs">
            <div className="field">
              <label htmlFor="budget">Project budget (USD)</label>
              <input
                id="budget"
                type="number"
                min="0"
                step="50"
                className="wm-input"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Common project sizes</label>
              <div className="presets">
                {PRESETS.map((preset) => (
                  <button
                    type="button"
                    key={preset}
                    className={amount === preset ? 'active' : ''}
                    onClick={() => setBudget(preset)}
                  >
                    ${preset.toLocaleString('en-US')}
                  </button>
                ))}
              </div>
            </div>

            <div className="field" style={{ marginBottom: 0 }}>
              <label htmlFor="currency">Show the total in</label>
              <select
                id="currency"
                className="wm-input"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                {CURRENCIES.map((code) => (
                  <option value={code} key={code}>{code}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="escrow-widget__result">
            <div className="result-side result-side--client">
              <small>Client funds</small>
              <strong className="wm-figure">{usd(clientPays)}</strong>
            </div>
            <div className="result-side result-side--freelancer">
              <small>Freelancer receives</small>
              <strong className="wm-figure">{usd(freelancerGets)}</strong>
            </div>

            <div className="result-row">
              <span>Agreed budget</span>
              <span className="wm-figure">{usd(amount)}</span>
            </div>
            <div className="result-row">
              <span>Client escrow fee ({CLIENT_FEE_RATE * 100}%)</span>
              <span className="wm-figure">+{usd(clientFee)}</span>
            </div>
            <div className="result-row">
              <span>Workmint fee ({FEE_RATE * 100}%)</span>
              <span className="wm-figure">-{usd(platformFee)}</span>
            </div>

            <div className="result-row result-row--total">
              <span>Client total in {currency}</span>
              <span className="wm-figure result-converted">
                {converted === null
                  ? '-'
                  : converted.toLocaleString('en-US', { maximumFractionDigits: 2 })}
              </span>
            </div>

            <p className="result-note">
              {error && error}
              {!error && !rates && 'Fetching todays exchange rates...'}
              {!error && rates && `Live rate: 1 USD = ${rate} ${currency}.`}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EscrowCalculator;

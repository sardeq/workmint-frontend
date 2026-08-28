import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FEE_RATE } from '../data/freelancerData';

/* Fee model, kept in one place so the landing page and the workspace agree:
   - the client adds a small escrow fee on top of the budget
   - the freelancer's payout has FEE_RATE deducted (same constant the
     freelancer dashboard uses for netOf())                                  */
const CLIENT_FEE_RATE = 0.03;

const CURRENCIES = [
  { code: 'JOD', label: 'Jordanian dinar', fallback: 0.709 },
  { code: 'EUR', label: 'Euro', fallback: 0.92 },
  { code: 'GBP', label: 'British pound', fallback: 0.79 },
  { code: 'AED', label: 'UAE dirham', fallback: 3.67 },
  { code: 'SAR', label: 'Saudi riyal', fallback: 3.75 },
  { code: 'CAD', label: 'Canadian dollar', fallback: 1.36 },
];

const PRESETS = [500, 1500, 3000, 7500];

const usd = (n) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const EscrowCalculator = () => {
  const [budget, setBudget] = useState(1500);
  const [currency, setCurrency] = useState('JOD');
  const [rates, setRates] = useState({});
  const [status, setStatus] = useState('loading'); // loading | live | offline

  useEffect(() => {
    let cancelled = false;

    axios
      .get('https://api.exchangerate-api.com/v4/latest/USD')
      .then((response) => {
        if (cancelled) return;
        setRates(response.data.rates);
        setStatus('live');
      })
      .catch(() => {
        // The page still has to work offline, so fall back to stored rates.
        if (cancelled) return;
        const fallback = {};
        CURRENCIES.forEach((c) => { fallback[c.code] = c.fallback; });
        setRates(fallback);
        setStatus('offline');
      });

    return () => { cancelled = true; };
  }, []);

  const amount = Math.max(0, Number(budget) || 0);
  const clientFee = amount * CLIENT_FEE_RATE;
  const clientPays = amount + clientFee;
  const platformFee = amount * FEE_RATE;
  const freelancerGets = amount - platformFee;

  const rate = rates[currency];
  const converted = rate ? clientPays * rate : null;
  const selected = CURRENCIES.find((c) => c.code === currency);

  return (
    <section className="wm-section wm-section--surface" id="pricing">
      <div className="wm-container">
        <div className="wm-section-head wm-section-head--center" id="escrow">
          <h2 className="wm-h2">Know the number before you commit</h2>
          <p className="wm-lead">
            One fee on each side, shown up front. Nothing is deducted twice and nothing appears later.
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
                {CURRENCIES.map((c) => (
                  <option value={c.code} key={c.code}>{c.code} - {c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="escrow-widget__result">
            {status === 'loading' ? (
              <p className="wm-lead" style={{ fontSize: '0.9rem' }}>Fetching today's exchange rates...</p>
            ) : (
              <>
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
                      ? 'Rate unavailable'
                      : converted.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                  </span>
                </div>

                <p className="result-note">
                  {status === 'live'
                    ? `Live rate: 1 USD = ${rate} ${currency}. Released per milestone, not all at once.`
                    : `Rates could not be loaded, so this uses a stored rate for the ${selected ? selected.label : currency}.`}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EscrowCalculator;
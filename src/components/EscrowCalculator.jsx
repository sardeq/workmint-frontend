import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EscrowCalculator = () => {
  const [rates, setRates] = useState({});
  const [budgetUSD, setBudgetUSD] = useState(1000);
  const [targetCurrency, setTargetCurrency] = useState('JOD');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('https://api.exchangerate-api.com/v4/latest/USD')
      .then(response => {
        setRates(response.data.rates);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching exchange rates:", error);
        setLoading(false);
      });
  }, []);

  const platformFee = budgetUSD * 0.05; 
  const totalUSD = Number(budgetUSD) + platformFee;
  const convertedTotal = rates[targetCurrency] ? (totalUSD * rates[targetCurrency]).toFixed(2) : 0;

  return (
    <div className="wm-card escrow-widget">
      <div className="escrow-inputs">
        <div className="input-group">
          <label>Project Budget (USD)</label>
          <input 
            type="number" 
            value={budgetUSD} 
            onChange={(e) => setBudgetUSD(e.target.value)} 
            className="wm-input"
          />
        </div>
        <div className="input-group">
          <label>Convert To</label>
          <select 
            value={targetCurrency} 
            onChange={(e) => setTargetCurrency(e.target.value)}
            className="wm-input"
          >
            <option value="JOD">JOD - Jordanian Dinar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="CAD">CAD - Canadian Dollar</option>
          </select>
        </div>
      </div>
      
      <div className="escrow-results">
        {loading ? (
          <p>Loading live rates...</p>
        ) : (
          <>
            <div className="result-row">
              <span>Freelancer Payout:</span>
              <span>${budgetUSD}</span>
            </div>
            <div className="result-row">
              <span>Workmint Escrow Fee (5%):</span>
              <span>${platformFee.toFixed(2)}</span>
            </div>
            <hr />
            <div className="result-row total">
              <span>Total Estimated Cost:</span>
              <span className="highlight-price">
                {convertedTotal} {targetCurrency}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EscrowCalculator;
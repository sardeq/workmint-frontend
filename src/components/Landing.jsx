import React, { useState } from 'react';
import Navbar from './Navbar';
import Hero from './Hero';
import Mission from './Mission';           // NEW
import ValueProp from './ValueProp';       // NEW
import EscrowCalculator from './EscrowCalculator';
import FreelancerGrid from './FreelancerGrid';
import Footer from './Footer';             // NEW
import '../style/landing.css';

const Landing = ({ onLogin }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      alert(`Routing to search results for: ${searchQuery}`);
    }
  };

  return (
    <div className="landing-page">
      <Navbar onLogin={onLogin} />
      
      <Hero 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        handleSearch={handleSearch} 
      />

      <Mission />
      <ValueProp />

      <section className="calculator-section">
        <div className="features-header text-center">
          <h2>Transparent Escrow Payments</h2>
          <p className="text-muted">Estimate your project costs in your local currency with real-time rates.</p>
        </div>
        <EscrowCalculator />
      </section>

      <FreelancerGrid />

      <Footer />
    </div>
  );
};

export default Landing;
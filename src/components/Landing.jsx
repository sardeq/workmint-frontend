import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Navbar from './Navbar';
import Hero from './Hero';
import HowItWorks from './Howitworks';
import ValueProp from './ValueProp';
import EscrowCalculator from './EscrowCalculator';
import FreelancerGrid from './FreelancerGrid';
import Mission from './Mission';
import Footer from './Footer';
import '../style/landing.css';

const Landing = ({ onLogin }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');

  const navigate = useNavigate();

  const enterAs = (role) => {
    onLogin(role);
    navigate(`/${role}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSubmittedQuery(searchQuery);
    const target = document.getElementById('talent');
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="landing-page">
      <Navbar onLogin={onLogin} />

      <Hero
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
      />

      <HowItWorks />
      <ValueProp />
      <EscrowCalculator />
      <FreelancerGrid query={submittedQuery} onEnter={enterAs} />
      <Mission onEnter={enterAs} />
      <Footer />
    </div>
  );
};

export default Landing;
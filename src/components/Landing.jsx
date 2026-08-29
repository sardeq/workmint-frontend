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

const Landing = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');

  const navigate = useNavigate();

  /* Both closing CTAs land on registration with the right side pre-selected. */
  const joinAs = (role) => navigate(`/register?role=${role}`);

  /* Search filters the talent section and scrolls to it. The old version
     popped an alert(), which is not an answer to anything. */
  const handleSearch = (e) => {
    e.preventDefault();
    setSubmittedQuery(searchQuery);
    const target = document.getElementById('talent');
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="landing-page">
      <Navbar />

      <Hero
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
      />

      <HowItWorks />
      <ValueProp />
      <EscrowCalculator />
      <FreelancerGrid query={submittedQuery} onJoin={joinAs} />
      <Mission onJoin={joinAs} />
      <Footer />
    </div>
  );
};

export default Landing;
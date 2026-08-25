import React from 'react';

const Hero = ({ searchQuery, setSearchQuery, handleSearch }) => {
  return (
    <section className="hero-container">
      <h1 className="hero-title">
        Freelancing, <span>Refined.</span>
      </h1>
      <p className="hero-subtitle">
        Connect with top-tier technical and creative talent to build your next big idea securely and efficiently.
      </p>
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Search for 'C++ Systems Engineer' or 'React Expert'..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit" className="search-btn">Find Talent</button>
      </form>
    </section>
  );
};

export default Hero;
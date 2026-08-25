import React from 'react';

const FreelancerGrid = () => {
  const freelancers = [
    { id: 1, name: 'Sarah K.', role: 'React & .NET Architect', rating: '4.9', rate: '$45/hr', skills: ['React', '.NET', 'SQL'] },
    { id: 2, name: 'Tariq M.', role: 'Systems Engineer', rating: '5.0', rate: '$55/hr', skills: ['C++', 'Linux', 'Python'] },
    { id: 3, name: 'Omar D.', role: 'Frontend Specialist', rating: '4.8', rate: '$35/hr', skills: ['Vue', 'JavaScript', 'CSS'] }
  ];

  return (
    <section className="featured-freelancers">
      <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>Top Rated Technical Talent</h2>
      <div className="freelancer-grid">
        {freelancers.map(freelancer => (
          <div className="freelancer-card wm-card" key={freelancer.id}>
            <div className="avatar-placeholder">{freelancer.name.charAt(0)}</div>
            <h5>{freelancer.name}</h5>
            <p className="role-text">{freelancer.role}</p>
            <div className="freelancer-stats">
              <span className="rating">⭐ {freelancer.rating}</span>
              <span className="rate">{freelancer.rate}</span>
            </div>
            <div className="skills-container">
              {freelancer.skills.map((skill, index) => (
                <span key={index} className="skill-badge">{skill}</span>
              ))}
            </div>
            <button className="wm-btn wm-btn-primary w-100 mt-3">View Profile</button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FreelancerGrid;
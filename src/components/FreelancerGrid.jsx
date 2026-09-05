import React from 'react';
import Icon from './Icon';
import { Avatar } from './Shared';
import { money } from '../data/freelancerData';

const FREELANCERS = [
  { id: 1, name: 'Sarah Khoury', role: 'React & .NET architect', rating: 4.9, jobs: 41, rate: 45, skills: ['React', '.NET', 'SQL Server'] },
  { id: 2, name: 'Tariq Mansour', role: 'Systems engineer', rating: 5.0, jobs: 28, rate: 55, skills: ['C++', 'Linux', 'Python'] },
  { id: 3, name: 'Omar Darwish', role: 'Frontend specialist', rating: 4.8, jobs: 63, rate: 35, skills: ['Vue', 'TypeScript', 'CSS'] },
  { id: 4, name: 'Lina Haddad', role: 'Data & backend engineer', rating: 4.9, jobs: 34, rate: 50, skills: ['PostgreSQL', 'Express.js', 'AWS'] },
];

const FreelancerGrid = ({ query = '', onJoin }) => {
  const term = query.trim().toLowerCase();

  const visible = term
    ? FREELANCERS.filter((f) =>
        f.name.toLowerCase().includes(term) ||
        f.role.toLowerCase().includes(term) ||
        f.skills.join(' ').toLowerCase().includes(term)
      )
    : FREELANCERS;

  return (
    <section className="wm-section" id="talent">
      <div className="wm-container">
        <div className="wm-section-head">
          <h2 className="wm-h2">Top rated technical talent</h2>
          <p className="wm-lead">
            {term
              ? `${visible.length} ${visible.length === 1 ? 'match' : 'matches'} for "${query.trim()}".`
              : 'Every freelancer here has completed at least ten milestone-based orders.'}
          </p>
        </div>

        <div className="wm-grid wm-grid--4">
          {visible.length === 0 ? (
            <div className="talent-empty">
              <p style={{ marginBottom: '0.5rem', color: 'var(--slate-dark)', fontWeight: 600 }}>
                Nobody matches "{query.trim()}" yet
              </p>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>
                Post the job instead and let freelancers come to you.
              </p>
            </div>
          ) : (
            visible.map((person) => (
              <article className="wm-tile wm-tile--hover talent-card" key={person.id}>
                <div className="talent-card__head">
                  <Avatar name={person.name} size={46} />
                  <div style={{ minWidth: 0 }}>
                    <h3 className="talent-card__name">{person.name}</h3>
                    <p className="talent-card__role">{person.role}</p>
                  </div>
                </div>

                <div className="talent-card__stats">
                  <span><Icon name="star" size={13} /> <strong>{person.rating}</strong></span>
                  <span><strong>{person.jobs}</strong> orders</span>
                  <span><strong>{money(person.rate)}</strong>/hr</span>
                </div>

                <div className="skills-container">
                  {person.skills.map((skill) => (
                    <span className="skill-badge" key={skill}>{skill}</span>
                  ))}
                </div>

                <div className="wm-tile__foot">
                  <button
                    type="button"
                    className="wm-btn wm-btn-outline"
                    style={{ width: '100%' }}
                    onClick={() => onJoin('client')}
                  >
                    View profile
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default FreelancerGrid;
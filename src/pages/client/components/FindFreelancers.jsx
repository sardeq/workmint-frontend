import React, { useState } from 'react';
import { Row, Col, Form, InputGroup, Button, Modal } from 'react-bootstrap';
import Icon from '../../../components/Icon';
import { Pill, EmptyState, Avatar } from '../../../components/Shared';
import { money } from '../../../data/freelancerData';

const FindFreelancers = ({ talent, jobs, onInvite, onGo }) => {
  const [search, setSearch] = useState('');
  const [skill, setSkill] = useState('All');
  const [sort, setSort] = useState('rating');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [inviting, setInviting] = useState(null);
  const [jobId, setJobId] = useState('');

  const skills = ['All', ...Array.from(new Set(talent.flatMap((t) => t.skills)))];

  const visible = talent
    .filter((person) => {
      const q = search.toLowerCase();
      const matchesText =
        person.name.toLowerCase().includes(q) ||
        person.title.toLowerCase().includes(q) ||
        person.skills.join(' ').toLowerCase().includes(q);
      const matchesSkill = skill === 'All' || person.skills.includes(skill);
      const matchesAvailability = !availableOnly || person.available;
      return matchesText && matchesSkill && matchesAvailability;
    })
    .sort((a, b) => {
      if (sort === 'rate-low') return a.rate - b.rate;
      if (sort === 'rate-high') return b.rate - a.rate;
      if (sort === 'experience') return b.jobs - a.jobs;
      return b.rating - a.rating;
    });

  const openInvite = (person) => {
    setInviting(person);
    setJobId(jobs.length ? jobs[0].id : '');
    setViewing(null);
  };

  const sendInvite = () => {
    const job = jobs.find((j) => j.id === jobId);
    if (job) onInvite(inviting, job);
    setInviting(null);
  };

  return (
    <>
      <div className="wm-panel mb-3">
        <Row className="g-2 align-items-center">
          <Col md={5}>
            <InputGroup>
              <InputGroup.Text style={{ background: 'transparent', borderRight: 0 }}>
                <Icon name="search" size={14} />
              </InputGroup.Text>
              <Form.Control
                placeholder="Search name, role or skill"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ borderLeft: 0 }}
              />
            </InputGroup>
          </Col>
          <Col md={4}>
            <Form.Select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="rating">Highest rated</option>
              <option value="experience">Most orders completed</option>
              <option value="rate-low">Lowest rate</option>
              <option value="rate-high">Highest rate</option>
            </Form.Select>
          </Col>
          <Col md={3} className="d-flex justify-content-md-end">
            <Button
              size="sm"
              variant={availableOnly ? 'primary' : 'outline-secondary'}
              onClick={() => setAvailableOnly(!availableOnly)}
            >
              Available now
            </Button>
          </Col>
        </Row>

        <div className="wm-chips mt-3">
          {skills.map((s) => (
            <button key={s} type="button" className={`wm-chip ${skill === s ? 'active' : ''}`} onClick={() => setSkill(s)}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="wm-panel">
          <EmptyState
            icon="search"
            title="Nobody matches those filters"
            body="Try a broader skill, or post the job and let freelancers come to you."
            action={<Button size="sm" variant="primary" onClick={() => onGo('Post a Job')}>Post a job</Button>}
          />
        </div>
      ) : (
        <Row className="g-3">
          {visible.map((person) => (
            <Col md={6} xl={4} key={person.id}>
              <div className="wm-panel h-100 d-flex flex-column">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <Avatar name={person.name} size={46} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: 'var(--slate-dark)' }}>{person.name}</div>
                    <div className="text-muted" style={{ fontSize: '0.82rem' }}>{person.title}</div>
                  </div>
                </div>

                <div className="d-flex flex-wrap gap-2 mb-3">
                  <Pill tone={person.available ? 'success' : 'muted'}>
                    {person.available ? 'Available' : 'Booked'}
                  </Pill>
                  <Pill tone="muted"><Icon name="star" size={11} /> {person.rating}</Pill>
                  <Pill tone="muted">{person.jobs} orders</Pill>
                </div>

                <p className="text-muted" style={{ fontSize: '0.86rem', lineHeight: 1.6 }}>{person.bio}</p>

                <div className="wm-chips mb-3">
                  {person.skills.slice(0, 4).map((s) => <span className="wm-tag" key={s}>{s}</span>)}
                </div>

                <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center gap-2">
                  <span className="wm-num">
                    {money(person.rate)}<span style={{ fontWeight: 500, color: 'var(--text-muted)', fontSize: '0.85rem' }}>/hr</span>
                  </span>
                  <div className="d-flex gap-2">
                    <Button size="sm" variant="outline-secondary" onClick={() => setViewing(person)}>Profile</Button>
                    <Button size="sm" variant="primary" disabled={jobs.length === 0} onClick={() => openInvite(person)}>
                      Invite
                    </Button>
                  </div>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      )}

      {jobs.length === 0 && visible.length > 0 && (
        <p className="text-muted mt-3 mb-0" style={{ fontSize: '0.85rem' }}>
          Post a job first and you can invite any of these freelancers to bid on it.
        </p>
      )}

      {/* ---------- profile ---------- */}
      <Modal show={Boolean(viewing)} onHide={() => setViewing(null)} centered>
        {viewing && (
          <>
            <Modal.Header closeButton>
              <div className="d-flex align-items-center gap-3">
                <Avatar name={viewing.name} size={44} />
                <div>
                  <Modal.Title style={{ fontSize: '1.02rem' }}>{viewing.name}</Modal.Title>
                  <div className="text-muted" style={{ fontSize: '0.82rem' }}>{viewing.title}</div>
                </div>
              </div>
            </Modal.Header>
            <Modal.Body>
              <Row className="g-2 mb-3">
                <Col xs={3}>
                  <div className="wm-eyebrow">Rate</div>
                  <div className="wm-num">{money(viewing.rate)}</div>
                </Col>
                <Col xs={3}>
                  <div className="wm-eyebrow">Rating</div>
                  <div className="wm-num">{viewing.rating}</div>
                </Col>
                <Col xs={3}>
                  <div className="wm-eyebrow">Orders</div>
                  <div className="wm-num">{viewing.jobs}</div>
                </Col>
                <Col xs={3}>
                  <div className="wm-eyebrow">Replies</div>
                  <div className="wm-num">~{viewing.responseHours}h</div>
                </Col>
              </Row>

              <p style={{ fontSize: '0.9rem', lineHeight: 1.65 }}>{viewing.bio}</p>

              <div className="wm-eyebrow mt-3 mb-2">Skills</div>
              <div className="wm-chips">
                {viewing.skills.map((s) => <span className="wm-tag" key={s}>{s}</span>)}
              </div>

              <div className="text-muted mt-3" style={{ fontSize: '0.83rem' }}>
                {viewing.location} &middot; {viewing.available ? 'taking new work' : 'not taking work right now'}
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="outline-secondary" onClick={() => setViewing(null)}>Close</Button>
              <Button variant="primary" disabled={jobs.length === 0} onClick={() => openInvite(viewing)}>
                Invite to a job
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>

      {/* ---------- invite ---------- */}
      <Modal show={Boolean(inviting)} onHide={() => setInviting(null)} centered>
        {inviting && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>Invite {inviting.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p className="text-muted" style={{ fontSize: '0.87rem' }}>
                They get a notification and can send you a proposal. Inviting does not commit you to anything.
              </p>
              <Form.Group>
                <Form.Label>Which job?</Form.Label>
                <Form.Select value={jobId} onChange={(e) => setJobId(e.target.value)}>
                  {jobs.map((job) => (
                    <option value={job.id} key={job.id}>{job.title} - {money(job.budget)}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="outline-secondary" onClick={() => setInviting(null)}>Cancel</Button>
              <Button variant="primary" onClick={sendInvite}>Send invitation</Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </>
  );
};

export default FindFreelancers;
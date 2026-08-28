import React, { useState } from 'react';
import { Row, Col, Form, InputGroup, Button, Modal } from 'react-bootstrap';
import Icon from '../../../components/Icon';
import { Pill, EmptyState, Avatar } from '../../../components/Shared';
import ProposalModal from './ProposalModal';
import { money, timeAgo, hoursAgo } from '../../../data/freelancerData';

const LEVEL_TONE = { Entry: 'muted', Intermediate: 'info', Expert: 'success' };

const AvailableJobs = ({ jobs, proposals, savedJobIds, onToggleSave, onApply }) => {
  const [search, setSearch] = useState('');
  const [skill, setSkill] = useState('All');
  const [sort, setSort] = useState('newest');
  const [savedOnly, setSavedOnly] = useState(false);
  const [detail, setDetail] = useState(null);
  const [applyingTo, setApplyingTo] = useState(null);

  // Skills are derived from the listings, so the filter never goes out of date.
  const skills = ['All', ...Array.from(new Set(jobs.flatMap((j) => j.skills)))];

  const appliedIds = proposals.filter((p) => p.status !== 'Withdrawn').map((p) => p.jobId);

  const visible = jobs
    .filter((job) => {
      const q = search.toLowerCase();
      const matchesText =
        job.title.toLowerCase().includes(q) ||
        job.description.toLowerCase().includes(q) ||
        job.skills.join(' ').toLowerCase().includes(q);
      const matchesSkill = skill === 'All' || job.skills.includes(skill);
      const matchesSaved = !savedOnly || savedJobIds.includes(job.id);
      return matchesText && matchesSkill && matchesSaved;
    })
    .sort((a, b) => {
      if (sort === 'budget') return b.budget - a.budget;
      if (sort === 'competition') return a.proposals - b.proposals;
      return a.postedHours - b.postedHours;
    });

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
                placeholder="Search jobs, skills or keywords"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ borderLeft: 0 }}
              />
            </InputGroup>
          </Col>
          <Col md={3}>
            <Form.Select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="newest">Newest first</option>
              <option value="budget">Highest budget</option>
              <option value="competition">Fewest proposals</option>
            </Form.Select>
          </Col>
          <Col md={4} className="d-flex justify-content-md-end">
            <Button
              variant={savedOnly ? 'primary' : 'outline-secondary'}
              onClick={() => setSavedOnly(!savedOnly)}
              size="sm"
            >
              <Icon name="bookmark" size={14} className="me-1" />
              Saved ({savedJobIds.length})
            </Button>
          </Col>
        </Row>

        <div className="wm-chips mt-3">
          {skills.map((s) => (
            <button
              key={s}
              type="button"
              className={`wm-chip ${skill === s ? 'active' : ''}`}
              onClick={() => setSkill(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="wm-panel">
          <EmptyState
            icon="search"
            title="No jobs match those filters"
            body="Try a broader skill or clear the search box."
            action={
              <Button size="sm" variant="outline-secondary" onClick={() => { setSearch(''); setSkill('All'); setSavedOnly(false); }}>
                Clear filters
              </Button>
            }
          />
        </div>
      ) : (
        <Row className="g-3">
          {visible.map((job) => {
            const applied = appliedIds.includes(job.id);
            const saved = savedJobIds.includes(job.id);
            return (
              <Col md={6} xl={4} key={job.id}>
                <div className="wm-job">
                  <div className="d-flex justify-content-between align-items-start gap-2">
                    <div style={{ minWidth: 0 }}>
                      <h6 className="wm-job__title">{job.title}</h6>
                      <div className="wm-job__meta">
                        {job.client} &middot; <Icon name="star" size={11} /> {job.clientRating} &middot; {job.clientJobs} jobs posted
                      </div>
                    </div>
                    <button
                      type="button"
                      className={`wm-save-btn ${saved ? 'active' : ''}`}
                      onClick={() => onToggleSave(job.id)}
                      aria-label={saved ? 'Remove from saved' : 'Save job'}
                    >
                      <Icon name="bookmark" size={17} />
                    </button>
                  </div>

                  <div className="d-flex align-items-baseline gap-2 mt-2">
                    <span className="wm-num" style={{ fontSize: '1.15rem' }}>{money(job.budget)}</span>
                    <span className="text-muted" style={{ fontSize: '0.8rem' }}>fixed &middot; {job.days} days</span>
                    <Pill tone={LEVEL_TONE[job.level]}>{job.level}</Pill>
                  </div>

                  <p className="wm-job__desc">{job.description}</p>

                  <div className="wm-chips mb-2">
                    {job.skills.map((s) => <span className="wm-tag" key={s}>{s}</span>)}
                  </div>

                  <div className="wm-job__foot">
                    <span className="text-muted" style={{ fontSize: '0.78rem' }}>
                      {job.proposals} proposals &middot; {timeAgo(hoursAgo(job.postedHours))}
                    </span>
                    <div className="d-flex gap-2">
                      <Button size="sm" variant="outline-secondary" onClick={() => setDetail(job)}>Details</Button>
                      {applied ? (
                        <Pill tone="success"><Icon name="check" size={12} /> Applied</Pill>
                      ) : (
                        <Button size="sm" variant="primary" onClick={() => setApplyingTo(job)}>Apply</Button>
                      )}
                    </div>
                  </div>
                </div>
              </Col>
            );
          })}
        </Row>
      )}

      {/* ---------- job detail ---------- */}
      <Modal show={Boolean(detail)} onHide={() => setDetail(null)} centered>
        {detail && (
          <>
            <Modal.Header closeButton>
              <Modal.Title style={{ fontSize: '1.05rem' }}>{detail.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="d-flex align-items-center gap-2 mb-3">
                <Avatar name={detail.client} size={40} tone="slate" />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--slate-dark)' }}>{detail.client}</div>
                  <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                    <Icon name="star" size={11} /> {detail.clientRating} from {detail.clientJobs} hires
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '0.9rem' }}>{detail.description}</p>

              <Row className="g-2 my-3">
                <Col xs={4}>
                  <div className="wm-eyebrow">Budget</div>
                  <div className="wm-num">{money(detail.budget)}</div>
                </Col>
                <Col xs={4}>
                  <div className="wm-eyebrow">Timeline</div>
                  <div className="wm-num">{detail.days} days</div>
                </Col>
                <Col xs={4}>
                  <div className="wm-eyebrow">Competition</div>
                  <div className="wm-num">{detail.proposals} bids</div>
                </Col>
              </Row>

              <div className="wm-chips">
                {detail.skills.map((s) => <span className="wm-tag" key={s}>{s}</span>)}
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="outline-secondary" onClick={() => onToggleSave(detail.id)}>
                {savedJobIds.includes(detail.id) ? 'Remove from saved' : 'Save for later'}
              </Button>
              <Button
                variant="primary"
                disabled={appliedIds.includes(detail.id)}
                onClick={() => { setApplyingTo(detail); setDetail(null); }}
              >
                {appliedIds.includes(detail.id) ? 'Already applied' : 'Submit a proposal'}
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>

      <ProposalModal
        show={Boolean(applyingTo)}
        job={applyingTo}
        onHide={() => setApplyingTo(null)}
        onSubmit={onApply}
      />
    </>
  );
};

export default AvailableJobs;
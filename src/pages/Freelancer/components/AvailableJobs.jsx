import { useState } from 'react';
import { Row, Col, Form, InputGroup, Button, Modal } from 'react-bootstrap';
import Icon from '../../../components/Icon';
import { Pill, EmptyState, Avatar } from '../../../components/Shared';
import ProposalModal from './ProposalModal';
import { money, num, timeAgo } from '../../../data/helpers';

const LEVEL_TONE = { Entry: 'muted', Intermediate: 'info', Expert: 'success' };

const AvailableJobs = ({ jobs, proposals, savedJobIds, onToggleSave, onApply }) => {
  const [search, setSearch] = useState('');
  const [skillFilter, setSkillFilter] = useState('All');
  const [sort, setSort] = useState('newest');
  const [savedOnly, setSavedOnly] = useState(false);
  const [detail, setDetail] = useState(null);
  const [applyingTo, setApplyingTo] = useState(null);

  const skills = ['All'];
  jobs.forEach((job) => {
    job.skills.forEach((skill) => {
      if (!skills.includes(skill)) skills.push(skill);
    });
  });

  const appliedIds = proposals
    .filter((proposal) => proposal.status !== 'Withdrawn')
    .map((proposal) => proposal.job_id);

  const visible = jobs
    .filter((job) => {
      const term = search.toLowerCase();
      const matchesText =
        job.title.toLowerCase().includes(term) ||
        job.description.toLowerCase().includes(term) ||
        job.skills.join(' ').toLowerCase().includes(term);
      const matchesSkill = skillFilter === 'All' || job.skills.includes(skillFilter);
      const matchesSaved = !savedOnly || savedJobIds.includes(job.id);
      return matchesText && matchesSkill && matchesSaved;
    })
    .sort((a, b) => {
      if (sort === 'budget') return num(b.budget) - num(a.budget);
      if (sort === 'competition') return num(a.proposal_count) - num(b.proposal_count);
      return new Date(b.created_at) - new Date(a.created_at);
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
          {skills.map((skill) => (
            <button
              key={skill}
              type="button"
              className={`wm-chip ${skillFilter === skill ? 'active' : ''}`}
              onClick={() => setSkillFilter(skill)}
            >
              {skill}
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
              <Button
                size="sm"
                variant="outline-secondary"
                onClick={() => { setSearch(''); setSkillFilter('All'); setSavedOnly(false); }}
              >
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
                        {job.client} &middot; <Icon name="star" size={11} /> {job.client_rating}
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
                    {job.skills.map((skill) => <span className="wm-tag" key={skill}>{skill}</span>)}
                  </div>

                  <div className="wm-job__foot">
                    <span className="text-muted" style={{ fontSize: '0.78rem' }}>
                      {job.proposal_count} proposals &middot; {timeAgo(job.created_at)}
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
                    <Icon name="star" size={11} /> {detail.client_rating}
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
                  <div className="wm-num">{detail.proposal_count} bids</div>
                </Col>
              </Row>

              <div className="wm-chips">
                {detail.skills.map((skill) => <span className="wm-tag" key={skill}>{skill}</span>)}
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

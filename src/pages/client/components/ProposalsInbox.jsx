import React, { useState } from 'react';
import { Row, Col, Button, Modal, Table } from 'react-bootstrap';
import Icon from '../../../components/Icon';
import { Pill, StatCard, EmptyState, Avatar } from '../../../components/Shared';
import { money, timeAgo, grossWithClientFee, CLIENT_FEE_RATE } from '../../../data/freelancerData';

const STATUS_TONE = { Pending: 'warn', Accepted: 'success', Declined: 'danger', Withdrawn: 'muted', Interviewing: 'info' };

/* Proposals are grouped by job, because a bid only means anything next to the
   other bids on the same job. */
const ProposalsInbox = ({ jobs, proposals, onHire, onDecline, onCloseJob, onGo }) => {
  const [reading, setReading] = useState(null);
  const [hiring, setHiring] = useState(null);
  const [closingJob, setClosingJob] = useState(null);

  const pending = proposals.filter((p) => p.status === 'Pending');
  const bids = pending.map((p) => p.amount);
  const avgBid = bids.length ? Math.round(bids.reduce((a, b) => a + b, 0) / bids.length) : 0;

  if (jobs.length === 0 && proposals.length === 0) {
    return (
      <div className="wm-panel">
        <EmptyState
          icon="inbox"
          title="No proposals yet"
          body="Post a job and freelancers will apply with a bid, a timeline and a milestone plan."
          action={<Button size="sm" variant="primary" onClick={() => onGo('Post a Job')}>Post a job</Button>}
        />
      </div>
    );
  }

  const confirmHire = () => {
    onHire(hiring.id);
    setHiring(null);
  };

  return (
    <>
      <Row className="g-3 mb-4">
        <Col sm={4}>
          <StatCard label="Open jobs" value={jobs.length} icon="briefcase" tone="info" sub="Still accepting bids" />
        </Col>
        <Col sm={4}>
          <StatCard label="Awaiting your review" value={pending.length} icon="inbox" tone="warn" sub="Freelancers waiting on a reply" />
        </Col>
        <Col sm={4}>
          <StatCard label="Average bid" value={avgBid ? money(avgBid) : '-'} icon="dollar" tone="muted" sub="Across open proposals" />
        </Col>
      </Row>

      {jobs.map((job) => {
        const forJob = proposals.filter((p) => p.jobId === job.id);
        const openBids = forJob.filter((p) => p.status === 'Pending');
        const cheapest = openBids.length ? Math.min(...openBids.map((p) => p.amount)) : null;
        const fastest = openBids.length ? Math.min(...openBids.map((p) => p.days)) : null;

        return (
          <div className="wm-panel wm-panel--flush mb-3" key={job.id}>
            <div className="wm-panel__head d-flex flex-wrap justify-content-between align-items-center gap-2">
              <div>
                <h5 className="m-0" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-dark)' }}>
                  {job.title}
                </h5>
                <p className="m-0 text-muted" style={{ fontSize: '0.82rem' }}>
                  {money(job.budget)} budget &middot; {job.days} days &middot; posted {timeAgo(new Date(Date.now() - job.postedHours * 3600000).toISOString())}
                </p>
              </div>
              <div className="d-flex align-items-center gap-2">
                <Pill tone={openBids.length > 0 ? 'warn' : 'muted'}>{openBids.length} open</Pill>
                <Button size="sm" variant="outline-secondary" onClick={() => setClosingJob(job)}>Close job</Button>
              </div>
            </div>

            {forJob.length === 0 ? (
              <EmptyState icon="clock" title="No proposals yet" body="Freelancers usually apply within a day or two." />
            ) : (
              <Table hover responsive className="align-middle">
                <thead>
                  <tr>
                    <th>Freelancer</th>
                    <th>Bid</th>
                    <th>Delivery</th>
                    <th>Sent</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {forJob.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <Avatar name={p.freelancer.name} size={34} />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 600, color: 'var(--slate-dark)' }}>{p.freelancer.name}</div>
                            <div className="text-muted" style={{ fontSize: '0.78rem' }}>
                              <Icon name="star" size={11} /> {p.freelancer.rating} &middot; {p.freelancer.jobs} orders
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="wm-num">{money(p.amount)}</span>
                        {p.amount === cheapest && p.status === 'Pending' && (
                          <div><Pill tone="success">Lowest bid</Pill></div>
                        )}
                        {p.amount > job.budget && (
                          <div><Pill tone="warn">Over budget</Pill></div>
                        )}
                      </td>
                      <td>
                        <span className="wm-num" style={{ fontSize: '0.9rem' }}>{p.days} days</span>
                        {p.days === fastest && p.status === 'Pending' && (
                          <div><Pill tone="info">Fastest</Pill></div>
                        )}
                      </td>
                      <td className="text-muted" style={{ fontSize: '0.85rem' }}>{timeAgo(p.sentAt)}</td>
                      <td><Pill tone={STATUS_TONE[p.status]}>{p.status}</Pill></td>
                      <td className="text-end">
                        <Button size="sm" variant="link" className="p-0 me-3" onClick={() => setReading(p)}>Read</Button>
                        {p.status === 'Pending' && (
                          <>
                            <Button size="sm" variant="outline-secondary" className="me-2" onClick={() => onDecline(p.id)}>
                              Decline
                            </Button>
                            <Button size="sm" variant="primary" onClick={() => setHiring(p)}>Hire</Button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </div>
        );
      })}

      {/* proposals whose job has already been closed or filled */}
      {proposals.filter((p) => !jobs.some((j) => j.id === p.jobId)).length > 0 && (
        <div className="wm-panel wm-panel--flush">
          <div className="wm-panel__head">
            <h5 className="m-0" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-dark)' }}>Settled</h5>
            <p className="m-0 text-muted" style={{ fontSize: '0.82rem' }}>Jobs you have already filled or closed</p>
          </div>
          <Table hover responsive className="align-middle">
            <tbody>
              {proposals.filter((p) => !jobs.some((j) => j.id === p.jobId)).map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--slate-dark)' }}>{p.freelancer.name}</div>
                    <div className="text-muted" style={{ fontSize: '0.78rem' }}>{p.job}</div>
                  </td>
                  <td className="wm-num">{money(p.amount)}</td>
                  <td><Pill tone={STATUS_TONE[p.status]}>{p.status}</Pill></td>
                  <td className="text-end">
                    <Button size="sm" variant="link" className="p-0" onClick={() => setReading(p)}>Read</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* ---------- read the pitch ---------- */}
      <Modal show={Boolean(reading)} onHide={() => setReading(null)} centered>
        {reading && (
          <>
            <Modal.Header closeButton>
              <div>
                <Modal.Title style={{ fontSize: '1.02rem' }}>{reading.freelancer.name}</Modal.Title>
                <div className="text-muted" style={{ fontSize: '0.82rem' }}>
                  {reading.freelancer.title} &middot; applied {timeAgo(reading.sentAt)}
                </div>
              </div>
            </Modal.Header>
            <Modal.Body>
              <Row className="g-2 mb-3">
                <Col xs={4}>
                  <div className="wm-eyebrow">Bid</div>
                  <div className="wm-num">{money(reading.amount)}</div>
                </Col>
                <Col xs={4}>
                  <div className="wm-eyebrow">Delivery</div>
                  <div className="wm-num">{reading.days} days</div>
                </Col>
                <Col xs={4}>
                  <div className="wm-eyebrow">Rating</div>
                  <div className="wm-num">{reading.freelancer.rating}</div>
                </Col>
              </Row>

              {reading.freelancer.skills && (
                <div className="wm-chips mb-3">
                  {reading.freelancer.skills.map((s) => <span className="wm-tag" key={s}>{s}</span>)}
                </div>
              )}

              <div className="wm-eyebrow">Their pitch</div>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.65 }}>{reading.cover}</p>

              {reading.plan && reading.plan.length > 0 && (
                <>
                  <div className="wm-eyebrow mt-3">Proposed milestones</div>
                  {reading.plan.map((row, i) => (
                    <div key={i} className="d-flex justify-content-between py-2 border-bottom" style={{ fontSize: '0.88rem' }}>
                      <span>{row.title || `Milestone ${i + 1}`}</span>
                      <span className="wm-num">{money(row.amount)}</span>
                    </div>
                  ))}
                  <p className="text-muted mt-2 mb-0" style={{ fontSize: '0.8rem' }}>
                    You approve and release each one separately.
                  </p>
                </>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="outline-secondary" onClick={() => setReading(null)}>Close</Button>
              {reading.status === 'Pending' && (
                <Button variant="primary" onClick={() => { setHiring(reading); setReading(null); }}>
                  Hire {reading.freelancer.name.split(' ')[0]}
                </Button>
              )}
            </Modal.Footer>
          </>
        )}
      </Modal>

      {/* ---------- funding confirmation ---------- */}
      <Modal show={Boolean(hiring)} onHide={() => setHiring(null)} centered>
        {hiring && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>Hire {hiring.freelancer.name}?</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p style={{ fontSize: '0.9rem' }}>
                This funds the contract into escrow and opens a project workspace. The money stays
                yours until you approve each milestone.
              </p>
              <div className="wm-panel" style={{ background: '#f8fafc' }}>
                <div className="d-flex justify-content-between py-1" style={{ fontSize: '0.87rem' }}>
                  <span className="text-muted">Agreed bid</span>
                  <span className="wm-num">{money(hiring.amount)}</span>
                </div>
                <div className="d-flex justify-content-between py-1" style={{ fontSize: '0.87rem' }}>
                  <span className="text-muted">Escrow fee ({CLIENT_FEE_RATE * 100}%)</span>
                  <span className="wm-num">+{money(Math.round(hiring.amount * CLIENT_FEE_RATE))}</span>
                </div>
                <div className="d-flex justify-content-between py-1 border-top mt-1 pt-2" style={{ fontSize: '0.9rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--slate-dark)' }}>Charged today</span>
                  <span className="wm-num">{money(grossWithClientFee(hiring.amount))}</span>
                </div>
              </div>
              <p className="text-muted mt-3 mb-0" style={{ fontSize: '0.82rem' }}>
                Other open proposals on this job will be declined automatically.
              </p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="outline-secondary" onClick={() => setHiring(null)}>Cancel</Button>
              <Button variant="primary" onClick={confirmHire}>Fund escrow and hire</Button>
            </Modal.Footer>
          </>
        )}
      </Modal>

      {/* ---------- close a job ---------- */}
      <Modal show={Boolean(closingJob)} onHide={() => setClosingJob(null)} centered size="sm">
        {closingJob && (
          <Modal.Body className="text-center p-4">
            <h6 style={{ fontWeight: 700, color: 'var(--slate-dark)' }}>Close "{closingJob.title}"?</h6>
            <p className="text-muted" style={{ fontSize: '0.86rem' }}>
              It stops appearing in the marketplace and any open proposals are declined.
            </p>
            <div className="d-flex gap-2 justify-content-center">
              <Button size="sm" variant="outline-secondary" onClick={() => setClosingJob(null)}>Keep it open</Button>
              <Button size="sm" variant="primary" onClick={() => { onCloseJob(closingJob.id); setClosingJob(null); }}>
                Close job
              </Button>
            </div>
          </Modal.Body>
        )}
      </Modal>
    </>
  );
};

export default ProposalsInbox;
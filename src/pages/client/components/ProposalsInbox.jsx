import { useState } from 'react';
import { Row, Col, Button, Modal, Table } from 'react-bootstrap';
import Icon from '../../../components/Icon';
import { Pill, StatCard, EmptyState, Avatar } from '../../../components/Shared';
import {
  money, num, timeAgo, grossWithClientFee, CLIENT_FEE_RATE, PROPOSAL_TONE,
} from '../../../data/helpers';

const ProposalsInbox = ({ jobs, proposals, onHire, onDecline, onCloseJob, onGo }) => {
  const [reading, setReading] = useState(null);
  const [hiring, setHiring] = useState(null);
  const [closingJob, setClosingJob] = useState(null);

  const pending = proposals.filter((p) => p.status === 'Pending');
  const bids = pending.map((p) => num(p.amount));
  const avgBid = bids.length === 0 ? 0 : Math.round(bids.reduce((a, b) => a + b, 0) / bids.length);

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
        const forJob = proposals.filter((p) => p.job_id === job.id);
        const openBids = forJob.filter((p) => p.status === 'Pending');
        const cheapest = openBids.length === 0 ? null : Math.min(...openBids.map((p) => num(p.amount)));
        const fastest = openBids.length === 0 ? null : Math.min(...openBids.map((p) => p.days));

        return (
          <div className="wm-panel wm-panel--flush mb-3" key={job.id}>
            <div className="wm-panel__head d-flex flex-wrap justify-content-between align-items-center gap-2">
              <div>
                <h5 className="m-0" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-dark)' }}>
                  {job.title}
                </h5>
                <p className="m-0 text-muted" style={{ fontSize: '0.82rem' }}>
                  {money(job.budget)} budget &middot; {job.days} days &middot; posted {timeAgo(job.created_at)}
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
                          <Avatar name={p.freelancer_name} size={34} />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 600, color: 'var(--slate-dark)' }}>{p.freelancer_name}</div>
                            <div className="text-muted" style={{ fontSize: '0.78rem' }}>
                              <Icon name="star" size={11} /> {p.rating} &middot; {p.freelancer_title}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="wm-num">{money(p.amount)}</span>
                        {num(p.amount) === cheapest && p.status === 'Pending' && (
                          <div><Pill tone="success">Lowest bid</Pill></div>
                        )}
                        {num(p.amount) > num(job.budget) && (
                          <div><Pill tone="warn">Over budget</Pill></div>
                        )}
                      </td>
                      <td>
                        <span className="wm-num" style={{ fontSize: '0.9rem' }}>{p.days} days</span>
                        {p.days === fastest && p.status === 'Pending' && (
                          <div><Pill tone="info">Fastest</Pill></div>
                        )}
                      </td>
                      <td className="text-muted" style={{ fontSize: '0.85rem' }}>{timeAgo(p.sent_at)}</td>
                      <td><Pill tone={PROPOSAL_TONE[p.status]}>{p.status}</Pill></td>
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

      {proposals.filter((p) => !jobs.some((job) => job.id === p.job_id)).length > 0 && (
        <div className="wm-panel wm-panel--flush">
          <div className="wm-panel__head">
            <h5 className="m-0" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-dark)' }}>Settled</h5>
            <p className="m-0 text-muted" style={{ fontSize: '0.82rem' }}>Jobs you have already filled or closed</p>
          </div>
          <Table hover responsive className="align-middle">
            <tbody>
              {proposals.filter((p) => !jobs.some((job) => job.id === p.job_id)).map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--slate-dark)' }}>{p.freelancer_name}</div>
                    <div className="text-muted" style={{ fontSize: '0.78rem' }}>{p.job_title}</div>
                  </td>
                  <td className="wm-num">{money(p.amount)}</td>
                  <td><Pill tone={PROPOSAL_TONE[p.status]}>{p.status}</Pill></td>
                  <td className="text-end">
                    <Button size="sm" variant="link" className="p-0" onClick={() => setReading(p)}>Read</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      <Modal show={Boolean(reading)} onHide={() => setReading(null)} centered>
        {reading && (
          <>
            <Modal.Header closeButton>
              <div>
                <Modal.Title style={{ fontSize: '1.02rem' }}>{reading.freelancer_name}</Modal.Title>
                <div className="text-muted" style={{ fontSize: '0.82rem' }}>
                  {reading.freelancer_title} &middot; applied {timeAgo(reading.sent_at)}
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
                  <div className="wm-num">{reading.rating}</div>
                </Col>
              </Row>

              {reading.skills && (
                <div className="wm-chips mb-3">
                  {reading.skills.map((skill) => <span className="wm-tag" key={skill}>{skill}</span>)}
                </div>
              )}

              <div className="wm-eyebrow">Their pitch</div>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.65 }}>{reading.cover}</p>

            </Modal.Body>
            <Modal.Footer>
              <Button variant="outline-secondary" onClick={() => setReading(null)}>Close</Button>
              {reading.status === 'Pending' && (
                <Button variant="primary" onClick={() => { setHiring(reading); setReading(null); }}>
                  Hire {reading.freelancer_name.split(' ')[0]}
                </Button>
              )}
            </Modal.Footer>
          </>
        )}
      </Modal>

      <Modal show={Boolean(hiring)} onHide={() => setHiring(null)} centered>
        {hiring && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>Hire {hiring.freelancer_name}?</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p style={{ fontSize: '0.9rem' }}>
                This funds the contract into escrow and opens a project workspace. The money stays
                yours until you approve the delivered work.
              </p>
              <div className="wm-panel" style={{ background: '#f8fafc' }}>
                <div className="d-flex justify-content-between py-1" style={{ fontSize: '0.87rem' }}>
                  <span className="text-muted">Agreed bid</span>
                  <span className="wm-num">{money(hiring.amount)}</span>
                </div>
                <div className="d-flex justify-content-between py-1" style={{ fontSize: '0.87rem' }}>
                  <span className="text-muted">Escrow fee ({CLIENT_FEE_RATE * 100}%)</span>
                  <span className="wm-num">+{money(Math.round(num(hiring.amount) * CLIENT_FEE_RATE))}</span>
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
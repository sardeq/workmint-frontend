import React, { useState } from 'react';
import { Row, Col, Button, Modal, Table } from 'react-bootstrap';
import Icon from '../../../components/Icon';
import { Pill, StatCard, EmptyState } from '../../../components/Shared';
import { money, timeAgo } from '../../../data/freelancerData';

const STATUS_TONE = {
  Pending: 'warn',
  Interviewing: 'info',
  Accepted: 'success',
  Declined: 'danger',
  Withdrawn: 'muted',
};

const FILTERS = ['All', 'Pending', 'Interviewing', 'Accepted', 'Declined', 'Withdrawn'];

const MyProposals = ({ proposals, onWithdraw, onGo }) => {
  const [filter, setFilter] = useState('All');
  const [reading, setReading] = useState(null);

  const decided = proposals.filter((p) => p.status === 'Accepted' || p.status === 'Declined');
  const won = proposals.filter((p) => p.status === 'Accepted').length;
  const winRate = decided.length === 0 ? null : Math.round((won / decided.length) * 100);
  const pipelineValue = proposals
    .filter((p) => p.status === 'Pending' || p.status === 'Interviewing')
    .reduce((sum, p) => sum + p.amount, 0);

  const visible = proposals
    .filter((p) => filter === 'All' || p.status === filter)
    .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));

  if (proposals.length === 0) {
    return (
      <div className="wm-panel">
        <EmptyState
          icon="send"
          title="You have not sent any proposals yet"
          body="Every order starts as a proposal. Find a job that fits your skills and pitch it."
          action={<Button variant="primary" size="sm" onClick={() => onGo('Available Jobs')}>Browse open jobs</Button>}
        />
      </div>
    );
  }

  return (
    <>
      <Row className="g-3 mb-4">
        <Col sm={6} xl={3}>
          <StatCard label="Sent" value={proposals.length} icon="send" tone="muted" sub="All time" />
        </Col>
        <Col sm={6} xl={3}>
          <StatCard
            label="Awaiting a reply" icon="clock" tone="warn"
            value={proposals.filter((p) => p.status === 'Pending').length}
            sub="Follow up after a week"
          />
        </Col>
        <Col sm={6} xl={3}>
          <StatCard label="Pipeline value" value={money(pipelineValue)} icon="dollar" tone="info" sub="If everything lands" />
        </Col>
        <Col sm={6} xl={3}>
          <StatCard
            label="Win rate" icon="trend" tone="success"
            value={winRate === null ? '-' : `${winRate}%`}
            sub={decided.length === 0 ? 'No decisions yet' : `${won} of ${decided.length} decided`}
          />
        </Col>
      </Row>

      <div className="wm-panel wm-panel--flush">
        <div className="wm-panel__head">
          <div className="wm-chips">
            {FILTERS.map((f) => (
              <button key={f} type="button" className={`wm-chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f}
                <span className="wm-chip__count">
                  {f === 'All' ? proposals.length : proposals.filter((p) => p.status === f).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {visible.length === 0 ? (
          <EmptyState icon="inbox" title={`No ${filter.toLowerCase()} proposals`} body="Switch filters to see the rest." />
        ) : (
          <Table hover responsive className="align-middle">
            <thead>
              <tr>
                <th>Job</th>
                <th>Client</th>
                <th>Your bid</th>
                <th>Sent</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--slate-dark)' }}>{p.job}</div>
                    <div className="text-muted" style={{ fontSize: '0.78rem' }}>{p.days} day delivery</div>
                  </td>
                  <td className="text-muted">{p.client}</td>
                  <td className="wm-num">{money(p.amount)}</td>
                  <td className="text-muted" style={{ fontSize: '0.85rem' }}>{timeAgo(p.sentAt)}</td>
                  <td><Pill tone={STATUS_TONE[p.status]}>{p.status}</Pill></td>
                  <td className="text-end">
                    <Button size="sm" variant="link" className="p-0 me-3" onClick={() => setReading(p)}>
                      View
                    </Button>
                    {(p.status === 'Pending' || p.status === 'Interviewing') && (
                      <Button size="sm" variant="outline-secondary" onClick={() => onWithdraw(p.id)}>
                        Withdraw
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>

      <Modal show={Boolean(reading)} onHide={() => setReading(null)} centered>
        {reading && (
          <>
            <Modal.Header closeButton>
              <div>
                <Modal.Title style={{ fontSize: '1.02rem' }}>{reading.job}</Modal.Title>
                <div className="text-muted" style={{ fontSize: '0.82rem' }}>
                  {reading.client} &middot; sent {timeAgo(reading.sentAt)}
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
                  <div className="wm-eyebrow">Status</div>
                  <Pill tone={STATUS_TONE[reading.status]}>{reading.status}</Pill>
                </Col>
              </Row>

              <div className="wm-eyebrow">Your pitch</div>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>{reading.cover}</p>

              {reading.plan && reading.plan.length > 0 && (
                <>
                  <div className="wm-eyebrow mt-3">Proposed milestones</div>
                  {reading.plan.map((row, i) => (
                    <div key={i} className="d-flex justify-content-between py-2 border-bottom" style={{ fontSize: '0.88rem' }}>
                      <span>{row.title || `Milestone ${i + 1}`}</span>
                      <span className="wm-num">{money(row.amount)}</span>
                    </div>
                  ))}
                </>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="outline-secondary" onClick={() => setReading(null)}>Close</Button>
              {(reading.status === 'Pending' || reading.status === 'Interviewing') && (
                <Button
                  variant="primary"
                  onClick={() => { onWithdraw(reading.id); setReading(null); }}
                >
                  <Icon name="trash" size={13} className="me-1" /> Withdraw proposal
                </Button>
              )}
            </Modal.Footer>
          </>
        )}
      </Modal>
    </>
  );
};

export default MyProposals;
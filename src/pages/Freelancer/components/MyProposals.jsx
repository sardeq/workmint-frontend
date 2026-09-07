import { useState } from 'react';
import { Row, Col, Button, Modal, Table } from 'react-bootstrap';
import Icon from '../../../components/Icon';
import { Pill, StatCard, EmptyState } from '../../../components/Shared';
import { money, num, timeAgo, PROPOSAL_TONE } from '../../../data/helpers';

const FILTERS = ['All', 'Pending', 'Accepted', 'Declined', 'Withdrawn'];

const MyProposals = ({ proposals, onWithdraw, onGo }) => {
  const [filter, setFilter] = useState('All');
  const [reading, setReading] = useState(null);

  const decided = proposals.filter((p) => p.status === 'Accepted' || p.status === 'Declined');
  const won = proposals.filter((p) => p.status === 'Accepted').length;
  const winRate = decided.length === 0 ? null : Math.round((won / decided.length) * 100);

  const pipelineValue = proposals
    .filter((p) => p.status === 'Pending')
    .reduce((sum, p) => sum + num(p.amount), 0);

  const visible = proposals
    .filter((p) => filter === 'All' || p.status === filter)
    .sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at));

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
            {FILTERS.map((item) => (
              <button
                key={item}
                type="button"
                className={`wm-chip ${filter === item ? 'active' : ''}`}
                onClick={() => setFilter(item)}
              >
                {item}
                <span className="wm-chip__count">
                  {item === 'All' ? proposals.length : proposals.filter((p) => p.status === item).length}
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
              {visible.map((proposal) => (
                <tr key={proposal.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--slate-dark)' }}>{proposal.job_title}</div>
                    <div className="text-muted" style={{ fontSize: '0.78rem' }}>{proposal.days} day delivery</div>
                  </td>
                  <td className="text-muted">{proposal.client}</td>
                  <td className="wm-num">{money(proposal.amount)}</td>
                  <td className="text-muted" style={{ fontSize: '0.85rem' }}>{timeAgo(proposal.sent_at)}</td>
                  <td><Pill tone={PROPOSAL_TONE[proposal.status]}>{proposal.status}</Pill></td>
                  <td className="text-end">
                    <Button size="sm" variant="link" className="p-0 me-3" onClick={() => setReading(proposal)}>
                      View
                    </Button>
                    {proposal.status === 'Pending' && (
                      <Button size="sm" variant="outline-secondary" onClick={() => onWithdraw(proposal.id)}>
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
                <Modal.Title style={{ fontSize: '1.02rem' }}>{reading.job_title}</Modal.Title>
                <div className="text-muted" style={{ fontSize: '0.82rem' }}>
                  {reading.client} &middot; sent {timeAgo(reading.sent_at)}
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
                  <Pill tone={PROPOSAL_TONE[reading.status]}>{reading.status}</Pill>
                </Col>
              </Row>

              <div className="wm-eyebrow">Your pitch</div>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>{reading.cover}</p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="outline-secondary" onClick={() => setReading(null)}>Close</Button>
              {reading.status === 'Pending' && (
                <Button variant="primary" onClick={() => { onWithdraw(reading.id); setReading(null); }}>
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

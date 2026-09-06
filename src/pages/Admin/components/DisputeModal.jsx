import { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Row, Col } from 'react-bootstrap';
import Icon from '../../../components/Icon';
import { Pill } from '../../../components/Shared';
import {
  money, num, netOf, timeAgo, shortDate, milestonesOf, messagesOf,
  DISPUTE_OUTCOMES, DISPUTE_STATUS, MILESTONE_STATUS,
} from '../../../data/helpers';

const DisputeModal = ({ show, dispute, order, onHide, onResolve }) => {
  const [outcome, setOutcome] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setOutcome('');
    setNote('');
    setError('');
  }, [dispute]);

  if (!dispute) return null;

  const milestone = order ? milestonesOf(order).find((item) => item.id === dispute.milestone_id) : null;
  const settled = dispute.status === 'Resolved';
  const amount = num(dispute.amount);
  const half = Math.round(amount / 2);
  const freelancerName = order ? order.freelancer_name : 'Freelancer';

  const handleResolve = (e) => {
    e.preventDefault();
    if (!outcome) {
      setError('Pick an outcome.');
      return;
    }
    if (note.trim().length < 20) {
      setError('Write the reasoning. Both sides see this on the case.');
      return;
    }
    onResolve(dispute.id, outcome, note.trim());
  };

  const preview = {
    release: [`${freelancerName} receives ${money(netOf(amount))}`, `${money(amount)} leaves escrow`],
    refund: [`${dispute.client} gets ${money(amount)} back`, 'The milestone is cancelled'],
    split: [`${freelancerName} receives ${money(netOf(amount - half))}`, `${dispute.client} gets ${money(half)} back`],
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <div>
          <Modal.Title style={{ fontSize: '1.05rem' }}>Case {dispute.id}</Modal.Title>
          <div className="text-muted" style={{ fontSize: '0.83rem' }}>
            {dispute.project} &middot; opened {timeAgo(dispute.opened_at)} by the {dispute.raised_by}
          </div>
        </div>
      </Modal.Header>

      <Modal.Body>
        <Row className="g-2 mb-3">
          <Col xs={4}>
            <div className="wm-eyebrow">Frozen</div>
            <div className="wm-num" style={{ fontSize: '1.15rem', color: 'var(--amber)' }}>{money(amount)}</div>
          </Col>
          <Col xs={4}>
            <div className="wm-eyebrow">Milestone</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--slate-dark)' }}>
              {milestone ? milestone.title : 'Not found'}
            </div>
            {milestone && <Pill tone={MILESTONE_STATUS[milestone.status].tone}>{MILESTONE_STATUS[milestone.status].label}</Pill>}
          </Col>
          <Col xs={4}>
            <div className="wm-eyebrow">Status</div>
            <Pill tone={DISPUTE_STATUS[dispute.status].tone}>{dispute.status}</Pill>
          </Col>
        </Row>

        <div className="wm-note wm-note--danger">
          <strong>{dispute.raised_by === 'client' ? dispute.client : dispute.freelancer} claims</strong>
          <div style={{ fontWeight: 600, color: 'var(--slate-dark)' }}>{dispute.reason}</div>
          <div className="mt-1">{dispute.detail}</div>
        </div>

        {milestone && milestone.deliverable_link && (
          <div className="wm-note wm-note--muted">
            <strong>What was delivered {timeAgo(milestone.delivered_at)}</strong>
            <a href={milestone.deliverable_link} target="_blank" rel="noreferrer" className="text-decoration-none">
              {milestone.deliverable_link} <Icon name="external" size={12} />
            </a>
            {milestone.deliverable_note && <div className="text-muted mt-1">{milestone.deliverable_note}</div>}
          </div>
        )}

        {milestone && milestone.revision_note && (
          <div className="wm-note wm-note--muted">
            <strong>Revision the client asked for</strong>
            {milestone.revision_note}
          </div>
        )}

        {order && messagesOf(order).length > 0 && (
          <>
            <div className="wm-eyebrow mt-3 mb-2">Last messages between them</div>
            <div className="wm-chat" style={{ maxHeight: 190 }}>
              {messagesOf(order).slice(-4).map((item) => (
                <div key={item.id} className={`wm-bubble wm-bubble--${item.sender_role === 'client' ? 'client' : 'you'}`}>
                  {item.body}
                  <div className="wm-bubble__meta">
                    {item.sender_role === 'client' ? order.client : order.freelancer_name} &middot; {timeAgo(item.sent_at)}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {settled ? (
          <Alert variant="light" className="border mt-3 mb-0">
            <div className="wm-eyebrow mb-1">Resolved {dispute.resolved_at ? shortDate(dispute.resolved_at) : ''}</div>
            <div style={{ fontWeight: 600, color: 'var(--slate-dark)', fontSize: '0.92rem' }}>
              {(DISPUTE_OUTCOMES.find((item) => item.key === dispute.resolution) || {}).label || dispute.resolution}
            </div>
            {dispute.resolution_note && (
              <div className="text-muted mt-1" style={{ fontSize: '0.87rem' }}>{dispute.resolution_note}</div>
            )}
          </Alert>
        ) : (
          <Form onSubmit={handleResolve} className="mt-4">
            <div className="wm-eyebrow mb-2">Decision</div>
            {error && <Alert variant="danger" className="py-2" style={{ fontSize: '0.85rem' }}>{error}</Alert>}

            <div className="wm-role-picker mb-3" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
              {DISPUTE_OUTCOMES.map((option) => (
                <button
                  type="button"
                  key={option.key}
                  className={`wm-role ${outcome === option.key ? 'active' : ''}`}
                  onClick={() => { setOutcome(option.key); setError(''); }}
                >
                  <strong>{option.label}</strong>
                  <small>{option.body}</small>
                </button>
              ))}
            </div>

            {outcome && (
              <div className="wm-panel mb-3" style={{ background: '#f8fafc' }}>
                <div className="wm-eyebrow mb-2">What this does to the money</div>
                {preview[outcome].map((line) => (
                  <div key={line} className="d-flex align-items-center gap-2 py-1" style={{ fontSize: '0.87rem' }}>
                    <Icon name="chevron" size={12} /> {line}
                  </div>
                ))}
              </div>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Reasoning</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="What you checked, and why this outcome. Both parties see it."
                value={note}
                onChange={(e) => { setNote(e.target.value); setError(''); }}
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="outline-secondary" onClick={onHide}>Close without deciding</Button>
              <Button variant="primary" type="submit">Resolve case</Button>
            </div>
          </Form>
        )}
      </Modal.Body>

      {settled && (
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onHide}>Close</Button>
        </Modal.Footer>
      )}
    </Modal>
  );
};

export default DisputeModal;
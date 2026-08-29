import React, { useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { money, canDispute, MILESTONE_STATUS } from '../data/freelancerData';

const REASONS = {
  client: [
    'Delivery does not match the brief',
    'Work is late with no explanation',
    'Freelancer has stopped responding',
    'Quality is below what was agreed',
  ],
  freelancer: [
    'Approval withheld after delivery',
    'Client keeps expanding the scope',
    'Client has stopped responding',
    'Revision requests are outside the brief',
  ],
};

/* Used by both workspaces. Raising a dispute freezes the milestone until an
   admin resolves it, so the form makes that consequence explicit. */
const RaiseDisputeModal = ({ show, onHide, order, role, onSubmit }) => {
  const [milestoneId, setMilestoneId] = useState('');
  const [reason, setReason] = useState('');
  const [detail, setDetail] = useState('');
  const [error, setError] = useState('');

  if (!order) return null;

  const eligible = order.milestones.filter(canDispute);
  const selected = eligible.find((m) => m.id === milestoneId) || eligible[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selected) return;
    if (!reason) return setError('Pick the closest reason.');
    if (detail.trim().length < 30) {
      return setError('Give the mediator enough detail to judge it. At least a couple of sentences.');
    }
    onSubmit(order.id, selected.id, role, { reason, detail: detail.trim() });
    setReason(''); setDetail(''); setError('');
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Open a dispute</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {eligible.length === 0 ? (
            <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
              Every milestone on this project is already settled, so there is nothing left in escrow to dispute.
            </p>
          ) : (
            <>
              <p className="text-muted" style={{ fontSize: '0.87rem' }}>
                A mediator reviews both sides and decides where the money goes. The milestone is frozen
                until then, so try a message first if this is a misunderstanding.
              </p>

              {error && <Alert variant="danger" className="py-2" style={{ fontSize: '0.85rem' }}>{error}</Alert>}

              <Form.Group className="mb-3">
                <Form.Label>Which milestone?</Form.Label>
                <Form.Select value={selected ? selected.id : ''} onChange={(e) => setMilestoneId(e.target.value)}>
                  {eligible.map((m) => (
                    <option value={m.id} key={m.id}>
                      {m.title} - {money(m.amount)} ({MILESTONE_STATUS[m.status].label})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Reason</Form.Label>
                <Form.Select value={reason} onChange={(e) => { setReason(e.target.value); setError(''); }}>
                  <option value="">Choose one...</option>
                  {REASONS[role].map((r) => <option value={r} key={r}>{r}</option>)}
                </Form.Select>
              </Form.Group>

              <Form.Group>
                <Form.Label>What happened?</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Dates, what was agreed, what was delivered, and what you have already tried."
                  value={detail}
                  onChange={(e) => { setDetail(e.target.value); setError(''); }}
                />
                <Form.Text>{detail.length} characters. The other side sees this.</Form.Text>
              </Form.Group>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onHide}>Cancel</Button>
          <Button variant="primary" type="submit" disabled={eligible.length === 0}>
            Open the dispute
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default RaiseDisputeModal;
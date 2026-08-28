import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import Icon from '../../../components/Icon';
import { money, netOf, FEE_RATE } from '../../../data/freelancerData';

const MIN_COVER = 80;

/* Proposals are where a freelancer wins or loses the job, so this is a real
   form: a bid, a timeline, and an optional milestone split that becomes the
   escrow schedule if the client accepts. */
const ProposalModal = ({ show, job, onHide, onSubmit }) => {
  const [form, setForm] = useState({ amount: '', days: '', cover: '' });
  const [plan, setPlan] = useState([]);
  const [error, setError] = useState('');

  // Reset the form every time a different job is opened.
  useEffect(() => {
    if (job) {
      setForm({ amount: job.budget, days: job.days, cover: '' });
      setPlan([]);
      setError('');
    }
  }, [job]);

  if (!job) return null;

  const amount = Number(form.amount) || 0;
  const planTotal = plan.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);

  const addRow = () => setPlan([...plan, { key: `row-${Date.now()}`, title: '', amount: '' }]);
  const updateRow = (key, patch) => setPlan(plan.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  const removeRow = (key) => setPlan(plan.filter((r) => r.key !== key));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (amount <= 0) return setError('Enter what you want to be paid.');
    if (Number(form.days) <= 0) return setError('Tell the client how many days you need.');
    if (form.cover.trim().length < MIN_COVER)
      return setError(`Write at least ${MIN_COVER} characters. Clients skip one-line proposals.`);
    if (plan.length > 0 && planTotal !== amount)
      return setError(`Your milestones add up to ${money(planTotal)} but your bid is ${money(amount)}.`);

    onSubmit(job, {
      amount,
      days: Number(form.days),
      cover: form.cover.trim(),
      plan: plan.map((r) => ({ title: r.title, amount: Number(r.amount) })),
    });
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <div>
          <Modal.Title>Submit a proposal</Modal.Title>
          <div className="text-muted" style={{ fontSize: '0.85rem' }}>{job.title} &middot; {job.client}</div>
        </div>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger" className="py-2" style={{ fontSize: '0.86rem' }}>{error}</Alert>}

          <Row className="g-3 mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Your bid</Form.Label>
                <Form.Control
                  type="number" min="0"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
                <Form.Text>Client budget: {money(job.budget)}</Form.Text>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Delivery time (days)</Form.Label>
                <Form.Control
                  type="number" min="1"
                  value={form.days}
                  onChange={(e) => setForm({ ...form, days: e.target.value })}
                />
                <Form.Text>Client expects {job.days} days</Form.Text>
              </Form.Group>
            </Col>
            <Col md={4}>
              <div className="wm-panel h-100 p-3" style={{ background: '#f8fafc' }}>
                <div className="wm-eyebrow">You take home</div>
                <div className="wm-num" style={{ fontSize: '1.3rem' }}>{money(netOf(amount))}</div>
                <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                  after the {FEE_RATE * 100}% Workmint fee
                </div>
              </div>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Why you</Form.Label>
            <Form.Control
              as="textarea" rows={5}
              placeholder="Open with the part of their problem you have solved before, then how you would start. Skip the biography."
              value={form.cover}
              onChange={(e) => setForm({ ...form, cover: e.target.value })}
            />
            <Form.Text className={form.cover.length < MIN_COVER ? 'text-danger' : ''}>
              {form.cover.length} characters {form.cover.length < MIN_COVER && `(${MIN_COVER - form.cover.length} more needed)`}
            </Form.Text>
          </Form.Group>

          <div className="wm-panel" style={{ background: '#f8fafc' }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div>
                <div style={{ fontWeight: 700, color: 'var(--slate-dark)', fontSize: '0.92rem' }}>
                  Milestone plan <span className="text-muted fw-normal">(optional)</span>
                </div>
                <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                  Split the bid so the client funds and releases it in stages.
                </div>
              </div>
              <Button size="sm" variant="outline-secondary" onClick={addRow} type="button">
                <Icon name="plus" size={13} /> Add
              </Button>
            </div>

            {plan.map((row, i) => (
              <Row className="g-2 mb-2 align-items-center" key={row.key}>
                <Col xs={7}>
                  <Form.Control
                    size="sm"
                    placeholder={`Milestone ${i + 1} - what you deliver`}
                    value={row.title}
                    onChange={(e) => updateRow(row.key, { title: e.target.value })}
                  />
                </Col>
                <Col xs={4}>
                  <Form.Control
                    size="sm" type="number" min="0" placeholder="Amount"
                    value={row.amount}
                    onChange={(e) => updateRow(row.key, { amount: e.target.value })}
                  />
                </Col>
                <Col xs={1} className="text-end">
                  <button type="button" className="wm-save-btn" onClick={() => removeRow(row.key)} aria-label="Remove milestone">
                    <Icon name="trash" size={15} />
                  </button>
                </Col>
              </Row>
            ))}

            {plan.length > 0 && (
              <div
                className="d-flex justify-content-between pt-2 border-top"
                style={{ fontSize: '0.85rem', color: planTotal === amount ? 'var(--mint-deep)' : 'var(--red)' }}
              >
                <span>Milestones total</span>
                <span className="wm-num" style={{ color: 'inherit' }}>{money(planTotal)} of {money(amount)}</span>
              </div>
            )}
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onHide}>Cancel</Button>
          <Button variant="primary" type="submit">Send proposal</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ProposalModal;
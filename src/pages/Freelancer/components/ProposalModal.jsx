import { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { money, netOf, FEE_RATE } from '../../../data/helpers';

const MIN_COVER = 80;

const ProposalModal = ({ show, job, onHide, onSubmit }) => {
  const [form, setForm] = useState({ amount: '', days: '', cover: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (job) {
      setForm({ amount: job.budget, days: job.days, cover: '' });
      setError('');
    }
  }, [job]);

  if (!job) return null;

  const amount = Number(form.amount) || 0;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (amount <= 0) {
      setError('Enter what you want to be paid.');
      return;
    }
    if (Number(form.days) <= 0) {
      setError('Tell the client how many days you need.');
      return;
    }
    if (form.cover.trim().length < MIN_COVER) {
      setError(`Write at least ${MIN_COVER} characters. Clients skip one-line proposals.`);
      return;
    }

    onSubmit(job, { amount, days: Number(form.days), cover: form.cover.trim() });
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
                  type="number"
                  min="0"
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
                  type="number"
                  min="1"
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

          <Form.Group>
            <Form.Label>Why you</Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              placeholder="Open with the part of their problem you have solved before, then how you would start. Skip the biography."
              value={form.cover}
              onChange={(e) => setForm({ ...form, cover: e.target.value })}
            />
            <Form.Text className={form.cover.length < MIN_COVER ? 'text-danger' : ''}>
              {form.cover.length} characters
              {form.cover.length < MIN_COVER && ` (${MIN_COVER - form.cover.length} more needed)`}
            </Form.Text>
          </Form.Group>
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

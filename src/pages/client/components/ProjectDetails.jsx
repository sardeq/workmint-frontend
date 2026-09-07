import { useState } from 'react';
import { Row, Col, Button, Form, Modal, Alert } from 'react-bootstrap';
import Icon from '../../../components/Icon';
import { Pill, Avatar, EmptyState } from '../../../components/Shared';
import {
  money, shortDate, timeAgo, deadlineLabel, deadlineTone, contractRef, contractStatus, isLive,
} from '../../../data/helpers';

const ProjectDetails = ({ contract, onBack, onApprove, onRequestRevision, onCancel, onSend }) => {
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [showRevision, setShowRevision] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [text, setText] = useState('');

  const status = contractStatus(contract, 'client');
  const messages = contract.messages || [];

  const submitRevision = (e) => {
    e.preventDefault();
    if (note.trim().length < 10) {
      setError('Say what needs changing, so the freelancer knows what to fix.');
      return;
    }
    onRequestRevision(contract.id, note.trim());
    setShowRevision(false);
    setNote('');
    setError('');
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(contract.id, 'client', text.trim());
    setText('');
  };

  return (
    <>
      <Button variant="link" className="p-0 mb-3" onClick={onBack}>
        <Icon name="back" size={14} /> All projects
      </Button>

      <Row className="g-3">
        <Col lg={7}>
          <div className="wm-panel mb-3">
            <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
              <div>
                <div className="wm-eyebrow">{contractRef(contract)}</div>
                <h5 style={{ fontWeight: 700, color: 'var(--slate-dark)' }}>{contract.title}</h5>
              </div>
              <Pill tone={status.tone}>{status.label}</Pill>
            </div>

            <p className="text-muted" style={{ fontSize: '0.9rem', lineHeight: 1.65 }}>{contract.brief}</p>

            <Row className="g-2 pt-3 border-top">
              <Col xs={4}>
                <div className="wm-eyebrow">Value</div>
                <div className="wm-num">{money(contract.amount)}</div>
              </Col>
              <Col xs={4}>
                <div className="wm-eyebrow">Deadline</div>
                <div className="wm-num">{shortDate(contract.deadline)}</div>
              </Col>
              <Col xs={4}>
                <div className="wm-eyebrow">Started</div>
                <div className="wm-num">{shortDate(contract.created_at)}</div>
              </Col>
            </Row>
          </div>

          {contract.status === 'delivered' && (
            <div className="wm-panel mb-3">
              <h5 className="m-0 mb-1" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-dark)' }}>
                The delivery
              </h5>
              <p className="text-muted mb-3" style={{ fontSize: '0.82rem' }}>
                Delivered {timeAgo(contract.delivered_at)}
              </p>

              <a href={contract.delivery_link} target="_blank" rel="noreferrer" className="d-inline-flex align-items-center gap-1 mb-3">
                <Icon name="external" size={13} /> {contract.delivery_link}
              </a>

              {contract.delivery_note && (
                <p style={{ fontSize: '0.9rem', lineHeight: 1.65 }}>{contract.delivery_note}</p>
              )}

              <div className="d-flex gap-2 pt-3 border-top">
                <Button variant="primary" onClick={() => onApprove(contract.id)}>
                  Approve and release {money(contract.amount)}
                </Button>
                <Button variant="outline-secondary" onClick={() => setShowRevision(true)}>
                  Ask for changes
                </Button>
              </div>
            </div>
          )}

          {contract.status === 'revision' && (
            <div className="wm-panel mb-3">
              <div className="wm-note wm-note--danger m-0">
                <strong>You asked for changes</strong>
                {contract.revision_note}
              </div>
            </div>
          )}

          {contract.status === 'approved' && (
            <Alert variant="success" className="mb-3" style={{ fontSize: '0.88rem' }}>
              Approved {shortDate(contract.approved_at)}. {money(contract.amount)} was released.
            </Alert>
          )}

          <div className="wm-panel">
            <h5 className="m-0 mb-3" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-dark)' }}>
              Messages
            </h5>

            {messages.length === 0 ? (
              <EmptyState icon="chat" title="No messages yet" body={`Say hello to ${contract.freelancer_name}.`} />
            ) : (
              <div className="wm-chat">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`wm-bubble wm-bubble--${message.sender_role === 'client' ? 'you' : 'client'}`}
                  >
                    {message.body}
                    <div className="wm-bubble__meta">
                      {message.sender_role === 'client' ? 'You' : contract.freelancer_name} &middot; {timeAgo(message.sent_at)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Form onSubmit={sendMessage} className="d-flex gap-2 mt-3 pt-3 border-top">
              <Form.Control
                placeholder={`Message ${contract.freelancer_name}`}
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <Button type="submit" variant="primary" disabled={!text.trim()}>
                <Icon name="send" size={15} />
              </Button>
            </Form>
          </div>
        </Col>

        <Col lg={5}>
          <div className="wm-panel mb-3">
            <div className="d-flex align-items-center gap-3 mb-3">
              <Avatar name={contract.freelancer_name} size={46} />
              <div>
                <div style={{ fontWeight: 700, color: 'var(--slate-dark)' }}>{contract.freelancer_name}</div>
                <div className="text-muted" style={{ fontSize: '0.82rem' }}>{contract.freelancer_title}</div>
              </div>
            </div>
            <div className="d-flex gap-2">
              <Pill tone="muted"><Icon name="star" size={11} /> {contract.rating}</Pill>
              <Pill tone={deadlineTone(contract.deadline)}>{deadlineLabel(contract.deadline)}</Pill>
            </div>
          </div>

          <div className="wm-panel">
            <div className="wm-eyebrow">
              {contract.status === 'approved' ? 'Released' : 'Held in escrow'}
            </div>
            <div className="wm-num" style={{ fontSize: '2rem' }}>{money(contract.amount)}</div>
            <p className="text-muted mt-2" style={{ fontSize: '0.83rem' }}>
              {contract.status === 'approved'
                ? 'This contract is finished and the freelancer has been paid.'
                : 'This is still your money. It moves to the freelancer only when you approve the delivery.'}
            </p>

            {isLive(contract) && (
              <Button variant="outline-secondary" size="sm" className="w-100" onClick={() => setShowCancel(true)}>
                Cancel this contract
              </Button>
            )}
          </div>
        </Col>
      </Row>

      <Modal show={showRevision} onHide={() => setShowRevision(false)} centered>
        <Modal.Header closeButton><Modal.Title>Ask for changes</Modal.Title></Modal.Header>
        <Form onSubmit={submitRevision}>
          <Modal.Body>
            {error && <Alert variant="danger" className="py-2" style={{ fontSize: '0.86rem' }}>{error}</Alert>}
            <Form.Group>
              <Form.Label>What needs changing?</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Be specific. The freelancer only sees what you write here."
                value={note}
                onChange={(e) => { setNote(e.target.value); setError(''); }}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setShowRevision(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Send it back</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showCancel} onHide={() => setShowCancel(false)} centered size="sm">
        <Modal.Body className="text-center p-4">
          <h6 style={{ fontWeight: 700, color: 'var(--slate-dark)' }}>Cancel this contract?</h6>
          <p className="text-muted" style={{ fontSize: '0.86rem' }}>
            The escrow is returned to you and the freelancer stops work.
          </p>
          <div className="d-flex gap-2 justify-content-center">
            <Button size="sm" variant="outline-secondary" onClick={() => setShowCancel(false)}>Keep it</Button>
            <Button size="sm" variant="primary" onClick={() => { onCancel(contract.id); setShowCancel(false); }}>
              Cancel contract
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ProjectDetails;

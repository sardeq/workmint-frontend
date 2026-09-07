import { useState } from 'react';
import { Row, Col, Button, Form, Modal, Alert } from 'react-bootstrap';
import Icon from '../../../components/Icon';
import { Pill, Avatar, EmptyState } from '../../../components/Shared';
import {
  money, netOf, shortDate, timeAgo, deadlineLabel, deadlineTone,
  contractRef, contractStatus, freelancerAction, FEE_RATE,
} from '../../../data/helpers';


const ProjectWorkspace = ({ contract, onBack, onDeliver, onSend }) => {
  const [showDeliver, setShowDeliver] = useState(false);
  const [link, setLink] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [text, setText] = useState('');

  const status = contractStatus(contract, 'freelancer');
  const action = freelancerAction(contract);
  const messages = contract.messages || [];

  const submitDelivery = (e) => {
    e.preventDefault();
    if (!link.trim().startsWith('http')) {
      setError('Paste a link the client can open.');
      return;
    }
    onDeliver(contract.id, link.trim(), note.trim());
    setShowDeliver(false);
    setLink('');
    setNote('');
    setError('');
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(contract.id, 'freelancer', text.trim());
    setText('');
  };

  return (
    <>
      <Button variant="link" className="p-0 mb-3" onClick={onBack}>
        <Icon name="back" size={14} /> All contracts
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
                <div className="wm-eyebrow">Contract value</div>
                <div className="wm-num">{money(contract.amount)}</div>
              </Col>
              <Col xs={4}>
                <div className="wm-eyebrow">You receive</div>
                <div className="wm-num">{money(netOf(contract.amount))}</div>
              </Col>
              <Col xs={4}>
                <div className="wm-eyebrow">Deadline</div>
                <div className="wm-num">{shortDate(contract.deadline)}</div>
              </Col>
            </Row>
          </div>

          {contract.status === 'revision' && (
            <div className="wm-panel mb-3">
              <div className="wm-note wm-note--danger m-0">
                <strong>The client asked for changes</strong>
                {contract.revision_note}
              </div>
            </div>
          )}

          {contract.status === 'delivered' && (
            <Alert variant="warning" className="mb-3" style={{ fontSize: '0.88rem' }}>
              Delivered {timeAgo(contract.delivered_at)}. Waiting on {contract.client} to review it.
            </Alert>
          )}

          {contract.status === 'approved' && (
            <Alert variant="success" className="mb-3" style={{ fontSize: '0.88rem' }}>
              Approved {shortDate(contract.approved_at)}. {money(netOf(contract.amount))} was added to your
              balance after the {FEE_RATE * 100}% platform fee.
            </Alert>
          )}

          {contract.delivery_link && (
            <div className="wm-panel mb-3">
              <div className="wm-eyebrow mb-2">What you sent</div>
              <a href={contract.delivery_link} target="_blank" rel="noreferrer" className="d-inline-flex align-items-center gap-1">
                <Icon name="external" size={13} /> {contract.delivery_link}
              </a>
              {contract.delivery_note && (
                <p className="mt-2 mb-0" style={{ fontSize: '0.88rem', lineHeight: 1.6 }}>{contract.delivery_note}</p>
              )}
            </div>
          )}

          <div className="wm-panel">
            <h5 className="m-0 mb-3" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-dark)' }}>
              Messages
            </h5>

            {messages.length === 0 ? (
              <EmptyState icon="chat" title="No messages yet" body={`Say hello to ${contract.client}.`} />
            ) : (
              <div className="wm-chat">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`wm-bubble wm-bubble--${message.sender_role === 'freelancer' ? 'you' : 'client'}`}
                  >
                    {message.body}
                    <div className="wm-bubble__meta">
                      {message.sender_role === 'freelancer' ? 'You' : contract.client} &middot; {timeAgo(message.sent_at)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Form onSubmit={sendMessage} className="d-flex gap-2 mt-3 pt-3 border-top">
              <Form.Control
                placeholder={`Message ${contract.client}`}
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
            <div className="wm-eyebrow">
              {contract.status === 'approved' ? 'Paid' : 'Held in escrow for you'}
            </div>
            <div className="wm-num" style={{ fontSize: '2rem' }}>{money(contract.amount)}</div>
            <p className="text-muted mt-2" style={{ fontSize: '0.83rem' }}>
              The client funded this up front. It is released to you the moment they approve
              your delivery.
            </p>

            {action && (
              <Button variant="primary" className="w-100" onClick={() => setShowDeliver(true)}>
                <Icon name="upload" size={14} className="me-1" /> {action}
              </Button>
            )}
          </div>

          <div className="wm-panel">
            <div className="d-flex align-items-center gap-3 mb-3">
              <Avatar name={contract.client} size={46} tone="slate" />
              <div>
                <div style={{ fontWeight: 700, color: 'var(--slate-dark)' }}>{contract.client}</div>
                <div className="text-muted" style={{ fontSize: '0.82rem' }}>{contract.client_contact}</div>
              </div>
            </div>
            <Pill tone={deadlineTone(contract.deadline)}>{deadlineLabel(contract.deadline)}</Pill>
          </div>
        </Col>
      </Row>

      <Modal show={showDeliver} onHide={() => setShowDeliver(false)} centered>
        <Modal.Header closeButton><Modal.Title>Deliver the work</Modal.Title></Modal.Header>
        <Form onSubmit={submitDelivery}>
          <Modal.Body>
            {error && <Alert variant="danger" className="py-2" style={{ fontSize: '0.86rem' }}>{error}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label>Link to the work</Form.Label>
              <Form.Control
                placeholder="https://github.com/you/project/pull/12"
                value={link}
                onChange={(e) => { setLink(e.target.value); setError(''); }}
              />
              <Form.Text>A repository, a pull request, a staging URL or a shared folder.</Form.Text>
            </Form.Group>
            <Form.Group>
              <Form.Label>Notes for the client (optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="What you built, and anything they should look at first."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setShowDeliver(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Send delivery</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default ProjectWorkspace;

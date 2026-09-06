import { useState } from 'react';
import { Row, Col, Button, Modal, Form, Alert } from 'react-bootstrap';
import Icon from '../../../components/Icon';
import { Pill, EmptyState, Avatar } from '../../../components/Shared';
import { timeAgo } from '../../../data/helpers';

const Approvals = ({ users, onDecide, onGo }) => {
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const pending = users
    .filter((person) => person.status === 'pending')
    .sort((a, b) => new Date(a.joined_at) - new Date(b.joined_at));

  const recentlyDecided = users
    .filter((person) => person.role === 'freelancer' && person.status !== 'pending')
    .slice(0, 6);

  const confirmReject = (e) => {
    e.preventDefault();
    if (reason.trim().length < 10) {
      setError('Say why. The applicant gets this back.');
      return;
    }
    onDecide(rejecting.id, 'suspended', reason.trim());
    setRejecting(null);
    setReason('');
    setError('');
  };

  if (pending.length === 0) {
    return (
      <div className="wm-panel">
        <EmptyState
          icon="check"
          title="No applications waiting"
          body="New freelancer sign-ups land here for screening before they can bid on work."
          action={<Button size="sm" variant="outline-secondary" onClick={() => onGo('Users')}>See all users</Button>}
        />
      </div>
    );
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5 className="m-0" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-dark)' }}>
            {pending.length} waiting on screening
          </h5>
          <p className="m-0 text-muted" style={{ fontSize: '0.83rem' }}>
            Oldest first. Applicants cannot sign in until you approve them.
          </p>
        </div>
      </div>

      <Row className="g-3">
        {pending.map((person) => (
          <Col md={6} key={person.id}>
            <div className="wm-panel h-100 d-flex flex-column">
              <div className="d-flex align-items-center gap-3 mb-3">
                <Avatar name={person.name} size={46} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: 'var(--slate-dark)' }}>{person.name}</div>
                  <div className="text-muted" style={{ fontSize: '0.83rem' }}>{person.title || 'No title given'}</div>
                </div>
                <Pill tone="warn" className="ms-auto">Applied {timeAgo(person.joined_at)}</Pill>
              </div>

              <div className="text-muted mb-2" style={{ fontSize: '0.83rem' }}>{person.email}</div>

              {person.skills && person.skills.length > 0 ? (
                <div className="wm-chips mb-3">
                  {person.skills.map((skill) => <span className="wm-tag" key={skill}>{skill}</span>)}
                </div>
              ) : (
                <div className="mb-3"><Pill tone="danger">No skills listed</Pill></div>
              )}

              {person.pitch && (
                <div className="wm-note wm-note--muted">
                  <strong>Their pitch</strong>
                  {person.pitch}
                </div>
              )}

              <div className="d-flex align-items-center gap-2 mb-3" style={{ fontSize: '0.83rem' }}>
                {person.portfolio_url ? (
                  <a href={person.portfolio_url} target="_blank" rel="noreferrer" className="text-decoration-none">
                    {person.portfolio_url} <Icon name="external" size={12} />
                  </a>
                ) : (
                  <Pill tone="danger">No portfolio link</Pill>
                )}
              </div>

              <div className="mt-auto pt-3 border-top d-flex gap-2">
                <Button
                  size="sm"
                  variant="outline-secondary"
                  className="flex-grow-1"
                  onClick={() => { setRejecting(person); setReason(''); setError(''); }}
                >
                  Reject
                </Button>
                <Button size="sm" variant="primary" className="flex-grow-1" onClick={() => onDecide(person.id, 'active')}>
                  <Icon name="check" size={13} className="me-1" /> Approve
                </Button>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {recentlyDecided.length > 0 && (
        <div className="wm-panel wm-panel--flush mt-3">
          <div className="wm-panel__head">
            <h5 className="m-0" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-dark)' }}>
              Recently decided
            </h5>
          </div>
          {recentlyDecided.map((person) => (
            <div key={person.id} className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom">
              <div className="d-flex align-items-center gap-2">
                <Avatar name={person.name} size={32} />
                <div>
                  <div style={{ fontSize: '0.89rem', fontWeight: 600, color: 'var(--slate-dark)' }}>{person.name}</div>
                  <div className="text-muted" style={{ fontSize: '0.77rem' }}>{person.title}</div>
                </div>
              </div>
              <Pill tone={person.status === 'active' ? 'success' : 'danger'}>
                {person.status === 'active' ? 'Approved' : 'Rejected'}
              </Pill>
            </div>
          ))}
        </div>
      )}

      <Modal show={Boolean(rejecting)} onHide={() => setRejecting(null)} centered>
        {rejecting && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>Reject {rejecting.name}?</Modal.Title>
            </Modal.Header>
            <Form onSubmit={confirmReject}>
              <Modal.Body>
                {error && <Alert variant="danger" className="py-2" style={{ fontSize: '0.85rem' }}>{error}</Alert>}
                <p className="text-muted" style={{ fontSize: '0.87rem' }}>
                  They keep the account but cannot sign in or bid. You can reverse this from the Users tab.
                </p>
                <Form.Group>
                  <Form.Label>Reason</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="No portfolio, generic pitch, skills outside what the platform serves..."
                    value={reason}
                    onChange={(e) => { setReason(e.target.value); setError(''); }}
                  />
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="outline-secondary" onClick={() => setRejecting(null)}>Cancel</Button>
                <Button variant="primary" type="submit">Reject application</Button>
              </Modal.Footer>
            </Form>
          </>
        )}
      </Modal>
    </>
  );
};

export default Approvals;
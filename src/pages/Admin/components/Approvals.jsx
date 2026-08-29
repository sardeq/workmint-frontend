import React, { useState } from 'react';
import { Row, Col, Button, Modal, Form, Alert } from 'react-bootstrap';
import Icon from '../../../components/Icon';
import { Pill, EmptyState, Avatar } from '../../../components/Shared';
import { timeAgo } from '../../../data/freelancerData';

/* Registration puts freelancers here rather than straight onto the platform.
   Approving flips the account to active, which is what lets them sign in. */
const Approvals = ({ users, onDecide, onGo }) => {
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const pending = users
    .filter((u) => u.status === 'pending')
    .sort((a, b) => new Date(a.joinedAt) - new Date(b.joinedAt));

  const recentlyDecided = users
    .filter((u) => u.role === 'freelancer' && u.status !== 'pending')
    .slice(0, 6);

  const confirmReject = (e) => {
    e.preventDefault();
    if (reason.trim().length < 10) return setError('Say why. The applicant gets this back.');
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
        {pending.map((user) => (
          <Col md={6} key={user.id}>
            <div className="wm-panel h-100 d-flex flex-column">
              <div className="d-flex align-items-center gap-3 mb-3">
                <Avatar name={user.name} size={46} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: 'var(--slate-dark)' }}>{user.name}</div>
                  <div className="text-muted" style={{ fontSize: '0.83rem' }}>{user.title || 'No title given'}</div>
                </div>
                <Pill tone="warn" className="ms-auto">Applied {timeAgo(user.joinedAt)}</Pill>
              </div>

              <div className="text-muted mb-2" style={{ fontSize: '0.83rem' }}>{user.email}</div>

              {user.skills && user.skills.length > 0 ? (
                <div className="wm-chips mb-3">
                  {user.skills.map((s) => <span className="wm-tag" key={s}>{s}</span>)}
                </div>
              ) : (
                <div className="mb-3"><Pill tone="danger">No skills listed</Pill></div>
              )}

              {user.pitch && (
                <div className="wm-note wm-note--muted">
                  <strong>Their pitch</strong>
                  {user.pitch}
                </div>
              )}

              <div className="d-flex align-items-center gap-2 mb-3" style={{ fontSize: '0.83rem' }}>
                {user.portfolio ? (
                  <a href={user.portfolio} target="_blank" rel="noreferrer" className="text-decoration-none">
                    {user.portfolio} <Icon name="external" size={12} />
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
                  onClick={() => { setRejecting(user); setReason(''); setError(''); }}
                >
                  Reject
                </Button>
                <Button size="sm" variant="primary" className="flex-grow-1" onClick={() => onDecide(user.id, 'active')}>
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
          {recentlyDecided.map((user) => (
            <div key={user.id} className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom">
              <div className="d-flex align-items-center gap-2">
                <Avatar name={user.name} size={32} />
                <div>
                  <div style={{ fontSize: '0.89rem', fontWeight: 600, color: 'var(--slate-dark)' }}>{user.name}</div>
                  <div className="text-muted" style={{ fontSize: '0.77rem' }}>{user.title}</div>
                </div>
              </div>
              <Pill tone={user.status === 'active' ? 'success' : 'danger'}>
                {user.status === 'active' ? 'Approved' : 'Rejected'}
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
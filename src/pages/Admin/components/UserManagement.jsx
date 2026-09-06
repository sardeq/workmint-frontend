import { useState } from 'react';
import { Table, Button, Form, InputGroup, Modal, Alert, Row, Col } from 'react-bootstrap';
import Icon from '../../../components/Icon';
import { Pill, StatCard, EmptyState, Avatar } from '../../../components/Shared';
import { money, shortDate, orderReleased } from '../../../data/helpers';

const STATUS_TONE = { active: 'success', pending: 'warn', suspended: 'danger' };
const ROLES = ['All', 'client', 'freelancer', 'admin'];

const UserManagement = ({ users, orders, onSetStatus }) => {
  const [role, setRole] = useState('All');
  const [search, setSearch] = useState('');
  const [suspending, setSuspending] = useState(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const volumeFor = (person) => {
    if (person.role === 'client') {
      return orders
        .filter((order) => order.client_id === person.id)
        .reduce((sum, order) => sum + orderReleased(order), 0);
    }
    if (person.role === 'freelancer') {
      return orders
        .filter((order) => order.freelancer_id === person.id)
        .reduce((sum, order) => sum + orderReleased(order), 0);
    }
    return 0;
  };

  const visible = users
    .filter((person) => role === 'All' || person.role === role)
    .filter((person) => {
      const term = search.toLowerCase();
      return (
        person.name.toLowerCase().includes(term) ||
        person.email.toLowerCase().includes(term) ||
        (person.company || '').toLowerCase().includes(term)
      );
    });

  const confirmSuspend = (e) => {
    e.preventDefault();
    if (reason.trim().length < 10) {
      setError('Record why. This shows on the account.');
      return;
    }
    onSetStatus(suspending.id, 'suspended', reason.trim());
    setSuspending(null);
    setReason('');
    setError('');
  };

  return (
    <>
      <Row className="g-3 mb-4">
        <Col sm={3}>
          <StatCard label="Accounts" value={users.length} icon="user" tone="info" sub="All roles" />
        </Col>
        <Col sm={3}>
          <StatCard label="Active" value={users.filter((person) => person.status === 'active').length} icon="check" tone="success" sub="Can sign in" />
        </Col>
        <Col sm={3}>
          <StatCard label="Pending" value={users.filter((person) => person.status === 'pending').length} icon="clock" tone="warn" sub="Awaiting screening" />
        </Col>
        <Col sm={3}>
          <StatCard label="Suspended" value={users.filter((person) => person.status === 'suspended').length} icon="alert" tone="danger" sub="Blocked from signing in" />
        </Col>
      </Row>

      <div className="wm-panel wm-panel--flush">
        <div className="wm-panel__head d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div className="wm-chips">
            {ROLES.map((item) => (
              <button
                key={item}
                type="button"
                className={`wm-chip ${role === item ? 'active' : ''}`}
                onClick={() => setRole(item)}
              >
                {item === 'All' ? 'All' : `${item.charAt(0).toUpperCase()}${item.slice(1)}s`}
                <span className="wm-chip__count">
                  {item === 'All' ? users.length : users.filter((person) => person.role === item).length}
                </span>
              </button>
            ))}
          </div>
          <InputGroup style={{ maxWidth: 280 }}>
            <InputGroup.Text style={{ background: 'transparent', borderRight: 0 }}>
              <Icon name="search" size={14} />
            </InputGroup.Text>
            <Form.Control
              placeholder="Name, email or company"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ borderLeft: 0 }}
            />
          </InputGroup>
        </div>

        {visible.length === 0 ? (
          <EmptyState icon="user" title="No accounts match" body="Try a different role filter or search term." />
        ) : (
          <Table hover responsive className="align-middle">
            <thead>
              <tr>
                <th>Account</th>
                <th>Role</th>
                <th>Volume</th>
                <th>Joined</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((person) => (
                <tr key={person.id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <Avatar name={person.name} size={34} tone={person.role === 'client' ? 'slate' : 'mint'} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: 'var(--slate-dark)' }}>{person.name}</div>
                        <div className="text-muted" style={{ fontSize: '0.78rem' }}>
                          {person.email}{person.company ? ` - ${person.company}` : ''}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ textTransform: 'capitalize', fontSize: '0.86rem' }}>{person.role}</td>
                  <td>
                    <span className="wm-num" style={{ fontSize: '0.9rem' }}>
                      {person.role === 'admin' ? '-' : money(volumeFor(person))}
                    </span>
                  </td>
                  <td className="text-muted" style={{ fontSize: '0.83rem' }}>
                    {shortDate(person.joined_at)}
                  </td>
                  <td>
                    <Pill tone={STATUS_TONE[person.status]}>{person.status}</Pill>
                    {person.suspended_reason && (
                      <div className="text-muted mt-1" style={{ fontSize: '0.74rem', maxWidth: 180 }}>
                        {person.suspended_reason}
                      </div>
                    )}
                  </td>
                  <td className="text-end">
                    {person.role === 'admin' ? (
                      <span className="text-muted" style={{ fontSize: '0.82rem' }}>Protected</span>
                    ) : person.status === 'active' ? (
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() => { setSuspending(person); setReason(''); setError(''); }}
                      >
                        Suspend
                      </Button>
                    ) : (
                      <Button size="sm" variant="primary" onClick={() => onSetStatus(person.id, 'active')}>
                        {person.status === 'pending' ? 'Approve' : 'Reinstate'}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>

      <Modal show={Boolean(suspending)} onHide={() => setSuspending(null)} centered>
        {suspending && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>Suspend {suspending.name}?</Modal.Title>
            </Modal.Header>
            <Form onSubmit={confirmSuspend}>
              <Modal.Body>
                {error && <Alert variant="danger" className="py-2" style={{ fontSize: '0.85rem' }}>{error}</Alert>}
                <p className="text-muted" style={{ fontSize: '0.87rem' }}>
                  They are signed out immediately and cannot sign back in. Money already in escrow is
                  unaffected and still needs a mediator if it is contested.
                </p>
                <Form.Group>
                  <Form.Label>Reason</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Chargebacks, abusive messages, fake portfolio..."
                    value={reason}
                    onChange={(e) => { setReason(e.target.value); setError(''); }}
                  />
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="outline-secondary" onClick={() => setSuspending(null)}>Cancel</Button>
                <Button variant="primary" type="submit">Suspend account</Button>
              </Modal.Footer>
            </Form>
          </>
        )}
      </Modal>
    </>
  );
};

export default UserManagement;
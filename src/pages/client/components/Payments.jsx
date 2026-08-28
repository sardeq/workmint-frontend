import React, { useState } from 'react';
import { Row, Col, Table, Button, Modal, Form, Alert } from 'react-bootstrap';
import Icon from '../../../components/Icon';
import { StatCard, Pill, EmptyState } from '../../../components/Shared';
import {
  money, shortDate, timeAgo, orderStatus, orderTotal, orderEscrow, orderReleased,
  grossWithClientFee, CLIENT_FEE_RATE,
} from '../../../data/freelancerData';

/* The mirror of the freelancer's Earnings screen: same ledger, other side.
   Funding is a charge, every approved milestone is a release.               */
const Payments = ({ orders, methods, onAddMethod, onSetPrimary }) => {
  const [show, setShow] = useState(false);
  const [label, setLabel] = useState('');
  const [kind, setKind] = useState('Card');
  const [error, setError] = useState('');

  const fundings = orders.map((order) => ({
    id: `${order.id}-fund`,
    at: order.startedOn,
    label: `Funded escrow for ${order.project}`,
    sub: `${order.freelancer.name} - ${order.id}`,
    amount: grossWithClientFee(orderTotal(order)),
    kind: 'charge',
  }));

  const releases = orders.flatMap((order) =>
    order.milestones
      .filter((m) => m.status === 'approved')
      .map((m) => ({
        id: `${order.id}-${m.id}`,
        at: m.approvedOn || order.deadline,
        label: `Released "${m.title}"`,
        sub: `${order.freelancer.name} - ${order.id}`,
        amount: m.amount,
        kind: 'release',
      }))
  );

  const ledger = [...fundings, ...releases].sort((a, b) => new Date(b.at) - new Date(a.at));

  const active = orders.filter((o) => orderStatus(o).key !== 'completed');
  const inEscrow = active.reduce((sum, o) => sum + orderEscrow(o), 0);
  const released = orders.reduce((sum, o) => sum + orderReleased(o), 0);
  const committed = orders.reduce((sum, o) => sum + orderTotal(o), 0);
  const fees = Math.round(committed * CLIENT_FEE_RATE);

  const handleAdd = (e) => {
    e.preventDefault();
    if (label.trim().length < 4) return setError('Give the method a name you will recognise later.');
    onAddMethod(label.trim(), kind);
    setLabel('');
    setError('');
    setShow(false);
  };

  return (
    <>
      <Row className="g-3 mb-4">
        <Col sm={6} xl={3}>
          <StatCard label="Held in escrow" value={money(inEscrow)} icon="lock" tone="warn" sub="Refundable until approved" />
        </Col>
        <Col sm={6} xl={3}>
          <StatCard label="Released" value={money(released)} icon="check" tone="success" sub="Paid for approved work" />
        </Col>
        <Col sm={6} xl={3}>
          <StatCard label="Total committed" value={money(committed)} icon="dollar" tone="info" sub="Across every contract" />
        </Col>
        <Col sm={6} xl={3}>
          <StatCard label="Escrow fees" value={money(fees)} icon="trend" tone="muted" sub={`${CLIENT_FEE_RATE * 100}% on funding`} />
        </Col>
      </Row>

      <Row className="g-3">
        <Col lg={4}>
          <div className="wm-panel mb-3">
            <div className="wm-eyebrow">Currently in escrow</div>
            <div className="wm-num" style={{ fontSize: '2rem' }}>{money(inEscrow)}</div>
            <p className="text-muted mt-2 mb-0" style={{ fontSize: '0.83rem' }}>
              This is still your money. It moves to the freelancer only when you approve a milestone,
              and comes back to you if a contract is cancelled before delivery.
            </p>
          </div>

          <div className="wm-panel wm-panel--flush">
            <div className="wm-panel__head d-flex justify-content-between align-items-center">
              <h5 className="m-0" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-dark)' }}>
                Payment methods
              </h5>
              <Button size="sm" variant="outline-secondary" onClick={() => setShow(true)}>
                <Icon name="plus" size={13} /> Add
              </Button>
            </div>

            {methods.length === 0 ? (
              <EmptyState icon="wallet" title="No payment methods" body="Add one before you hire." />
            ) : (
              methods.map((method) => (
                <div key={method.id} className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom">
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--slate-dark)' }}>{method.label}</div>
                    <div className="text-muted" style={{ fontSize: '0.78rem' }}>{method.kind}</div>
                  </div>
                  {method.primary ? (
                    <Pill tone="success">Primary</Pill>
                  ) : (
                    <Button size="sm" variant="link" className="p-0" onClick={() => onSetPrimary(method.id)}>
                      Make primary
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </Col>

        <Col lg={8}>
          <div className="wm-panel wm-panel--flush">
            <div className="wm-panel__head">
              <h5 className="m-0" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-dark)' }}>Transactions</h5>
              <p className="m-0 text-muted" style={{ fontSize: '0.82rem' }}>Every funding and every release</p>
            </div>

            {ledger.length === 0 ? (
              <EmptyState icon="wallet" title="Nothing here yet" body="Your first hire shows up as an escrow funding." />
            ) : (
              <Table hover responsive className="align-middle">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Date</th>
                    <th className="text-end">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <span className={`wm-stat__icon wm-stat__icon--${row.kind === 'charge' ? 'warn' : 'success'}`}>
                            <Icon name={row.kind === 'charge' ? 'lock' : 'check'} size={13} />
                          </span>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--slate-dark)', fontSize: '0.9rem' }}>{row.label}</div>
                            <div className="text-muted" style={{ fontSize: '0.77rem' }}>{row.sub}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-muted" style={{ fontSize: '0.83rem' }}>
                        {shortDate(row.at)}
                        <div style={{ fontSize: '0.73rem' }}>{timeAgo(row.at)}</div>
                      </td>
                      <td className="text-end wm-num" style={{ color: row.kind === 'charge' ? 'var(--slate-dark)' : 'var(--mint-deep)' }}>
                        {row.kind === 'charge' ? money(row.amount) : `-${money(row.amount)}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </div>
        </Col>
      </Row>

      <Modal show={show} onHide={() => setShow(false)} centered>
        <Modal.Header closeButton><Modal.Title>Add a payment method</Modal.Title></Modal.Header>
        <Form onSubmit={handleAdd}>
          <Modal.Body>
            {error && <Alert variant="danger" className="py-2" style={{ fontSize: '0.86rem' }}>{error}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label>Type</Form.Label>
              <Form.Select value={kind} onChange={(e) => setKind(e.target.value)}>
                <option>Card</option>
                <option>Bank</option>
                <option>PayPal</option>
              </Form.Select>
            </Form.Group>
            <Form.Group>
              <Form.Label>Label</Form.Label>
              <Form.Control
                placeholder="Visa ending 1234"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
              <Form.Text>A name for your own reference. Card details are handled by the payment provider.</Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setShow(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Add method</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default Payments;
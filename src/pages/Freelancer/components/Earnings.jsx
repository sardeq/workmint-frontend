import { useState } from 'react';
import { Row, Col, Button, Table, Modal, Form, Alert } from 'react-bootstrap';
import Icon from '../../../components/Icon';
import { StatCard, Pill, EmptyState } from '../../../components/Shared';
import {
  money, num, netOf, shortDate, timeAgo, orderRef,
  orderStatus, orderEscrow, milestonesOf, FEE_RATE,
} from '../../../data/helpers';

const Earnings = ({ orders, withdrawals, onWithdraw }) => {
  const [show, setShow] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Bank transfer');
  const [error, setError] = useState('');

  const credits = orders.flatMap((order) =>
    milestonesOf(order)
      .filter((milestone) => milestone.status === 'approved')
      .map((milestone) => ({
        id: `C-${order.id}-${milestone.id}`,
        at: milestone.approved_on || order.deadline,
        label: milestone.title,
        sub: `${order.client} - ${orderRef(order)}`,
        gross: num(milestone.amount),
        net: netOf(milestone.amount),
        kind: 'credit',
      }))
  );

  const debits = withdrawals.map((withdrawal) => ({
    id: `D-${withdrawal.id}`,
    at: withdrawal.at,
    label: `Withdrawal to ${withdrawal.method.toLowerCase()}`,
    sub: withdrawal.status,
    gross: null,
    net: -num(withdrawal.amount),
    kind: 'debit',
  }));

  const ledger = [...credits, ...debits].sort((a, b) => new Date(b.at) - new Date(a.at));

  const lifetimeNet = credits.reduce((sum, row) => sum + row.net, 0);
  const paidOut = withdrawals.reduce((sum, row) => sum + num(row.amount), 0);
  const available = lifetimeNet - paidOut;
  const feesPaid = credits.reduce((sum, row) => sum + (row.gross - row.net), 0);

  const inEscrow = orders
    .filter((order) => orderStatus(order).key !== 'completed')
    .reduce((sum, order) => sum + orderEscrow(order), 0);

  const months = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i, 1);
    months.push({
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: date.toLocaleDateString('en-US', { month: 'short' }),
      total: 0,
    });
  }

  credits.forEach((credit) => {
    const date = new Date(credit.at);
    const bucket = months.find((month) => month.key === `${date.getFullYear()}-${date.getMonth()}`);
    if (bucket) bucket.total += credit.net;
  });

  const peak = Math.max(...months.map((month) => month.total), 1);

  const handleWithdraw = (e) => {
    e.preventDefault();
    const value = Number(amount);

    if (!value || value <= 0) {
      setError('Enter an amount.');
      return;
    }
    if (value > available) {
      setError(`You can withdraw up to ${money(available)} right now.`);
      return;
    }

    onWithdraw(value, method);
    setShow(false);
    setAmount('');
    setError('');
  };

  return (
    <>
      <Row className="g-3 mb-4">
        <Col sm={6} xl={3}>
          <StatCard label="Available to withdraw" value={money(available)} icon="wallet" tone="success" sub="Cleared and yours" />
        </Col>
        <Col sm={6} xl={3}>
          <StatCard label="Held in escrow" value={money(inEscrow)} icon="lock" tone="warn" sub="Releases on approval" />
        </Col>
        <Col sm={6} xl={3}>
          <StatCard label="Lifetime earnings" value={money(lifetimeNet)} icon="trend" tone="info" sub={`${money(feesPaid)} in fees`} />
        </Col>
        <Col sm={6} xl={3}>
          <StatCard label="Paid out" value={money(paidOut)} icon="dollar" tone="muted" sub={`${withdrawals.length} withdrawals`} />
        </Col>
      </Row>

      <Row className="g-3">
        <Col lg={4}>
          <div className="wm-panel mb-3">
            <div className="wm-eyebrow">Ready to withdraw</div>
            <div className="wm-num" style={{ fontSize: '2rem' }}>{money(available)}</div>
            <p className="text-muted mt-2" style={{ fontSize: '0.83rem' }}>
              Funds clear as soon as a client approves a milestone. Workmint keeps {FEE_RATE * 100}%.
            </p>
            <Button variant="primary" className="w-100" disabled={available <= 0} onClick={() => setShow(true)}>
              Withdraw funds
            </Button>
          </div>

          <div className="wm-panel">
            <div className="wm-eyebrow mb-3">Released per month</div>
            <div className="wm-bars">
              {months.map((month) => (
                <div className="wm-bars__col" key={month.key} title={money(month.total)}>
                  <div className="wm-bars__bar" style={{ height: `${Math.max((month.total / peak) * 100, 3)}%` }} />
                  <span className="wm-bars__label">{month.label}</span>
                </div>
              ))}
            </div>
          </div>
        </Col>

        <Col lg={8}>
          <div className="wm-panel wm-panel--flush">
            <div className="wm-panel__head">
              <h5 className="m-0" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-dark)' }}>Transactions</h5>
              <p className="m-0 text-muted" style={{ fontSize: '0.82rem' }}>Every milestone release and payout</p>
            </div>

            {ledger.length === 0 ? (
              <EmptyState icon="wallet" title="Nothing here yet" body="Your first approved milestone shows up as a credit." />
            ) : (
              <Table hover responsive className="align-middle">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Date</th>
                    <th className="text-end">Gross</th>
                    <th className="text-end">Fee</th>
                    <th className="text-end">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <span className={`wm-stat__icon wm-stat__icon--${row.kind === 'credit' ? 'success' : 'muted'}`}>
                            <Icon name={row.kind === 'credit' ? 'check' : 'upload'} size={13} />
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
                      <td className="text-end wm-num" style={{ fontWeight: 500 }}>
                        {row.gross === null ? '-' : money(row.gross)}
                      </td>
                      <td className="text-end text-muted" style={{ fontSize: '0.85rem' }}>
                        {row.gross === null ? '-' : `-${money(row.gross - row.net)}`}
                      </td>
                      <td className="text-end wm-num" style={{ color: row.net < 0 ? 'var(--text-muted)' : 'var(--mint-deep)' }}>
                        {row.net < 0 ? `-${money(Math.abs(row.net))}` : `+${money(row.net)}`}
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
        <Modal.Header closeButton><Modal.Title>Withdraw funds</Modal.Title></Modal.Header>
        <Form onSubmit={handleWithdraw}>
          <Modal.Body>
            {error && <Alert variant="danger" className="py-2" style={{ fontSize: '0.86rem' }}>{error}</Alert>}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="text-muted" style={{ fontSize: '0.88rem' }}>Available</span>
              <span className="wm-num">{money(available)}</span>
            </div>
            <Form.Group className="mb-3">
              <Form.Label>Amount</Form.Label>
              <Form.Control
                type="number"
                min="1"
                max={available}
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <Button variant="link" size="sm" className="p-0 mt-1" onClick={() => setAmount(String(available))}>
                Withdraw everything
              </Button>
            </Form.Group>
            <Form.Group>
              <Form.Label>Send to</Form.Label>
              <Form.Select value={method} onChange={(e) => setMethod(e.target.value)}>
                <option>Bank transfer</option>
                <option>PayPal</option>
                <option>Wise</option>
              </Form.Select>
            </Form.Group>
            <div className="mt-3"><Pill tone="muted">Arrives in 2 to 3 business days</Pill></div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setShow(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Confirm withdrawal</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default Earnings;

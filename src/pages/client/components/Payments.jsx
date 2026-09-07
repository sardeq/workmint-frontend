import { useState, useEffect } from 'react';
import { Row, Col, Table, Button, Form, Alert } from 'react-bootstrap';
import Icon from '../../../components/Icon';
import { StatCard, Pill, EmptyState } from '../../../components/Shared';
import { getRates, CURRENCIES } from '../../../api/exchange';
import { money, num, shortDate, timeAgo, CLIENT_FEE_RATE } from '../../../data/helpers';

const BLANK = { note: '', amount: '', currency: 'JOD', methodId: '' };

const Payments = ({ payments, methods, onPay, onAddMethod, onRemoveMethod }) => {
  const [form, setForm] = useState(BLANK);
  const [error, setError] = useState('');

  const [label, setLabel] = useState('');
  const [kind, setKind] = useState('Card');

  const [rates, setRates] = useState(null);
  const [ratesError, setRatesError] = useState('');

  useEffect(() => {
    getRates()
      .then((data) => setRates(data))
      .catch(() => setRatesError('Live exchange rates are unavailable, so payments cannot be taken right now.'));
  }, []);

  const set = (changes) => setForm({ ...form, ...changes });

  const amount = num(form.amount);
  const fee = amount * CLIENT_FEE_RATE;
  const total = amount + fee;

  const rate = rates ? rates[form.currency] : null;
  const converted = rate ? total * rate : null;

  const handlePay = (e) => {
    e.preventDefault();

    if (form.note.trim().length < 4) {
      setError('Say what this payment is for.');
      return;
    }
    if (amount <= 0) {
      setError('Enter an amount above zero.');
      return;
    }
    if (!rate) {
      setError('The exchange rate has not loaded, so the total cannot be confirmed.');
      return;
    }

    onPay({
      note: form.note.trim(),
      amount_usd: Number(total.toFixed(2)),
      currency: form.currency,
      rate,
      amount_converted: Number(converted.toFixed(2)),
      method_id: form.methodId ? Number(form.methodId) : null,
    });

    setForm(BLANK);
    setError('');
  };

  const handleAddMethod = (e) => {
    e.preventDefault();
    if (label.trim().length < 4) return;
    onAddMethod(label.trim(), kind);
    setLabel('');
  };

  const totalPaid = payments.reduce((sum, payment) => sum + num(payment.amount_usd), 0);

  return (
    <>
      <Row className="g-3 mb-4">
        <Col sm={4}>
          <StatCard label="Total paid" value={money(totalPaid)} icon="dollar" tone="success" sub="Across every payment" />
        </Col>
        <Col sm={4}>
          <StatCard label="Payments made" value={payments.length} icon="wallet" tone="info" sub="On this account" />
        </Col>
        <Col sm={4}>
          <StatCard label="Saved methods" value={methods.length} icon="lock" tone="muted" sub="Cards and accounts" />
        </Col>
      </Row>

      <Row className="g-3">
        <Col lg={5}>
          <div className="wm-panel mb-3">
            <h5 className="m-0 mb-1" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-dark)' }}>
              Make a payment
            </h5>
            <p className="text-muted mb-3" style={{ fontSize: '0.83rem' }}>
              Enter the amount in USD. The total is converted with today’s live rate before
              you confirm, and the rate is stored on the receipt.
            </p>

            {ratesError && (
              <Alert variant="warning" className="py-2" style={{ fontSize: '0.85rem' }}>{ratesError}</Alert>
            )}
            {error && (
              <Alert variant="danger" className="py-2" style={{ fontSize: '0.85rem' }}>{error}</Alert>
            )}

            <Form onSubmit={handlePay}>
              <Form.Group className="mb-3">
                <Form.Label>What is this for?</Form.Label>
                <Form.Control
                  placeholder="Escrow funding for the admin panel"
                  value={form.note}
                  onChange={(e) => set({ note: e.target.value })}
                />
              </Form.Group>

              <Row className="g-2 mb-3">
                <Col xs={7}>
                  <Form.Group>
                    <Form.Label>Amount (USD)</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      step="50"
                      placeholder="1500"
                      value={form.amount}
                      onChange={(e) => set({ amount: e.target.value })}
                    />
                  </Form.Group>
                </Col>
                <Col xs={5}>
                  <Form.Group>
                    <Form.Label>Charge in</Form.Label>
                    <Form.Select value={form.currency} onChange={(e) => set({ currency: e.target.value })}>
                      {CURRENCIES.map((code) => (
                        <option value={code} key={code}>{code}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Pay with</Form.Label>
                <Form.Select value={form.methodId} onChange={(e) => set({ methodId: e.target.value })}>
                  <option value="">No saved method</option>
                  {methods.map((method) => (
                    <option value={method.id} key={method.id}>
                      {method.label} ({method.kind})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <div className="wm-panel mb-3" style={{ background: '#f8fafc' }}>
                <div className="d-flex justify-content-between py-1" style={{ fontSize: '0.87rem' }}>
                  <span className="text-muted">Amount</span>
                  <span className="wm-num">{money(amount)}</span>
                </div>
                <div className="d-flex justify-content-between py-1" style={{ fontSize: '0.87rem' }}>
                  <span className="text-muted">Escrow fee ({CLIENT_FEE_RATE * 100}%)</span>
                  <span className="wm-num">+{money(fee)}</span>
                </div>
                <div className="d-flex justify-content-between py-2 mt-1 border-top" style={{ fontSize: '0.92rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--slate-dark)' }}>Charged in {form.currency}</span>
                  <span className="wm-num">
                    {converted === null
                      ? '-'
                      : `${converted.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${form.currency}`}
                  </span>
                </div>
                <div className="text-muted" style={{ fontSize: '0.78rem' }}>
                  {rate ? `1 USD = ${rate} ${form.currency}` : 'Loading today’s rate...'}
                </div>
              </div>

              <Button type="submit" variant="primary" className="w-100" disabled={!rate}>
                Pay {converted === null ? '' : `${converted.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${form.currency}`}
              </Button>
            </Form>
          </div>

          <div className="wm-panel">
            <h5 className="m-0 mb-3" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-dark)' }}>
              Saved methods
            </h5>

            {methods.length === 0 ? (
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>Nothing saved yet.</p>
            ) : (
              methods.map((method) => (
                <div key={method.id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--slate-dark)' }}>{method.label}</div>
                    <div className="text-muted" style={{ fontSize: '0.78rem' }}>{method.kind}</div>
                  </div>
                  <Button size="sm" variant="link" className="p-0 text-danger" onClick={() => onRemoveMethod(method.id)}>
                    <Icon name="trash" size={14} />
                  </Button>
                </div>
              ))
            )}

            <Form onSubmit={handleAddMethod} className="d-flex gap-2 mt-3">
              <Form.Select
                value={kind}
                onChange={(e) => setKind(e.target.value)}
                style={{ maxWidth: 110 }}
              >
                <option>Card</option>
                <option>Bank</option>
                <option>PayPal</option>
              </Form.Select>
              <Form.Control
                placeholder="Visa ending 1234"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
              <Button type="submit" variant="outline-secondary">Add</Button>
            </Form>
          </div>
        </Col>

        <Col lg={7}>
          <div className="wm-panel wm-panel--flush">
            <div className="wm-panel__head">
              <h5 className="m-0" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-dark)' }}>
                Payment history
              </h5>
              <p className="m-0 text-muted" style={{ fontSize: '0.82rem' }}>
                Each row keeps the exchange rate it was charged at
              </p>
            </div>

            {payments.length === 0 ? (
              <EmptyState icon="wallet" title="No payments yet" body="Your first payment appears here." />
            ) : (
              <Table hover responsive className="align-middle">
                <thead>
                  <tr>
                    <th>Payment</th>
                    <th>Date</th>
                    <th className="text-end">USD</th>
                    <th className="text-end">Charged</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--slate-dark)', fontSize: '0.9rem' }}>
                          {payment.note}
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.77rem' }}>
                          {payment.method_label || 'No saved method'}
                        </div>
                      </td>
                      <td className="text-muted" style={{ fontSize: '0.83rem' }}>
                        {shortDate(payment.paid_at)}
                        <div style={{ fontSize: '0.73rem' }}>{timeAgo(payment.paid_at)}</div>
                      </td>
                      <td className="text-end wm-num">{money(payment.amount_usd)}</td>
                      <td className="text-end">
                        <span className="wm-num">
                          {num(payment.amount_converted).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                        </span>
                        <div><Pill tone="muted">{payment.currency} @ {num(payment.rate)}</Pill></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </div>
        </Col>
      </Row>
    </>
  );
};

export default Payments;

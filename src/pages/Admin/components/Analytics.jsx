import { useState, useEffect } from 'react';
import { Row, Col, Form, Table } from 'react-bootstrap';
import axios from 'axios';
import { StatCard, Pill, EmptyState } from '../../../components/Shared';
import {
  money, num, FEE_RATE, orderStatus, orderTotal, orderEscrow, orderReleased, milestonesOf,
} from '../../../data/helpers';

const CURRENCIES = [
  { code: 'USD', label: 'US dollar', fallback: 1 },
  { code: 'JOD', label: 'Jordanian dinar', fallback: 0.709 },
  { code: 'EUR', label: 'Euro', fallback: 0.92 },
  { code: 'GBP', label: 'British pound', fallback: 0.79 },
];

const Analytics = ({ orders, users, disputes, jobs }) => {
  const [currency, setCurrency] = useState('USD');
  const [rates, setRates] = useState({ USD: 1 });
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let cancelled = false;

    axios
      .get('https://open.er-api.com/v6/latest/USD')
      .then((response) => {
        if (cancelled) return;
        setRates(response.data.rates);
        setStatus('live');
      })
      .catch(() => {
        if (cancelled) return;
        const fallback = {};
        CURRENCIES.forEach((item) => { fallback[item.code] = item.fallback; });
        setRates(fallback);
        setStatus('offline');
      });

    return () => { cancelled = true; };
  }, []);

  const rate = rates[currency] || 1;

  const show = (usd) =>
    currency === 'USD'
      ? money(usd)
      : `${(usd * rate).toLocaleString('en-US', { maximumFractionDigits: 0 })} ${currency}`;

  const gmv = orders.reduce((sum, order) => sum + orderTotal(order), 0);
  const released = orders.reduce((sum, order) => sum + orderReleased(order), 0);
  const escrow = orders.reduce((sum, order) => sum + orderEscrow(order), 0);
  const fees = Math.round(released * FEE_RATE);
  const avgContract = orders.length === 0 ? 0 : Math.round(gmv / orders.length);
  const disputeRate = orders.length === 0 ? 0 : Math.round((disputes.length / orders.length) * 100);

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

  orders.forEach((order) => {
    milestonesOf(order)
      .filter((milestone) => milestone.status === 'approved')
      .forEach((milestone) => {
        const date = new Date(milestone.approved_on || order.deadline);
        const bucket = months.find((month) => month.key === `${date.getFullYear()}-${date.getMonth()}`);
        if (bucket) bucket.total += num(milestone.amount);
      });
  });

  const peak = Math.max(...months.map((month) => month.total), 1);

  const addTo = (list, name, amount) => {
    const found = list.find((row) => row.name === name);
    if (found) {
      found.amount += amount;
    } else {
      list.push({ name, amount });
    }
  };

  const freelancerTotals = [];
  const clientTotals = [];

  orders.forEach((order) => {
    const earned = orderReleased(order);
    addTo(freelancerTotals, order.freelancer_name, earned);
    addTo(clientTotals, order.client, earned);
  });

  freelancerTotals.sort((a, b) => b.amount - a.amount);
  clientTotals.sort((a, b) => b.amount - a.amount);
  const topFreelancers = freelancerTotals.slice(0, 5);
  const topClients = clientTotals.slice(0, 5);

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <h5 className="m-0" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-dark)' }}>
            Platform totals
          </h5>
          <p className="m-0 text-muted" style={{ fontSize: '0.82rem' }}>
            {status === 'live'
              ? `Converted at today's rate: 1 USD = ${rate} ${currency}.`
              : status === 'offline'
                ? 'Live rates unavailable, using stored rates.'
                : 'Fetching exchange rates...'}
          </p>
        </div>
        <Form.Select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          style={{ maxWidth: 220 }}
        >
          {CURRENCIES.map((item) => <option value={item.code} key={item.code}>{item.code} - {item.label}</option>)}
        </Form.Select>
      </div>

      <Row className="g-3 mb-4">
        <Col sm={6} xl={3}>
          <StatCard label="Contract volume" value={show(gmv)} icon="dollar" tone="info" sub={`${orders.length} contracts`} />
        </Col>
        <Col sm={6} xl={3}>
          <StatCard label="Released" value={show(released)} icon="check" tone="success" sub={`${show(escrow)} still held`} />
        </Col>
        <Col sm={6} xl={3}>
          <StatCard label={`Platform fees (${FEE_RATE * 100}%)`} value={show(fees)} icon="trend" tone="success" sub="Earned on released work" />
        </Col>
        <Col sm={6} xl={3}>
          <StatCard
            label="Dispute rate" icon="alert" tone={disputeRate > 20 ? 'danger' : 'muted'}
            value={`${disputeRate}%`}
            sub={`${disputes.length} cases on ${orders.length} contracts`}
          />
        </Col>
      </Row>

      <Row className="g-3">
        <Col lg={7}>
          <div className="wm-panel mb-3">
            <div className="wm-eyebrow mb-3">Released per month</div>
            <div className="wm-bars">
              {months.map((month) => (
                <div className="wm-bars__col" key={month.key} title={show(month.total)}>
                  <div className="wm-bars__bar" style={{ height: `${Math.max((month.total / peak) * 100, 3)}%` }} />
                  <span className="wm-bars__label">{month.label}</span>
                </div>
              ))}
            </div>
            <div className="d-flex justify-content-between mt-3 pt-3 border-top" style={{ fontSize: '0.85rem' }}>
              <span className="text-muted">Best month</span>
              <span className="wm-num">{show(peak)}</span>
            </div>
          </div>

          <div className="wm-panel">
            <div className="wm-eyebrow mb-3">Marketplace funnel</div>
            {[
              { label: 'Open listings', value: jobs.length },
              { label: 'Proposals sent', value: orders.length + jobs.reduce((sum, job) => sum + num(job.proposal_count), 0) },
              { label: 'Contracts started', value: orders.length },
              { label: 'Contracts completed', value: orders.filter((order) => orderStatus(order).key === 'completed').length },
            ].map((step, index, all) => (
              <div key={step.label} className="d-flex align-items-center gap-3 py-2">
                <span className="text-muted" style={{ fontSize: '0.86rem', minWidth: 150 }}>{step.label}</span>
                <div className="flex-grow-1">
                  <div className="wm-escrow-bar">
                    <div
                      className="wm-escrow-bar__fill"
                      style={{ width: `${Math.max((step.value / Math.max(all[1].value, 1)) * 100, 2)}%` }}
                    />
                  </div>
                </div>
                <span className="wm-num" style={{ fontSize: '0.9rem', minWidth: 30, textAlign: 'right' }}>{step.value}</span>
              </div>
            ))}
          </div>
        </Col>

        <Col lg={5}>
          <div className="wm-panel wm-panel--flush mb-3">
            <div className="wm-panel__head">
              <h5 className="m-0" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-dark)' }}>
                Top earning freelancers
              </h5>
            </div>
            {topFreelancers.length === 0 ? (
              <EmptyState icon="trend" title="No earnings yet" body="Nothing has been released on the platform." />
            ) : (
              <Table hover responsive className="align-middle">
                <tbody>
                  {topFreelancers.map((row, index) => (
                    <tr key={row.name}>
                      <td style={{ width: 30 }} className="text-muted">{index + 1}</td>
                      <td style={{ fontWeight: 600, color: 'var(--slate-dark)', fontSize: '0.89rem' }}>{row.name}</td>
                      <td className="text-end wm-num" style={{ fontSize: '0.9rem' }}>{show(row.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </div>

          <div className="wm-panel wm-panel--flush mb-3">
            <div className="wm-panel__head">
              <h5 className="m-0" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-dark)' }}>
                Top spending clients
              </h5>
            </div>
            <Table hover responsive className="align-middle">
              <tbody>
                {topClients.map((row, index) => (
                  <tr key={row.name}>
                    <td style={{ width: 30 }} className="text-muted">{index + 1}</td>
                    <td style={{ fontWeight: 600, color: 'var(--slate-dark)', fontSize: '0.89rem' }}>{row.name}</td>
                    <td className="text-end wm-num" style={{ fontSize: '0.9rem' }}>{show(row.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          <div className="wm-panel">
            <div className="wm-eyebrow mb-2">Accounts</div>
            <div className="d-flex justify-content-between py-1" style={{ fontSize: '0.88rem' }}>
              <span className="text-muted">Clients</span>
              <span className="wm-num">{users.filter((person) => person.role === 'client').length}</span>
            </div>
            <div className="d-flex justify-content-between py-1" style={{ fontSize: '0.88rem' }}>
              <span className="text-muted">Freelancers</span>
              <span className="wm-num">{users.filter((person) => person.role === 'freelancer').length}</span>
            </div>
            <div className="d-flex justify-content-between py-1" style={{ fontSize: '0.88rem' }}>
              <span className="text-muted">Average contract</span>
              <span className="wm-num">{show(avgContract)}</span>
            </div>
            <div className="mt-2">
              <Pill tone={status === 'live' ? 'success' : status === 'offline' ? 'warn' : 'muted'}>
                {status === 'live' ? 'Live rates' : status === 'offline' ? 'Stored rates' : 'Loading rates'}
              </Pill>
            </div>
          </div>
        </Col>
      </Row>
    </>
  );
};

export default Analytics;
import { useState } from 'react';
import { Table, Button, Form, InputGroup, Modal, Row, Col } from 'react-bootstrap';
import Icon from '../../../components/Icon';
import { Pill, StatCard, EmptyState } from '../../../components/Shared';
import {
  money, timeAgo, shortDate, deadlineLabel, deadlineTone, orderRef, milestonesOf,
  orderStatus, orderTotal, orderEscrow, orderReleased,
} from '../../../data/helpers';

const VIEWS = [
  { key: 'jobs', label: 'Open listings' },
  { key: 'contracts', label: 'Live contracts' },
];

const JobManagement = ({ jobs, orders, proposals, onCloseJob }) => {
  const [view, setView] = useState('jobs');
  const [search, setSearch] = useState('');
  const [removing, setRemoving] = useState(null);

  const active = orders.filter((order) => orderStatus(order).key !== 'completed');
  const gmv = orders.reduce((sum, order) => sum + orderTotal(order), 0);

  const matches = (text) => String(text).toLowerCase().includes(search.toLowerCase());

  const visibleJobs = jobs.filter((job) => matches(job.title) || matches(job.client));
  const visibleOrders = orders.filter(
    (order) =>
      matches(order.project) ||
      matches(order.client) ||
      matches(order.freelancer_name) ||
      matches(orderRef(order))
  );

  return (
    <>
      <Row className="g-3 mb-4">
        <Col sm={3}>
          <StatCard label="Open listings" value={jobs.length} icon="search" tone="info" sub="Visible in the marketplace" />
        </Col>
        <Col sm={3}>
          <StatCard label="Live contracts" value={active.length} icon="briefcase" tone="warn" sub={`${orders.length} all time`} />
        </Col>
        <Col sm={3}>
          <StatCard label="Contract volume" value={money(gmv)} icon="dollar" tone="success" sub="Total value ever funded" />
        </Col>
        <Col sm={3}>
          <StatCard
            label="Live proposals" icon="send" tone="muted"
            value={proposals.filter((p) => p.status === 'Pending').length}
            sub="Awaiting a client decision"
          />
        </Col>
      </Row>

      <div className="wm-panel wm-panel--flush">
        <div className="wm-panel__head d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div className="wm-chips">
            {VIEWS.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`wm-chip ${view === item.key ? 'active' : ''}`}
                onClick={() => setView(item.key)}
              >
                {item.label}
                <span className="wm-chip__count">{item.key === 'jobs' ? jobs.length : orders.length}</span>
              </button>
            ))}
          </div>
          <InputGroup style={{ maxWidth: 280 }}>
            <InputGroup.Text style={{ background: 'transparent', borderRight: 0 }}>
              <Icon name="search" size={14} />
            </InputGroup.Text>
            <Form.Control
              placeholder={view === 'jobs' ? 'Title or client' : 'Project, party or ID'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ borderLeft: 0 }}
            />
          </InputGroup>
        </div>

        {view === 'jobs' ? (
          visibleJobs.length === 0 ? (
            <EmptyState icon="search" title="No listings" body="Nothing is open on the marketplace right now." />
          ) : (
            <Table hover responsive className="align-middle">
              <thead>
                <tr>
                  <th>Listing</th>
                  <th>Client</th>
                  <th>Budget</th>
                  <th>Proposals</th>
                  <th>Posted</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleJobs.map((job) => {
                  const bids = proposals.filter((p) => p.job_id === job.id).length;
                  return (
                    <tr key={job.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--slate-dark)' }}>{job.title}</div>
                        <div className="wm-chips mt-1">
                          {job.skills.slice(0, 3).map((skill) => <span className="wm-tag" key={skill}>{skill}</span>)}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.87rem' }}>{job.client}</div>
                        <div className="text-muted" style={{ fontSize: '0.77rem' }}>
                          <Icon name="star" size={11} /> {job.client_rating}
                        </div>
                      </td>
                      <td>
                        <span className="wm-num">{money(job.budget)}</span>
                        <div className="text-muted" style={{ fontSize: '0.77rem' }}>{job.days} days</div>
                      </td>
                      <td><Pill tone={bids > 0 ? 'info' : 'muted'}>{bids}</Pill></td>
                      <td className="text-muted" style={{ fontSize: '0.83rem' }}>
                        {timeAgo(job.created_at)}
                      </td>
                      <td className="text-end">
                        <Button size="sm" variant="outline-secondary" onClick={() => setRemoving(job)}>
                          Remove
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )
        ) : visibleOrders.length === 0 ? (
          <EmptyState icon="briefcase" title="No contracts" body="Nothing matches that search." />
        ) : (
          <Table hover responsive className="align-middle">
            <thead>
              <tr>
                <th>Contract</th>
                <th>Parties</th>
                <th>Escrow</th>
                <th>Released</th>
                <th>Deadline</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {visibleOrders.map((order) => {
                const status = orderStatus(order);
                const done = status.key === 'completed';
                return (
                  <tr key={order.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--slate-dark)' }}>{order.project}</div>
                      <div className="text-muted" style={{ fontSize: '0.78rem' }}>
                        {orderRef(order)} &middot; {milestonesOf(order).length} milestones
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>{order.client}</div>
                      <div className="text-muted" style={{ fontSize: '0.78rem' }}>{order.freelancer_name}</div>
                    </td>
                    <td className="wm-num" style={{ color: orderEscrow(order) > 0 ? 'var(--amber)' : 'inherit' }}>
                      {money(orderEscrow(order))}
                    </td>
                    <td className="wm-num">{money(orderReleased(order))}</td>
                    <td>
                      {done ? (
                        <span className="text-muted" style={{ fontSize: '0.83rem' }}>{shortDate(order.deadline)}</span>
                      ) : (
                        <Pill tone={deadlineTone(order.deadline)}>{deadlineLabel(order.deadline)}</Pill>
                      )}
                    </td>
                    <td><Pill tone={status.tone}>{status.label}</Pill></td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </div>

      <Modal show={Boolean(removing)} onHide={() => setRemoving(null)} centered size="sm">
        {removing && (
          <Modal.Body className="text-center p-4">
            <h6 style={{ fontWeight: 700, color: 'var(--slate-dark)' }}>Remove "{removing.title}"?</h6>
            <p className="text-muted" style={{ fontSize: '0.86rem' }}>
              It disappears from the marketplace and any open proposals on it are declined.
            </p>
            <div className="d-flex gap-2 justify-content-center">
              <Button size="sm" variant="outline-secondary" onClick={() => setRemoving(null)}>Keep it</Button>
              <Button size="sm" variant="primary" onClick={() => { onCloseJob(removing.id); setRemoving(null); }}>
                Remove listing
              </Button>
            </div>
          </Modal.Body>
        )}
      </Modal>
    </>
  );
};

export default JobManagement;
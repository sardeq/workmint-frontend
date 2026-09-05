import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import Icon from '../../../components/Icon';
import { Pill, EmptyState, Avatar } from '../../../components/Shared';
import AdminStats from './AdminStats';
import {
  money, timeAgo, orderStatus, orderEscrow, orderTotal, DISPUTE_STATUS,
} from '../../../data/freelancerData';

const AdminOverview = ({ orders, jobs, users, disputes, proposals, onReviewDispute, onGo }) => {
  const openDisputes = disputes.filter((d) => d.status !== 'Resolved');
  const pendingUsers = users.filter((u) => u.status === 'pending');
  const activeOrders = orders.filter((o) => orderStatus(o).key !== 'completed');

  /* Everything happening on the platform, newest first. */
  const activity = [];
  orders.forEach((o) => {
    o.activity.forEach((a) => activity.push({ ...a, order: o }));
  });
  activity.sort((a, b) => new Date(b.at) - new Date(a.at));
  const latestActivity = activity.slice(0, 8);

  const biggest = [...activeOrders]
    .sort((a, b) => orderEscrow(b) - orderEscrow(a))
    .slice(0, 4);

  return (
    <>
      <AdminStats orders={orders} users={users} disputes={disputes} />

      <Row className="g-3">
        <Col lg={7}>
          <div className="wm-panel wm-panel--flush mb-3">
            <div className="wm-panel__head d-flex justify-content-between align-items-center">
              <div>
                <h5 className="m-0" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-dark)' }}>
                  Cases waiting on a mediator
                </h5>
                <p className="m-0 text-muted" style={{ fontSize: '0.82rem' }}>
                  Escrow stays frozen until each is resolved
                </p>
              </div>
              <Button size="sm" variant="outline-secondary" onClick={() => onGo('Disputes')}>All cases</Button>
            </div>

            {openDisputes.length === 0 ? (
              <EmptyState
                icon="check"
                title="No open disputes"
                body="Nothing is frozen. Every contract is moving on its own."
              />
            ) : (
              openDisputes.map((dispute) => (
                <button
                  key={dispute.id}
                  type="button"
                  className="wm-thread w-100"
                  onClick={() => onReviewDispute(dispute)}
                >
                  <span className="wm-stat__icon wm-stat__icon--danger" style={{ width: 36, height: 36 }}>
                    <Icon name="alert" size={16} />
                  </span>
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <span className="wm-thread__name">{dispute.id}</span>
                      <Pill tone={DISPUTE_STATUS[dispute.status].tone}>{dispute.status}</Pill>
                      <Pill tone="muted">raised by the {dispute.raisedBy}</Pill>
                    </div>
                    <div className="wm-thread__preview" style={{ maxWidth: '100%' }}>{dispute.reason}</div>
                    <div className="text-muted mt-1" style={{ fontSize: '0.75rem' }}>
                      {dispute.client} vs {dispute.freelancer} &middot; {dispute.project}
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="wm-num">{money(dispute.amount)}</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>{timeAgo(dispute.openedAt)}</div>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="wm-panel">
            <h5 className="m-0 mb-3" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-dark)' }}>
              Platform activity
            </h5>
            {latestActivity.length === 0 ? (
              <p className="text-muted small m-0">Nothing has happened yet.</p>
            ) : (
              <ul className="wm-timeline">
                {latestActivity.map((a) => (
                  <li key={a.id} className={a.actor === 'system' ? 'is-system' : a.actor === 'client' ? 'is-client' : ''}>
                    {a.text}
                    <time>{a.order.ref} &middot; {timeAgo(a.at)}</time>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Col>

        <Col lg={5}>
          <div className="wm-panel wm-panel--flush mb-3">
            <div className="wm-panel__head d-flex justify-content-between align-items-center">
              <h5 className="m-0" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-dark)' }}>
                Freelancers to screen
              </h5>
              <Button size="sm" variant="outline-secondary" onClick={() => onGo('Approvals')}>Review</Button>
            </div>

            {pendingUsers.length === 0 ? (
              <EmptyState icon="check" title="Queue is clear" body="No accounts are waiting on screening." />
            ) : (
              pendingUsers.slice(0, 4).map((user) => (
                <div key={user.id} className="d-flex align-items-center gap-2 px-4 py-3 border-bottom">
                  <Avatar name={user.name} size={34} />
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '0.89rem', fontWeight: 600, color: 'var(--slate-dark)' }}>{user.name}</div>
                    <div className="text-muted" style={{ fontSize: '0.77rem' }}>{user.title}</div>
                  </div>
                  <span className="text-muted" style={{ fontSize: '0.75rem' }}>{timeAgo(user.joinedAt)}</span>
                </div>
              ))
            )}
          </div>

          <div className="wm-panel wm-panel--flush">
            <div className="wm-panel__head d-flex justify-content-between align-items-center">
              <h5 className="m-0" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-dark)' }}>
                Largest escrow balances
              </h5>
              <Button size="sm" variant="outline-secondary" onClick={() => onGo('Jobs')}>Contracts</Button>
            </div>

            {biggest.length === 0 ? (
              <EmptyState icon="lock" title="Nothing in escrow" body="No live contracts on the platform." />
            ) : (
              biggest.map((order) => (
                <div key={order.id} className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom">
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '0.89rem', fontWeight: 600, color: 'var(--slate-dark)' }}>{order.project}</div>
                    <div className="text-muted" style={{ fontSize: '0.77rem' }}>
                      {order.client} &rarr; {order.freelancer.name}
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="wm-num" style={{ color: 'var(--amber)' }}>{money(orderEscrow(order))}</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>of {money(orderTotal(order))}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="d-flex gap-2 mt-3">
            <Pill tone="muted">{jobs.length} open jobs</Pill>
            <Pill tone="muted">{proposals.filter((p) => p.status === 'Pending').length} live proposals</Pill>
            <Pill tone="muted">{users.filter((u) => u.status === 'active').length} active accounts</Pill>
          </div>
        </Col>
      </Row>
    </>
  );
};

export default AdminOverview;
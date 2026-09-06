import { Row, Col, Button } from 'react-bootstrap';
import Icon from '../../../components/Icon';
import { StatCard, Pill, EmptyState, Avatar, EscrowBar } from '../../../components/Shared';
import {
  money, num, netOf, timeAgo, deadlineLabel, deadlineTone, orderRef,
  orderStatus, orderEscrow, orderReleased, orderTotal, nextAction, needsAttention,
  milestonesOf, activityOf,
} from '../../../data/helpers';

const FreelancerOverview = ({ orders, proposals, withdrawals, profile, onOpenOrder, onGo }) => {
  const active = orders.filter((order) => orderStatus(order).key !== 'completed');

  const inEscrow = active.reduce((sum, order) => sum + orderEscrow(order), 0);
  const lifetimeNet = orders.reduce((sum, order) => sum + netOf(orderReleased(order)), 0);
  const paidOut = withdrawals.reduce((sum, item) => sum + num(item.amount), 0);
  const available = lifetimeNet - paidOut;

  const openProposals = proposals.filter((p) => p.status === 'Pending' || p.status === 'Interviewing');
  const interviewing = proposals.filter((p) => p.status === 'Interviewing').length;

  const todo = active
    .filter(needsAttention)
    .map((order) => ({ order, action: nextAction(order) }))
    .filter((row) => row.action)
    .sort((a, b) => new Date(a.order.deadline) - new Date(b.order.deadline));

  const latestActivity = orders
    .flatMap((order) => activityOf(order).map((item) => ({ ...item, order })))
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, 6);

  const upcoming = active
    .flatMap((order) => milestonesOf(order).map((milestone) => ({ milestone, order })))
    .filter((row) => row.milestone.status !== 'approved')
    .sort((a, b) => new Date(a.milestone.due_date) - new Date(b.milestone.due_date));

  return (
    <>
      <Row className="g-3 mb-4">
        <Col sm={6} xl={3}>
          <StatCard
            label="Active orders" icon="briefcase" tone="info"
            value={active.length}
            sub={todo.length > 0 ? `${todo.length} waiting on you` : 'Nothing blocked'}
          />
        </Col>
        <Col sm={6} xl={3}>
          <StatCard
            label="Held in escrow" icon="lock" tone="warn"
            value={money(inEscrow)}
            sub="Released as milestones are approved"
          />
        </Col>
        <Col sm={6} xl={3}>
          <StatCard
            label="Available to withdraw" icon="wallet" tone="success"
            value={money(available)}
            sub="After the 10% platform fee"
          />
        </Col>
        <Col sm={6} xl={3}>
          <StatCard
            label="Open proposals" icon="send" tone="muted"
            value={openProposals.length}
            sub={interviewing > 0 ? `${interviewing} at interview stage` : 'Awaiting client replies'}
          />
        </Col>
      </Row>

      <Row className="g-3">
        <Col lg={7}>
          <div className="wm-panel wm-panel--flush mb-3">
            <div className="wm-panel__head d-flex justify-content-between align-items-center">
              <div>
                <h5 className="m-0" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-dark)' }}>
                  Waiting on you
                </h5>
                <p className="m-0 text-muted" style={{ fontSize: '0.82rem' }}>
                  One step per order, in deadline order
                </p>
              </div>
              <Button size="sm" variant="outline-secondary" onClick={() => onGo('My Orders')}>
                All orders
              </Button>
            </div>

            {todo.length === 0 ? (
              <EmptyState
                icon="check"
                title="You are all caught up"
                body="Every active order is with the client. Good time to send a few proposals."
                action={<Button size="sm" variant="primary" onClick={() => onGo('Available Jobs')}>Browse jobs</Button>}
              />
            ) : (
              todo.map(({ order, action }) => (
                <button
                  key={order.id}
                  type="button"
                  className="wm-thread w-100"
                  onClick={() => onOpenOrder(order.id)}
                >
                  <Avatar name={order.client} size={36} tone="slate" />
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <span className="wm-thread__name">{order.project}</span>
                      <Pill tone={action.tone}>{action.label}</Pill>
                    </div>
                    <div className="wm-thread__preview" style={{ maxWidth: '100%' }}>
                      {order.client} &middot; {money(orderTotal(order))} contract
                    </div>
                    <div className="mt-2" style={{ maxWidth: 220 }}>
                      <EscrowBar released={orderReleased(order)} total={orderTotal(order)} />
                    </div>
                  </div>
                  <div className="text-end">
                    <Pill tone={deadlineTone(order.deadline)}>{deadlineLabel(order.deadline)}</Pill>
                    <div className="mt-2 text-muted"><Icon name="chevron" size={14} /></div>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="wm-panel">
            <h5 className="m-0 mb-3" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-dark)' }}>
              Recent activity
            </h5>
            {latestActivity.length === 0 ? (
              <p className="text-muted small m-0">Nothing has happened yet.</p>
            ) : (
              <ul className="wm-timeline">
                {latestActivity.map((item) => (
                  <li
                    key={`${item.order.id}-${item.id}`}
                    className={item.actor === 'client' ? 'is-client' : item.actor === 'system' ? 'is-system' : ''}
                  >
                    {item.text}
                    <time>{orderRef(item.order)} &middot; {timeAgo(item.at)}</time>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Col>

        <Col lg={5}>
          <div className="wm-panel mb-3">
            <h5 className="m-0 mb-3" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-dark)' }}>
              Milestone deadlines
            </h5>
            {active.length === 0 ? (
              <p className="text-muted small m-0">No active orders.</p>
            ) : (
              upcoming.slice(0, 5).map(({ milestone, order }) => (
                <div key={milestone.id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--slate-dark)' }}>{milestone.title}</div>
                    <div className="text-muted" style={{ fontSize: '0.78rem' }}>{order.client}</div>
                  </div>
                  <div className="text-end">
                    <div className="wm-num" style={{ fontSize: '0.9rem' }}>{money(milestone.amount)}</div>
                    <Pill tone={deadlineTone(milestone.due_date)}>{deadlineLabel(milestone.due_date)}</Pill>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="wm-panel">
            <div className="d-flex align-items-center gap-3 mb-3">
              <Avatar name={profile ? profile.name : 'W'} size={46} />
              <div>
                <div style={{ fontWeight: 700, color: 'var(--slate-dark)' }}>{profile ? profile.name : ''}</div>
                <div className="text-muted" style={{ fontSize: '0.82rem' }}>{profile ? profile.title : ''}</div>
              </div>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <Pill tone={profile && profile.available ? 'success' : 'muted'}>
                {profile && profile.available ? 'Available for work' : 'Not taking work'}
              </Pill>
              <span className="wm-num" style={{ fontSize: '0.95rem' }}>
                {money(profile ? profile.hourly_rate : 0)}
                <span style={{ fontWeight: 500, color: 'var(--text-muted)' }}>/hr</span>
              </span>
            </div>
            <div className="d-grid gap-2">
              <Button variant="primary" size="sm" onClick={() => onGo('Available Jobs')}>
                <Icon name="search" size={14} className="me-1" /> Find new work
              </Button>
              <Button variant="outline-secondary" size="sm" onClick={() => onGo('Profile')}>
                Edit profile
              </Button>
            </div>
          </div>
        </Col>
      </Row>
    </>
  );
};

export default FreelancerOverview;

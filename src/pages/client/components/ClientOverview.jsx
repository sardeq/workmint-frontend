import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import Icon from '../../../components/Icon';
import { StatCard, Pill, EmptyState, Avatar, EscrowBar } from '../../../components/Shared';
import {
  money, timeAgo, deadlineLabel, deadlineTone,
  orderStatus, orderEscrow, orderReleased, orderTotal, clientNextAction, clientNeedsAttention,
} from '../../../data/freelancerData';

const ClientOverview = ({ orders, jobs, proposals, profile, onOpenProject, onGo }) => {
  const active = orders.filter((o) => orderStatus(o).key !== 'completed');
  const inEscrow = active.reduce((sum, o) => sum + orderEscrow(o), 0);
  const totalSpent = orders.reduce((sum, o) => sum + orderReleased(o), 0);
  const committed = active.reduce((sum, o) => sum + orderTotal(o), 0);
  const pendingProposals = proposals.filter((p) => p.status === 'Pending');

  const decisions = active
    .filter(clientNeedsAttention)
    .map((order) => ({ order, action: clientNextAction(order) }))
    .sort((a, b) => new Date(a.order.deadline) - new Date(b.order.deadline));

  const activity = orders
    .flatMap((o) => o.activity.map((a) => ({ ...a, order: o })))
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, 6);

  return (
    <>
      <Row className="g-3 mb-4">
        <Col sm={6} xl={3}>
          <StatCard
            label="Active projects" icon="briefcase" tone="info"
            value={active.length}
            sub={decisions.length > 0 ? `${decisions.length} need a decision` : 'Nothing waiting on you'}
          />
        </Col>
        <Col sm={6} xl={3}>
          <StatCard
            label="Held in escrow" icon="lock" tone="warn"
            value={money(inEscrow)}
            sub={`of ${money(committed)} committed`}
          />
        </Col>
        <Col sm={6} xl={3}>
          <StatCard
            label="Released to date" icon="check" tone="success"
            value={money(totalSpent)}
            sub="Paid only for approved work"
          />
        </Col>
        <Col sm={6} xl={3}>
          <StatCard
            label="Proposals to review" icon="inbox" tone="muted"
            value={pendingProposals.length}
            sub={jobs.length > 0 ? `across ${jobs.length} open ${jobs.length === 1 ? 'job' : 'jobs'}` : 'No open jobs'}
          />
        </Col>
      </Row>

      <Row className="g-3">
        <Col lg={7}>
          <div className="wm-panel wm-panel--flush mb-3">
            <div className="wm-panel__head d-flex justify-content-between align-items-center">
              <div>
                <h5 className="m-0" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-dark)' }}>
                  Waiting on your decision
                </h5>
                <p className="m-0 text-muted" style={{ fontSize: '0.82rem' }}>
                  Deliveries to review and scope changes to settle
                </p>
              </div>
              <Button size="sm" variant="outline-secondary" onClick={() => onGo('My Projects')}>
                All projects
              </Button>
            </div>

            {decisions.length === 0 ? (
              <EmptyState
                icon="check"
                title="Nothing needs you right now"
                body="Every project is with its freelancer. You will get a notification the moment something is delivered."
                action={<Button size="sm" variant="primary" onClick={() => onGo('Post a Job')}>Post another job</Button>}
              />
            ) : (
              decisions.map(({ order, action }) => (
                <button
                  key={order.id}
                  type="button"
                  className="wm-thread w-100"
                  onClick={() => onOpenProject(order.id)}
                >
                  <Avatar name={order.freelancer.name} size={36} />
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <span className="wm-thread__name">{order.project}</span>
                      <Pill tone={action.tone}>{action.label}</Pill>
                    </div>
                    <div className="wm-thread__preview" style={{ maxWidth: '100%' }}>
                      {order.freelancer.name} &middot; {money(orderEscrow(order))} still in escrow
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
            {activity.length === 0 ? (
              <p className="text-muted small m-0">Nothing has happened yet.</p>
            ) : (
              <ul className="wm-timeline">
                {activity.map((a) => (
                  <li key={a.id} className={a.actor === 'freelancer' ? 'is-client' : a.actor === 'system' ? 'is-system' : ''}>
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
                Your open jobs
              </h5>
              <Button size="sm" variant="outline-secondary" onClick={() => onGo('Proposals')}>Review</Button>
            </div>

            {jobs.length === 0 ? (
              <EmptyState
                icon="plus"
                title="No jobs posted"
                body="Describe the work once and let freelancers come to you."
                action={<Button size="sm" variant="primary" onClick={() => onGo('Post a Job')}>Post a job</Button>}
              />
            ) : (
              jobs.map((job) => {
                const count = proposals.filter((p) => p.jobId === job.id && p.status === 'Pending').length;
                return (
                  <div key={job.id} className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom">
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--slate-dark)' }}>{job.title}</div>
                      <div className="text-muted" style={{ fontSize: '0.78rem' }}>
                        {money(job.budget)} budget &middot; {job.days} days
                      </div>
                    </div>
                    <Pill tone={count > 0 ? 'warn' : 'muted'}>
                      {count} {count === 1 ? 'proposal' : 'proposals'}
                    </Pill>
                  </div>
                );
              })
            )}
          </div>

          <div className="wm-panel">
            <div className="d-flex align-items-center gap-3 mb-3">
              <Avatar name={profile ? profile.company : 'W'} size={46} tone="slate" />
              <div>
                <div style={{ fontWeight: 700, color: 'var(--slate-dark)' }}>{profile ? profile.company : ''}</div>
                <div className="text-muted" style={{ fontSize: '0.82rem' }}>
                  {profile ? `${profile.contact} - ${profile.role}` : ''}
                </div>
              </div>
            </div>
            <div className="d-grid gap-2">
              <Button variant="primary" size="sm" onClick={() => onGo('Post a Job')}>
                <Icon name="plus" size={14} className="me-1" /> Post a job
              </Button>
              <Button variant="outline-secondary" size="sm" onClick={() => onGo('Find Freelancers')}>
                Browse freelancers
              </Button>
            </div>
          </div>
        </Col>
      </Row>
    </>
  );
};

export default ClientOverview;
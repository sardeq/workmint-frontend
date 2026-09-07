import { Row, Col, Button } from 'react-bootstrap';
import Icon from '../../../components/Icon';
import { StatCard, Pill, EmptyState, Avatar } from '../../../components/Shared';
import {
  money, num, netOf, deadlineLabel, deadlineTone,
  isLive, escrowOf, releasedOf, sumBy, freelancerAction,
} from '../../../data/helpers';

const FreelancerOverview = ({ contracts, proposals, withdrawals, profile, onOpenContract, onGo }) => {
  const live = contracts.filter(isLive);

  const inEscrow = sumBy(live, escrowOf);
  const lifetimeNet = netOf(sumBy(contracts, releasedOf));
  const paidOut = sumBy(withdrawals, (item) => num(item.amount));
  const available = lifetimeNet - paidOut;

  const openProposals = proposals.filter((p) => p.status === 'Pending');

  const todo = live
    .filter(freelancerAction)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  return (
    <>
      <Row className="g-3 mb-4">
        <Col sm={6} xl={3}>
          <StatCard
            label="Active contracts" icon="briefcase" tone="info"
            value={live.length}
            sub={todo.length > 0 ? `${todo.length} waiting on you` : 'Nothing blocked'}
          />
        </Col>
        <Col sm={6} xl={3}>
          <StatCard
            label="Held in escrow" icon="lock" tone="warn"
            value={money(inEscrow)}
            sub="Released when the client approves"
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
            sub="Awaiting client replies"
          />
        </Col>
      </Row>

      <Row className="g-3">
        <Col lg={7}>
          <div className="wm-panel wm-panel--flush">
            <div className="wm-panel__head d-flex justify-content-between align-items-center">
              <div>
                <h5 className="m-0" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-dark)' }}>
                  Waiting on you
                </h5>
                <p className="m-0 text-muted" style={{ fontSize: '0.82rem' }}>
                  In deadline order
                </p>
              </div>
              <Button size="sm" variant="outline-secondary" onClick={() => onGo('My Contracts')}>
                All contracts
              </Button>
            </div>

            {todo.length === 0 ? (
              <EmptyState
                icon="check"
                title="You are all caught up"
                body="Every active contract is with the client. Good time to send a few proposals."
                action={<Button size="sm" variant="primary" onClick={() => onGo('Available Jobs')}>Browse jobs</Button>}
              />
            ) : (
              todo.map((contract) => (
                <button
                  key={contract.id}
                  type="button"
                  className="wm-thread w-100"
                  onClick={() => onOpenContract(contract.id)}
                >
                  <Avatar name={contract.client} size={36} tone="slate" />
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <span className="wm-thread__name">{contract.title}</span>
                      <Pill tone={contract.status === 'revision' ? 'danger' : 'info'}>
                        {freelancerAction(contract)}
                      </Pill>
                    </div>
                    <div className="wm-thread__preview" style={{ maxWidth: '100%' }}>
                      {contract.client} &middot; {money(contract.amount)} contract
                    </div>
                  </div>
                  <div className="text-end">
                    <Pill tone={deadlineTone(contract.deadline)}>{deadlineLabel(contract.deadline)}</Pill>
                    <div className="mt-2 text-muted"><Icon name="chevron" size={14} /></div>
                  </div>
                </button>
              ))
            )}
          </div>
        </Col>

        <Col lg={5}>
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

import { Row, Col, Button } from 'react-bootstrap';
import { Pill, EmptyState, Avatar } from '../../../components/Shared';
import AdminStats from './AdminStats';
import {
  money, timeAgo, shortDate, isLive, escrowOf, contractStatus,
} from '../../../data/helpers';

const AdminOverview = ({ contracts, jobs, users, proposals, onGo }) => {
  const pendingUsers = users.filter((person) => person.status === 'pending');
  const live = contracts.filter(isLive);

  const biggest = [...live].sort((a, b) => escrowOf(b) - escrowOf(a)).slice(0, 4);

  return (
    <>
      <AdminStats contracts={contracts} users={users} />

      <Row className="g-3">
        <Col lg={7}>
          <div className="wm-panel wm-panel--flush">
            <div className="wm-panel__head d-flex justify-content-between align-items-center">
              <div>
                <h5 className="m-0" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-dark)' }}>
                  Live contracts
                </h5>
                <p className="m-0 text-muted" style={{ fontSize: '0.82rem' }}>
                  Everything currently running on the platform
                </p>
              </div>
              <Button size="sm" variant="outline-secondary" onClick={() => onGo('Jobs')}>All contracts</Button>
            </div>

            {live.length === 0 ? (
              <EmptyState icon="briefcase" title="Nothing running" body="No live contracts on the platform." />
            ) : (
              live.map((contract) => (
                <div key={contract.id} className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom">
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--slate-dark)' }}>
                      {contract.title}
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.78rem' }}>
                      {contract.client} &rarr; {contract.freelancer_name} &middot; due {shortDate(contract.deadline)}
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="wm-num" style={{ color: 'var(--amber)' }}>{money(contract.amount)}</div>
                    <Pill tone={contractStatus(contract, 'client').tone}>
                      {contractStatus(contract, 'client').label}
                    </Pill>
                  </div>
                </div>
              ))
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
              pendingUsers.map((person) => (
                <div key={person.id} className="d-flex align-items-center gap-2 px-4 py-3 border-bottom">
                  <Avatar name={person.name} size={34} />
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '0.89rem', fontWeight: 600, color: 'var(--slate-dark)' }}>{person.name}</div>
                    <div className="text-muted" style={{ fontSize: '0.77rem' }}>{person.title}</div>
                  </div>
                  <span className="text-muted" style={{ fontSize: '0.75rem' }}>{timeAgo(person.joined_at)}</span>
                </div>
              ))
            )}
          </div>

          <div className="wm-panel">
            <div className="wm-eyebrow mb-2">Largest escrow balances</div>
            {biggest.length === 0 ? (
              <p className="text-muted small m-0">Nothing in escrow.</p>
            ) : (
              biggest.map((contract) => (
                <div key={contract.id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                  <span style={{ fontSize: '0.87rem', color: 'var(--slate-dark)' }}>{contract.title}</span>
                  <span className="wm-num">{money(contract.amount)}</span>
                </div>
              ))
            )}
          </div>

          <div className="d-flex gap-2 mt-3">
            <Pill tone="muted">{jobs.length} open jobs</Pill>
            <Pill tone="muted">{proposals.filter((p) => p.status === 'Pending').length} live proposals</Pill>
            <Pill tone="muted">{users.filter((person) => person.status === 'active').length} active accounts</Pill>
          </div>
        </Col>
      </Row>
    </>
  );
};

export default AdminOverview;

import { Row, Col, Button } from 'react-bootstrap';
import Icon from '../../../components/Icon';
import { StatCard, Pill, EmptyState, Avatar } from '../../../components/Shared';
import {
  money, deadlineLabel, deadlineTone, isLive, escrowOf, releasedOf, sumBy, clientAction,
} from '../../../data/helpers';

const ClientOverview = ({ contracts, jobs, proposals, user, onOpenProject, onGo }) => {
  const live = contracts.filter(isLive);

  const inEscrow = sumBy(live, escrowOf);
  const released = sumBy(contracts, releasedOf);
  const pendingProposals = proposals.filter((p) => p.status === 'Pending');

  const decisions = live
    .filter(clientAction)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  return (
    <>
      <Row className="g-3 mb-4">
        <Col sm={6} xl={3}>
          <StatCard
            label="Active projects" icon="briefcase" tone="info"
            value={live.length}
            sub={decisions.length > 0 ? `${decisions.length} need a decision` : 'Nothing waiting on you'}
          />
        </Col>
        <Col sm={6} xl={3}>
          <StatCard
            label="Held in escrow" icon="lock" tone="warn"
            value={money(inEscrow)}
            sub="Yours until you approve"
          />
        </Col>
        <Col sm={6} xl={3}>
          <StatCard
            label="Released to date" icon="check" tone="success"
            value={money(released)}
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
          <div className="wm-panel wm-panel--flush">
            <div className="wm-panel__head d-flex justify-content-between align-items-center">
              <div>
                <h5 className="m-0" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-dark)' }}>
                  Waiting on your decision
                </h5>
                <p className="m-0 text-muted" style={{ fontSize: '0.82rem' }}>
                  Work that has been delivered and needs approving
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
                body="Every project is with its freelancer."
                action={<Button size="sm" variant="primary" onClick={() => onGo('Post a Job')}>Post another job</Button>}
              />
            ) : (
              decisions.map((contract) => (
                <button
                  key={contract.id}
                  type="button"
                  className="wm-thread w-100"
                  onClick={() => onOpenProject(contract.id)}
                >
                  <Avatar name={contract.freelancer_name} size={36} />
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <span className="wm-thread__name">{contract.title}</span>
                      <Pill tone="warn">{clientAction(contract)}</Pill>
                    </div>
                    <div className="wm-thread__preview" style={{ maxWidth: '100%' }}>
                      {contract.freelancer_name} &middot; {money(contract.amount)} in escrow
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
                const count = proposals.filter((p) => p.job_id === job.id && p.status === 'Pending').length;
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
              <Avatar name={user.company || user.name} size={46} tone="slate" />
              <div>
                <div style={{ fontWeight: 700, color: 'var(--slate-dark)' }}>{user.company || user.name}</div>
                <div className="text-muted" style={{ fontSize: '0.82rem' }}>{user.name} &middot; {user.title}</div>
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

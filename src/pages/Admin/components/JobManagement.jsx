import { useState } from 'react';
import { Table, Button, Form, InputGroup, Modal, Row, Col } from 'react-bootstrap';
import Icon from '../../../components/Icon';
import { Pill, StatCard, EmptyState } from '../../../components/Shared';
import {
  money, num, timeAgo, shortDate, deadlineLabel, deadlineTone,
  contractRef, contractStatus, isLive, sumBy,
} from '../../../data/helpers';

const VIEWS = [
  { key: 'jobs', label: 'Open listings' },
  { key: 'contracts', label: 'Contracts' },
];

const JobManagement = ({ jobs, contracts, proposals, onDeleteJob }) => {
  const [view, setView] = useState('jobs');
  const [search, setSearch] = useState('');
  const [removing, setRemoving] = useState(null);

  const live = contracts.filter(isLive);
  const volume = sumBy(contracts, (contract) => num(contract.amount));

  const matches = (text) => String(text).toLowerCase().includes(search.toLowerCase());

  const visibleJobs = jobs.filter((job) => matches(job.title) || matches(job.client));
  const visibleContracts = contracts.filter(
    (contract) =>
      matches(contract.title) ||
      matches(contract.client) ||
      matches(contract.freelancer_name) ||
      matches(contractRef(contract))
  );

  return (
    <>
      <Row className="g-3 mb-4">
        <Col sm={3}>
          <StatCard label="Open listings" value={jobs.length} icon="search" tone="info" sub="Visible in the marketplace" />
        </Col>
        <Col sm={3}>
          <StatCard label="Live contracts" value={live.length} icon="briefcase" tone="warn" sub={`${contracts.length} all time`} />
        </Col>
        <Col sm={3}>
          <StatCard label="Contract volume" value={money(volume)} icon="dollar" tone="success" sub="Total value ever funded" />
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
                <span className="wm-chip__count">{item.key === 'jobs' ? jobs.length : contracts.length}</span>
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
                {visibleJobs.map((job) => (
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
                    <td>
                      <Pill tone={num(job.proposal_count) > 0 ? 'info' : 'muted'}>{job.proposal_count}</Pill>
                    </td>
                    <td className="text-muted" style={{ fontSize: '0.83rem' }}>{timeAgo(job.created_at)}</td>
                    <td className="text-end">
                      <Button size="sm" variant="outline-secondary" onClick={() => setRemoving(job)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )
        ) : visibleContracts.length === 0 ? (
          <EmptyState icon="briefcase" title="No contracts" body="Nothing matches that search." />
        ) : (
          <Table hover responsive className="align-middle">
            <thead>
              <tr>
                <th>Contract</th>
                <th>Parties</th>
                <th>Value</th>
                <th>Deadline</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {visibleContracts.map((contract) => (
                <tr key={contract.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--slate-dark)' }}>{contract.title}</div>
                    <div className="text-muted" style={{ fontSize: '0.78rem' }}>{contractRef(contract)}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem' }}>{contract.client}</div>
                    <div className="text-muted" style={{ fontSize: '0.78rem' }}>{contract.freelancer_name}</div>
                  </td>
                  <td className="wm-num">{money(contract.amount)}</td>
                  <td>
                    {isLive(contract) ? (
                      <Pill tone={deadlineTone(contract.deadline)}>{deadlineLabel(contract.deadline)}</Pill>
                    ) : (
                      <span className="text-muted" style={{ fontSize: '0.83rem' }}>{shortDate(contract.deadline)}</span>
                    )}
                  </td>
                  <td>
                    <Pill tone={contractStatus(contract, 'client').tone}>
                      {contractStatus(contract, 'client').label}
                    </Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>

      <Modal show={Boolean(removing)} onHide={() => setRemoving(null)} centered size="sm">
        {removing && (
          <Modal.Body className="text-center p-4">
            <h6 style={{ fontWeight: 700, color: 'var(--slate-dark)' }}>Delete "{removing.title}"?</h6>
            <p className="text-muted" style={{ fontSize: '0.86rem' }}>
              The listing and every proposal on it are removed from the database.
            </p>
            <div className="d-flex gap-2 justify-content-center">
              <Button size="sm" variant="outline-secondary" onClick={() => setRemoving(null)}>Keep it</Button>
              <Button size="sm" variant="danger" onClick={() => { onDeleteJob(removing.id); setRemoving(null); }}>
                Delete listing
              </Button>
            </div>
          </Modal.Body>
        )}
      </Modal>
    </>
  );
};

export default JobManagement;

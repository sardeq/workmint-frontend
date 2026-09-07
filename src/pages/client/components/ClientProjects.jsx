import { useState } from 'react';
import { Row, Col, Form, InputGroup, Button } from 'react-bootstrap';
import Icon from '../../../components/Icon';
import { EmptyState, StatCard } from '../../../components/Shared';
import ProjectCard from './ProjectCard';
import { money, isLive, escrowOf, releasedOf, sumBy, clientAction } from '../../../data/helpers';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'decision', label: 'Needs a decision' },
  { key: 'progress', label: 'With freelancer' },
  { key: 'done', label: 'Finished' },
];

const ClientProjects = ({ contracts, onOpen, onGo }) => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const matchesFilter = (contract) => {
    if (filter === 'done') return !isLive(contract);
    if (filter === 'decision') return Boolean(clientAction(contract));
    if (filter === 'progress') return isLive(contract) && !clientAction(contract);
    return true;
  };

  const matchesSearch = (contract) => {
    const term = search.toLowerCase();
    return (
      contract.title.toLowerCase().includes(term) ||
      contract.freelancer_name.toLowerCase().includes(term)
    );
  };

  const visible = contracts.filter(matchesFilter).filter(matchesSearch);
  const live = contracts.filter(isLive);

  return (
    <>
      <Row className="g-3 mb-4">
        <Col sm={4}>
          <StatCard label="Active" value={live.length} icon="briefcase" tone="info" sub="Contracts running" />
        </Col>
        <Col sm={4}>
          <StatCard label="In escrow" value={money(sumBy(live, escrowOf))} icon="lock" tone="warn" sub="Yours until you approve" />
        </Col>
        <Col sm={4}>
          <StatCard label="Released" value={money(sumBy(contracts, releasedOf))} icon="check" tone="success" sub="Across all projects" />
        </Col>
      </Row>

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div className="wm-chips">
          {FILTERS.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`wm-chip ${filter === item.key ? 'active' : ''}`}
              onClick={() => setFilter(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <InputGroup style={{ maxWidth: 280 }}>
          <InputGroup.Text style={{ background: 'transparent', borderRight: 0 }}>
            <Icon name="search" size={14} />
          </InputGroup.Text>
          <Form.Control
            placeholder="Search project or freelancer"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ borderLeft: 0 }}
          />
        </InputGroup>
      </div>

      {visible.length === 0 ? (
        <div className="wm-panel">
          <EmptyState
            icon="briefcase"
            title="No projects here"
            body={search ? `Nothing matches "${search}".` : 'Projects appear once you hire someone from a proposal.'}
            action={<Button size="sm" variant="primary" onClick={() => onGo('Proposals')}>Review proposals</Button>}
          />
        </div>
      ) : (
        <Row className="g-3">
          {visible.map((contract) => (
            <Col md={6} xl={4} key={contract.id}>
              <ProjectCard contract={contract} onOpen={onOpen} />
            </Col>
          ))}
        </Row>
      )}
    </>
  );
};

export default ClientProjects;

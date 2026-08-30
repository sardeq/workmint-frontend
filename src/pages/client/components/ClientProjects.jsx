import React, { useState } from 'react';
import { Row, Col, Form, InputGroup, Button } from 'react-bootstrap';
import Icon from '../../../components/Icon';
import { EmptyState, StatCard } from '../../../components/Shared';
import ProjectCard from './ProjectCard';
import {
  money, orderStatus, orderEscrow, orderReleased, clientNeedsAttention, byUrgency,
} from '../../../data/freelancerData';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'decision', label: 'Needs a decision' },
  { key: 'progress', label: 'With freelancer' },
  { key: 'completed', label: 'Completed' },
];

const ClientProjects = ({ orders, onOpen, onGo }) => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const matches = (order) => {
    const key = orderStatus(order).key;
    if (filter === 'completed') return key === 'completed';
    if (filter === 'decision') return clientNeedsAttention(order);
    if (filter === 'progress') return key !== 'completed' && !clientNeedsAttention(order);
    return true;
  };

  const visible = orders
    .filter(matches)
    .filter((o) => {
      const q = search.toLowerCase();
      return (
        o.project.toLowerCase().includes(q) ||
        o.freelancer.name.toLowerCase().includes(q) ||
        (o.ref || '').toLowerCase().includes(q)
      );
    })
    .sort(byUrgency('client'));

  const active = orders.filter((o) => orderStatus(o).key !== 'completed');

  return (
    <>
      <Row className="g-3 mb-4">
        <Col sm={4}>
          <StatCard label="Active" value={active.length} icon="briefcase" tone="info" sub="Contracts running" />
        </Col>
        <Col sm={4}>
          <StatCard
            label="In escrow" icon="lock" tone="warn"
            value={money(active.reduce((sum, o) => sum + orderEscrow(o), 0))}
            sub="Yours until you approve"
          />
        </Col>
        <Col sm={4}>
          <StatCard
            label="Released" icon="check" tone="success"
            value={money(orders.reduce((sum, o) => sum + orderReleased(o), 0))}
            sub="Across all projects"
          />
        </Col>
      </Row>

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div className="wm-chips">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              className={`wm-chip ${filter === f.key ? 'active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
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
          {visible.map((order) => (
            <Col md={6} xl={4} key={order.id}>
              <ProjectCard project={order} onOpen={onOpen} />
            </Col>
          ))}
        </Row>
      )}
    </>
  );
};

export default ClientProjects;
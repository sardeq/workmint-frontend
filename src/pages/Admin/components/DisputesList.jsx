import { useState } from 'react';
import { Table, Button, Form, InputGroup, Row, Col } from 'react-bootstrap';
import Icon from '../../../components/Icon';
import { Pill, StatCard, EmptyState } from '../../../components/Shared';
import { money, num, timeAgo, orderRef, DISPUTE_STATUS } from '../../../data/helpers';

const FILTERS = ['All', 'Open', 'Under review', 'Resolved'];

const DisputesList = ({ disputes, orders, onReview, onTriage }) => {
  const [filter, setFilter] = useState('Open');
  const [search, setSearch] = useState('');

  const open = disputes.filter((dispute) => dispute.status !== 'Resolved');
  const frozen = open.reduce((sum, dispute) => sum + num(dispute.amount), 0);
  const resolved = disputes.filter((dispute) => dispute.status === 'Resolved');

  const oldest = open.length === 0
    ? 0
    : Math.max(...open.map((dispute) => Date.now() - new Date(dispute.opened_at).getTime()));
  const oldestDays = Math.floor(oldest / 86400000);

  const visible = disputes
    .filter((dispute) => filter === 'All' || dispute.status === filter)
    .filter((dispute) => {
      const term = search.toLowerCase();
      return (
        String(dispute.id).includes(term) ||
        dispute.client.toLowerCase().includes(term) ||
        dispute.freelancer.toLowerCase().includes(term) ||
        dispute.project.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => new Date(a.opened_at) - new Date(b.opened_at));

  return (
    <>
      <Row className="g-3 mb-4">
        <Col sm={4}>
          <StatCard label="Open cases" value={open.length} icon="alert" tone={open.length > 0 ? 'danger' : 'muted'} sub="Awaiting mediation" />
        </Col>
        <Col sm={4}>
          <StatCard label="Frozen escrow" value={money(frozen)} icon="lock" tone="warn" sub="Cannot move until resolved" />
        </Col>
        <Col sm={4}>
          <StatCard
            label="Oldest open case" icon="clock" tone={oldestDays > 3 ? 'danger' : 'muted'}
            value={open.length > 0 ? `${oldestDays}d` : '-'}
            sub={`${resolved.length} resolved all time`}
          />
        </Col>
      </Row>

      <div className="wm-panel wm-panel--flush">
        <div className="wm-panel__head d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div className="wm-chips">
            {FILTERS.map((item) => (
              <button
                key={item}
                type="button"
                className={`wm-chip ${filter === item ? 'active' : ''}`}
                onClick={() => setFilter(item)}
              >
                {item}
                <span className="wm-chip__count">
                  {item === 'All' ? disputes.length : disputes.filter((dispute) => dispute.status === item).length}
                </span>
              </button>
            ))}
          </div>
          <InputGroup style={{ maxWidth: 280 }}>
            <InputGroup.Text style={{ background: 'transparent', borderRight: 0 }}>
              <Icon name="search" size={14} />
            </InputGroup.Text>
            <Form.Control
              placeholder="Case ID, party or project"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ borderLeft: 0 }}
            />
          </InputGroup>
        </div>

        {visible.length === 0 ? (
          <EmptyState
            icon="check"
            title={search ? 'No cases match that search' : `No ${filter.toLowerCase()} cases`}
            body={search ? 'Try a case ID or one of the party names.' : 'Nothing in this queue right now.'}
          />
        ) : (
          <Table hover responsive className="align-middle">
            <thead>
              <tr>
                <th>Case</th>
                <th>Parties</th>
                <th>Frozen</th>
                <th>Opened</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((dispute) => {
                const order = orders.find((item) => item.id === dispute.order_id);
                return (
                  <tr key={dispute.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--slate-dark)' }}>Case {dispute.id}</div>
                      <div className="text-muted" style={{ fontSize: '0.78rem' }}>{dispute.reason}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>{dispute.client}</div>
                      <div className="text-muted" style={{ fontSize: '0.78rem' }}>vs {dispute.freelancer}</div>
                      <Pill tone="muted">raised by the {dispute.raised_by}</Pill>
                    </td>
                    <td>
                      <span className="wm-num">{money(dispute.amount)}</span>
                      {order && (
                        <div className="text-muted" style={{ fontSize: '0.76rem' }}>{orderRef(order)}</div>
                      )}
                    </td>
                    <td className="text-muted" style={{ fontSize: '0.84rem' }}>{timeAgo(dispute.opened_at)}</td>
                    <td>
                      <Pill tone={DISPUTE_STATUS[dispute.status].tone}>{dispute.status}</Pill>
                      {dispute.resolution && (
                        <div className="text-muted mt-1" style={{ fontSize: '0.75rem' }}>{dispute.resolution}</div>
                      )}
                    </td>
                    <td className="text-end">
                      {dispute.status === 'Open' && (
                        <Button size="sm" variant="link" className="p-0 me-3" onClick={() => onTriage(dispute.id, 'Under review')}>
                          Claim
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant={dispute.status === 'Resolved' ? 'outline-secondary' : 'primary'}
                        onClick={() => onReview(dispute)}
                      >
                        {dispute.status === 'Resolved' ? 'View' : 'Mediate'}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </div>
    </>
  );
};

export default DisputesList;
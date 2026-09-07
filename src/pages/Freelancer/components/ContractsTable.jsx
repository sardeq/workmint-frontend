import { useState } from 'react';
import { Table, Button, Form, InputGroup } from 'react-bootstrap';
import Icon from '../../../components/Icon';
import { Pill, Avatar, EmptyState } from '../../../components/Shared';
import {
  money, shortDate, deadlineLabel, deadlineTone, contractRef,
  contractStatus, isLive, freelancerAction,
} from '../../../data/helpers';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'action', label: 'Needs you' },
  { key: 'waiting', label: 'With client' },
  { key: 'done', label: 'Finished' },
];

const ContractsTable = ({ contracts, onOpen }) => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const matchesFilter = (contract) => {
    if (filter === 'done') return !isLive(contract);
    if (filter === 'action') return Boolean(freelancerAction(contract));
    if (filter === 'waiting') return contract.status === 'delivered';
    return true;
  };

  const matchesSearch = (contract) => {
    const term = search.toLowerCase();
    return (
      contract.title.toLowerCase().includes(term) ||
      contract.client.toLowerCase().includes(term) ||
      contractRef(contract).toLowerCase().includes(term)
    );
  };

  const visible = contracts.filter(matchesFilter).filter(matchesSearch);

  return (
    <div className="wm-panel wm-panel--flush">
      <div className="wm-panel__head d-flex flex-wrap justify-content-between align-items-center gap-2">
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
            placeholder="Search project, client or ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ borderLeft: 0 }}
          />
        </InputGroup>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon="briefcase"
          title="No contracts here"
          body={search ? `Nothing matches "${search}".` : 'Contracts appear once a client accepts one of your proposals.'}
        />
      ) : (
        <Table hover responsive className="align-middle">
          <thead>
            <tr>
              <th>Project</th>
              <th>Value</th>
              <th>Deadline</th>
              <th>Status</th>
              <th className="text-end">Workspace</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((contract) => {
              const status = contractStatus(contract, 'freelancer');

              return (
                <tr key={contract.id} style={{ cursor: 'pointer' }} onClick={() => onOpen(contract.id)}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <Avatar name={contract.client} size={34} tone="slate" />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: 'var(--slate-dark)' }}>{contract.title}</div>
                        <div className="text-muted" style={{ fontSize: '0.78rem' }}>
                          {contractRef(contract)} &middot; {contract.client}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="wm-num">{money(contract.amount)}</td>
                  <td>
                    {isLive(contract) ? (
                      <Pill tone={deadlineTone(contract.deadline)}>{deadlineLabel(contract.deadline)}</Pill>
                    ) : (
                      <Pill tone="muted">Ended {shortDate(contract.deadline)}</Pill>
                    )}
                  </td>
                  <td><Pill tone={status.tone}>{status.label}</Pill></td>
                  <td className="text-end">
                    <Button
                      size="sm"
                      variant={freelancerAction(contract) ? 'primary' : 'outline-secondary'}
                      onClick={(e) => { e.stopPropagation(); onOpen(contract.id); }}
                    >
                      Open <Icon name="chevron" size={13} />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default ContractsTable;

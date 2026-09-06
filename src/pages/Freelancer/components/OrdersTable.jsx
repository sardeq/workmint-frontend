import { useState } from 'react';
import { Table, Button, Form, InputGroup } from 'react-bootstrap';
import Icon from '../../../components/Icon';
import { Pill, Avatar, EmptyState, EscrowBar } from '../../../components/Shared';
import {
  money, shortDate, deadlineLabel, deadlineTone, orderRef,
  orderStatus, orderTotal, orderReleased, orderProgress, unreadCount, needsAttention, byUrgency,
} from '../../../data/helpers';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'action', label: 'Needs you' },
  { key: 'awaiting', label: 'With client' },
  { key: 'completed', label: 'Completed' },
];

const OrdersTable = ({ orders, onOpen }) => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const matchesFilter = (order) => {
    const status = orderStatus(order).key;
    if (filter === 'all') return true;
    if (filter === 'completed') return status === 'completed';
    if (filter === 'awaiting') return status === 'awaiting';
    return needsAttention(order);
  };

  const matchesSearch = (order) => {
    const term = search.toLowerCase();
    return (
      order.project.toLowerCase().includes(term) ||
      order.client.toLowerCase().includes(term) ||
      orderRef(order).toLowerCase().includes(term)
    );
  };

  const visible = orders
    .filter(matchesFilter)
    .filter(matchesSearch)
    .sort(byUrgency('freelancer'));

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
          title="No orders here"
          body={search ? `Nothing matches "${search}".` : 'Orders appear once a client accepts one of your proposals.'}
        />
      ) : (
        <Table hover responsive className="align-middle">
          <thead>
            <tr>
              <th>Project</th>
              <th>Escrow released</th>
              <th>Value</th>
              <th>Deadline</th>
              <th>Status</th>
              <th className="text-end">Workspace</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((order) => {
              const status = orderStatus(order);
              const unread = unreadCount(order, 'freelancer');

              return (
                <tr key={order.id} style={{ cursor: 'pointer' }} onClick={() => onOpen(order.id)}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <Avatar name={order.client} size={34} tone="slate" />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: 'var(--slate-dark)' }}>{order.project}</div>
                        <div className="text-muted" style={{ fontSize: '0.78rem' }}>
                          {orderRef(order)} &middot; {order.client}
                          {unread > 0 && (
                            <span style={{ color: 'var(--mint-deep)', fontWeight: 600 }}> &middot; {unread} new</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ minWidth: 150 }}>
                    <div className="d-flex justify-content-between" style={{ fontSize: '0.78rem' }}>
                      <span className="wm-num" style={{ fontSize: '0.82rem' }}>{money(orderReleased(order))}</span>
                      <span className="text-muted">{orderProgress(order)}%</span>
                    </div>
                    <div className="mt-1"><EscrowBar released={orderReleased(order)} total={orderTotal(order)} /></div>
                  </td>
                  <td className="wm-num">{money(orderTotal(order))}</td>
                  <td>
                    {status.key === 'completed' ? (
                      <Pill tone="muted">Delivered {shortDate(order.deadline)}</Pill>
                    ) : (
                      <Pill tone={deadlineTone(order.deadline)}>{deadlineLabel(order.deadline)}</Pill>
                    )}
                  </td>
                  <td><Pill tone={status.tone}>{status.label}</Pill></td>
                  <td className="text-end">
                    <Button
                      size="sm"
                      variant={status.key === 'completed' ? 'outline-secondary' : 'primary'}
                      onClick={(e) => { e.stopPropagation(); onOpen(order.id); }}
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

export default OrdersTable;

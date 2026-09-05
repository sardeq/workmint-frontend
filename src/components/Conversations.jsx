import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import Icon from './Icon';
import { Pill, Avatar, EmptyState } from './Shared';
import { timeAgo, unreadCount, orderStatus } from '../data/freelancerData';

const Conversations = ({ orders, role, onSend, onRead, onOpenOrder }) => {
  const other = (order) => (role === 'client' ? order.freelancer.name : order.client);

  const sorted = [...orders].sort((a, b) => {
    const last = (o) => (o.messages.length ? new Date(o.messages[o.messages.length - 1].at) : 0);
    return last(b) - last(a);
  });

  const [activeId, setActiveId] = useState(sorted.length ? sorted[0].id : null);
  const [text, setText] = useState('');

  const active = orders.find((o) => o.id === activeId) || null;

  useEffect(() => {
    if (activeId) onRead(activeId, role);
  }, [activeId]);

  useEffect(() => {
    // Scroll the newest message into view (plain DOM, no ref needed).
    const node = document.getElementById('conversations-chat-end');
    if (node) node.scrollIntoView({ block: 'nearest' });
  }, [activeId, active ? active.messages.length : 0]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() || !active) return;
    onSend(active.id, role, text.trim());
    setText('');
  };

  if (orders.length === 0) {
    return (
      <div className="wm-panel">
        <EmptyState
          icon="chat"
          title="No conversations yet"
          body={role === 'client'
            ? 'A thread opens automatically when you hire someone.'
            : 'Threads open automatically when a client hires you.'}
        />
      </div>
    );
  }

  return (
    <div className="wm-panel wm-panel--flush">
      <Row className="g-0">
        <Col lg={4}>
          <div className="wm-thread-list">
            {sorted.map((order) => {
              const last = order.messages[order.messages.length - 1];
              const unread = unreadCount(order, role);
              return (
                <button
                  key={order.id}
                  type="button"
                  className={`wm-thread ${activeId === order.id ? 'active' : ''}`}
                  onClick={() => setActiveId(order.id)}
                >
                  <Avatar name={other(order)} size={38} tone="slate" />
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="wm-thread__name">{other(order)}</span>
                      <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                        {last ? timeAgo(last.at) : ''}
                      </span>
                    </div>
                    <div className="wm-thread__preview">{last ? last.text : 'No messages yet'}</div>
                    <div className="text-muted mt-1" style={{ fontSize: '0.72rem' }}>{order.project}</div>
                  </div>
                  {unread > 0 && <span className="wm-thread__dot" />}
                </button>
              );
            })}
          </div>
        </Col>

        <Col lg={8}>
          {active && (
            <>
              <div className="wm-panel__head d-flex justify-content-between align-items-center">
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--slate-dark)' }}>{other(active)}</div>
                  <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                    {active.project} &middot; {active.ref}
                  </div>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <Pill tone={orderStatus(active, role).tone}>{orderStatus(active, role).label}</Pill>
                  <Button size="sm" variant="outline-secondary" onClick={() => onOpenOrder(active.id)}>
                    Open workspace
                  </Button>
                </div>
              </div>

              <div className="wm-panel__body">
                {active.messages.length === 0 ? (
                  <EmptyState icon="chat" title="Start the conversation" body={`Say hello to ${other(active)}.`} />
                ) : (
                  <div className="wm-chat">
                    {active.messages.map((m) => (
                      <div key={m.id} className={`wm-bubble wm-bubble--${m.from === role ? 'you' : 'client'}`}>
                        {m.text}
                        <div className="wm-bubble__meta">
                          {m.from === role ? 'You' : other(active)} &middot; {timeAgo(m.at)}
                        </div>
                      </div>
                    ))}
                    <div id="conversations-chat-end" />
                  </div>
                )}

                <Form onSubmit={handleSend} className="d-flex gap-2 mt-3 pt-3 border-top">
                  <Form.Control
                    placeholder={`Message ${other(active)}`}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                  <Button type="submit" variant="primary" disabled={!text.trim()}>
                    <Icon name="send" size={15} />
                  </Button>
                </Form>
              </div>
            </>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default Conversations;
import { useState } from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import Icon from './Icon';
import { Avatar, EmptyState, Pill } from './Shared';
import { timeAgo, contractStatus } from '../data/helpers';

const Conversations = ({ contracts, role, onSend }) => {
  const [activeId, setActiveId] = useState(contracts.length > 0 ? contracts[0].id : null);
  const [text, setText] = useState('');

  const active = contracts.find((contract) => contract.id === activeId) || null;

  const other = (contract) => (role === 'client' ? contract.freelancer_name : contract.client);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() || !active) return;
    onSend(active.id, role, text.trim());
    setText('');
  };

  if (contracts.length === 0) {
    return (
      <div className="wm-panel">
        <EmptyState
          icon="chat"
          title="No conversations yet"
          body={
            role === 'client'
              ? 'A thread opens automatically when you hire someone.'
              : 'A thread opens automatically when a client hires you.'
          }
        />
      </div>
    );
  }

  return (
    <div className="wm-panel wm-panel--flush">
      <Row className="g-0">
        <Col lg={4}>
          <div className="wm-thread-list">
            {contracts.map((contract) => {
              const messages = contract.messages || [];
              const last = messages[messages.length - 1];

              return (
                <button
                  key={contract.id}
                  type="button"
                  className={`wm-thread ${activeId === contract.id ? 'active' : ''}`}
                  onClick={() => setActiveId(contract.id)}
                >
                  <Avatar name={other(contract)} size={38} tone="slate" />
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="wm-thread__name">{other(contract)}</span>
                      <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                        {last ? timeAgo(last.sent_at) : ''}
                      </span>
                    </div>
                    <div className="wm-thread__preview">{last ? last.body : 'No messages yet'}</div>
                    <div className="text-muted mt-1" style={{ fontSize: '0.72rem' }}>{contract.title}</div>
                  </div>
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
                  <div className="text-muted" style={{ fontSize: '0.8rem' }}>{active.title}</div>
                </div>
                <Pill tone={contractStatus(active, role).tone}>{contractStatus(active, role).label}</Pill>
              </div>

              <div className="wm-panel__body">
                {(active.messages || []).length === 0 ? (
                  <EmptyState icon="chat" title="Start the conversation" body={`Say hello to ${other(active)}.`} />
                ) : (
                  <div className="wm-chat">
                    {active.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`wm-bubble wm-bubble--${message.sender_role === role ? 'you' : 'client'}`}
                      >
                        {message.body}
                        <div className="wm-bubble__meta">
                          {message.sender_role === role ? 'You' : other(active)} &middot; {timeAgo(message.sent_at)}
                        </div>
                      </div>
                    ))}
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

import { useState, useEffect } from 'react';
import { Button, Form, Row, Col, Modal, Alert } from 'react-bootstrap';
import Icon from '../../../components/Icon';
import { Pill, EmptyState, Avatar } from '../../../components/Shared';
import RaiseDisputeModal from '../../../components/RaiseDisputeModal';
import {
  money, netOf, shortDate, timeAgo, deadlineLabel, deadlineTone, orderRef,
  MILESTONE_STATUS, orderStatus, orderTotal, orderReleased, orderEscrow, orderProgress, unreadCount,
  milestonesOf, messagesOf, activityOf, changeRequestsOf,
} from '../../../data/helpers';

const DOT_ICON = { approved: 'check', active: 'clock', submitted: 'upload', revision: 'revision', pending: 'lock', disputed: 'alert', refunded: 'back' };

const ProjectWorkspace = ({ order, onBack, onStart, onSubmit, onScopeChange, onSend, onRead, onRaiseDispute }) => {
  const [tab, setTab] = useState('milestones');
  const [drafts, setDrafts] = useState({});
  const [message, setMessage] = useState('');
  const [showScope, setShowScope] = useState(false);
  const [showDispute, setShowDispute] = useState(false);
  const [scopeForm, setScopeForm] = useState({ reason: '', extraCost: '', extraDays: '' });
  const [scopeError, setScopeError] = useState('');

  const unread = unreadCount(order, 'freelancer');
  const status = orderStatus(order);

  useEffect(() => {
    if (tab === 'messages') onRead(order.id, 'freelancer');
  }, [tab, order.id]);

  useEffect(() => {
    const node = document.getElementById('workspace-chat-end');
    if (tab === 'messages' && node) node.scrollIntoView({ block: 'nearest' });
  }, [tab, messagesOf(order).length]);

  const draftFor = (id) => drafts[id] || { link: '', note: '' };
  const setDraft = (id, changes) => setDrafts({ ...drafts, [id]: { ...draftFor(id), ...changes } });

  const handleDeliver = (e, milestone) => {
    e.preventDefault();
    const draft = draftFor(milestone.id);
    if (!draft.link.trim()) return;
    onSubmit(order.id, milestone.id, { link: draft.link.trim(), note: draft.note.trim() });
    setDrafts({ ...drafts, [milestone.id]: { link: '', note: '' } });
  };

  const handleScope = (e) => {
    e.preventDefault();
    if (scopeForm.reason.trim().length < 15) {
      setScopeError('Give the client at least a sentence explaining what changed.');
      return;
    }
    if (Number(scopeForm.extraCost) <= 0 && Number(scopeForm.extraDays) <= 0) {
      setScopeError('Ask for extra budget, extra days, or both.');
      return;
    }
    onScopeChange(order.id, scopeForm);
    setScopeForm({ reason: '', extraCost: '', extraDays: '' });
    setScopeError('');
    setShowScope(false);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    onSend(order.id, 'freelancer', message.trim());
    setMessage('');
  };

  const renderMilestone = (milestone, index) => {
    const meta = MILESTONE_STATUS[milestone.status];
    const draft = draftFor(milestone.id);
    const revisionsLeft = order.revisions_included - milestone.revisions_used;
    const canDeliver = milestone.status === 'active' || milestone.status === 'revision';

    return (
      <div className="wm-rail-item" key={milestone.id}>
        <span className={`wm-rail-dot wm-rail-dot--${milestone.status}`}>
          <Icon name={DOT_ICON[milestone.status]} size={11} strokeWidth={2.5} />
        </span>

        <div
          className={`wm-milestone ${canDeliver ? 'wm-milestone--live' : ''} ${
            milestone.status === 'revision' ? 'wm-milestone--revision' : ''
          } ${milestone.status === 'pending' ? 'wm-milestone--pending' : ''}`}
        >
          <div className="wm-milestone__head">
            <div>
              <p className="wm-milestone__title">
                <span className="text-muted me-2" style={{ fontWeight: 600 }}>{index + 1}.</span>
                {milestone.title}
              </p>
              <div className="wm-milestone__meta">
                Due {shortDate(milestone.due_date)}
                {milestone.status !== 'approved' && <> &middot; {deadlineLabel(milestone.due_date)}</>}
                {milestone.revisions_used > 0 && (
                  <> &middot; {milestone.revisions_used} of {order.revisions_included} revisions used</>
                )}
              </div>
            </div>
            <div className="wm-milestone__amount">
              <span className="wm-num">{money(milestone.amount)}</span>
              <small>{milestone.status === 'approved' ? `${money(netOf(milestone.amount))} paid to you` : 'in escrow'}</small>
              <div className="mt-1"><Pill tone={meta.tone}>{meta.label}</Pill></div>
            </div>
          </div>

          {milestone.status === 'revision' && (
            <div className="wm-note wm-note--danger">
              <strong>{order.client} asked for changes</strong>
              {milestone.revision_note}
              {revisionsLeft <= 0 && (
                <div className="mt-2">
                  <Pill tone="warn">No free revisions left</Pill>{' '}
                  <Button
                    size="sm"
                    variant="link"
                    className="p-0 align-baseline"
                    onClick={() => {
                      setScopeForm({ reason: `Additional revision on "${milestone.title}": `, extraCost: '', extraDays: '' });
                      setShowScope(true);
                    }}
                  >
                    Bill this as a scope change
                  </Button>
                </div>
              )}
            </div>
          )}

          {milestone.deliverable_link && milestone.status !== 'revision' && (
            <div className="wm-note wm-note--muted">
              <strong>Delivered {timeAgo(milestone.delivered_at)}</strong>
              <a href={milestone.deliverable_link} target="_blank" rel="noreferrer" className="text-decoration-none">
                {milestone.deliverable_link} <Icon name="external" size={12} />
              </a>
              {milestone.deliverable_note && <div className="text-muted mt-1">{milestone.deliverable_note}</div>}
            </div>
          )}

          {milestone.status === 'pending' && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <span className="text-muted" style={{ fontSize: '0.83rem' }}>
                Funded and waiting. Start it when you are ready to work.
              </span>
              <Button size="sm" variant="outline-primary" onClick={() => onStart(order.id, milestone.id)}>
                Start milestone
              </Button>
            </div>
          )}

          {canDeliver && (
            <Form onSubmit={(e) => handleDeliver(e, milestone)} className="mt-3">
              <Row className="g-2">
                <Col md={7}>
                  <Form.Control
                    type="url"
                    placeholder="Staging URL, repo link or shared folder"
                    value={draft.link}
                    onChange={(e) => setDraft(milestone.id, { link: e.target.value })}
                    required
                  />
                </Col>
                <Col md={5}>
                  <Form.Control
                    placeholder="What should they look at first?"
                    value={draft.note}
                    onChange={(e) => setDraft(milestone.id, { note: e.target.value })}
                  />
                </Col>
              </Row>
              <div className="d-flex justify-content-between align-items-center mt-2">
                <span className="text-muted" style={{ fontSize: '0.78rem' }}>
                  {order.client} gets a review request and {money(milestone.amount)} releases on approval.
                </span>
                <Button size="sm" variant="primary" type="submit">
                  <Icon name="upload" size={13} className="me-1" />
                  {milestone.status === 'revision' ? 'Resend for review' : 'Deliver milestone'}
                </Button>
              </div>
            </Form>
          )}

          {milestone.status === 'disputed' && (
            <div className="wm-note wm-note--danger">
              <strong>Frozen pending mediation</strong>
              {money(milestone.amount)} stays in escrow until a Workmint mediator decides the case.
            </div>
          )}

          {milestone.status === 'refunded' && (
            <div className="wm-note wm-note--muted">
              <strong>Refunded to the client</strong>
              This milestone was returned after mediation and is not payable.
            </div>
          )}

          {milestone.status === 'submitted' && (
            <div className="wm-note wm-note--muted">
              <strong>With {order.client}</strong>
              They approve to release {money(milestone.amount)}, or send it back with notes.
            </div>
          )}

        </div>
      </div>
    );
  };

  return (
    <div>
      <Button variant="link" onClick={onBack} className="p-0 mb-3 text-decoration-none">
        <Icon name="back" size={15} className="me-1" /> All orders
      </Button>

      <div className="wm-panel mb-3">
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
          <div style={{ minWidth: 0 }}>
            <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
              <h4 className="m-0" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--slate-dark)' }}>
                {order.project}
              </h4>
              <Pill tone={status.tone}>{status.label}</Pill>
              {status.key === 'completed' ? (
                <Pill tone="muted">Delivered {shortDate(order.deadline)}</Pill>
              ) : (
                <Pill tone={deadlineTone(order.deadline)}>{deadlineLabel(order.deadline)}</Pill>
              )}
            </div>
            <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: '0.85rem' }}>
              <Avatar name={order.client} size={24} tone="slate" />
              {order.client} &middot; {orderRef(order)} &middot; started {shortDate(order.started_on)}
            </div>
            <p className="text-muted mt-2 mb-0" style={{ fontSize: '0.87rem', maxWidth: 620 }}>{order.brief}</p>
          </div>

          <div className="d-flex gap-2">
            <Button variant="outline-secondary" size="sm" onClick={() => setTab('messages')}>
              <Icon name="chat" size={14} className="me-1" /> Message client
            </Button>
            <Button variant="outline-primary" size="sm" onClick={() => setShowScope(true)}>
              Request scope change
            </Button>
            <Button variant="outline-secondary" size="sm" onClick={() => setShowDispute(true)}>
              Open a dispute
            </Button>
          </div>
        </div>

        <Row className="g-3 mt-1 pt-3 border-top">
          <Col xs={6} md={3}>
            <div className="wm-eyebrow">Released to you</div>
            <div className="wm-num" style={{ fontSize: '1.25rem' }}>{money(orderReleased(order))}</div>
          </Col>
          <Col xs={6} md={3}>
            <div className="wm-eyebrow">Held in escrow</div>
            <div className="wm-num" style={{ fontSize: '1.25rem', color: 'var(--amber)' }}>{money(orderEscrow(order))}</div>
          </Col>
          <Col xs={6} md={3}>
            <div className="wm-eyebrow">Contract value</div>
            <div className="wm-num" style={{ fontSize: '1.25rem' }}>{money(orderTotal(order))}</div>
          </Col>
          <Col xs={6} md={3}>
            <div className="wm-eyebrow">Complete</div>
            <div className="wm-num" style={{ fontSize: '1.25rem' }}>{orderProgress(order)}%</div>
          </Col>
        </Row>
      </div>

      <div className="wm-tabs">
        <button type="button" className={`wm-tab ${tab === 'milestones' ? 'active' : ''}`} onClick={() => setTab('milestones')}>
          <Icon name="layers" size={14} /> Milestones
        </button>
        <button type="button" className={`wm-tab ${tab === 'messages' ? 'active' : ''}`} onClick={() => setTab('messages')}>
          <Icon name="chat" size={14} /> Messages
          {unread > 0 && <span className="wm-tab__count">{unread}</span>}
        </button>
        <button type="button" className={`wm-tab ${tab === 'requests' ? 'active' : ''}`} onClick={() => setTab('requests')}>
          <Icon name="file" size={14} /> Scope changes
        </button>
        <button type="button" className={`wm-tab ${tab === 'activity' ? 'active' : ''}`} onClick={() => setTab('activity')}>
          <Icon name="clock" size={14} /> Activity
        </button>
      </div>

      {tab === 'milestones' && <div className="wm-rail">{milestonesOf(order).map(renderMilestone)}</div>}

      {tab === 'messages' && (
        <div className="wm-panel">
          {messagesOf(order).length === 0 ? (
            <EmptyState icon="chat" title="No messages yet" body={`Say hello to ${order.client} and confirm the first milestone.`} />
          ) : (
            <div className="wm-chat">
              {messagesOf(order).map((item) => (
                <div key={item.id} className={`wm-bubble wm-bubble--${item.sender_role === 'freelancer' ? 'you' : 'client'}`}>
                  {item.body}
                  <div className="wm-bubble__meta">
                    {item.sender_role === 'freelancer' ? 'You' : order.client} &middot; {timeAgo(item.sent_at)}
                  </div>
                </div>
              ))}
              <div id="workspace-chat-end" />
            </div>
          )}

          <Form onSubmit={handleSend} className="d-flex gap-2 mt-3 pt-3 border-top">
            <Form.Control
              placeholder={`Message ${order.client}`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button type="submit" variant="primary" disabled={!message.trim()}>
              <Icon name="send" size={15} />
            </Button>
          </Form>
        </div>
      )}

      {tab === 'requests' && (
        <div className="wm-panel">
          {changeRequestsOf(order).length === 0 ? (
            <EmptyState
              icon="file"
              title="No scope changes on this order"
              body="If the client asks for work outside the brief, raise it here instead of absorbing it."
              action={<Button size="sm" variant="outline-primary" onClick={() => setShowScope(true)}>Request scope change</Button>}
            />
          ) : (
            changeRequestsOf(order).map((cr) => (
              <div key={cr.id} className="d-flex justify-content-between align-items-start gap-3 py-3 border-bottom">
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--slate-dark)', fontSize: '0.92rem' }}>{cr.reason}</div>
                  <div className="text-muted" style={{ fontSize: '0.8rem' }}>Sent {timeAgo(cr.created_at)}</div>
                </div>
                <div className="text-end">
                  <div className="wm-num">+{money(cr.extra_cost)}</div>
                  <div className="text-muted" style={{ fontSize: '0.78rem' }}>+{cr.extra_days} days</div>
                  <Pill tone={cr.status === 'Approved' ? 'success' : cr.status === 'Declined' ? 'danger' : 'warn'}>
                    {cr.status}
                  </Pill>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'activity' && (
        <div className="wm-panel">
          <ul className="wm-timeline">
            {activityOf(order).map((item) => (
              <li key={item.id} className={item.actor === 'client' ? 'is-client' : item.actor === 'system' ? 'is-system' : ''}>
                {item.text}
                <time>{timeAgo(item.at)}</time>
              </li>
            ))}
          </ul>
        </div>
      )}

      <RaiseDisputeModal
        show={showDispute}
        onHide={() => setShowDispute(false)}
        order={order}
        role="freelancer"
        onSubmit={onRaiseDispute}
      />

      <Modal show={showScope} onHide={() => setShowScope(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Request a scope change</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleScope}>
          <Modal.Body>
            <p className="text-muted" style={{ fontSize: '0.87rem' }}>
              {order.client} reviews this before any extra money is funded. Nothing changes until they approve.
            </p>
            {scopeError && <Alert variant="danger" className="py-2" style={{ fontSize: '0.85rem' }}>{scopeError}</Alert>}

            <Form.Group className="mb-3">
              <Form.Label>What changed</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="The client added two more API endpoints and a role permission matrix that were not in the brief."
                value={scopeForm.reason}
                onChange={(e) => setScopeForm({ ...scopeForm, reason: e.target.value })}
              />
            </Form.Group>

            <Row>
              <Col xs={6}>
                <Form.Group>
                  <Form.Label>Extra budget</Form.Label>
                  <Form.Control
                    type="number" min="0" placeholder="0"
                    value={scopeForm.extraCost}
                    onChange={(e) => setScopeForm({ ...scopeForm, extraCost: e.target.value })}
                  />
                  <Form.Text>You keep {money(netOf(Number(scopeForm.extraCost) || 0))} after the fee.</Form.Text>
                </Form.Group>
              </Col>
              <Col xs={6}>
                <Form.Group>
                  <Form.Label>Extra days</Form.Label>
                  <Form.Control
                    type="number" min="0" placeholder="0"
                    value={scopeForm.extraDays}
                    onChange={(e) => setScopeForm({ ...scopeForm, extraDays: e.target.value })}
                  />
                  <Form.Text>New deadline moves to match.</Form.Text>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setShowScope(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Send request</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectWorkspace;
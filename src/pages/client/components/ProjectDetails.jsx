import { useState, useEffect } from 'react';
import { Button, Form, Row, Col, Modal, Alert } from 'react-bootstrap';
import Icon from '../../../components/Icon';
import { Pill, EmptyState, Avatar } from '../../../components/Shared';
import RaiseDisputeModal from '../../../components/RaiseDisputeModal';
import {
  money, num, netOf, shortDate, timeAgo, deadlineLabel, deadlineTone, orderRef,
  MILESTONE_STATUS, orderStatus, orderTotal, orderReleased, orderEscrow, orderProgress, unreadCount,
  milestonesOf, messagesOf, activityOf, changeRequestsOf,
} from '../../../data/helpers';

const DOT_ICON = { approved: 'check', active: 'clock', submitted: 'upload', revision: 'revision', pending: 'lock', disputed: 'alert', refunded: 'back' };

const ProjectDetails = ({ order, onBack, onApprove, onRequestRevision, onDecideScope, onSend, onRead, onRaiseDispute }) => {
  const [tab, setTab] = useState('milestones');
  const [message, setMessage] = useState('');
  const [revisionFor, setRevisionFor] = useState(null);
  const [revisionNote, setRevisionNote] = useState('');
  const [revisionError, setRevisionError] = useState('');
  const [confirming, setConfirming] = useState(null);
  const [showDispute, setShowDispute] = useState(false);

  const unread = unreadCount(order, 'client');
  const status = orderStatus(order, 'client');
  const pendingScope = changeRequestsOf(order).filter((cr) => cr.status === 'Pending').length;

  useEffect(() => {
    if (tab === 'messages') onRead(order.id, 'client');
  }, [tab, order.id]);

  useEffect(() => {
    const node = document.getElementById('project-chat-end');
    if (tab === 'messages' && node) node.scrollIntoView({ block: 'nearest' });
  }, [tab, messagesOf(order).length]);

  const confirmApprove = () => {
    onApprove(order.id, confirming.id);
    setConfirming(null);
  };

  const submitRevision = (e, milestone) => {
    e.preventDefault();
    if (revisionNote.trim().length < 15) {
      setRevisionError('Say what needs to change. "Please fix" costs everyone another round.');
      return;
    }
    onRequestRevision(order.id, milestone.id, revisionNote.trim());
    setRevisionFor(null);
    setRevisionNote('');
    setRevisionError('');
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    onSend(order.id, 'client', message.trim());
    setMessage('');
  };

  const renderMilestone = (milestone, index) => {
    const meta = MILESTONE_STATUS[milestone.status];
    const revisionsLeft = order.revisions_included - milestone.revisions_used;
    const awaitingYou = milestone.status === 'submitted';

    return (
      <div className="wm-rail-item" key={milestone.id}>
        <span className={`wm-rail-dot wm-rail-dot--${milestone.status}`}>
          <Icon name={DOT_ICON[milestone.status]} size={11} strokeWidth={2.5} />
        </span>

        <div className={`wm-milestone ${awaitingYou ? 'wm-milestone--live' : ''} ${milestone.status === 'pending' ? 'wm-milestone--pending' : ''}`}>
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
              <small>{milestone.status === 'approved' ? 'released' : 'held in escrow'}</small>
              <div className="mt-1"><Pill tone={meta.tone}>{meta.label}</Pill></div>
            </div>
          </div>

          {milestone.deliverable_link && (
            <div className={`wm-note ${milestone.status === 'revision' ? 'wm-note--muted' : ''}`}>
              <strong>Delivered {timeAgo(milestone.delivered_at)}</strong>
              <a href={milestone.deliverable_link} target="_blank" rel="noreferrer" className="text-decoration-none">
                {milestone.deliverable_link} <Icon name="external" size={12} />
              </a>
              {milestone.deliverable_note && <div className="text-muted mt-1">{milestone.deliverable_note}</div>}
            </div>
          )}

          {milestone.status === 'revision' && (
            <div className="wm-note wm-note--danger">
              <strong>You asked for changes</strong>
              {milestone.revision_note}
              <div className="text-muted mt-2" style={{ fontSize: '0.82rem' }}>
                Waiting on {order.freelancer_name} to resend.
              </div>
            </div>
          )}

          {milestone.status === 'disputed' && (
            <div className="wm-note wm-note--danger">
              <strong>Frozen pending mediation</strong>
              {money(milestone.amount)} stays in escrow until a Workmint mediator decides the case.
            </div>
          )}

          {milestone.status === 'refunded' && (
            <div className="wm-note wm-note--muted">
              <strong>Refunded to you</strong>
              This milestone was returned after mediation. Nothing was paid out.
            </div>
          )}

          {milestone.status === 'active' && (
            <p className="text-muted mb-0 mt-3" style={{ fontSize: '0.85rem' }}>
              {order.freelancer_name} is working on this. You will be notified when it arrives.
            </p>
          )}

          {milestone.status === 'pending' && (
            <p className="text-muted mb-0 mt-3" style={{ fontSize: '0.85rem' }}>
              Funded and queued. Work starts once the previous milestone is settled.
            </p>
          )}

          {awaitingYou && revisionFor !== milestone.id && (
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3">
              <span className="text-muted" style={{ fontSize: '0.82rem' }}>
                Approving releases {money(milestone.amount)} immediately.
                {revisionsLeft > 0
                  ? ` ${revisionsLeft} free ${revisionsLeft === 1 ? 'revision' : 'revisions'} left.`
                  : ' No free revisions left on this order.'}
              </span>
              <div className="d-flex gap-2">
                <Button size="sm" variant="outline-secondary" onClick={() => { setRevisionFor(milestone.id); setRevisionNote(''); setRevisionError(''); }}>
                  <Icon name="revision" size={13} className="me-1" /> Request a revision
                </Button>
                <Button size="sm" variant="primary" onClick={() => setConfirming(milestone)}>
                  <Icon name="check" size={13} className="me-1" /> Approve and release
                </Button>
              </div>
            </div>
          )}

          {revisionFor === milestone.id && (
            <Form onSubmit={(e) => submitRevision(e, milestone)} className="mt-3">
              {revisionError && (
                <Alert variant="danger" className="py-2" style={{ fontSize: '0.84rem' }}>{revisionError}</Alert>
              )}
              <Form.Group className="mb-2">
                <Form.Label>What needs to change?</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Be specific: which screen, which behaviour, what you expected instead."
                  value={revisionNote}
                  onChange={(e) => setRevisionNote(e.target.value)}
                />
              </Form.Group>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                  This counts as revision {milestone.revisions_used + 1} of {order.revisions_included}.
                </span>
                <div className="d-flex gap-2">
                  <Button size="sm" variant="outline-secondary" onClick={() => setRevisionFor(null)}>Cancel</Button>
                  <Button size="sm" variant="primary" type="submit">Send it back</Button>
                </div>
              </div>
            </Form>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <Button variant="link" onClick={onBack} className="p-0 mb-3 text-decoration-none">
        <Icon name="back" size={15} className="me-1" /> All projects
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
              <Avatar name={order.freelancer_name} size={24} />
              {order.freelancer_name} &middot; {order.freelancer_title} &middot; {orderRef(order)}
            </div>
            <p className="text-muted mt-2 mb-0" style={{ fontSize: '0.87rem', maxWidth: 620 }}>{order.brief}</p>
          </div>

          <div className="d-flex gap-2">
            <Button variant="outline-secondary" size="sm" onClick={() => setTab('messages')}>
              <Icon name="chat" size={14} className="me-1" /> Message {order.freelancer_name.split(' ')[0]}
            </Button>
            <Button variant="outline-secondary" size="sm" onClick={() => setShowDispute(true)}>
              Open a dispute
            </Button>
          </div>
        </div>

        <Row className="g-3 mt-1 pt-3 border-top">
          <Col xs={6} md={3}>
            <div className="wm-eyebrow">Released so far</div>
            <div className="wm-num" style={{ fontSize: '1.25rem' }}>{money(orderReleased(order))}</div>
          </Col>
          <Col xs={6} md={3}>
            <div className="wm-eyebrow">Still in escrow</div>
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
          {pendingScope > 0 && <span className="wm-tab__count">{pendingScope}</span>}
        </button>
        <button type="button" className={`wm-tab ${tab === 'activity' ? 'active' : ''}`} onClick={() => setTab('activity')}>
          <Icon name="clock" size={14} /> Activity
        </button>
      </div>

      {tab === 'milestones' && <div className="wm-rail">{milestonesOf(order).map(renderMilestone)}</div>}

      {tab === 'messages' && (
        <div className="wm-panel">
          {messagesOf(order).length === 0 ? (
            <EmptyState icon="chat" title="No messages yet" body={`Say hello to ${order.freelancer_name}.`} />
          ) : (
            <div className="wm-chat">
              {messagesOf(order).map((item) => (
                <div key={item.id} className={`wm-bubble wm-bubble--${item.sender_role === 'client' ? 'you' : 'client'}`}>
                  {item.body}
                  <div className="wm-bubble__meta">
                    {item.sender_role === 'client' ? 'You' : order.freelancer_name} &middot; {timeAgo(item.sent_at)}
                  </div>
                </div>
              ))}
              <div id="project-chat-end" />
            </div>
          )}

          <Form onSubmit={handleSend} className="d-flex gap-2 mt-3 pt-3 border-top">
            <Form.Control
              placeholder={`Message ${order.freelancer_name}`}
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
              title="No scope changes"
              body="If the freelancer hits work outside the brief, their request lands here before anything is charged."
            />
          ) : (
            changeRequestsOf(order).map((cr) => (
              <div key={cr.id} className="py-3 border-bottom">
                <div className="d-flex justify-content-between align-items-start gap-3">
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--slate-dark)', fontSize: '0.92rem' }}>{cr.reason}</div>
                    <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                      From {order.freelancer_name} &middot; {timeAgo(cr.created_at)}
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="wm-num">+{money(cr.extra_cost)}</div>
                    <div className="text-muted" style={{ fontSize: '0.78rem' }}>+{cr.extra_days} days</div>
                    <Pill tone={cr.status === 'Approved' ? 'success' : cr.status === 'Declined' ? 'danger' : 'warn'}>
                      {cr.status}
                    </Pill>
                  </div>
                </div>

                {cr.status === 'Pending' && (
                  <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3">
                    <span className="text-muted" style={{ fontSize: '0.82rem' }}>
                      Approving funds {money(cr.extra_cost)} more into escrow as a new milestone.
                    </span>
                    <div className="d-flex gap-2">
                      <Button size="sm" variant="outline-secondary" onClick={() => onDecideScope(order.id, cr.id, 'Declined')}>
                        Decline
                      </Button>
                      <Button size="sm" variant="primary" onClick={() => onDecideScope(order.id, cr.id, 'Approved')}>
                        Approve and fund
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'activity' && (
        <div className="wm-panel">
          <ul className="wm-timeline">
            {activityOf(order).map((item) => (
              <li key={item.id} className={item.actor === 'freelancer' ? 'is-client' : item.actor === 'system' ? 'is-system' : ''}>
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
        role="client"
        onSubmit={onRaiseDispute}
      />

      <Modal show={Boolean(confirming)} onHide={() => setConfirming(null)} centered>
        {confirming && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>Release {money(confirming.amount)}?</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p style={{ fontSize: '0.9rem' }}>
                This approves <strong>{confirming.title}</strong> and pays {order.freelancer_name} straight away.
                Releases cannot be reversed, so check the delivery first.
              </p>
              <div className="wm-panel" style={{ background: '#f8fafc' }}>
                <div className="d-flex justify-content-between py-1" style={{ fontSize: '0.87rem' }}>
                  <span className="text-muted">Released from escrow</span>
                  <span className="wm-num">{money(confirming.amount)}</span>
                </div>
                <div className="d-flex justify-content-between py-1" style={{ fontSize: '0.87rem' }}>
                  <span className="text-muted">{order.freelancer_name} receives</span>
                  <span className="wm-num">{money(netOf(confirming.amount))}</span>
                </div>
                <div className="d-flex justify-content-between py-1 border-top mt-1 pt-2" style={{ fontSize: '0.87rem' }}>
                  <span className="text-muted">Left in escrow after this</span>
                  <span className="wm-num" style={{ color: 'var(--amber)' }}>
                    {money(orderEscrow(order) - num(confirming.amount))}
                  </span>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="outline-secondary" onClick={() => setConfirming(null)}>Not yet</Button>
              <Button variant="primary" onClick={confirmApprove}>Approve and release</Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </div>
  );
};

export default ProjectDetails;
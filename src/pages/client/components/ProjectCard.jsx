import React from 'react';
import { Button } from 'react-bootstrap';
import Icon from '../../../components/Icon';
import { Pill, Avatar, EscrowBar } from '../../../components/Shared';
import {
  money, shortDate, deadlineLabel, deadlineTone,
  orderStatus, orderTotal, orderReleased, orderEscrow, orderProgress, unreadCount, clientNextAction,
} from '../../../data/freelancerData';

/* One card per contract. Everything on it answers "where is my money and
   what happens next", which is the only question a client card needs to. */
const ProjectCard = ({ project, onOpen }) => {
  const status = orderStatus(project, 'client');
  const action = clientNextAction(project);
  const unread = unreadCount(project, 'client');
  const done = status.key === 'completed';

  return (
    <div className="wm-panel h-100 d-flex flex-column">
      <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
        <div style={{ minWidth: 0 }}>
          <h6 style={{ fontWeight: 700, color: 'var(--slate-dark)', marginBottom: '0.35rem' }}>{project.project}</h6>
          <div className="d-flex align-items-center gap-2">
            <Avatar name={project.freelancer.name} size={26} />
            <span className="text-muted" style={{ fontSize: '0.82rem' }}>{project.freelancer.name}</span>
          </div>
        </div>
        <Pill tone={status.tone}>{status.label}</Pill>
      </div>

      <div className="d-flex justify-content-between align-items-baseline mb-1">
        <span className="wm-num" style={{ fontSize: '1.15rem' }}>{money(orderReleased(project))}</span>
        <span className="text-muted" style={{ fontSize: '0.8rem' }}>
          released of {money(orderTotal(project))}
        </span>
      </div>
      <EscrowBar released={orderReleased(project)} total={orderTotal(project)} />

      <div className="d-flex justify-content-between mt-2 mb-3" style={{ fontSize: '0.79rem' }}>
        <span className="text-muted">
          <span className="wm-num" style={{ fontSize: '0.82rem', color: 'var(--amber)' }}>
            {money(orderEscrow(project))}
          </span> in escrow
        </span>
        <span className="text-muted">{orderProgress(project)}% complete</span>
      </div>

      <div className="d-flex justify-content-between align-items-center pt-3 border-top" style={{ fontSize: '0.8rem' }}>
        <span className="text-muted">
          {done ? `Delivered ${shortDate(project.deadline)}` : deadlineLabel(project.deadline)}
        </span>
        {!done && <Pill tone={deadlineTone(project.deadline)}>{project.milestones.length} milestones</Pill>}
      </div>

      {action && (
        <div className="wm-note wm-note--danger mt-3 mb-0">
          <strong>Needs you</strong>
          {action.label}
        </div>
      )}

      <div className="mt-auto pt-3">
        <Button
          variant={action ? 'primary' : 'outline-secondary'}
          size="sm"
          className="w-100"
          onClick={() => onOpen(project.id)}
        >
          Open project
          {unread > 0 && <span className="ms-2"><Icon name="chat" size={12} /> {unread}</span>}
        </Button>
      </div>
    </div>
  );
};

export default ProjectCard;
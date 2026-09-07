import { Button } from 'react-bootstrap';
import { Pill, Avatar } from '../../../components/Shared';
import {
  money, shortDate, deadlineLabel, deadlineTone, isLive, contractStatus, clientAction,
} from '../../../data/helpers';

const ProjectCard = ({ contract, onOpen }) => {
  const status = contractStatus(contract, 'client');
  const action = clientAction(contract);

  return (
    <div className="wm-panel h-100 d-flex flex-column">
      <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
        <div style={{ minWidth: 0 }}>
          <h6 style={{ fontWeight: 700, color: 'var(--slate-dark)', marginBottom: '0.35rem' }}>
            {contract.title}
          </h6>
          <div className="d-flex align-items-center gap-2">
            <Avatar name={contract.freelancer_name} size={26} />
            <span className="text-muted" style={{ fontSize: '0.82rem' }}>{contract.freelancer_name}</span>
          </div>
        </div>
        <Pill tone={status.tone}>{status.label}</Pill>
      </div>

      <div className="d-flex justify-content-between align-items-baseline mb-3">
        <span className="wm-num" style={{ fontSize: '1.15rem' }}>{money(contract.amount)}</span>
        <span className="text-muted" style={{ fontSize: '0.8rem' }}>
          {contract.status === 'approved' ? 'released' : 'in escrow'}
        </span>
      </div>

      <div className="d-flex justify-content-between align-items-center pt-3 border-top" style={{ fontSize: '0.8rem' }}>
        <span className="text-muted">
          {isLive(contract) ? deadlineLabel(contract.deadline) : `Ended ${shortDate(contract.deadline)}`}
        </span>
        {isLive(contract) && <Pill tone={deadlineTone(contract.deadline)}>Due {shortDate(contract.deadline)}</Pill>}
      </div>

      {action && (
        <div className="wm-note wm-note--danger mt-3 mb-0">
          <strong>Needs you</strong>
          {action}
        </div>
      )}

      <div className="mt-auto pt-3">
        <Button
          variant={action ? 'primary' : 'outline-secondary'}
          size="sm"
          className="w-100"
          onClick={() => onOpen(contract.id)}
        >
          Open project
        </Button>
      </div>
    </div>
  );
};

export default ProjectCard;

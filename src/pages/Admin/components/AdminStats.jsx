import { Row, Col } from 'react-bootstrap';
import { StatCard } from '../../../components/Shared';
import { money, num, FEE_RATE, orderEscrow, orderReleased } from '../../../data/helpers';

const AdminStats = ({ orders, users, disputes }) => {
  const escrow = orders.reduce((sum, order) => sum + orderEscrow(order), 0);
  const released = orders.reduce((sum, order) => sum + orderReleased(order), 0);
  const fees = Math.round(released * FEE_RATE);

  const openDisputes = disputes.filter((dispute) => dispute.status !== 'Resolved');
  const frozen = openDisputes.reduce((sum, dispute) => sum + num(dispute.amount), 0);
  const pending = users.filter((person) => person.status === 'pending').length;

  return (
    <Row className="g-3 mb-4">
      <Col sm={6} xl={3}>
        <StatCard
          label="Held in escrow" icon="lock" tone="warn"
          value={money(escrow)}
          sub="Across every live contract"
        />
      </Col>
      <Col sm={6} xl={3}>
        <StatCard
          label="Released to date" icon="check" tone="success"
          value={money(released)}
          sub={`${money(fees)} in platform fees`}
        />
      </Col>
      <Col sm={6} xl={3}>
        <StatCard
          label="Open disputes" icon="alert" tone={openDisputes.length > 0 ? 'danger' : 'muted'}
          value={openDisputes.length}
          sub={frozen > 0 ? `${money(frozen)} frozen` : 'Nothing frozen'}
        />
      </Col>
      <Col sm={6} xl={3}>
        <StatCard
          label="Pending approvals" icon="user" tone={pending > 0 ? 'info' : 'muted'}
          value={pending}
          sub={pending > 0 ? 'Waiting on screening' : 'Queue is clear'}
        />
      </Col>
    </Row>
  );
};

export default AdminStats;
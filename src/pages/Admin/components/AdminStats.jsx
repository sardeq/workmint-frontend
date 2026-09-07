import { Row, Col } from 'react-bootstrap';
import { StatCard } from '../../../components/Shared';
import { money, isLive, escrowOf, releasedOf, sumBy, FEE_RATE } from '../../../data/helpers';

const AdminStats = ({ contracts, users }) => {
  const escrow = sumBy(contracts.filter(isLive), escrowOf);
  const released = sumBy(contracts, releasedOf);
  const fees = Math.round(released * FEE_RATE);

  const pending = users.filter((person) => person.status === 'pending').length;
  const suspended = users.filter((person) => person.status === 'suspended').length;

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
          label="Pending approvals" icon="user" tone={pending > 0 ? 'info' : 'muted'}
          value={pending}
          sub={pending > 0 ? 'Waiting on screening' : 'Queue is clear'}
        />
      </Col>
      <Col sm={6} xl={3}>
        <StatCard
          label="Suspended accounts" icon="alert" tone={suspended > 0 ? 'danger' : 'muted'}
          value={suspended}
          sub={suspended > 0 ? 'Blocked from signing in' : 'None blocked'}
        />
      </Col>
    </Row>
  );
};

export default AdminStats;

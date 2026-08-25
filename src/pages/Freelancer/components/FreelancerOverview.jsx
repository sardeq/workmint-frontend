import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';

const FreelancerOverview = ({ orders, proposals }) => {
  const totalEarned = orders.filter(o => o.status === 'Completed')
    .reduce((sum, o) => sum + parseInt(o.price.replace('$','').replace(',','')), 0);
  return (
    <Row className="g-3">
      <Col md={4}>
        <Card className="border-0 shadow-sm p-3">
          <h6 className="text-muted">Active Orders</h6>
          <h3>{orders.filter(o => o.status !== 'Completed').length}</h3>
        </Card>
      </Col>
      <Col md={4}>
        <Card className="border-0 shadow-sm p-3">
          <h6 className="text-muted">Total Earned</h6>
          <h3>${totalEarned.toLocaleString()}</h3>
        </Card>
      </Col>
      <Col md={4}>
        <Card className="border-0 shadow-sm p-3">
          <h6 className="text-muted">Proposals Submitted</h6>
          <h3>{proposals.length}</h3>
        </Card>
      </Col>
    </Row>
  );
};
export default FreelancerOverview;
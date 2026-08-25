import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';

const ClientOverview = ({ projects }) => {
  const totalSpent = projects.reduce((sum, p) => sum + p.costUSD, 0);
  const active = projects.filter(p => p.status !== 'Completed').length;
  return (
    <Row className="g-3">
      <Col md={4}>
        <Card className="border-0 shadow-sm p-3">
          <h6 className="text-muted">Active Projects</h6>
          <h3>{active}</h3>
        </Card>
      </Col>
      <Col md={4}>
        <Card className="border-0 shadow-sm p-3">
          <h6 className="text-muted">Total Spent</h6>
          <h3>${totalSpent}</h3>
        </Card>
      </Col>
      <Col md={4}>
        <Card className="border-0 shadow-sm p-3">
          <h6 className="text-muted">Pending Proposals</h6>
          <h3>0</h3> {/* Could be fetched */}
        </Card>
      </Col>
    </Row>
  );
};
export default ClientOverview;
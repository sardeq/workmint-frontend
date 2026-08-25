import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';

const AdminOverview = () => {
  // Mock stats
  return (
    <Row className="g-3">
      <Col md={3}>
        <Card className="border-0 shadow-sm p-3">
          <h6 className="text-muted">Total Users</h6>
          <h3>124</h3>
        </Card>
      </Col>
      <Col md={3}>
        <Card className="border-0 shadow-sm p-3">
          <h6 className="text-muted">Total Jobs</h6>
          <h3>45</h3>
        </Card>
      </Col>
      <Col md={3}>
        <Card className="border-0 shadow-sm p-3">
          <h6 className="text-muted">Total Revenue</h6>
          <h3>$18,200</h3>
        </Card>
      </Col>
      <Col md={3}>
        <Card className="border-0 shadow-sm p-3">
          <h6 className="text-muted">Active Disputes</h6>
          <h3 className="text-danger">2</h3>
        </Card>
      </Col>
    </Row>
  );
};
export default AdminOverview;
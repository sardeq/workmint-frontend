import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';

// Passing data down via props
const AdminStats = ({ exchangeRate, activeDisputes, pendingApprovalsCount = 3 }) => {
  // Localized static analytics logic
  const analytics = {
    platformFee: 4825,
    growth: 14
  };

  return (
    <Row className="g-3 mb-4">
      <Col md={3}>
        <Card className="border-0 shadow-sm rounded-4 bg-primary text-white p-3">
          <Card.Body>
            <h6 className="text-white-50 text-uppercase">Platform Escrow</h6>
            <h3>$48,250 USD</h3>
            <small>≈ €{(48250 * exchangeRate).toFixed(2)} EUR</small>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3}>
        <Card className="border-0 shadow-sm rounded-4 bg-dark text-white p-3">
          <Card.Body>
            <h6 className="text-secondary text-uppercase">Pending Approvals</h6>
            <h3>{pendingApprovalsCount}</h3>
            <small className="text-warning">Requires screening</small>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3}>
        <Card className="border-0 shadow-sm rounded-4 bg-white p-3">
          <Card.Body>
            <h6 className="text-muted text-uppercase">Active Disputes</h6>
            <h3 className="text-danger">{activeDisputes}</h3>
            <small className="text-muted">Awaiting mediation</small>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3}>
        <Card className="border-0 shadow-sm rounded-4 bg-white p-3">
          <Card.Body>
            <h6 className="text-muted text-uppercase">Platform Fee (10%)</h6>
            <h3 className="text-success">${analytics.platformFee} USD</h3>
            <small className="text-success">↑ {analytics.growth}% vs last month</small>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default AdminStats;
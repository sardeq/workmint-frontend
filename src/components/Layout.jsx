import React from 'react';
import { Container, Row, Col, Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Layout = ({ user, title, children }) => {
  const navigate = useNavigate();

  if (!user) {
    return (
      <Container className="mt-5 text-center">
        <h3>Access Denied. Please login.</h3>
        <button className="btn btn-primary mt-3" onClick={() => navigate('/')}>Go Home</button>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Row style={{ minHeight: '100vh' }}>
        <Col md={2} className="bg-dark text-white p-4">
          <div className="d-flex align-items-center mb-4">
            <div className="bg-secondary me-2" style={{ width: '40px', height: '40px' }}></div>
            <h5 className="mb-0 text-uppercase">{user.role} DASHBOARD</h5>
          </div>
          <Nav className="flex-column gap-2">
            <Nav.Link className="text-light bg-secondary rounded px-3 py-2">Overview</Nav.Link>
            <Nav.Link className="text-muted px-3 py-2">Projects</Nav.Link>
            <Nav.Link className="text-muted px-3 py-2">Payments</Nav.Link>
            <Nav.Link className="text-danger mt-5 px-3 py-2" onClick={() => navigate('/')}>Logout</Nav.Link>
          </Nav>
        </Col>
        
        <Col md={10} className="p-5 bg-light">
          <h3 className="mb-4">{title}</h3>
          {children}
        </Col>
      </Row>
    </Container>
  );
};

export default Layout;
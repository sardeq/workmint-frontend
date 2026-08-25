import React, { useState } from 'react';
import { Container, Navbar, Nav, Button, Form, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Landing = ({ onLogin }) => {
  const navigate = useNavigate();
  // React - part03: States for Form Handling
  const [searchQuery, setSearchQuery] = useState('');

  // Dummy data for wireframe grids
  const topServices = ['Web Dev', 'Graphic Design', 'SEO', 'Writing'];
  const bottomFeatures = ['Secure Payments', 'Verified Talent', '24/7 Support'];

  // React - part03: Event Handling
  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
  };

  const loginAs = (role) => {
    onLogin(role);
    navigate(`/${role}`);
  };

  return (
    <>
      <Navbar bg="light" expand="lg" className="px-4 border-bottom">
        <Navbar.Brand className="fw-bold">WORKMINT</Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          <Nav className="me-4">
            <Nav.Link href="#home">Home</Nav.Link>
            <Nav.Link href="#about">About</Nav.Link>
            <Nav.Link href="#services">Services</Nav.Link>
          </Nav>
          <Button variant="outline-dark" className="me-2" onClick={() => loginAs('client')}>Client Login</Button>
          <Button variant="dark" onClick={() => loginAs('freelancer')}>Freelancer Login</Button>
          <Button variant="danger" className="ms-2" onClick={() => loginAs('admin')}>Admin</Button>
        </Navbar.Collapse>
      </Navbar>

      <Container className="mt-5 text-center">
        <h2 className="mb-4">Find the perfect freelance services for your business</h2>
        
        {/* React - part03: Form */}
        <Form onSubmit={handleSearch} className="d-flex justify-content-center mb-5">
          <Form.Control 
            type="text" 
            placeholder="Search for services..." 
            className="w-50 me-2 bg-light border-secondary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button variant="secondary" type="submit">SEARCH</Button>
        </Form>

        {/* React - part03: Rendering list with map() */}
        <Row className="mb-5">
          {topServices.map((service, index) => (
            <Col md={3} key={index}>
              <Card className="bg-secondary text-white mb-3" style={{ height: '150px' }}>
                <Card.Body className="d-flex align-items-center justify-content-center">
                  <Card.Title>{service}</Card.Title>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        <hr className="my-5" />

        <Row>
          {bottomFeatures.map((feature, index) => (
            <Col md={4} key={index}>
              <div className="d-flex align-items-start text-start">
                <div className="bg-secondary me-3" style={{ width: '50px', height: '50px' }}></div>
                <div>
                  <h5>{feature}</h5>
                  <p className="text-muted">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default Landing;
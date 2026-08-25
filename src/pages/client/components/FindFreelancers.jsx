import React, { useState } from 'react';
import { Form, Row, Col, Card, Button } from 'react-bootstrap';

// Mock data
const freelancers = [
  { id: 1, name: 'Alex Rivera', skills: 'React, Node.js', rate: 80, rating: 4.8 },
  { id: 2, name: 'Samantha Lee', skills: 'Python, Django', rate: 75, rating: 4.9 },
];

const FindFreelancers = () => {
  const [search, setSearch] = useState('');
  const filtered = freelancers.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.skills.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Form.Control 
        type="text" 
        placeholder="Search by name or skill..." 
        value={search} 
        onChange={e => setSearch(e.target.value)} 
        className="mb-3"
      />
      <Row>
        {filtered.map(f => (
          <Col md={6} key={f.id}>
            <Card className="mb-3 p-3">
              <h5>{f.name}</h5>
              <p><strong>Skills:</strong> {f.skills}</p>
              <p><strong>Rate:</strong> ${f.rate}/hr</p>
              <p>⭐ {f.rating}</p>
              <Button variant="primary" size="sm">Hire</Button>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
};
export default FindFreelancers;
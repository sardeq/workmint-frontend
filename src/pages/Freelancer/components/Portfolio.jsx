import React, { useState } from 'react';
import { Form, Button, Row, Col, Card } from 'react-bootstrap';

const Portfolio = () => {
  const [items, setItems] = useState([
    { id: 1, title: 'E-commerce Site', description: 'Built with React and Stripe' },
  ]);
  const [newItem, setNewItem] = useState({ title: '', description: '' });

  const addItem = () => {
    if (newItem.title) {
      setItems([...items, { id: Date.now(), ...newItem }]);
      setNewItem({ title: '', description: '' });
    }
  };

  return (
    <>
      <Row>
        {items.map(item => (
          <Col md={6} key={item.id}>
            <Card className="mb-2 p-2">
              <h5>{item.title}</h5>
              <p>{item.description}</p>
            </Card>
          </Col>
        ))}
      </Row>
      <hr />
      <h6>Add New Portfolio Item</h6>
      <Form.Group className="mb-2">
        <Form.Control type="text" placeholder="Title" value={newItem.title} onChange={e => setNewItem({...newItem, title: e.target.value})} />
      </Form.Group>
      <Form.Group className="mb-2">
        <Form.Control type="text" placeholder="Description" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} />
      </Form.Group>
      <Button variant="primary" onClick={addItem}>Add</Button>
    </>
  );
};
export default Portfolio;
import React, { useState } from 'react';
import { Row, Col, Card, Badge, Button, Tabs, Tab } from 'react-bootstrap';
import Layout from './Layout';

const FreelancerDashboard = ({ user }) => {
  const [orders, setOrders] = useState([
    { id: 101, client: 'TechCorp', project: 'React Frontend Dashboard', status: 'In Progress', price: '$1,200' },
    { id: 102, client: 'Startup Inc', project: 'Vue.js UI Migration', status: 'Pending Review', price: '$850' },
    { id: 103, client: 'Enterprise LLC', project: 'C++ System Optimization', status: 'Completed', price: '$3,400' }
  ]);

  const updateOrderStatus = (id, newStatus) => {
    setOrders(orders.map(order => 
      order.id === id ? { ...order, status: newStatus } : order
    ));
  };

  return (
    <Layout user={user} title="App Developer Workspace">
      <Tabs defaultActiveKey="orders" className="mb-4">
        <Tab eventKey="orders" title="Active Orders">
          <Row>
            {orders.map((order) => (
              <Col md={4} key={order.id} className="mb-4">
                <Card className="h-100 shadow-sm border-0 rounded-4">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="mb-0 text-truncate">{order.project}</h5>
                      <Badge bg={
                        order.status === 'Completed' ? 'success' : 
                        order.status === 'In Progress' ? 'primary' : 'warning'
                      }>
                        {order.status}
                      </Badge>
                    </div>
                    <Card.Subtitle className="mb-2 text-muted">Client: {order.client}</Card.Subtitle>
                    <h3 className="text-success">{order.price}</h3>
                    <hr />
                    {order.status === 'Pending Review' && (
                      <div className="d-flex gap-2">
                        <Button variant="success" size="sm" onClick={() => updateOrderStatus(order.id, 'In Progress')}>Accept</Button>
                        <Button variant="outline-danger" size="sm">Decline</Button>
                      </div>
                    )}
                    {order.status === 'In Progress' && (
                      <Button variant="primary" size="sm" className="w-100" onClick={() => updateOrderStatus(order.id, 'Completed')}>
                        Submit for Payment
                      </Button>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Tab>
        <Tab eventKey="portfolio" title="My Services">
          <Card className="border-0 shadow-sm p-4 text-center mt-3">
            <h4 className="text-muted">Manage your service listings here.</h4>
            <p>Active stacks: C++, .NET, React, Vue, Python.</p>
            <Button variant="dark" className="w-25 mx-auto mt-2">+ Add New Service</Button>
          </Card>
        </Tab>
      </Tabs>
    </Layout>
  );
};

export default FreelancerDashboard;
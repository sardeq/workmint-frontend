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
                <div className="wm-card h-100">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0 text-truncate fw-bold">{order.project}</h5>
                    <span className="badge bg-light text-dark border">{order.status}</span>
                  </div>
                  <div className="text-muted small mb-3">Client: {order.client}</div>
                  <h3 style={{ color: 'var(--mint-primary)' }}>{order.price}</h3>
                  <hr style={{ borderColor: 'var(--border-color)' }} />
                  
                  {order.status === 'In Progress' && (
                    <button className="wm-btn wm-btn-primary w-100" onClick={() => updateOrderStatus(order.id, 'Completed')}>
                      Submit for Payment
                    </button>
                  )}
                </div>
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
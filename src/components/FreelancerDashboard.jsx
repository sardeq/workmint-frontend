import React, { useState, useEffect, useContext } from 'react';
import { Card, Badge, Button, Tabs, Tab, Table, Form, Row, Col } from 'react-bootstrap';
import Layout from './Layout';
import { UserContext } from '../App';

const FreelancerDashboard = () => {
  const { currentUser } = useContext(UserContext);

  const [orders, setOrders] = useState([
    { id: 'ORD-892', client: 'TechCorp', project: 'C++ Systems Architecture', status: 'In Progress', price: '$2,200', deadline: 'Oct 15', milestones: [{ name: 'Design', done: true }, { name: 'Implementation', done: false }] },
    { id: 'ORD-893', client: 'Startup Inc', project: 'React/Vue Frontend Build', status: 'Pending Review', price: '$1,850', deadline: 'Oct 02', milestones: [{ name: 'Mockup', done: true }, { name: 'Code', done: true }] },
    { id: 'ORD-894', client: 'Enterprise LLC', project: '.NET Backend Integration', status: 'Completed', price: '$3,400', deadline: 'Sep 28', milestones: [{ name: 'Planning', done: true }, { name: 'Development', done: true }] }
  ]);

  const [availableJobs] = useState([
    { id: 'JOB-001', title: 'React Native App', client: 'MobileFirst', budget: '$3,000', skills: 'React Native, Firebase' },
    { id: 'JOB-002', title: 'DevOps Pipeline Setup', client: 'CloudTech', budget: '$4,500', skills: 'AWS, Docker, Jenkins' }
  ]);

  const [proposals, setProposals] = useState([
    { id: 'PROP-01', job: 'React Native App', client: 'MobileFirst', status: 'Pending', amount: 2800 },
    { id: 'PROP-02', job: 'DevOps Pipeline Setup', client: 'CloudTech', status: 'Accepted', amount: 4200 }
  ]);

  const [messages] = useState([
    { from: 'TechCorp', subject: 'Update on milestone 2', date: '2026-08-24' }
  ]);

  const updateOrderStatus = (id, newStatus) => {
    setOrders(orders.map(order =>
      order.id === id ? { ...order, status: newStatus } : order
    ));
  };

  const applyToJob = (jobId) => {
    const job = availableJobs.find(j => j.id === jobId);
    if (job) {
      setProposals([...proposals, { id: `PROP-${Date.now()}`, job: job.title, client: job.client, status: 'Pending', amount: parseInt(job.budget.replace('$','')) }]);
      alert('Applied successfully!');
    }
  };

  return (
    <Layout user={currentUser} title="Freelancer Workspace">
      <div className="wm-metrics-grid">
        <Card className="border-0 shadow-sm rounded-4 p-3 bg-primary text-white">
          <p className="text-white-50 text-uppercase mb-1 small">Pending Clearance</p>
          <h3 className="fw-bold m-0">$1,850</h3>
        </Card>
        <Card className="border-0 shadow-sm rounded-4 p-3">
          <p className="text-muted text-uppercase mb-1 small">Active Orders</p>
          <h3 className="fw-bold m-0">{orders.filter(o => o.status === 'In Progress').length}</h3>
        </Card>
        <Card className="border-0 shadow-sm rounded-4 p-3">
          <p className="text-muted text-uppercase mb-1 small">Job Success Rate</p>
          <h3 className="fw-bold m-0 text-success">98%</h3>
        </Card>
      </div>

      <Card className="border-0 shadow-sm rounded-4 p-4">
        <Tabs defaultActiveKey="orders" className="mb-4">
          <Tab eventKey="orders" title="My Orders">
            <Table hover responsive className="align-middle">
              <thead className="table-light">
                <tr><th>Order</th><th>Project</th><th>Client</th><th>Deadline</th><th>Value</th><th>Status</th><th className="text-end">Actions</th></tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="fw-bold text-muted">{order.id}</td>
                    <td className="fw-semibold">{order.project}</td>
                    <td>{order.client}</td>
                    <td>{order.deadline}</td>
                    <td className="text-success fw-bold">{order.price}</td>
                    <td><Badge bg={order.status === 'Completed' ? 'success' : order.status === 'In Progress' ? 'primary' : 'warning'}>{order.status}</Badge></td>
                    <td className="text-end">
                      {order.status === 'In Progress' && (
                        <Button variant="outline-primary" size="sm" onClick={() => updateOrderStatus(order.id, 'Pending Review')}>Submit Deliverable</Button>
                      )}
                      {order.status === 'Pending Review' && <span className="text-muted small">Awaiting Client</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Tab>

          <Tab eventKey="jobs" title="Available Jobs">
            <Table hover responsive>
              <thead><tr><th>Title</th><th>Client</th><th>Budget</th><th>Skills</th><th></th></tr></thead>
              <tbody>
                {availableJobs.map(job => (
                  <tr key={job.id}>
                    <td className="fw-semibold">{job.title}</td>
                    <td>{job.client}</td>
                    <td>{job.budget}</td>
                    <td>{job.skills}</td>
                    <td><Button variant="success" size="sm" onClick={() => applyToJob(job.id)}>Apply</Button></td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Tab>

          <Tab eventKey="proposals" title="My Proposals">
            <Table hover responsive>
              <thead><tr><th>Job</th><th>Client</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody>
                {proposals.map(p => (
                  <tr key={p.id}>
                    <td>{p.job}</td>
                    <td>{p.client}</td>
                    <td>${p.amount}</td>
                    <td><Badge bg={p.status === 'Accepted' ? 'success' : 'secondary'}>{p.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Tab>

          <Tab eventKey="portfolio" title="Portfolio">
            <div className="wm-metrics-grid mt-4">
              <Card className="border"><Card.Body><Badge bg="dark" className="mb-2">Backend</Badge><h5>C++ / .NET Architecture</h5><p className="text-muted small">High-performance systems programming.</p><h6 className="text-primary">From $60/hr</h6></Card.Body></Card>
              <Card className="border"><Card.Body><Badge bg="info" className="mb-2 text-dark">Frontend</Badge><h5>React & Vue Web Apps</h5><p className="text-muted small">Modern, responsive frontends.</p><h6 className="text-primary">From $45/hr</h6></Card.Body></Card>
              <Card className="border border-dashed d-flex align-items-center justify-content-center bg-light" style={{ cursor: 'pointer' }}><div className="text-center text-muted"><h3 className="m-0">+</h3><small>Add Service</small></div></Card>
            </div>
          </Tab>

          <Tab eventKey="messages" title="Messages">
            <Table hover responsive>
              <thead><tr><th>From</th><th>Subject</th><th>Date</th><th></th></tr></thead>
              <tbody>
                {messages.map((m, i) => (
                  <tr key={i}><td>{m.from}</td><td>{m.subject}</td><td>{m.date}</td><td><Button variant="outline-secondary" size="sm">View</Button></td></tr>
                ))}
              </tbody>
            </Table>
          </Tab>
        </Tabs>
      </Card>
    </Layout>
  );
};

export default FreelancerDashboard;
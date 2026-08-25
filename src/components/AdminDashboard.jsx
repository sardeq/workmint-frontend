import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Row, Col, Card, Table, Badge, Button, Form, InputGroup, Tabs, Tab, Modal } from 'react-bootstrap';
import Layout from './Layout';
import { UserContext } from '../App';

const AdminDashboard = () => {
  const { currentUser } = useContext(UserContext);
  const [exchangeRate, setExchangeRate] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [pendingFreelancers, setPendingFreelancers] = useState([
    { id: 1, name: 'Alex Rivera', specialty: 'Full-Stack Developer (React/.NET)', experience: '4 yrs', status: 'Pending Review' },
    { id: 2, name: 'Sarah Chen', specialty: 'Systems Engineer (C++/Linux)', experience: '6 yrs', status: 'Pending Review' },
    { id: 3, name: 'Omar Malik', specialty: 'UI/UX & Mobile Developer', experience: '3 yrs', status: 'Pending Review' }
  ]);

  const [disputes, setDisputes] = useState([
    { id: 'DSP-901', client: 'Alpha Corp', freelancer: 'John Doe', amount: 1500, reason: 'Scope creep / Delayed milestone', status: 'Open' },
    { id: 'DSP-902', client: 'Zenith Apps', freelancer: 'Elena Rostova', amount: 820, reason: 'Incomplete API documentation', status: 'Under Review' },
    { id: 'DSP-903', client: 'NextGen Ltd', freelancer: 'Mark Evans', amount: 2400, reason: 'Payment withheld post-delivery', status: 'Resolved' }
  ]);

  const [users, setUsers] = useState([
    { id: 1, name: 'Client A', email: 'client@a.com', role: 'client', status: 'active' },
    { id: 2, name: 'Freelancer B', email: 'freelancer@b.com', role: 'freelancer', status: 'active' },
    { id: 3, name: 'Client C', email: 'client@c.com', role: 'client', status: 'suspended' }
  ]);

  const [analytics] = useState({
    totalUsers: 150,
    activeProjects: 42,
    totalRevenue: 48250,
    platformFee: 4825,
    growth: 14
  });

  useEffect(() => {
    axios.get('https://open.er-api.com/v6/latest/USD')
      .then(res => setExchangeRate(res.data.rates.EUR || 1))
      .catch(err => console.error(err));
  }, []);

  const handleApproveFreelancer = (id) => setPendingFreelancers(prev => prev.filter(f => f.id !== id));
  const handleRejectFreelancer = (id) => setPendingFreelancers(prev => prev.filter(f => f.id !== id));

  const handleResolveDispute = (id, resolution) => {
    setDisputes(prev => prev.map(d => d.id === id ? { ...d, status: `Resolved (${resolution})` } : d));
    setShowModal(false);
  };

  const openDisputeModal = (dispute) => { setSelectedDispute(dispute); setShowModal(true); };

  const toggleUserStatus = (id) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u));
  };

  const filteredDisputes = disputes.filter(d =>
    d.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.freelancer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout user={currentUser} title="Admin Control Center">
      <Row className="g-3 mb-4">
        <Col md={3}><Card className="border-0 shadow-sm rounded-4 bg-primary text-white p-3"><Card.Body><h6 className="text-white-50 text-uppercase">Platform Escrow</h6><h3>$48,250 USD</h3><small>≈ €{(48250 * exchangeRate).toFixed(2)} EUR</small></Card.Body></Card></Col>
        <Col md={3}><Card className="border-0 shadow-sm rounded-4 bg-dark text-white p-3"><Card.Body><h6 className="text-secondary text-uppercase">Pending Approvals</h6><h3>{pendingFreelancers.length}</h3><small className="text-warning">Requires screening</small></Card.Body></Card></Col>
        <Col md={3}><Card className="border-0 shadow-sm rounded-4 bg-white p-3"><Card.Body><h6 className="text-muted text-uppercase">Active Disputes</h6><h3 className="text-danger">{disputes.filter(d => d.status !== 'Resolved' && !d.status.startsWith('Resolved')).length}</h3><small className="text-muted">Awaiting mediation</small></Card.Body></Card></Col>
        <Col md={3}><Card className="border-0 shadow-sm rounded-4 bg-white p-3"><Card.Body><h6 className="text-muted text-uppercase">Platform Fee (10%)</h6><h3 className="text-success">$4,825 USD</h3><small className="text-success">↑ {analytics.growth}% vs last month</small></Card.Body></Card></Col>
      </Row>

      <Card className="border-0 shadow-sm rounded-4 p-4">
        <Tabs defaultActiveKey="disputes" className="mb-4">
          <Tab eventKey="disputes" title="Disputes">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">Active Escrow Cases</h5>
              <InputGroup style={{ maxWidth: '300px' }}>
                <Form.Control type="text" placeholder="Filter..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </InputGroup>
            </div>
            <Table responsive hover>
              <thead className="table-light"><tr><th>Case ID</th><th>Client</th><th>Freelancer</th><th>Amount</th><th>Reason</th><th>Status</th><th className="text-end">Action</th></tr></thead>
              <tbody>
                {filteredDisputes.map(d => (
                  <tr key={d.id}>
                    <td className="fw-semibold">{d.id}</td><td>{d.client}</td><td>{d.freelancer}</td>
                    <td><strong>${d.amount}</strong> <span className="text-muted small">(€{(d.amount * exchangeRate).toFixed(0)})</span></td>
                    <td className="text-truncate" style={{ maxWidth: '200px' }}>{d.reason}</td>
                    <td><Badge bg={d.status === 'Open' ? 'danger' : d.status === 'Under Review' ? 'warning' : 'success'}>{d.status}</Badge></td>
                    <td className="text-end"><Button variant="outline-dark" size="sm" onClick={() => openDisputeModal(d)}>Review</Button></td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Tab>

          <Tab eventKey="approvals" title={`Freelancer Approvals (${pendingFreelancers.length})`}>
            <Table responsive hover>
              <thead className="table-light"><tr><th>Name</th><th>Specialty</th><th>Experience</th><th>Status</th><th className="text-end">Decision</th></tr></thead>
              <tbody>
                {pendingFreelancers.map(f => (
                  <tr key={f.id}>
                    <td className="fw-semibold">{f.name}</td><td>{f.specialty}</td><td>{f.experience}</td>
                    <td><Badge bg="secondary">{f.status}</Badge></td>
                    <td className="text-end">
                      <Button variant="success" size="sm" className="me-2" onClick={() => handleApproveFreelancer(f.id)}>Approve</Button>
                      <Button variant="outline-danger" size="sm" onClick={() => handleRejectFreelancer(f.id)}>Reject</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Tab>

          <Tab eventKey="users" title="User Management">
            <Table responsive hover>
              <thead className="table-light"><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th className="text-end">Action</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.name}</td><td>{u.email}</td><td>{u.role}</td>
                    <td><Badge bg={u.status === 'active' ? 'success' : 'danger'}>{u.status}</Badge></td>
                    <td className="text-end">
                      <Button variant={u.status === 'active' ? 'outline-danger' : 'outline-success'} size="sm" onClick={() => toggleUserStatus(u.id)}>
                        {u.status === 'active' ? 'Suspend' : 'Activate'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Tab>

          <Tab eventKey="analytics" title="Analytics">
            <Row>
              <Col md={3}><Card className="text-center"><Card.Body><h6>Total Users</h6><h3>{analytics.totalUsers}</h3></Card.Body></Card></Col>
              <Col md={3}><Card className="text-center"><Card.Body><h6>Active Projects</h6><h3>{analytics.activeProjects}</h3></Card.Body></Card></Col>
              <Col md={3}><Card className="text-center"><Card.Body><h6>Revenue</h6><h3>${analytics.totalRevenue}</h3></Card.Body></Card></Col>
              <Col md={3}><Card className="text-center"><Card.Body><h6>Platform Fee</h6><h3>${analytics.platformFee}</h3></Card.Body></Card></Col>
            </Row>
          </Tab>
        </Tabs>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Dispute Mediation: {selectedDispute?.id}</Modal.Title></Modal.Header>
        <Modal.Body>
          {selectedDispute && (
            <div>
              <p><strong>Client:</strong> {selectedDispute.client}</p>
              <p><strong>Freelancer:</strong> {selectedDispute.freelancer}</p>
              <p><strong>Amount:</strong> ${selectedDispute.amount} USD</p>
              <p><strong>Claim:</strong> {selectedDispute.reason}</p>
              <hr />
              <h6>Mediation Action:</h6>
              <div className="d-grid gap-2">
                <Button variant="success" onClick={() => handleResolveDispute(selectedDispute.id, 'Released to Freelancer')}>Release Payment</Button>
                <Button variant="danger" onClick={() => handleResolveDispute(selectedDispute.id, 'Refunded to Client')}>Refund Client</Button>
                <Button variant="warning" onClick={() => handleResolveDispute(selectedDispute.id, '50/50 Split')}>Split 50/50</Button>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </Layout>
  );
};

export default AdminDashboard;
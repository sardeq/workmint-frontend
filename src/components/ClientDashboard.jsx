import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Card, ProgressBar, Badge, Button, Form, Tabs, Tab, Table, Row, Col } from 'react-bootstrap';
import Layout from './Layout';
import { UserContext } from '../App';

const ClientDashboard = () => {
  const { currentUser } = useContext(UserContext);
  const [rates, setRates] = useState({});
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [showJobModal, setShowJobModal] = useState(false);
  const [newJob, setNewJob] = useState({ title: '', budget: '', description: '', category: '' });

  const [activeProjects, setActiveProjects] = useState([
    { id: 'PRJ-01', title: 'Full-Stack Web App', freelancer: 'Alex Dev', progress: 75, status: 'In Revision', costUSD: 1200, milestones: [{ name: 'Design', completed: true }, { name: 'Backend', completed: false }] },
    { id: 'PRJ-02', title: 'Database Migration', freelancer: 'Sarah C.', progress: 20, status: 'In Progress', costUSD: 850, milestones: [{ name: 'Planning', completed: true }] }
  ]);

  const [freelancers] = useState([
    { id: 1, name: 'Alex Rivera', skills: 'React, Node, Python', rating: 4.8, rate: 65 },
    { id: 2, name: 'Sarah Chen', skills: 'C++, Linux, DevOps', rating: 4.9, rate: 80 },
    { id: 3, name: 'Omar Malik', skills: 'UI/UX, Swift, Kotlin', rating: 4.7, rate: 55 }
  ]);

  const [messages] = useState([
    { from: 'Alex Dev', subject: 'Milestone 2 update', date: '2026-08-24', preview: 'I have completed the backend integration...' },
    { from: 'Sarah C.', subject: 'Migration schedule', date: '2026-08-23', preview: 'We can start the migration on Friday...' }
  ]);

  const [filterSkill, setFilterSkill] = useState('');

  useEffect(() => {
    axios.get('https://open.er-api.com/v6/latest/USD')
      .then(res => setRates(res.data.rates))
      .catch(err => console.error("Error fetching rates:", err));
  }, []);

  const convertCost = (usdAmount) => {
    if (!rates[selectedCurrency]) return usdAmount;
    return (usdAmount * rates[selectedCurrency]).toFixed(2);
  };

  const handlePostJob = (e) => {
    e.preventDefault();
    // Simulate posting a job
    console.log("Job Posted:", newJob);
    setNewJob({ title: '', budget: '', description: '', category: '' });
    alert('Job posted successfully!');
  };

  const handleApproveMilestone = (projectId) => {
    setActiveProjects(prev => prev.map(p =>
      p.id === projectId ? { ...p, progress: Math.min(100, p.progress + 25), status: 'In Progress' } : p
    ));
  };

  const filteredFreelancers = freelancers.filter(f =>
    f.skills.toLowerCase().includes(filterSkill.toLowerCase())
  );

  return (
    <Layout user={currentUser} title="Client Workspace">
      <Card className="border-0 shadow-sm rounded-4 p-4">
        <Tabs defaultActiveKey="projects" className="mb-4">
          {/* Projects Tab */}
          <Tab eventKey="projects" title="My Projects">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold m-0">Active Projects</h5>
              <div className="d-flex gap-2">
                <Form.Select size="sm" style={{ width: 'auto' }} value={selectedCurrency} onChange={(e) => setSelectedCurrency(e.target.value)}>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="JPY">JPY</option>
                </Form.Select>
              </div>
            </div>
            <Row>
              {activeProjects.map(project => (
                <Col md={6} lg={4} key={project.id} className="mb-3">
                  <Card className="h-100 border-0 shadow-sm rounded-4">
                    <Card.Body>
                      <div className="d-flex justify-content-between mb-2">
                        <h6 className="fw-bold">{project.title}</h6>
                        <Badge bg={project.progress === 100 ? 'success' : 'primary'}>{project.status}</Badge>
                      </div>
                      <p className="text-muted small">Freelancer: {project.freelancer}</p>
                      <p className="text-muted small">Cost: {selectedCurrency} {convertCost(project.costUSD)}</p>
                      <ProgressBar now={project.progress} variant="success" style={{ height: '8px' }} className="mb-3" />
                      {project.status === 'In Revision' && (
                        <div className="bg-light p-2 rounded text-center">
                          <small className="text-muted d-block mb-1">Freelancer submitted a deliverable.</small>
                          <Button variant="outline-success" size="sm" className="me-2" onClick={() => handleApproveMilestone(project.id)}>Approve</Button>
                          <Button variant="outline-danger" size="sm">Request Changes</Button>
                        </div>
                      )}
                      <div className="mt-2">
                        <small className="text-muted">Milestones:</small>
                        <ul className="list-unstyled small">
                          {project.milestones.map((m, i) => (
                            <li key={i} className={m.completed ? 'text-success' : 'text-muted'}>
                              {m.completed ? '✓' : '○'} {m.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Tab>

          {/* Find Freelancers Tab */}
          <Tab eventKey="find" title="Find Freelancers">
            <div className="d-flex mb-3">
              <Form.Control
                type="text"
                placeholder="Filter by skill..."
                value={filterSkill}
                onChange={(e) => setFilterSkill(e.target.value)}
                className="me-2"
              />
            </div>
            <Table responsive hover>
              <thead>
                <tr><th>Name</th><th>Skills</th><th>Rating</th><th>Rate (USD)</th><th></th></tr>
              </thead>
              <tbody>
                {filteredFreelancers.map(f => (
                  <tr key={f.id}>
                    <td className="fw-semibold">{f.name}</td>
                    <td>{f.skills}</td>
                    <td>{f.rating} ⭐</td>
                    <td>${f.rate}/hr</td>
                    <td><Button variant="outline-primary" size="sm">Invite</Button></td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Tab>

          {/* Post Job Tab */}
          <Tab eventKey="post" title="Post Job">
            <Form onSubmit={handlePostJob}>
              <Form.Group className="mb-3">
                <Form.Label>Project Title</Form.Label>
                <Form.Control type="text" required value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Select value={newJob.category} onChange={e => setNewJob({...newJob, category: e.target.value})}>
                  <option value="">Select...</option>
                  <option>Web Development</option>
                  <option>Mobile Apps</option>
                  <option>AI/ML</option>
                  <option>DevOps</option>
                  <option>Design</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Estimated Budget (USD)</Form.Label>
                <Form.Control type="number" required value={newJob.budget} onChange={e => setNewJob({...newJob, budget: e.target.value})} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Scope Description</Form.Label>
                <Form.Control as="textarea" rows={3} required value={newJob.description} onChange={e => setNewJob({...newJob, description: e.target.value})} />
              </Form.Group>
              <Button variant="primary" type="submit">Post Job</Button>
            </Form>
          </Tab>

          {/* Messages Tab */}
          <Tab eventKey="messages" title="Messages">
            <Table responsive hover>
              <thead><tr><th>From</th><th>Subject</th><th>Date</th><th></th></tr></thead>
              <tbody>
                {messages.map((m, i) => (
                  <tr key={i}>
                    <td className="fw-semibold">{m.from}</td>
                    <td>{m.subject}</td>
                    <td>{m.date}</td>
                    <td><Button variant="outline-secondary" size="sm">View</Button></td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Tab>
        </Tabs>
      </Card>
    </Layout>
  );
};

export default ClientDashboard;
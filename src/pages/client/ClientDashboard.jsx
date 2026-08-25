import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
// Removed Tabs, Tab[cite: 4]
import { Card, Row, Form } from 'react-bootstrap'; 
import Layout from '../../components/Layout';
import { UserContext } from '../../App';

import ProjectCard from './components/ProjectCard'; //[cite: 4]
import PostJobForm from './components/PostJobForm'; //[cite: 4]
import ClientOverview from './components/ClientOverview'; //[cite: 4]
import FindFreelancers from './components/FindFreelancers'; //[cite: 4]

const ClientDashboard = () => {
  const { currentUser } = useContext(UserContext); //[cite: 4]
  const [rates, setRates] = useState({}); //[cite: 4]
  const [selectedCurrency, setSelectedCurrency] = useState('USD'); //[cite: 4]
  
  // 1. Create state to track the active sidebar item
  const [activeTab, setActiveTab] = useState('My Projects');

  const [activeProjects, setActiveProjects] = useState([ //[cite: 4]
    { 
      id: 'PRJ-01', 
      title: 'Full-Stack Web App', 
      freelancer: 'Alex Dev', 
      progress: 75, 
      status: 'In Revision', 
      costUSD: 1200, 
      milestones: [{ id: 1, name: 'Design', completed: true }, { id: 2, name: 'Backend', completed: false }] 
    }
  ]);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await axios.get('https://open.er-api.com/v6/latest/USD'); //[cite: 4]
        setRates(response.data.rates); //[cite: 4]
      } catch (error) { //[cite: 4]
        console.error("Error fetching currency rates:", error); //[cite: 4]
      }
    };
    fetchRates(); //[cite: 4]
  }, []);

  const handleApproveMilestone = (projectId, milestoneId) => { //[cite: 4]
    // ... keep your existing logic[cite: 4]
  };

  const handlePostJob = (newJob) => { //[cite: 4]
    // ... keep your existing logic[cite: 4]
  };

  // 2. Render the correct view based on the activeTab state
  const renderContent = () => {
    switch (activeTab) {
      case 'Overview':
        return <ClientOverview projects={activeProjects} />;
      case 'My Projects':
        return (
          <>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold m-0">Active Projects</h5>
              <Form.Select 
                size="sm" 
                style={{ width: 'auto' }} 
                value={selectedCurrency} 
                onChange={(e) => setSelectedCurrency(e.target.value)}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="JOD">JOD</option>
              </Form.Select>
            </div>
            <Row>
              {activeProjects.map(project => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  rates={rates} 
                  currency={selectedCurrency} 
                  onApprove={handleApproveMilestone} 
                />
              ))}
            </Row>
          </>
        );
      case 'Find Freelancers':
        return <FindFreelancers />;
      case 'Post Job':
        return <PostJobForm onPostJob={handlePostJob} />;
      case 'Messages':
        return <div>Messages Module Coming Soon...</div>;
      default:
        return <ClientOverview projects={activeProjects} />;
    }
  };

  return (
    // 3. Pass the state and setter to the Layout component
    <Layout user={currentUser} title="Client Workspace" activeTab={activeTab} setActiveTab={setActiveTab}>
      <Card className="border-0 shadow-sm rounded-4 p-4">
        {renderContent()}
      </Card>
    </Layout>
  );
};

export default ClientDashboard;
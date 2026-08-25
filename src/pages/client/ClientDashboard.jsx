import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Card, Tabs, Tab, Row, Form } from 'react-bootstrap';
import Layout from '../../components/Layout';
import { UserContext } from '../../App';

import ProjectCard from './components/ProjectCard';
import PostJobForm from './components/PostJobForm';
import ClientOverview from './components/ClientOverview';
import FindFreelancers from './components/FindFreelancers';


const ClientDashboard = () => {
  const { currentUser } = useContext(UserContext); // Hook: Context
  const [rates, setRates] = useState({}); // Hook: State
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  
  // Enhanced Feature: Detailed Milestone Tracking
  const [activeProjects, setActiveProjects] = useState([
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

  // Hook: useEffect & Axios for 3rd Party API
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await axios.get('https://open.er-api.com/v6/latest/USD');
        setRates(response.data.rates);
      } catch (error) {
        console.error("Error fetching currency rates:", error);
      }
    };
    fetchRates();
  }, []);

  // Function to pass down as a prop (Props drilling / Passing Functions)
  const handleApproveMilestone = (projectId, milestoneId) => {
    setActiveProjects(prevProjects => prevProjects.map(project => {
      if (project.id === projectId) {
        const updatedMilestones = project.milestones.map(m => 
          m.id === milestoneId ? { ...m, completed: true } : m
        );
        const newProgress = Math.min(100, project.progress + 25);
        return { ...project, milestones: updatedMilestones, progress: newProgress, status: 'In Progress' };
      }
      return project;
    }));
  };

  const handlePostJob = (newJob) => {
    console.log("Job Posted to DB:", newJob);
    alert(`Success: ${newJob.title} has been posted!`);
  };

  return (
    <Layout user={currentUser} title="Client Workspace">
      <Card className="border-0 shadow-sm rounded-4 p-4">
        <Tabs defaultActiveKey="projects" className="mb-4">
          
          <Tab eventKey="projects" title="My Projects">
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
              {/* Rendering list with map() and passing props */}
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
          </Tab>

          <Tab eventKey="post" title="Post Job">
             {/* Componentizing the form logic */}
             <PostJobForm onPostJob={handlePostJob} />
          </Tab>

          <Tab eventKey="overview" title="Overview">
            <ClientOverview projects={activeProjects} />
          </Tab>
          <Tab eventKey="find" title="Find Freelancers">
            <FindFreelancers />
          </Tab>
                    
        </Tabs>
      </Card>
    </Layout>
  );
};

export default ClientDashboard;
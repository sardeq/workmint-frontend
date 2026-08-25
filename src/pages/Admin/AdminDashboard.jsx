import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Card, Tabs, Tab } from 'react-bootstrap';
import Layout from '../../components/Layout';
import { UserContext } from '../../App';
import AdminStats from './components/AdminStats';
import DisputesList from './components/DisputesList';
import DisputeModal from './components/DisputeModal';

import AdminOverview from './components/AdminOverview';
import UserManagement from './components/UserManagement';
import JobManagement from './components/JobManagement';

const AdminDashboard = () => {
  const { currentUser } = useContext(UserContext); // Hook: Context
  const [exchangeRate, setExchangeRate] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState(null);

  // Hook: State for disputes data
  const [disputes, setDisputes] = useState([
    { id: 'DSP-901', client: 'Alpha Corp', freelancer: 'John Doe', amount: 1500, reason: 'Scope creep / Delayed milestone', status: 'Open' },
    { id: 'DSP-902', client: 'Zenith Apps', freelancer: 'Elena Rostova', amount: 820, reason: 'Incomplete API documentation', status: 'Under Review' }
  ]);

  useEffect(() => {
    axios.get('https://open.er-api.com/v6/latest/USD')
      .then(res => setExchangeRate(res.data.rates.EUR || 1))
      .catch(err => console.error(err));
  }, []);

  // Event Handling: Passing this down to the modal
  const handleResolveDispute = (id, resolution) => {
    setDisputes(prev => prev.map(d => 
      d.id === id ? { ...d, status: `Resolved (${resolution})` } : d
    ));
    setShowModal(false);
  };

  const openModal = (dispute) => {
    setSelectedDispute(dispute);
    setShowModal(true);
  };

  return (
    <Layout user={currentUser} title="Admin Control Center">
      {/* Passing state down as props */}
      <AdminStats 
        exchangeRate={exchangeRate} 
        activeDisputes={disputes.filter(d => !d.status.includes('Resolved')).length} 
      />

      <Card className="border-0 shadow-sm rounded-4 p-4 mt-4">
        <Tabs defaultActiveKey="disputes">
          <Tab eventKey="disputes" title="Disputes">
             <DisputesList 
               disputes={disputes} 
               exchangeRate={exchangeRate} 
               onReview={openModal} 
             />
          </Tab>
          <Tab eventKey="overview" title="Overview">
            <AdminOverview />
          </Tab>
          <Tab eventKey="users" title="Users">
            <UserManagement />
          </Tab>
          <Tab eventKey="jobs" title="Jobs">
            <JobManagement />
          </Tab>
        </Tabs>
      </Card>

      {/* Conditional Rendering Modal */}
      <DisputeModal 
        show={showModal} 
        onHide={() => setShowModal(false)} 
        dispute={selectedDispute} 
        onResolve={handleResolveDispute} 
      />
    </Layout>
  );
};

export default AdminDashboard;
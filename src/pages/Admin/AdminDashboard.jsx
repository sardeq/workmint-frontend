import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Card } from 'react-bootstrap'; // Removed Tabs and Tab[cite: 3]
import Layout from '../../components/Layout';
import { UserContext } from '../../App';
import AdminStats from './components/AdminStats';
import DisputesList from './components/DisputesList';
import DisputeModal from './components/DisputeModal';

import AdminOverview from './components/AdminOverview';
import UserManagement from './components/UserManagement';
import JobManagement from './components/JobManagement';

const AdminDashboard = () => {
  const { currentUser } = useContext(UserContext); //[cite: 3]
  const [exchangeRate, setExchangeRate] = useState(1); //[cite: 3]
  const [showModal, setShowModal] = useState(false); //[cite: 3]
  const [selectedDispute, setSelectedDispute] = useState(null); //[cite: 3]

  // Track the active sidebar item
  const [activeTab, setActiveTab] = useState('Disputes'); 

  const [disputes, setDisputes] = useState([ //[cite: 3]
    { id: 'DSP-901', client: 'Alpha Corp', freelancer: 'John Doe', amount: 1500, reason: 'Scope creep / Delayed milestone', status: 'Open' }, //[cite: 3]
    { id: 'DSP-902', client: 'Zenith Apps', freelancer: 'Elena Rostova', amount: 820, reason: 'Incomplete API documentation', status: 'Under Review' } //[cite: 3]
  ]);

  useEffect(() => {
    axios.get('https://open.er-api.com/v6/latest/USD') //[cite: 3]
      .then(res => setExchangeRate(res.data.rates.EUR || 1)) //[cite: 3]
      .catch(err => console.error(err)); //[cite: 3]
  }, []);

  const handleResolveDispute = (id, resolution) => { //[cite: 3]
    setDisputes(prev => prev.map(d => 
      d.id === id ? { ...d, status: `Resolved (${resolution})` } : d //[cite: 3]
    ));
    setShowModal(false); //[cite: 3]
  };

  const openModal = (dispute) => { //[cite: 3]
    setSelectedDispute(dispute); //[cite: 3]
    setShowModal(true); //[cite: 3]
  };

  // Render content based on sidebar state
  const renderContent = () => {
    switch (activeTab) {
      case 'Overview':
        return <AdminOverview />;
      case 'Disputes':
        return (
          <DisputesList 
            disputes={disputes} 
            exchangeRate={exchangeRate} 
            onReview={openModal} 
          />
        );
      case 'User Management':
        return <UserManagement />;
      case 'Jobs': // Fallback for your original Jobs component[cite: 3]
        return <JobManagement />;
      case 'Freelancer Approvals':
        return <div>Freelancer Approvals Module Coming Soon...</div>;
      case 'Analytics':
        return <div>Analytics Module Coming Soon...</div>;
      default:
        return <AdminOverview />;
    }
  };

  return (
    // Pass activeTab and setActiveTab to Layout[cite: 2, 3]
    <Layout user={currentUser} title="Admin Control Center" activeTab={activeTab} setActiveTab={setActiveTab}>
      <AdminStats 
        exchangeRate={exchangeRate} 
        activeDisputes={disputes.filter(d => !d.status.includes('Resolved')).length} 
      />

      <Card className="border-0 shadow-sm rounded-4 p-4 mt-4">
        {renderContent()}
      </Card>

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
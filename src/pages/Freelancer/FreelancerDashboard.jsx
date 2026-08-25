import React, { useState, useContext } from 'react';
import { Card } from 'react-bootstrap'; // Removed Tabs and Tab[cite: 5]
import Layout from '../../components/Layout';
import { UserContext } from '../../App';
import OrdersTable from './components/OrdersTable';
import AvailableJobs from './components/AvailableJobs';
import FreelancerOverview from './components/FreelancerOverview';
import MyProposals from './components/MyProposals';
import Portfolio from './components/Portfolio';
import ProfileEdit from './components/ProfileEdit';

const FreelancerDashboard = () => {
  const { currentUser } = useContext(UserContext); //[cite: 5]

  // Track the active sidebar item
  const [activeTab, setActiveTab] = useState('My Orders');

  const [orders, setOrders] = useState([ //[cite: 5]
    { id: 'ORD-892', client: 'TechCorp', project: 'C++ Systems Architecture', status: 'In Progress', price: '$2,200', deadline: 'Oct 15' }, //[cite: 5]
    { id: 'ORD-894', client: 'Enterprise LLC', project: '.NET Backend Integration', status: 'Completed', price: '$3,400', deadline: 'Sep 28' } //[cite: 5]
  ]);

  const [availableJobs] = useState([ //[cite: 5]
    { id: 'JOB-001', title: 'React Native App', client: 'MobileFirst', budget: '$3,000', skills: 'React Native, Firebase' } //[cite: 5]
  ]);

  const [proposals, setProposals] = useState([]); //[cite: 5]

  const updateOrderStatus = (id, newStatus) => { //[cite: 5]
    setOrders(orders.map(order =>
      order.id === id ? { ...order, status: newStatus } : order //[cite: 5]
    ));
  };

  const applyToJob = (job) => { //[cite: 5]
    setProposals([...proposals, { 
      id: `PROP-${Date.now()}`, 
      job: job.title, 
      client: job.client, 
      status: 'Pending', 
      amount: parseInt(job.budget.replace('$','')) 
    }]); //[cite: 5]
    alert(`Proposal submitted for ${job.title}!`); //[cite: 5]
  };

  // Render content based on sidebar state
  const renderContent = () => {
    switch (activeTab) {
      case 'Overview':
        return <FreelancerOverview orders={orders} proposals={proposals} />;
      case 'My Orders':
        return <OrdersTable orders={orders} onUpdateStatus={updateOrderStatus} />;
      case 'Available Jobs':
        return <AvailableJobs jobs={availableJobs} onApply={applyToJob} />;
      case 'My Proposals':
        return <MyProposals proposals={proposals} />;
      case 'Portfolio':
        return <Portfolio />;
      case 'Profile': // Fallback for your original Profile component[cite: 5]
        return <ProfileEdit />;
      case 'Messages':
        return <div>Messages Module Coming Soon...</div>;
      default:
        return <FreelancerOverview orders={orders} proposals={proposals} />;
    }
  };

  return (
    // Pass activeTab and setActiveTab to Layout[cite: 2, 5]
    <Layout user={currentUser} title="Freelancer Workspace" activeTab={activeTab} setActiveTab={setActiveTab}>
      <Card className="border-0 shadow-sm rounded-4 p-4 mt-4">
        {renderContent()}
      </Card>
    </Layout>
  );
};

export default FreelancerDashboard;
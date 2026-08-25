import React, { useState, useContext } from 'react';
import { Card, Tabs, Tab } from 'react-bootstrap';
import Layout from '../../components/Layout';
import { UserContext } from '../../App';
import OrdersTable from './components/OrdersTable';
import AvailableJobs from './components/AvailableJobs';
import FreelancerOverview from './components/FreelancerOverview';
import MyProposals from './components/MyProposals';
import Portfolio from './components/Portfolio';
import ProfileEdit from './components/ProfileEdit';

const FreelancerDashboard = () => {
  const { currentUser } = useContext(UserContext);

  const [orders, setOrders] = useState([
    { id: 'ORD-892', client: 'TechCorp', project: 'C++ Systems Architecture', status: 'In Progress', price: '$2,200', deadline: 'Oct 15' },
    { id: 'ORD-894', client: 'Enterprise LLC', project: '.NET Backend Integration', status: 'Completed', price: '$3,400', deadline: 'Sep 28' }
  ]);

  const [availableJobs] = useState([
    { id: 'JOB-001', title: 'React Native App', client: 'MobileFirst', budget: '$3,000', skills: 'React Native, Firebase' }
  ]);

  const [proposals, setProposals] = useState([]);

  // Event Handling
  const updateOrderStatus = (id, newStatus) => {
    setOrders(orders.map(order =>
      order.id === id ? { ...order, status: newStatus } : order
    ));
  };

  const applyToJob = (job) => {
    setProposals([...proposals, { 
      id: `PROP-${Date.now()}`, 
      job: job.title, 
      client: job.client, 
      status: 'Pending', 
      amount: parseInt(job.budget.replace('$','')) 
    }]);
    alert(`Proposal submitted for ${job.title}!`);
  };

  return (
    <Layout user={currentUser} title="Freelancer Workspace">
      <Card className="border-0 shadow-sm rounded-4 p-4 mt-4">
        <Tabs defaultActiveKey="orders" className="mb-4">
          
          <Tab eventKey="orders" title="My Orders">
            <OrdersTable orders={orders} onUpdateStatus={updateOrderStatus} />
          </Tab>

          <Tab eventKey="jobs" title="Available Jobs">
            <AvailableJobs jobs={availableJobs} onApply={applyToJob} />
          </Tab>

          <Tab eventKey="overview" title="Overview">
            <FreelancerOverview orders={orders} proposals={proposals} />
          </Tab>
          <Tab eventKey="proposals" title="My Proposals">
            <MyProposals proposals={proposals} />
          </Tab>
          <Tab eventKey="portfolio" title="Portfolio">
            <Portfolio />
          </Tab>
          <Tab eventKey="profile" title="Profile">
            <ProfileEdit />
          </Tab>

        </Tabs>
      </Card>
    </Layout>
  );
};

export default FreelancerDashboard;
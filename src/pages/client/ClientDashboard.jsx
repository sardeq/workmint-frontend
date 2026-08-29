import React, { useState, useContext } from 'react';
import { Spinner } from 'react-bootstrap';

import Layout from '../../components/Layout';
import Conversations from '../../components/Conversations';
import { UserContext } from '../../App';
import { useWorkspace } from '../../data/WorkspaceContext';

import ClientOverview from './components/ClientOverview';
import ClientProjects from './components/ClientProjects';
import ProjectDetails from './components/ProjectDetails';
import ProposalsInbox from './components/ProposalsInbox';
import PostJobForm from './components/PostJobForm';
import FindFreelancers from './components/FindFreelancers';
import Payments from './components/Payments';

import { unreadCount, clientNeedsAttention } from '../../data/freelancerData';

const PAGE_COPY = {
  'Overview': ['Your workspace', 'What needs a decision from you, in order of urgency'],
  'My Projects': ['My projects', 'Live contracts and where the money sits'],
  'Proposals': ['Proposals', 'Freelancers who applied to your jobs'],
  'Post a Job': ['Post a job', 'Describe the work and set the milestones'],
  'Find Freelancers': ['Find freelancers', 'Search the directory and invite someone directly'],
  'Messages': ['Messages', 'One thread per project'],
  'Payments': ['Payments', 'Funded, released, and still in escrow'],
};

const ClientDashboard = () => {
  const { currentUser } = useContext(UserContext);
  const workspace = useWorkspace();

  const [activeTab, setActiveTab] = useState('Overview');
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const {
    loading, orders: allOrders, jobs, proposals: allProposals, talent, paymentMethods,
    clientProfile, notifications, markNotificationsRead,
    sendMessage, markThreadRead, raiseDispute,
    approveMilestone, requestRevision, decideScopeChange,
    postJob, closeJob, acceptProposal, declineProposal,
    addPaymentMethod, setPrimaryMethod, notify,
  } = workspace;

  const company = clientProfile ? clientProfile.company : '';

  // Same store as the freelancer portal, filtered to this company's side.
  const orders = allOrders.filter((o) => o.client === company);
  const myJobs = jobs.filter((j) => j.postedBy === company);
  const proposals = allProposals.filter((p) => p.client === company);
  const myNotifications = notifications.filter((n) => n.audience === 'client');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedOrderId(null);
  };

  const openProject = (orderId) => {
    setActiveTab('My Projects');
    setSelectedOrderId(orderId);
  };

  const selectedOrder = orders.find((o) => o.id === selectedOrderId) || null;

  const badges = {
    'My Projects': orders.filter(clientNeedsAttention).length,
    'Proposals': proposals.filter((p) => p.status === 'Pending').length,
    'Messages': orders.reduce((sum, o) => sum + unreadCount(o, 'client'), 0),
  };

  const [pageTitle, pageSub] = PAGE_COPY[activeTab] || PAGE_COPY.Overview;
  const firstName = currentUser ? currentUser.name.split(' ')[0] : 'there';

  const handleHire = (proposalId) => {
    const order = acceptProposal(proposalId);
    if (order) openProject(order.id);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center py-5">
          <Spinner animation="border" style={{ color: 'var(--mint-primary)' }} />
          <p className="text-muted mt-3 mb-0" style={{ fontSize: '0.9rem' }}>Loading your workspace...</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'Overview':
        return (
          <ClientOverview
            orders={orders}
            jobs={myJobs}
            proposals={proposals}
            profile={clientProfile}
            onOpenProject={openProject}
            onGo={handleTabChange}
          />
        );

      case 'My Projects':
        return selectedOrder ? (
          <ProjectDetails
            order={selectedOrder}
            onBack={() => setSelectedOrderId(null)}
            onApprove={approveMilestone}
            onRequestRevision={requestRevision}
            onDecideScope={decideScopeChange}
            onSend={sendMessage}
            onRead={markThreadRead}
            onRaiseDispute={raiseDispute}
          />
        ) : (
          <ClientProjects orders={orders} onOpen={openProject} onGo={handleTabChange} />
        );

      case 'Proposals':
        return (
          <ProposalsInbox
            jobs={myJobs}
            proposals={proposals}
            onHire={handleHire}
            onDecline={declineProposal}
            onCloseJob={closeJob}
            onGo={handleTabChange}
          />
        );

      case 'Post a Job':
        return (
          <PostJobForm
            onPostJob={(form) => { postJob(form); handleTabChange('Proposals'); }}
          />
        );

      case 'Find Freelancers':
        return (
          <FindFreelancers
            talent={talent}
            jobs={myJobs}
            onInvite={(person, job) => notify(`Invitation sent to ${person.name} for "${job.title}"`)}
            onGo={handleTabChange}
          />
        );

      case 'Messages':
        return (
          <Conversations
            orders={orders}
            role="client"
            onSend={sendMessage}
            onRead={markThreadRead}
            onOpenOrder={openProject}
          />
        );

      case 'Payments':
        return (
          <Payments
            orders={orders}
            methods={paymentMethods}
            onAddMethod={addPaymentMethod}
            onSetPrimary={setPrimaryMethod}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Layout
      title={selectedOrder ? selectedOrder.project : activeTab === 'Overview' ? `Welcome back, ${firstName}` : pageTitle}
      subtitle={selectedOrder ? `${selectedOrder.id} with ${selectedOrder.freelancer.name}` : pageSub}
      activeTab={activeTab}
      setActiveTab={handleTabChange}
      badges={badges}
      notifications={myNotifications}
      onReadNotifications={() => markNotificationsRead('client')}
    >
      {renderContent()}
    </Layout>
  );
};

export default ClientDashboard;
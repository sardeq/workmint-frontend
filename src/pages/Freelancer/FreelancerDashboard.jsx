import React, { useState, useContext } from 'react';
import { Spinner } from 'react-bootstrap';

import Layout from '../../components/Layout';
import Conversations from '../../components/Conversations';
import { UserContext } from '../../App';
import { useWorkspace } from '../../data/WorkspaceContext';

import FreelancerOverview from './components/FreelancerOverview';
import OrdersTable from './components/OrdersTable';
import ProjectWorkspace from './components/ProjectWorkspace';
import AvailableJobs from './components/AvailableJobs';
import MyProposals from './components/MyProposals';
import Earnings from './components/Earnings';
import Portfolio from './components/Portfolio';
import ProfileEdit from './components/ProfileEdit';

import { unreadCount, needsAttention } from '../../data/freelancerData';

const PAGE_COPY = {
  'Overview': ['Your workspace', 'Everything waiting on you, in order of urgency'],
  'My Orders': ['My orders', 'Active contracts and their escrow status'],
  'Available Jobs': ['Find work', 'Open jobs matched to your skills'],
  'My Proposals': ['My proposals', 'Bids you have sent and where they stand'],
  'Messages': ['Messages', 'One thread per order, so nothing gets lost'],
  'Earnings': ['Earnings', 'Released, held in escrow, and paid out'],
  'Portfolio': ['Portfolio', 'What clients see before they hire you'],
  'Profile': ['Profile', 'Your public profile and availability'],
};

const FreelancerDashboard = () => {
  const { currentUser } = useContext(UserContext);
  const workspace = useWorkspace();

  const [activeTab, setActiveTab] = useState('Overview');
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const {
    loading, orders: allOrders, jobs, proposals: allProposals, portfolio, withdrawals,
    profile, savedJobIds, notifications, markNotificationsRead,
    sendMessage, markThreadRead, raiseDispute,
    startMilestone, submitDeliverable, requestScopeChange, applyToJob, withdrawProposal,
    toggleSaveJob, savePortfolioItem, deletePortfolioItem, saveProfile, requestWithdrawal,
  } = workspace;

  const me = profile ? profile.name : '';

  // The shared store holds both sides of the marketplace; take this side of it.
  const orders = allOrders.filter((o) => o.freelancer && o.freelancer.name === me);
  const proposals = allProposals.filter((p) => p.freelancer && p.freelancer.name === me);
  const myNotifications = notifications.filter((n) => n.audience === 'freelancer');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedOrderId(null);
  };

  const openOrder = (orderId) => {
    setActiveTab('My Orders');
    setSelectedOrderId(orderId);
  };

  // Derived, never stored: a stale copy of the order was the old bug here.
  const selectedOrder = orders.find((o) => o.id === selectedOrderId) || null;

  const badges = {
    'My Orders': orders.filter(needsAttention).length,
    'Messages': orders.reduce((sum, o) => sum + unreadCount(o, 'freelancer'), 0),
  };

  const [pageTitle, pageSub] = PAGE_COPY[activeTab] || PAGE_COPY.Overview;
  const firstName = currentUser ? currentUser.name.split(' ')[0] : 'there';

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
          <FreelancerOverview
            orders={orders}
            proposals={proposals}
            withdrawals={withdrawals}
            profile={profile}
            onOpenOrder={openOrder}
            onGo={handleTabChange}
          />
        );

      case 'My Orders':
        return selectedOrder ? (
          <ProjectWorkspace
            order={selectedOrder}
            onBack={() => setSelectedOrderId(null)}
            onStart={startMilestone}
            onSubmit={submitDeliverable}
            onScopeChange={requestScopeChange}
            onSend={sendMessage}
            onRead={markThreadRead}
            onRaiseDispute={raiseDispute}
          />
        ) : (
          <OrdersTable orders={orders} onOpen={openOrder} />
        );

      case 'Available Jobs':
        return (
          <AvailableJobs
            jobs={jobs}
            proposals={proposals}
            savedJobIds={savedJobIds}
            onToggleSave={toggleSaveJob}
            onApply={applyToJob}
          />
        );

      case 'My Proposals':
        return <MyProposals proposals={proposals} onWithdraw={withdrawProposal} onGo={handleTabChange} />;

      case 'Messages':
        return (
          <Conversations
            orders={orders}
            role="freelancer"
            onSend={sendMessage}
            onRead={markThreadRead}
            onOpenOrder={openOrder}
          />
        );

      case 'Earnings':
        return <Earnings orders={orders} withdrawals={withdrawals} onWithdraw={requestWithdrawal} />;

      case 'Portfolio':
        return <Portfolio items={portfolio} onSave={savePortfolioItem} onDelete={deletePortfolioItem} />;

      case 'Profile':
        return <ProfileEdit profile={profile} onSave={saveProfile} />;

      default:
        return null;
    }
  };

  return (
    <Layout
      title={selectedOrder ? selectedOrder.project : activeTab === 'Overview' ? `Welcome back, ${firstName}` : pageTitle}
      subtitle={selectedOrder ? `${selectedOrder.ref} for ${selectedOrder.client}` : pageSub}
      activeTab={activeTab}
      setActiveTab={handleTabChange}
      badges={badges}
      notifications={myNotifications}
      onReadNotifications={() => markNotificationsRead('freelancer')}
    >
      {renderContent()}
    </Layout>
  );
};

export default FreelancerDashboard;
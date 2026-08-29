import React, { useState } from 'react';
import { Spinner } from 'react-bootstrap';

import Layout from '../../components/Layout';
import { useAuth } from '../../data/AuthContext';
import { useWorkspace } from '../../data/WorkspaceContext';

import AdminOverview from './components/AdminOverview';
import DisputesList from './components/DisputesList';
import DisputeModal from './components/DisputeModal';
import Approvals from './components/Approvals';
import UserManagement from './components/UserManagement';
import JobManagement from './components/JobManagement';
import Analytics from './components/Analytics';

const PAGE_COPY = {
  'Overview': ['Control centre', 'Platform health and everything queued for a decision'],
  'Disputes': ['Disputes', 'Frozen escrow waiting on a mediator'],
  'Approvals': ['Freelancer approvals', 'Accounts waiting to be screened'],
  'Users': ['Users', 'Every account on the platform'],
  'Jobs': ['Jobs and contracts', 'Marketplace listings and live contracts'],
  'Analytics': ['Analytics', 'Volume, fees and where the money sits'],
};

const AdminDashboard = () => {
  const { users, currentUser, setUserStatus } = useAuth();
  const {
    loading, orders, jobs, proposals, disputes,
    markNotificationsRead, resolveDispute, setDisputeStatus, closeJob,
  } = useWorkspace();

  const [activeTab, setActiveTab] = useState('Overview');
  const [selectedDispute, setSelectedDispute] = useState(null);

  const openDisputes = disputes.filter((d) => d.status !== 'Resolved');
  const pendingUsers = users.filter((u) => u.status === 'pending');

  const badges = {
    'Disputes': openDisputes.length,
    'Approvals': pendingUsers.length,
  };

  /* Admin notifications are the queues, not per-contract chatter. */
  const adminFeed = [
    ...openDisputes.map((d) => ({
      id: `AN-${d.id}`, at: d.openedAt, read: false,
      text: `${d.id}: ${d.reason} (${d.client} vs ${d.freelancer})`,
    })),
    ...pendingUsers.map((u) => ({
      id: `AN-${u.id}`, at: u.joinedAt, read: false,
      text: `${u.name} applied as a freelancer`,
    })),
  ].sort((a, b) => new Date(b.at) - new Date(a.at));

  const [pageTitle, pageSub] = PAGE_COPY[activeTab] || PAGE_COPY.Overview;
  const firstName = currentUser ? currentUser.name.split(' ')[0] : 'there';

  const handleResolve = (disputeId, outcome, note) => {
    resolveDispute(disputeId, outcome, note);
    setSelectedDispute(null);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center py-5">
          <Spinner animation="border" style={{ color: 'var(--mint-primary)' }} />
          <p className="text-muted mt-3 mb-0" style={{ fontSize: '0.9rem' }}>Loading platform data...</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'Overview':
        return (
          <AdminOverview
            orders={orders}
            jobs={jobs}
            users={users}
            disputes={disputes}
            proposals={proposals}
            onReviewDispute={setSelectedDispute}
            onGo={setActiveTab}
          />
        );

      case 'Disputes':
        return (
          <DisputesList
            disputes={disputes}
            orders={orders}
            onReview={setSelectedDispute}
            onTriage={setDisputeStatus}
          />
        );

      case 'Approvals':
        return <Approvals users={users} onDecide={setUserStatus} onGo={setActiveTab} />;

      case 'Users':
        return <UserManagement users={users} orders={orders} onSetStatus={setUserStatus} />;

      case 'Jobs':
        return <JobManagement jobs={jobs} orders={orders} proposals={proposals} onCloseJob={closeJob} />;

      case 'Analytics':
        return <Analytics orders={orders} users={users} disputes={disputes} jobs={jobs} />;

      default:
        return null;
    }
  };

  return (
    <Layout
      title={activeTab === 'Overview' ? `Welcome back, ${firstName}` : pageTitle}
      subtitle={pageSub}
      activeTab={activeTab}
      setActiveTab={(tab) => { setActiveTab(tab); setSelectedDispute(null); }}
      badges={badges}
      notifications={adminFeed}
      onReadNotifications={() => markNotificationsRead('admin')}
    >
      {renderContent()}

      <DisputeModal
        show={Boolean(selectedDispute)}
        dispute={selectedDispute}
        order={selectedDispute ? orders.find((o) => o.id === selectedDispute.orderId) : null}
        onHide={() => setSelectedDispute(null)}
        onResolve={handleResolve}
      />
    </Layout>
  );
};

export default AdminDashboard;
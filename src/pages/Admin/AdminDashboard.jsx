import { useState, useEffect } from 'react';
import { Spinner } from 'react-bootstrap';

import Layout from '../../components/Layout';
import { ToastMessage } from '../../components/Shared';

import AdminOverview from './components/AdminOverview';
import DisputesList from './components/DisputesList';
import DisputeModal from './components/DisputeModal';
import Approvals from './components/Approvals';
import UserManagement from './components/UserManagement';
import JobManagement from './components/JobManagement';
import Analytics from './components/Analytics';

import { ordersApi, jobsApi, proposalsApi, disputesApi, usersApi, errorText } from '../../api/api';

const PAGE_COPY = {
  'Overview': ['Control centre', 'Platform health and everything queued for a decision'],
  'Disputes': ['Disputes', 'Frozen escrow waiting on a mediator'],
  'Approvals': ['Freelancer approvals', 'Accounts waiting to be screened'],
  'Users': ['Users', 'Every account on the platform'],
  'Jobs': ['Jobs and contracts', 'Marketplace listings and live contracts'],
  'Analytics': ['Analytics', 'Volume, fees and where the money sits'],
};

const AdminDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [disputes, setDisputes] = useState([]);

  const notify = (text, tone = 'success') => setToast({ text, tone });

  const loadUsers = async () => setUsers(await usersApi.getAll());

  const loadDisputes = async () => setDisputes(await disputesApi.getAll());

  const loadJobs = async () => setJobs(await jobsApi.getAll());

  const loadOrders = async () => {
    const rows = await ordersApi.getAll();
    const full = [];
    for (const row of rows) {
      full.push(await ordersApi.getOne(row.id));
    }
    setOrders(full);
  };

  useEffect(() => {
    const loadPlatform = async () => {
      try {
        await loadUsers();
        await loadOrders();
        await loadJobs();
        await loadDisputes();
        setProposals(await proposalsApi.getAll());
      } catch (err) {
        notify(errorText(err, 'Could not load platform data.'), 'warn');
      }
      setLoading(false);
    };

    loadPlatform();
  }, []);

  const openDisputes = disputes.filter((dispute) => dispute.status !== 'Resolved');
  const pendingUsers = users.filter((person) => person.status === 'pending');

  const badges = {
    'Disputes': openDisputes.length,
    'Approvals': pendingUsers.length,
  };

  const notifications = [
    ...openDisputes.map((dispute) => ({
      id: `AN-D${dispute.id}`,
      at: dispute.opened_at,
      text: `Case ${dispute.id}: ${dispute.reason} (${dispute.client} vs ${dispute.freelancer})`,
    })),
    ...pendingUsers.map((person) => ({
      id: `AN-U${person.id}`,
      at: person.joined_at,
      text: `${person.name} applied as a freelancer`,
    })),
  ].sort((a, b) => new Date(b.at) - new Date(a.at));

  const setUserStatus = async (id, status, reason) => {
    try {
      await usersApi.setStatus(id, status, reason);
      await loadUsers();
      notify(`Account marked as ${status}`);
    } catch (err) {
      notify(errorText(err, 'Could not update the account.'), 'warn');
    }
  };

  const setDisputeStatus = async (disputeId, status) => {
    try {
      await disputesApi.claim(disputeId);
      await loadDisputes();
      notify(`Case marked as ${status.toLowerCase()}`);
    } catch (err) {
      notify(errorText(err), 'warn');
    }
  };

  const resolveDispute = async (disputeId, outcome, note) => {
    try {
      await disputesApi.resolve(disputeId, outcome, note);
      await loadDisputes();
      await loadOrders();
      notify(`Case ${disputeId} resolved`);
      setSelectedDispute(null);
    } catch (err) {
      notify(errorText(err, 'Could not resolve that case.'), 'warn');
    }
  };

  const closeJob = async (jobId) => {
    try {
      await jobsApi.close(jobId);
      await loadJobs();
      notify('Job closed', 'warn');
    } catch (err) {
      notify(errorText(err), 'warn');
    }
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

    if (activeTab === 'Overview') {
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
    }

    if (activeTab === 'Disputes') {
      return (
        <DisputesList
          disputes={disputes}
          orders={orders}
          onReview={setSelectedDispute}
          onTriage={setDisputeStatus}
        />
      );
    }

    if (activeTab === 'Approvals') {
      return <Approvals users={users} onDecide={setUserStatus} onGo={setActiveTab} />;
    }

    if (activeTab === 'Users') {
      return <UserManagement users={users} orders={orders} onSetStatus={setUserStatus} />;
    }

    if (activeTab === 'Jobs') {
      return <JobManagement jobs={jobs} orders={orders} proposals={proposals} onCloseJob={closeJob} />;
    }

    if (activeTab === 'Analytics') {
      return <Analytics orders={orders} users={users} disputes={disputes} jobs={jobs} />;
    }

    return null;
  };

  const [pageTitle, pageSub] = PAGE_COPY[activeTab] || PAGE_COPY.Overview;
  const firstName = user.name.split(' ')[0];

  return (
    <Layout
      user={user}
      onLogout={onLogout}
      title={activeTab === 'Overview' ? `Welcome back, ${firstName}` : pageTitle}
      subtitle={pageSub}
      activeTab={activeTab}
      setActiveTab={(tab) => { setActiveTab(tab); setSelectedDispute(null); }}
      badges={badges}
      notifications={notifications}
    >
      {renderContent()}

      <DisputeModal
        show={Boolean(selectedDispute)}
        dispute={selectedDispute}
        order={selectedDispute ? orders.find((order) => order.id === selectedDispute.order_id) : null}
        onHide={() => setSelectedDispute(null)}
        onResolve={resolveDispute}
      />

      <ToastMessage toast={toast} onClose={() => setToast(null)} />
    </Layout>
  );
};

export default AdminDashboard;

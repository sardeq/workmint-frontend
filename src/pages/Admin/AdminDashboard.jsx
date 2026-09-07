import { useState, useEffect } from 'react';
import { Spinner } from 'react-bootstrap';

import Layout from '../../components/Layout';
import { ToastMessage } from '../../components/Shared';

import AdminOverview from './components/AdminOverview';
import Approvals from './components/Approvals';
import UserManagement from './components/UserManagement';
import JobManagement from './components/JobManagement';

import { contractsApi, jobsApi, proposalsApi, usersApi, errorText } from '../../api/api';

const PAGE_COPY = {
  'Overview': ['Control centre', 'Platform health and everything queued for a decision'],
  'Approvals': ['Freelancer approvals', 'Accounts waiting to be screened'],
  'Users': ['Users', 'Every account on the platform'],
  'Jobs': ['Jobs and contracts', 'Marketplace listings and live contracts'],
};

const AdminDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [users, setUsers] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [proposals, setProposals] = useState([]);

  const notify = (text, tone = 'success') => setToast({ text, tone });

  const loadUsers = async () => setUsers(await usersApi.getAll());
  const loadJobs = async () => setJobs(await jobsApi.getAll());
  const loadContracts = async () => setContracts(await contractsApi.getAll());

  useEffect(() => {
    const loadPlatform = async () => {
      try {
        await loadUsers();
        await loadContracts();
        await loadJobs();
        setProposals(await proposalsApi.getAll());
      } catch (err) {
        notify(errorText(err, 'Could not load platform data.'), 'warn');
      }
      setLoading(false);
    };

    loadPlatform();
  }, []);

  const pendingUsers = users.filter((person) => person.status === 'pending');

  const badges = { 'Approvals': pendingUsers.length };


  const setUserStatus = async (id, status, reason) => {
    try {
      await usersApi.setStatus(id, status, reason);
      await loadUsers();
      notify(`Account marked as ${status}`);
    } catch (err) {
      notify(errorText(err, 'Could not update the account.'), 'warn');
    }
  };

  const deleteUser = async (id) => {
    try {
      await usersApi.remove(id);
      await loadUsers();
      notify('Account deleted', 'warn');
    } catch (err) {
      notify(errorText(err, 'Could not delete that account.'), 'warn');
    }
  };

  const deleteJob = async (jobId) => {
    try {
      await jobsApi.remove(jobId);
      await loadJobs();
      notify('Listing removed', 'warn');
    } catch (err) {
      notify(errorText(err, 'Could not remove that listing.'), 'warn');
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
          contracts={contracts}
          jobs={jobs}
          users={users}
          proposals={proposals}
          onGo={setActiveTab}
        />
      );
    }

    if (activeTab === 'Approvals') {
      return <Approvals users={users} onDecide={setUserStatus} onGo={setActiveTab} />;
    }

    if (activeTab === 'Users') {
      return <UserManagement users={users} contracts={contracts} onSetStatus={setUserStatus} onDelete={deleteUser} />;
    }

    if (activeTab === 'Jobs') {
      return <JobManagement jobs={jobs} contracts={contracts} proposals={proposals} onDeleteJob={deleteJob} />;
    }

    return null;
  };

  const [pageTitle, pageSub] = PAGE_COPY[activeTab];
  const firstName = user.name.split(' ')[0];

  return (
    <Layout
      user={user}
      onLogout={onLogout}
      title={activeTab === 'Overview' ? `Welcome back, ${firstName}` : pageTitle}
      subtitle={pageSub}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      badges={badges}
    >
      {renderContent()}
      <ToastMessage toast={toast} onClose={() => setToast(null)} />
    </Layout>
  );
};

export default AdminDashboard;

import { useState, useEffect } from 'react';
import { Spinner } from 'react-bootstrap';

import Layout from '../../components/Layout';
import Conversations from '../../components/Conversations';
import { ToastMessage } from '../../components/Shared';

import ClientOverview from './components/ClientOverview';
import ClientProjects from './components/ClientProjects';
import ProjectDetails from './components/ProjectDetails';
import ProposalsInbox from './components/ProposalsInbox';
import PostJobForm from './components/PostJobForm';
import FindFreelancers from './components/FindFreelancers';
import Payments from './components/Payments';

import {
  contractsApi, jobsApi, proposalsApi, messagesApi, usersApi,
  paymentsApi, paymentMethodsApi, errorText,
} from '../../api/api';
import { clientAction, money } from '../../data/helpers';

const PAGE_COPY = {
  'Overview': ['Your workspace', 'What needs a decision from you'],
  'My Projects': ['My projects', 'Live contracts and where the money sits'],
  'Proposals': ['Proposals', 'Freelancers who applied to your jobs'],
  'Post a Job': ['Post a job', 'Describe the work and set a budget'],
  'Find Freelancers': ['Find freelancers', 'Search the directory and invite someone'],
  'Messages': ['Messages', 'One thread per contract'],
  'Payments': ['Payments', 'Pay in your own currency and keep the receipts'],
};

const ClientDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [contracts, setContracts] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [talent, setTalent] = useState([]);
  const [payments, setPayments] = useState([]);
  const [methods, setMethods] = useState([]);

  const notify = (text, tone = 'success') => setToast({ text, tone });

  const loadContracts = async () => {
    const rows = await contractsApi.getAll({ client_id: user.id });
    const full = [];
    for (const row of rows) {
      full.push(await contractsApi.getOne(row.id));
    }
    setContracts(full);
  };

  const loadJobs = async () => setJobs(await jobsApi.getAll({ client_id: user.id }));

  const loadProposals = async () => setProposals(await proposalsApi.getAll({ client_id: user.id }));

  useEffect(() => {
    const loadWorkspace = async () => {
      try {
        await loadContracts();
        await loadJobs();
        await loadProposals();
        setTalent(await usersApi.getAll({ role: 'freelancer' }));
        setPayments(await paymentsApi.getAll(user.id));
        setMethods(await paymentMethodsApi.getAll(user.id));
      } catch (err) {
        notify(errorText(err, 'Could not load your workspace.'), 'warn');
      }
      setLoading(false);
    };

    loadWorkspace();
  }, []);

  // Replaces one contract in state with a fresh copy from the API.
  const refreshContract = async (id) => {
    const fresh = await contractsApi.getOne(id);
    setContracts(contracts.map((contract) => (contract.id === id ? fresh : contract)));
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedId(null);
  };

  const openProject = (id) => {
    setActiveTab('My Projects');
    setSelectedId(id);
  };

  const selected = contracts.find((contract) => contract.id === selectedId) || null;

  const badges = {
    'My Projects': contracts.filter(clientAction).length,
    'Proposals': proposals.filter((p) => p.status === 'Pending').length,
  };

  const approve = async (id) => {
    try {
      const contract = await contractsApi.approve(id);
      await refreshContract(id);
      notify(`Approved. ${money(contract.amount)} released to the freelancer.`);
    } catch (err) {
      notify(errorText(err, 'Could not approve that delivery.'), 'warn');
    }
  };

  const requestRevision = async (id, note) => {
    try {
      await contractsApi.requestRevision(id, note);
      await refreshContract(id);
      notify('Sent back with your notes', 'warn');
    } catch (err) {
      notify(errorText(err, 'Could not send that back.'), 'warn');
    }
  };

  const cancelContract = async (id) => {
    try {
      await contractsApi.cancel(id);
      await refreshContract(id);
      notify('Contract cancelled', 'warn');
    } catch (err) {
      notify(errorText(err, 'Could not cancel that contract.'), 'warn');
    }
  };

  const sendMessage = async (contractId, senderRole, text) => {
    try {
      await messagesApi.send(contractId, senderRole, text);
      await refreshContract(contractId);
    } catch (err) {
      notify(errorText(err, 'Message not sent.'), 'warn');
    }
  };

  const postJob = async (form) => {
    try {
      await jobsApi.create({
        client_id: user.id,
        title: form.title,
        description: form.description,
        budget: Number(form.budget),
        days: Number(form.days),
        level: form.level,
        skills: form.skills,
      });
      await loadJobs();
      notify('Job posted. Freelancers can see it now.');
      handleTabChange('Proposals');
    } catch (err) {
      notify(errorText(err, 'Could not post that job.'), 'warn');
    }
  };

  const closeJob = async (jobId) => {
    try {
      await jobsApi.close(jobId);
      await loadJobs();
      await loadProposals();
      notify('Job closed and its open proposals declined', 'warn');
    } catch (err) {
      notify(errorText(err), 'warn');
    }
  };

  const hire = async (proposalId) => {
    try {
      const proposal = proposals.find((p) => p.id === proposalId);
      const contract = await proposalsApi.accept(proposalId);
      await loadProposals();
      await loadJobs();
      await loadContracts();
      notify(`Hired ${proposal.freelancer_name}. ${money(proposal.amount)} is now in escrow.`);
      openProject(contract.id);
    } catch (err) {
      notify(errorText(err, 'Could not accept that proposal.'), 'warn');
    }
  };

  const declineProposal = async (proposalId) => {
    try {
      await proposalsApi.setStatus(proposalId, 'Declined');
      await loadProposals();
      notify('Proposal declined', 'warn');
    } catch (err) {
      notify(errorText(err), 'warn');
    }
  };

  const pay = async (body) => {
    try {
      await paymentsApi.create({ ...body, client_id: user.id });
      setPayments(await paymentsApi.getAll(user.id));
      notify('Payment recorded');
    } catch (err) {
      notify(errorText(err, 'Could not take that payment.'), 'warn');
    }
  };

  const addMethod = async (label, kind) => {
    try {
      const row = await paymentMethodsApi.create({ client_id: user.id, label, kind });
      setMethods([...methods, row]);
      notify('Payment method added');
    } catch (err) {
      notify(errorText(err, 'Could not add that payment method.'), 'warn');
    }
  };

  const removeMethod = async (id) => {
    try {
      await paymentMethodsApi.remove(id);
      setMethods(methods.filter((method) => method.id !== id));
      notify('Payment method removed', 'warn');
    } catch (err) {
      notify(errorText(err), 'warn');
    }
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

    if (activeTab === 'Overview') {
      return (
        <ClientOverview
          contracts={contracts}
          jobs={jobs}
          proposals={proposals}
          user={user}
          onOpenProject={openProject}
          onGo={handleTabChange}
        />
      );
    }

    if (activeTab === 'My Projects') {
      if (selected) {
        return (
          <ProjectDetails
            contract={selected}
            onBack={() => setSelectedId(null)}
            onApprove={approve}
            onRequestRevision={requestRevision}
            onCancel={cancelContract}
            onSend={sendMessage}
          />
        );
      }
      return <ClientProjects contracts={contracts} onOpen={openProject} onGo={handleTabChange} />;
    }

    if (activeTab === 'Proposals') {
      return (
        <ProposalsInbox
          jobs={jobs}
          proposals={proposals}
          onHire={hire}
          onDecline={declineProposal}
          onCloseJob={closeJob}
          onGo={handleTabChange}
        />
      );
    }

    if (activeTab === 'Post a Job') {
      return <PostJobForm onPostJob={postJob} />;
    }

    if (activeTab === 'Find Freelancers') {
      return (
        <FindFreelancers
          talent={talent}
          jobs={jobs}
          onInvite={(person, job) => notify(`Invitation sent to ${person.name} for "${job.title}"`)}
          onGo={handleTabChange}
        />
      );
    }

    if (activeTab === 'Messages') {
      return <Conversations contracts={contracts} role="client" onSend={sendMessage} />;
    }

    if (activeTab === 'Payments') {
      return (
        <Payments
          payments={payments}
          methods={methods}
          onPay={pay}
          onAddMethod={addMethod}
          onRemoveMethod={removeMethod}
        />
      );
    }

    return null;
  };

  const [pageTitle, pageSub] = PAGE_COPY[activeTab];
  const firstName = user.name.split(' ')[0];

  let title = pageTitle;
  let subtitle = pageSub;

  if (selected) {
    title = selected.title;
    subtitle = `With ${selected.freelancer_name}`;
  } else if (activeTab === 'Overview') {
    title = `Welcome back, ${firstName}`;
  }

  return (
    <Layout
      user={user}
      onLogout={onLogout}
      title={title}
      subtitle={subtitle}
      activeTab={activeTab}
      setActiveTab={handleTabChange}
      badges={badges}
    >
      {renderContent()}
      <ToastMessage toast={toast} onClose={() => setToast(null)} />
    </Layout>
  );
};

export default ClientDashboard;

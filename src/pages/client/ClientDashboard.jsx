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
  ordersApi, jobsApi, proposalsApi, milestonesApi, messagesApi,
  disputesApi, usersApi, paymentMethodsApi, errorText,
} from '../../api/api';
import { unreadCount, clientNeedsAttention, orderRef, money } from '../../data/helpers';

const PAGE_COPY = {
  'Overview': ['Your workspace', 'What needs a decision from you, in order of urgency'],
  'My Projects': ['My projects', 'Live contracts and where the money sits'],
  'Proposals': ['Proposals', 'Freelancers who applied to your jobs'],
  'Post a Job': ['Post a job', 'Describe the work and set the milestones'],
  'Find Freelancers': ['Find freelancers', 'Search the directory and invite someone directly'],
  'Messages': ['Messages', 'One thread per project'],
  'Payments': ['Payments', 'Funded, released, and still in escrow'],
};

const ClientDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [orders, setOrders] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [talent, setTalent] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);

  const notify = (text, tone = 'success') => setToast({ text, tone });

  const loadOrders = async () => {
    const rows = await ordersApi.getAll({ client_id: user.id });
    const full = [];
    for (const row of rows) {
      full.push(await ordersApi.getOne(row.id));
    }
    setOrders(full);
  };

  const loadJobs = async () => {
    const rows = await jobsApi.getAll({ client_id: user.id });
    setJobs(rows);
  };

  const loadProposals = async () => {
    const rows = await proposalsApi.getAll({ client_id: user.id });
    setProposals(rows);
  };

  useEffect(() => {
    const loadWorkspace = async () => {
      try {
        await loadOrders();
        await loadJobs();
        await loadProposals();
        setTalent(await usersApi.getAll({ role: 'freelancer', status: 'active' }));
        setPaymentMethods(await paymentMethodsApi.getAll(user.id));
      } catch (err) {
        notify(errorText(err, 'Could not load your workspace.'), 'warn');
      }
      setLoading(false);
    };

    loadWorkspace();
  }, []);

  const refreshOrder = async (orderId) => {
    const fresh = await ordersApi.getOne(orderId);
    setOrders(orders.map((order) => (order.id === orderId ? fresh : order)));
    return fresh;
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedOrderId(null);
  };

  const openProject = (orderId) => {
    setActiveTab('My Projects');
    setSelectedOrderId(orderId);
  };

  const selectedOrder = orders.find((order) => order.id === selectedOrderId) || null;

  const badges = {
    'My Projects': orders.filter(clientNeedsAttention).length,
    'Proposals': proposals.filter((p) => p.status === 'Pending').length,
    'Messages': orders.reduce((sum, order) => sum + unreadCount(order, 'client'), 0),
  };

  const notifications = orders
    .flatMap((order) =>
      (order.activity || [])
        .filter((item) => item.actor === 'freelancer' || item.actor === 'system')
        .map((item) => ({ id: `N-${order.id}-${item.id}`, at: item.at, text: item.text }))
    )
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, 12);

  const approveMilestone = async (orderId, milestoneId) => {
    try {
      const milestone = await milestonesApi.approve(milestoneId);
      await refreshOrder(orderId);
      notify(`Approved "${milestone.title}" - ${money(milestone.amount)} released`);
    } catch (err) {
      notify(errorText(err, 'Could not approve that milestone.'), 'warn');
    }
  };

  const requestRevision = async (orderId, milestoneId, note) => {
    try {
      await milestonesApi.requestRevision(milestoneId, note);
      await refreshOrder(orderId);
      notify('Sent back with your notes', 'warn');
    } catch (err) {
      notify(errorText(err, 'Could not send that back.'), 'warn');
    }
  };

  const decideScopeChange = async (orderId, requestId, decision) => {
    try {
      const request = await ordersApi.decideScopeChange(orderId, requestId, decision);
      await refreshOrder(orderId);
      if (decision === 'Approved') {
        notify(`Scope change approved, ${money(request.extra_cost)} added to escrow`);
      } else {
        notify('Scope change declined', 'warn');
      }
    } catch (err) {
      notify(errorText(err), 'warn');
    }
  };

  const sendMessage = async (orderId, senderRole, text) => {
    try {
      await messagesApi.send(orderId, senderRole, text);
      await refreshOrder(orderId);
    } catch (err) {
      notify(errorText(err, 'Message not sent.'), 'warn');
    }
  };

  const markThreadRead = async (orderId, role) => {
    try {
      await messagesApi.markRead(orderId, role);
      await refreshOrder(orderId);
    } catch (err) {
      notify(errorText(err), 'warn');
    }
  };

  const raiseDispute = async (orderId, milestoneId, raisedBy, form) => {
    try {
      await disputesApi.create({
        order_id: orderId,
        milestone_id: milestoneId,
        raised_by: raisedBy,
        reason: form.reason,
        detail: form.detail,
      });
      await refreshOrder(orderId);
      notify('Dispute opened. A mediator will review it.', 'warn');
    } catch (err) {
      notify(errorText(err, 'Could not open that dispute.'), 'warn');
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
      notify('Job closed and open proposals declined', 'warn');
    } catch (err) {
      notify(errorText(err), 'warn');
    }
  };

  const hire = async (proposalId) => {
    try {
      const proposal = proposals.find((p) => p.id === proposalId);
      const order = await proposalsApi.accept(proposalId);
      await loadProposals();
      await loadJobs();
      await loadOrders();
      notify(`Hired ${proposal.freelancer_name}. ${money(proposal.amount)} is now in escrow.`);
      openProject(order.id);
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

  const addPaymentMethod = async (label, kind) => {
    try {
      const row = await paymentMethodsApi.create({ client_id: user.id, label, kind });
      setPaymentMethods([...paymentMethods, row]);
      notify('Payment method added');
    } catch (err) {
      notify(errorText(err, 'Could not add that payment method.'), 'warn');
    }
  };

  const setPrimaryMethod = async (id) => {
    try {
      await paymentMethodsApi.setPrimary(id);
      setPaymentMethods(paymentMethods.map((method) => ({ ...method, is_primary: method.id === id })));
      notify('Primary payment method updated');
    } catch (err) {
      notify(errorText(err, 'Could not update your payment methods.'), 'warn');
    }
  };

  const clientProfile = {
    company: user.company,
    contact: user.name,
    role: user.title,
    location: user.location,
    since: user.joined_at,
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
          orders={orders}
          jobs={jobs}
          proposals={proposals}
          profile={clientProfile}
          onOpenProject={openProject}
          onGo={handleTabChange}
        />
      );
    }

    if (activeTab === 'My Projects') {
      if (selectedOrder) {
        return (
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
        );
      }
      return <ClientProjects orders={orders} onOpen={openProject} onGo={handleTabChange} />;
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
      return (
        <Conversations
          orders={orders}
          role="client"
          onSend={sendMessage}
          onRead={markThreadRead}
          onOpenOrder={openProject}
        />
      );
    }

    if (activeTab === 'Payments') {
      return (
        <Payments
          orders={orders}
          methods={paymentMethods}
          onAddMethod={addPaymentMethod}
          onSetPrimary={setPrimaryMethod}
        />
      );
    }

    return null;
  };

  const [pageTitle, pageSub] = PAGE_COPY[activeTab] || PAGE_COPY.Overview;
  const firstName = user.name.split(' ')[0];

  let title = pageTitle;
  let subtitle = pageSub;

  if (selectedOrder) {
    title = selectedOrder.project;
    subtitle = `${orderRef(selectedOrder)} with ${selectedOrder.freelancer_name}`;
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
      notifications={notifications}
    >
      {renderContent()}
      <ToastMessage toast={toast} onClose={() => setToast(null)} />
    </Layout>
  );
};

export default ClientDashboard;

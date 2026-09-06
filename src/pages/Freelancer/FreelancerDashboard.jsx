import { useState, useEffect } from 'react';
import { Spinner } from 'react-bootstrap';

import Layout from '../../components/Layout';
import Conversations from '../../components/Conversations';
import { ToastMessage } from '../../components/Shared';

import FreelancerOverview from './components/FreelancerOverview';
import OrdersTable from './components/OrdersTable';
import ProjectWorkspace from './components/ProjectWorkspace';
import AvailableJobs from './components/AvailableJobs';
import MyProposals from './components/MyProposals';
import Earnings from './components/Earnings';
import Portfolio from './components/Portfolio';
import ProfileEdit from './components/ProfileEdit';

import {
  ordersApi, jobsApi, proposalsApi, milestonesApi, messagesApi, disputesApi,
  usersApi, portfolioApi, withdrawalsApi, errorText,
} from '../../api/api';
import { unreadCount, needsAttention, orderRef, money } from '../../data/helpers';

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

const FreelancerDashboard = ({ user, onLogout, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [orders, setOrders] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [profile, setProfile] = useState(null);
  const [savedJobIds, setSavedJobIds] = useState([]);

  const notify = (text, tone = 'success') => setToast({ text, tone });

  const loadOrders = async () => {
    const rows = await ordersApi.getAll({ freelancer_id: user.id });
    const full = [];
    for (const row of rows) {
      full.push(await ordersApi.getOne(row.id));
    }
    setOrders(full);
  };

  const loadProposals = async () => {
    const rows = await proposalsApi.getAll({ freelancer_id: user.id });
    setProposals(rows);
  };

  useEffect(() => {
    const loadWorkspace = async () => {
      try {
        await loadOrders();
        await loadProposals();
        setJobs(await jobsApi.getAll());
        setProfile(await usersApi.getOne(user.id));
        setPortfolio(await portfolioApi.getAll(user.id));
        setWithdrawals(await withdrawalsApi.getAll(user.id));
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

  const openOrder = (orderId) => {
    setActiveTab('My Orders');
    setSelectedOrderId(orderId);
  };

  const selectedOrder = orders.find((order) => order.id === selectedOrderId) || null;

  const badges = {
    'My Orders': orders.filter(needsAttention).length,
    'Messages': orders.reduce((sum, order) => sum + unreadCount(order, 'freelancer'), 0),
  };

  const notifications = orders
    .flatMap((order) =>
      (order.activity || [])
        .filter((item) => item.actor === 'client' || item.actor === 'system')
        .map((item) => ({ id: `N-${order.id}-${item.id}`, at: item.at, text: item.text }))
    )
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, 12);

  const startMilestone = async (orderId, milestoneId) => {
    try {
      const milestone = await milestonesApi.start(milestoneId);
      await refreshOrder(orderId);
      notify(`Started "${milestone.title}"`);
    } catch (err) {
      notify(errorText(err, 'Could not start that milestone.'), 'warn');
    }
  };

  const submitDeliverable = async (orderId, milestoneId, form) => {
    try {
      const milestone = await milestonesApi.deliver(milestoneId, form.link, form.note);
      const order = await refreshOrder(orderId);
      notify(`Delivered "${milestone.title}". ${order.client} has been notified.`);
    } catch (err) {
      notify(errorText(err, 'Could not deliver that milestone.'), 'warn');
    }
  };

  const requestScopeChange = async (orderId, form) => {
    try {
      await ordersApi.requestScopeChange(orderId, {
        reason: form.reason,
        extra_cost: Number(form.extraCost) || 0,
        extra_days: Number(form.extraDays) || 0,
      });
      await refreshOrder(orderId);
      notify('Scope change sent for client approval');
    } catch (err) {
      notify(errorText(err, 'Could not send that request.'), 'warn');
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

  const applyToJob = async (job, form) => {
    try {
      await proposalsApi.create({
        job_id: job.id,
        freelancer_id: user.id,
        amount: Number(form.amount),
        days: Number(form.days),
        cover: form.cover,
      });
      await loadProposals();
      notify(`Proposal sent to ${job.client}`);
    } catch (err) {
      notify(errorText(err, 'Could not send that proposal.'), 'warn');
    }
  };

  const withdrawProposal = async (proposalId) => {
    try {
      await proposalsApi.setStatus(proposalId, 'Withdrawn');
      await loadProposals();
      notify('Proposal withdrawn', 'warn');
    } catch (err) {
      notify(errorText(err), 'warn');
    }
  };

  const toggleSaveJob = (jobId) => {
    if (savedJobIds.includes(jobId)) {
      setSavedJobIds(savedJobIds.filter((id) => id !== jobId));
    } else {
      setSavedJobIds([...savedJobIds, jobId]);
    }
  };

  const savePortfolioItem = async (item) => {
    try {
      const body = {
        title: item.title,
        tech: item.tech,
        link: item.link,
        description: item.description,
      };

      if (item.id) {
        const saved = await portfolioApi.update(item.id, body);
        setPortfolio(portfolio.map((p) => (p.id === saved.id ? saved : p)));
        notify('Project updated');
      } else {
        const saved = await portfolioApi.create({ ...body, user_id: user.id });
        setPortfolio([...portfolio, saved]);
        notify('Project added to your portfolio');
      }
    } catch (err) {
      notify(errorText(err, 'Could not save that project.'), 'warn');
    }
  };

  const deletePortfolioItem = async (id) => {
    try {
      await portfolioApi.remove(id);
      setPortfolio(portfolio.filter((item) => item.id !== id));
      notify('Project removed', 'warn');
    } catch (err) {
      notify(errorText(err, 'Could not remove that project.'), 'warn');
    }
  };

  const saveProfile = async (next) => {
    try {
      const saved = await usersApi.update(user.id, {
        name: next.name,
        title: next.title,
        bio: next.bio,
        skills: next.skills,
        hourly_rate: next.hourly_rate,
        available: next.available,
        location: next.location,
        company: null,
      });
      setProfile(saved);
      onUpdateUser({ name: saved.name, title: saved.title });
      notify('Profile saved');
    } catch (err) {
      notify(errorText(err, 'Could not save your profile.'), 'warn');
    }
  };

  const requestWithdrawal = async (amount, method) => {
    try {
      const row = await withdrawalsApi.create({
        freelancer_id: user.id,
        amount: Number(amount),
        method,
      });
      setWithdrawals([row, ...withdrawals]);
      notify(`${money(row.amount)} on the way to your ${method.toLowerCase()}`);
    } catch (err) {
      notify(errorText(err, 'Could not start that withdrawal.'), 'warn');
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
        <FreelancerOverview
          orders={orders}
          proposals={proposals}
          withdrawals={withdrawals}
          profile={profile}
          onOpenOrder={openOrder}
          onGo={handleTabChange}
        />
      );
    }

    if (activeTab === 'My Orders') {
      if (selectedOrder) {
        return (
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
        );
      }
      return <OrdersTable orders={orders} onOpen={openOrder} />;
    }

    if (activeTab === 'Available Jobs') {
      return (
        <AvailableJobs
          jobs={jobs}
          proposals={proposals}
          savedJobIds={savedJobIds}
          onToggleSave={toggleSaveJob}
          onApply={applyToJob}
        />
      );
    }

    if (activeTab === 'My Proposals') {
      return <MyProposals proposals={proposals} onWithdraw={withdrawProposal} onGo={handleTabChange} />;
    }

    if (activeTab === 'Messages') {
      return (
        <Conversations
          orders={orders}
          role="freelancer"
          onSend={sendMessage}
          onRead={markThreadRead}
          onOpenOrder={openOrder}
        />
      );
    }

    if (activeTab === 'Earnings') {
      return <Earnings orders={orders} withdrawals={withdrawals} onWithdraw={requestWithdrawal} />;
    }

    if (activeTab === 'Portfolio') {
      return <Portfolio items={portfolio} onSave={savePortfolioItem} onDelete={deletePortfolioItem} />;
    }

    if (activeTab === 'Profile') {
      return <ProfileEdit profile={profile} onSave={saveProfile} />;
    }

    return null;
  };

  const [pageTitle, pageSub] = PAGE_COPY[activeTab] || PAGE_COPY.Overview;
  const firstName = user.name.split(' ')[0];

  let title = pageTitle;
  let subtitle = pageSub;

  if (selectedOrder) {
    title = selectedOrder.project;
    subtitle = `${orderRef(selectedOrder)} for ${selectedOrder.client}`;
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

export default FreelancerDashboard;

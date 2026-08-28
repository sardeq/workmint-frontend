import React, { useState, useEffect, useContext } from 'react';
import { Spinner, Toast, ToastContainer } from 'react-bootstrap';
import axios from 'axios';

import Layout from '../../components/Layout';
import { UserContext } from '../../App';

import FreelancerOverview from './components/FreelancerOverview';
import OrdersTable from './components/OrdersTable';
import ProjectWorkspace from './components/ProjectWorkspace';
import AvailableJobs from './components/AvailableJobs';
import MyProposals from './components/MyProposals';
import Messages from './components/Messages';
import Earnings from './components/Earning';
import Portfolio from './components/Portfolio';
import ProfileEdit from './components/ProfileEdit';

import { buildSeed, uid, unreadCount, needsAttention, money } from '../../data/freelancerData';

const USE_API = false;

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

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [toast, setToast] = useState(null);

  const [orders, setOrders] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [profile, setProfile] = useState(null);
  const [savedJobIds, setSavedJobIds] = useState([]);
  const [notifications, setNotifications] = useState([]);

  /* ---------------- load ---------------- */
  useEffect(() => {
    let cancelled = false;

    const loadWorkspace = async () => {
      let data = buildSeed();

      if (USE_API) {
        try {
          const res = await axios.get('/api/freelancer/workspace');
          data = res.data;
        } catch (err) {
          console.warn('Workspace API unavailable, using seed data:', err.message);
        }
      } else {
        await new Promise((resolve) => setTimeout(resolve, 350)); // stand-in for the request
      }

      if (cancelled) return; // component unmounted mid-request

      setOrders(data.orders);
      setJobs(data.jobs);
      setProposals(data.proposals);
      setPortfolio(data.portfolio);
      setWithdrawals(data.withdrawals);
      setProfile(data.profile);
      setNotifications(
        data.orders
          .flatMap((o) =>
            o.activity
              .filter((a) => a.actor === 'client')
              .map((a) => ({ id: `N-${a.id}`, at: a.at, text: a.text, orderId: o.id, read: false }))
          )
          .sort((a, b) => new Date(b.at) - new Date(a.at))
          .slice(0, 10)
      );
      setLoading(false);
    };

    loadWorkspace();
    return () => { cancelled = true; };
  }, []);

  /* ---------------- shared helpers ---------------- */
  const notify = (text, tone = 'success') => setToast({ id: uid('T'), text, tone });

  const updateOrder = (orderId, updater) =>
    setOrders((prev) => prev.map((o) => (o.id === orderId ? updater(o) : o)));

  const withActivity = (order, actor, text) => ({
    ...order,
    activity: [{ id: uid('A'), at: new Date().toISOString(), actor, text }, ...order.activity],
  });

  const pushNotification = (orderId, text) =>
    setNotifications((prev) => [
      { id: uid('N'), at: new Date().toISOString(), text, orderId, read: false },
      ...prev,
    ]);

  const mapMilestone = (order, milestoneId, patch) => ({
    ...order,
    milestones: order.milestones.map((m) => (m.id === milestoneId ? { ...m, ...patch } : m)),
  });

  /* ---------------- order handlers ---------------- */
  const startMilestone = (orderId, milestoneId) =>
    updateOrder(orderId, (order) => {
      const ms = order.milestones.find((m) => m.id === milestoneId);
      const next = mapMilestone(order, milestoneId, { status: 'active', startedOn: new Date().toISOString() });
      notify(`Started "${ms.title}"`);
      return withActivity(next, 'you', `You started "${ms.title}"`);
    });

  const submitDeliverable = (orderId, milestoneId, payload) =>
    updateOrder(orderId, (order) => {
      const ms = order.milestones.find((m) => m.id === milestoneId);
      const next = mapMilestone(order, milestoneId, {
        status: 'submitted',
        deliverable: { ...payload, at: new Date().toISOString() },
      });
      notify(`Delivered "${ms.title}". ${order.client} has been notified.`);
      return withActivity(next, 'you', `You delivered "${ms.title}"`);
    });

  const requestScopeChange = (orderId, form) =>
    updateOrder(orderId, (order) => {
      const request = {
        id: uid('CR'),
        reason: form.reason,
        extraCost: Number(form.extraCost) || 0,
        extraDays: Number(form.extraDays) || 0,
        status: 'Pending',
        at: new Date().toISOString(),
      };
      notify('Scope change sent for client approval');
      return withActivity(
        { ...order, changeRequests: [request, ...order.changeRequests] },
        'you',
        `You requested +${money(request.extraCost)} and ${request.extraDays} extra days`
      );
    });

  const sendMessage = (orderId, text) =>
    updateOrder(orderId, (order) => ({
      ...order,
      messages: [...order.messages, { id: uid('M'), from: 'you', text, at: new Date().toISOString(), read: true }],
    }));

  const markThreadRead = (orderId) =>
    updateOrder(orderId, (order) => ({
      ...order,
      messages: order.messages.map((m) => ({ ...m, read: true })),
    }));

  /* Demo bridge: the client dashboard will eventually drive these. Until it
     exists, the workspace exposes them behind a clearly marked panel so the
     approve / revise loop can actually be walked end to end. */
  const simulateClient = (orderId, milestoneId, action, note) =>
    updateOrder(orderId, (order) => {
      const ms = order.milestones.find((m) => m.id === milestoneId);

      if (action === 'approve') {
        const next = mapMilestone(order, milestoneId, { status: 'approved', approvedOn: new Date().toISOString() });
        const text = `${order.client} approved "${ms.title}" - ${money(ms.amount)} released`;
        pushNotification(orderId, text);
        notify(text);
        return withActivity(next, 'client', text);
      }

      const next = mapMilestone(order, milestoneId, {
        status: 'revision',
        revisionsUsed: ms.revisionsUsed + 1,
        revisionNote: note || 'Client asked for changes.',
      });
      const text = `${order.client} requested a revision on "${ms.title}"`;
      pushNotification(orderId, text);
      notify(text, 'warn');
      return withActivity(next, 'client', text);
    });

  /* ---------------- job + proposal handlers ---------------- */
  const applyToJob = (job, form) => {
    setProposals((prev) => [
      {
        id: uid('PROP'),
        jobId: job.id,
        job: job.title,
        client: job.client,
        amount: Number(form.amount),
        days: Number(form.days),
        cover: form.cover,
        plan: form.plan,
        status: 'Pending',
        sentAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    notify(`Proposal sent to ${job.client}`);
  };

  const withdrawProposal = (id) => {
    setProposals((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'Withdrawn' } : p)));
    notify('Proposal withdrawn', 'warn');
  };

  const toggleSaveJob = (id) =>
    setSavedJobIds((prev) => (prev.includes(id) ? prev.filter((j) => j !== id) : [...prev, id]));

  /* ---------------- profile, portfolio, payouts ---------------- */
  const savePortfolioItem = (item) => {
    setPortfolio((prev) =>
      item.id ? prev.map((p) => (p.id === item.id ? item : p)) : [...prev, { ...item, id: uid('PF') }]
    );
    notify(item.id ? 'Project updated' : 'Project added to your portfolio');
  };

  const deletePortfolioItem = (id) => {
    setPortfolio((prev) => prev.filter((p) => p.id !== id));
    notify('Project removed', 'warn');
  };

  const saveProfile = (next) => {
    setProfile(next);
    notify('Profile saved');
  };

  const requestWithdrawal = (amount, method) => {
    setWithdrawals((prev) => [
      { id: uid('WD'), amount, method, at: new Date().toISOString(), status: 'Processing' },
      ...prev,
    ]);
    notify(`${money(amount)} on the way to your ${method.toLowerCase()}`);
  };

  /* ---------------- navigation ---------------- */
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedOrderId(null); // sidebar always returns you to the list view
  };

  const openOrder = (orderId) => {
    setActiveTab('My Orders');
    setSelectedOrderId(orderId);
  };

  // Derived, never stored: a stale copy of the order was the old bug here.
  const selectedOrder = orders.find((o) => o.id === selectedOrderId) || null;

  const badges = {
    'My Orders': orders.filter(needsAttention).length,
    'Messages': orders.reduce((sum, o) => sum + unreadCount(o), 0),
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
            onClientAction={simulateClient}
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
        return <Messages orders={orders} onSend={sendMessage} onRead={markThreadRead} onOpenOrder={openOrder} />;

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
      subtitle={selectedOrder ? `${selectedOrder.id} for ${selectedOrder.client}` : pageSub}
      activeTab={activeTab}
      setActiveTab={handleTabChange}
      badges={badges}
      notifications={notifications}
      onReadNotifications={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))}
    >
      {renderContent()}

      <ToastContainer position="bottom-end" className="p-3" style={{ zIndex: 1080 }}>
        {toast && (
          <Toast key={toast.id} onClose={() => setToast(null)} show autohide delay={3200}>
            <Toast.Body className="d-flex align-items-center gap-2" style={{ fontSize: '0.88rem' }}>
              <span
                style={{
                  width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                  background: toast.tone === 'warn' ? 'var(--amber)' : 'var(--mint-primary)',
                }}
              />
              {toast.text}
            </Toast.Body>
          </Toast>
        )}
      </ToastContainer>
    </Layout>
  );
};

export default FreelancerDashboard;
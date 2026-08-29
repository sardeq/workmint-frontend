import React, { createContext, useContext, useState, useEffect } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import axios from 'axios';

import {
  buildSeed, uid, money, dayOffset, CLIENT_COMPANY,
} from './freelancerData';


const USE_API = false; // flip to true once /api exists, see loadWorkspace()

export const WorkspaceContext = createContext();
export const useWorkspace = () => useContext(WorkspaceContext);

export const WorkspaceProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [orders, setOrders] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [talent, setTalent] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [profile, setProfile] = useState(null);
  const [clientProfile, setClientProfile] = useState(null);
  const [savedJobIds, setSavedJobIds] = useState([]);
  const [notifications, setNotifications] = useState([]);

  /* ---------------- load ---------------- */
  useEffect(() => {
    let cancelled = false;

    const loadWorkspace = async () => {
      let data = buildSeed();

      if (USE_API) {
        try {
          const res = await axios.get('/api/workspace');
          data = res.data;
        } catch (err) {
          console.warn('Workspace API unavailable, using seed data:', err.message);
        }
      } else {
        await new Promise((resolve) => setTimeout(resolve, 350));
      }

      if (cancelled) return;

      setOrders(data.orders);
      setJobs(data.jobs);
      setProposals(data.proposals);
      setTalent(data.talent);
      setPortfolio(data.portfolio);
      setWithdrawals(data.withdrawals);
      setPaymentMethods(data.paymentMethods);
      setDisputes(data.disputes);
      setProfile(data.profile);
      setClientProfile(data.clientProfile);
      setNotifications(
        data.orders
          .flatMap((order) =>
            order.activity.map((a) => ({
              id: `N-${a.id}`,
              at: a.at,
              text: a.text,
              orderId: order.id,
              // a notification is for whoever did NOT cause it
              audience: a.actor === 'client' ? 'freelancer' : 'client',
              read: false,
            }))
          )
          .sort((a, b) => new Date(b.at) - new Date(a.at))
          .slice(0, 12)
      );
      setLoading(false);
    };

    loadWorkspace();
    return () => { cancelled = true; };
  }, []);

  /* ---------------- helpers ---------------- */
  const notify = (text, tone = 'success') => setToast({ id: uid('T'), text, tone });

  const updateOrder = (orderId, updater) =>
    setOrders((prev) => prev.map((o) => (o.id === orderId ? updater(o) : o)));

  const withActivity = (order, actor, text) => ({
    ...order,
    activity: [{ id: uid('A'), at: new Date().toISOString(), actor, text }, ...order.activity],
  });

  const pushNotification = (orderId, audience, text) =>
    setNotifications((prev) => [
      { id: uid('N'), at: new Date().toISOString(), text, orderId, audience, read: false },
      ...prev,
    ]);

  const mapMilestone = (order, milestoneId, patch) => ({
    ...order,
    milestones: order.milestones.map((m) => (m.id === milestoneId ? { ...m, ...patch } : m)),
  });

  const markNotificationsRead = (audience) =>
    setNotifications((prev) => prev.map((n) => (n.audience === audience ? { ...n, read: true } : n)));

  /* ---------------- shared: messaging ---------------- */
  const sendMessage = (orderId, from, text) =>
    updateOrder(orderId, (order) => ({
      ...order,
      messages: [...order.messages, { id: uid('M'), from, text, at: new Date().toISOString(), read: false }],
    }));

  const markThreadRead = (orderId, role) =>
    updateOrder(orderId, (order) => ({
      ...order,
      messages: order.messages.map((m) => (m.from === role ? m : { ...m, read: true })),
    }));

  /* ---------------- freelancer actions ---------------- */
  const startMilestone = (orderId, milestoneId) =>
    updateOrder(orderId, (order) => {
      const ms = order.milestones.find((m) => m.id === milestoneId);
      notify(`Started "${ms.title}"`);
      return withActivity(
        mapMilestone(order, milestoneId, { status: 'active' }),
        'freelancer',
        `${order.freelancer.name} started "${ms.title}"`
      );
    });

  const submitDeliverable = (orderId, milestoneId, payload) =>
    updateOrder(orderId, (order) => {
      const ms = order.milestones.find((m) => m.id === milestoneId);
      const text = `${order.freelancer.name} delivered "${ms.title}"`;
      pushNotification(orderId, 'client', text);
      notify(`Delivered "${ms.title}". ${order.client} has been notified.`);
      return withActivity(
        mapMilestone(order, milestoneId, {
          status: 'submitted',
          deliverable: { ...payload, at: new Date().toISOString() },
        }),
        'freelancer',
        text
      );
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
      const text = `${order.freelancer.name} requested a scope change`;
      pushNotification(orderId, 'client', text);
      notify('Scope change sent for client approval');
      return withActivity(
        { ...order, changeRequests: [request, ...order.changeRequests] },
        'freelancer',
        text
      );
    });

  const applyToJob = (job, form) => {
    setProposals((prev) => [
      {
        id: uid('PROP'),
        jobId: job.id,
        job: job.title,
        client: job.client,
        freelancer: profile ? { name: profile.name, title: profile.title, rating: 4.9, jobs: 38 } : null,
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

  /* ---------------- client actions ---------------- */
  const approveMilestone = (orderId, milestoneId) =>
    updateOrder(orderId, (order) => {
      const ms = order.milestones.find((m) => m.id === milestoneId);
      const text = `${order.client} approved "${ms.title}" - ${money(ms.amount)} released`;
      pushNotification(orderId, 'freelancer', text);
      notify(text);
      return withActivity(
        mapMilestone(order, milestoneId, { status: 'approved', approvedOn: new Date().toISOString() }),
        'client',
        text
      );
    });

  const requestRevision = (orderId, milestoneId, note) =>
    updateOrder(orderId, (order) => {
      const ms = order.milestones.find((m) => m.id === milestoneId);
      const text = `${order.client} requested a revision on "${ms.title}"`;
      pushNotification(orderId, 'freelancer', text);
      notify('Sent back with your notes', 'warn');
      return withActivity(
        mapMilestone(order, milestoneId, {
          status: 'revision',
          revisionsUsed: ms.revisionsUsed + 1,
          revisionNote: note,
        }),
        'client',
        text
      );
    });

  const decideScopeChange = (orderId, requestId, decision) =>
    updateOrder(orderId, (order) => {
      const request = order.changeRequests.find((cr) => cr.id === requestId);
      const approved = decision === 'Approved';

      // Approving adds the extra work as a new funded milestone.
      const extraMilestone = approved && request.extraCost > 0
        ? [{
            id: uid('MS'),
            title: 'Scope change: additional work',
            amount: request.extraCost,
            dueDate: dayOffset(request.extraDays || 7),
            status: 'pending',
            revisionsUsed: 0,
          }]
        : [];

      const text = `${order.client} ${approved ? 'approved' : 'declined'} the scope change`;
      pushNotification(orderId, 'freelancer', text);
      notify(approved ? `Scope change approved, ${money(request.extraCost)} added to escrow` : 'Scope change declined', approved ? 'success' : 'warn');

      return withActivity(
        {
          ...order,
          milestones: [...order.milestones, ...extraMilestone],
          changeRequests: order.changeRequests.map((cr) =>
            cr.id === requestId ? { ...cr, status: decision } : cr
          ),
        },
        'client',
        text
      );
    });

  const postJob = (form) => {
    const job = {
      id: uid('JOB'),
      postedBy: CLIENT_COMPANY,
      client: CLIENT_COMPANY,
      clientRating: 4.9,
      clientJobs: 14,
      title: form.title,
      description: form.description,
      budget: Number(form.budget),
      days: Number(form.days),
      level: form.level,
      skills: form.skills,
      postedHours: 0,
      proposals: 0,
    };
    setJobs((prev) => [job, ...prev]);
    notify('Job posted. Freelancers can see it now.');
    return job;
  };

  const closeJob = (jobId) => {
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
    setProposals((prev) =>
      prev.map((p) => (p.jobId === jobId && p.status === 'Pending' ? { ...p, status: 'Declined' } : p))
    );
    notify('Job closed and open proposals declined', 'warn');
  };

  /* Accepting a proposal is what turns a job into a funded contract. */
  const acceptProposal = (proposalId) => {
    const proposal = proposals.find((p) => p.id === proposalId);
    if (!proposal) return null;

    const job = jobs.find((j) => j.id === proposal.jobId);
    const plan = proposal.plan && proposal.plan.length
      ? proposal.plan
      : [{ title: 'Full delivery', amount: proposal.amount }];

    const newOrder = {
      id: uid('ORD'),
      client: CLIENT_COMPANY,
      clientContact: clientProfile ? clientProfile.contact : 'Client',
      freelancer: proposal.freelancer,
      project: job ? job.title : proposal.job,
      brief: job ? job.description : '',
      startedOn: dayOffset(0),
      deadline: dayOffset(proposal.days),
      revisionsIncluded: 2,
      milestones: plan.map((row, index) => ({
        id: uid('MS'),
        title: row.title || `Milestone ${index + 1}`,
        amount: Number(row.amount),
        dueDate: dayOffset(Math.round((proposal.days * (index + 1)) / plan.length)),
        status: index === 0 ? 'active' : 'pending',
        revisionsUsed: 0,
      })),
      messages: [{
        id: uid('M'),
        from: 'client',
        text: `We have accepted your proposal and funded ${money(proposal.amount)} into escrow. Start whenever you are ready.`,
        at: new Date().toISOString(),
        read: false,
      }],
      activity: [{
        id: uid('A'),
        at: new Date().toISOString(),
        actor: 'system',
        text: `${CLIENT_COMPANY} funded ${money(proposal.amount)} into escrow`,
      }],
      changeRequests: [],
    };

    setOrders((prev) => [newOrder, ...prev]);
    setProposals((prev) =>
      prev.map((p) => {
        if (p.id === proposalId) return { ...p, status: 'Accepted' };
        // one job, one hire: everything else on that job is declined
        if (p.jobId === proposal.jobId && p.status === 'Pending') return { ...p, status: 'Declined' };
        return p;
      })
    );
    if (job) setJobs((prev) => prev.filter((j) => j.id !== job.id));

    pushNotification(newOrder.id, 'freelancer', `${CLIENT_COMPANY} accepted your proposal for ${newOrder.project}`);
    notify(`Hired ${proposal.freelancer.name}. ${money(proposal.amount)} is now in escrow.`);
    return newOrder;
  };

  const declineProposal = (proposalId) => {
    setProposals((prev) => prev.map((p) => (p.id === proposalId ? { ...p, status: 'Declined' } : p)));
    notify('Proposal declined', 'warn');
  };

  /* ---------------- disputes ----------------
     Either side can raise one while the money is still held. The milestone
     freezes, and only an admin resolution moves it again. */
  const raiseDispute = (orderId, milestoneId, raisedBy, form) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    const milestone = order.milestones.find((m) => m.id === milestoneId);

    const dispute = {
      id: uid('DSP'),
      orderId,
      milestoneId,
      project: order.project,
      client: order.client,
      freelancer: order.freelancer.name,
      raisedBy,
      amount: milestone.amount,
      reason: form.reason,
      detail: form.detail,
      status: 'Open',
      openedAt: new Date().toISOString(),
    };

    setDisputes((prev) => [dispute, ...prev]);

    const who = raisedBy === 'client' ? order.client : order.freelancer.name;
    const text = `${who} opened a dispute on "${milestone.title}"`;
    updateOrder(orderId, (current) =>
      withActivity(mapMilestone(current, milestoneId, { status: 'disputed' }), 'system', text)
    );
    pushNotification(orderId, raisedBy === 'client' ? 'freelancer' : 'client', text);
    notify('Dispute opened. A mediator will review it.', 'warn');
  };

  const setDisputeStatus = (disputeId, status) => {
    setDisputes((prev) => prev.map((d) => (d.id === disputeId ? { ...d, status } : d)));
    notify(`Case marked as ${status.toLowerCase()}`);
  };

  /* Resolving a dispute is the only thing that can move disputed money. */
  const resolveDispute = (disputeId, outcome, note) => {
    const dispute = disputes.find((d) => d.id === disputeId);
    if (!dispute) return;

    setDisputes((prev) =>
      prev.map((d) =>
        d.id === disputeId
          ? { ...d, status: 'Resolved', resolution: outcome, resolutionNote: note, resolvedAt: new Date().toISOString() }
          : d
      )
    );

    updateOrder(dispute.orderId, (order) => {
      const milestone = order.milestones.find((m) => m.id === dispute.milestoneId);
      if (!milestone) return order;

      let milestones;
      let text;

      if (outcome === 'release') {
        milestones = order.milestones.map((m) =>
          m.id === milestone.id ? { ...m, status: 'approved', approvedOn: new Date().toISOString() } : m
        );
        text = `Mediator released ${money(milestone.amount)} to ${order.freelancer.name}`;
      } else if (outcome === 'refund') {
        milestones = order.milestones.map((m) =>
          m.id === milestone.id ? { ...m, status: 'refunded', refundedOn: new Date().toISOString() } : m
        );
        text = `Mediator refunded ${money(milestone.amount)} to ${order.client}`;
      } else {
        // Split: half is paid out, half leaves escrow as a separate refund row
        // so both ledgers still add up to the original amount.
        const half = Math.round(milestone.amount / 2);
        milestones = order.milestones.flatMap((m) =>
          m.id === milestone.id
            ? [
                { ...m, amount: milestone.amount - half, status: 'approved', approvedOn: new Date().toISOString() },
                {
                  id: uid('MS'),
                  title: `${milestone.title} (refunded half)`,
                  amount: half,
                  dueDate: m.dueDate,
                  status: 'refunded',
                  revisionsUsed: 0,
                  refundedOn: new Date().toISOString(),
                },
              ]
            : [m]
        );
        text = `Mediator split "${milestone.title}" evenly between both sides`;
      }

      return withActivity({ ...order, milestones }, 'system', text);
    });

    pushNotification(dispute.orderId, 'client', `Case ${dispute.id} was resolved`);
    pushNotification(dispute.orderId, 'freelancer', `Case ${dispute.id} was resolved`);
    notify(`${dispute.id} resolved`);
  };

  const addPaymentMethod = (label, kind) => {
    setPaymentMethods((prev) => [...prev, { id: uid('PM'), label, kind, primary: false }]);
    notify('Payment method added');
  };

  const setPrimaryMethod = (id) => {
    setPaymentMethods((prev) => prev.map((m) => ({ ...m, primary: m.id === id })));
    notify('Primary payment method updated');
  };

  const value = {
    loading, notify,
    orders, jobs, proposals, talent, portfolio, withdrawals, paymentMethods, disputes,
    profile, clientProfile, savedJobIds, notifications, markNotificationsRead,
    // shared
    sendMessage, markThreadRead, raiseDispute,
    // freelancer
    startMilestone, submitDeliverable, requestScopeChange, applyToJob, withdrawProposal,
    toggleSaveJob, savePortfolioItem, deletePortfolioItem, saveProfile, requestWithdrawal,
    // client
    approveMilestone, requestRevision, decideScopeChange, postJob, closeJob,
    acceptProposal, declineProposal, addPaymentMethod, setPrimaryMethod,
    // admin
    resolveDispute, setDisputeStatus,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}

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
    </WorkspaceContext.Provider>
  );
};
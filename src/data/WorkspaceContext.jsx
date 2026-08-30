import React, { createContext, useContext, useState, useEffect } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

import { useAuth } from './AuthContext';
import { buildSeed, uid, money } from './freelancerData';
import {
    ordersApi, jobsApi, proposalsApi, milestonesApi, messagesApi, disputesApi, usersApi,
} from '../api/api';
import {
    toOrder, toJob, toProposal, toDispute, toTalent, toProfile, errorText,
} from '../api/adapters';


export const WorkspaceContext = createContext();
export const useWorkspace = () => useContext(WorkspaceContext);

export const WorkspaceProvider = ({ children }) => {
    const { currentUser, updateCurrentUser } = useAuth();

    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    const [orders, setOrders] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [proposals, setProposals] = useState([]);
    const [disputes, setDisputes] = useState([]);
    const [talent, setTalent] = useState([]);
    const [profile, setProfile] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [savedJobIds, setSavedJobIds] = useState([]);

    /* ---- not on the server yet, so these stay local ----
       Portfolio and payment methods keep their seed rows because they are
       only cosmetic. Withdrawals start EMPTY: the seed had a $1,440 payout
       against seed earnings, and paired with real earnings from the database
       that produced a negative available balance. */
    const seed = buildSeed();
    const [portfolio, setPortfolio] = useState(seed.portfolio);
    const [withdrawals, setWithdrawals] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState(seed.paymentMethods);

    const notify = (text, tone = 'success') => setToast({ id: uid('T'), text, tone });

    /* ---------------- loading ---------------- */

    // Which slice of the marketplace this account can see.
    const scope = () => {
        if (!currentUser) return {};
        if (currentUser.role === 'client') return { client_id: currentUser.id };
        if (currentUser.role === 'freelancer') return { freelancer_id: currentUser.id };
        return {}; // admin sees everything
    };

    const loadWorkspace = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const params = scope();
            const [orderRows, jobRows, proposalRows, disputeRows] = await Promise.all([
                ordersApi.getAll(params),
                jobsApi.getAll(),
                proposalsApi.getAll(params),
                disputesApi.getAll(),
            ]);

            // The list endpoint returns no milestones or messages, and every
            // screen needs them, so pull each order in full.
            const full = await Promise.all(orderRows.map((row) => ordersApi.getOne(row.id)));

            setOrders(full.map(toOrder));
            setJobs(jobRows.map(toJob));
            setProposals(proposalRows.map(toProposal));
            setDisputes(disputeRows.map(toDispute));

            if (currentUser.role === 'client') {
                const people = await usersApi.getAll({ role: 'freelancer', status: 'active' });
                setTalent(people.map(toTalent));
            }
            if (currentUser.role === 'freelancer') {
                const me = await usersApi.getOne(currentUser.id);
                setProfile(toProfile(me));
            }
        } catch (err) {
            notify(errorText(err, 'Could not load your workspace.'), 'warn');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser) {
            loadWorkspace();
        } else {
            setOrders([]); setJobs([]); setProposals([]); setDisputes([]);
            setTalent([]); setProfile(null); setLoading(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser]);

    /* Notifications are derived from order activity rather than stored, so
       there is no extra table or endpoint to keep in step. */
    useEffect(() => {
        const audienceOf = (actor) => (actor === 'client' ? 'freelancer' : 'client');
        setNotifications(
            orders
                .flatMap((order) =>
                    order.activity.map((a) => ({
                        id: `N-${order.id}-${a.id}`,
                        at: a.at,
                        text: a.text,
                        orderId: order.id,
                        audience: audienceOf(a.actor),
                        read: false,
                    }))
                )
                .sort((a, b) => new Date(b.at) - new Date(a.at))
                .slice(0, 12)
        );
    }, [orders]);

    const markNotificationsRead = (audience) =>
        setNotifications((prev) => prev.map((n) => (n.audience === audience ? { ...n, read: true } : n)));

    /* After any write, read the order back so the UI matches the database. */
    const refreshOrder = async (orderId) => {
        const fresh = await ordersApi.getOne(orderId);
        const mapped = toOrder(fresh);
        setOrders((prev) => prev.map((o) => (o.id === orderId ? mapped : o)));
        return mapped;
    };

    const refreshProposals = async () => {
        const rows = await proposalsApi.getAll(scope());
        setProposals(rows.map(toProposal));
    };

    const refreshJobs = async () => {
        const rows = await jobsApi.getAll();
        setJobs(rows.map(toJob));
    };

    const refreshDisputes = async () => {
        const rows = await disputesApi.getAll();
        setDisputes(rows.map(toDispute));
    };

    /* ---------------- messaging ---------------- */

    const sendMessage = async (orderId, from, text) => {
        try {
            await messagesApi.send(orderId, from, text);
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
            // Not worth a toast: the badge is just briefly wrong.
            console.error(errorText(err));
        }
    };

    /* ---------------- freelancer ---------------- */

    const startMilestone = async (orderId, milestoneId) => {
        try {
            const m = await milestonesApi.start(milestoneId);
            await refreshOrder(orderId);
            notify(`Started "${m.title}"`);
        } catch (err) {
            notify(errorText(err, 'Could not start that milestone.'), 'warn');
        }
    };

    const submitDeliverable = async (orderId, milestoneId, payload) => {
        try {
            const m = await milestonesApi.deliver(milestoneId, payload.link, payload.note);
            const order = await refreshOrder(orderId);
            notify(`Delivered "${m.title}". ${order.client} has been notified.`);
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

    const applyToJob = async (job, form) => {
        try {
            await proposalsApi.create({
                job_id: job.id,
                freelancer_id: currentUser.id,
                amount: Number(form.amount),
                days: Number(form.days),
                cover: form.cover,
            });
            await refreshProposals();
            notify(`Proposal sent to ${job.client}`);
        } catch (err) {
            notify(errorText(err, 'Could not send that proposal.'), 'warn');
        }
    };

    const withdrawProposal = async (id) => {
        try {
            await proposalsApi.setStatus(id, 'Withdrawn');
            await refreshProposals();
            notify('Proposal withdrawn', 'warn');
        } catch (err) {
            notify(errorText(err), 'warn');
        }
    };

    const toggleSaveJob = (id) =>
        setSavedJobIds((prev) => (prev.includes(id) ? prev.filter((j) => j !== id) : [...prev, id]));

    const saveProfile = async (next) => {
        try {
            await usersApi.update(currentUser.id, {
                name: next.name,
                title: next.title,
                bio: next.bio,
                skills: next.skills,
                hourly_rate: next.rate,
                available: next.available,
                location: next.location,
                company: null,
            });
            setProfile(next);
            updateCurrentUser({ name: next.name, title: next.title });
            notify('Profile saved');
        } catch (err) {
            notify(errorText(err, 'Could not save your profile.'), 'warn');
        }
    };

    /* ---------------- client ---------------- */

    const approveMilestone = async (orderId, milestoneId) => {
        try {
            const m = await milestonesApi.approve(milestoneId);
            await refreshOrder(orderId);
            notify(`Approved "${m.title}" - ${money(Number(m.amount))} released`);
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
            notify(
                decision === 'Approved'
                    ? `Scope change approved, ${money(Number(request.extra_cost))} added to escrow`
                    : 'Scope change declined',
                decision === 'Approved' ? 'success' : 'warn'
            );
        } catch (err) {
            notify(errorText(err), 'warn');
        }
    };

    const postJob = async (form) => {
        try {
            const job = await jobsApi.create({
                client_id: currentUser.id,
                title: form.title,
                description: form.description,
                budget: Number(form.budget),
                days: Number(form.days),
                level: form.level,
                skills: form.skills,
            });
            await refreshJobs();
            notify('Job posted. Freelancers can see it now.');
            return job;
        } catch (err) {
            notify(errorText(err, 'Could not post that job.'), 'warn');
            return null;
        }
    };

    const closeJob = async (jobId) => {
        try {
            await jobsApi.close(jobId);
            await refreshJobs();
            await refreshProposals();
            notify('Job closed and open proposals declined', 'warn');
        } catch (err) {
            notify(errorText(err), 'warn');
        }
    };

    /* Hiring creates the contract server-side, so reload rather than trying
       to guess what the new order looks like. */
    const acceptProposal = async (proposalId) => {
        try {
            const proposal = proposals.find((p) => p.id === proposalId);
            const row = await proposalsApi.accept(proposalId);
            await Promise.all([refreshProposals(), refreshJobs()]);

            const created = toOrder(await ordersApi.getOne(row.id));
            setOrders((prev) => [created, ...prev]);

            notify(
                proposal
                    ? `Hired ${proposal.freelancer.name}. ${money(proposal.amount)} is now in escrow.`
                    : 'Freelancer hired.'
            );
            return created;
        } catch (err) {
            notify(errorText(err, 'Could not accept that proposal.'), 'warn');
            return null;
        }
    };

    const declineProposal = async (proposalId) => {
        try {
            await proposalsApi.setStatus(proposalId, 'Declined');
            await refreshProposals();
            notify('Proposal declined', 'warn');
        } catch (err) {
            notify(errorText(err), 'warn');
        }
    };

    /* ---------------- disputes ---------------- */

    const raiseDispute = async (orderId, milestoneId, raisedBy, form) => {
        try {
            await disputesApi.create({
                order_id: orderId,
                milestone_id: milestoneId,
                raised_by: raisedBy,
                reason: form.reason,
                detail: form.detail,
            });
            await Promise.all([refreshOrder(orderId), refreshDisputes()]);
            notify('Dispute opened. A mediator will review it.', 'warn');
        } catch (err) {
            notify(errorText(err, 'Could not open that dispute.'), 'warn');
        }
    };

    const setDisputeStatus = async (disputeId, status) => {
        try {
            await disputesApi.claim(disputeId);
            await refreshDisputes();
            notify(`Case marked as ${status.toLowerCase()}`);
        } catch (err) {
            notify(errorText(err), 'warn');
        }
    };

    const resolveDispute = async (disputeId, outcome, note) => {
        try {
            const dispute = disputes.find((d) => d.id === disputeId);
            await disputesApi.resolve(disputeId, outcome, note);
            await refreshDisputes();
            if (dispute) await refreshOrder(dispute.orderId);
            notify(`${dispute ? `Case ${dispute.id}` : 'Case'} resolved`);
        } catch (err) {
            notify(errorText(err, 'Could not resolve that case.'), 'warn');
        }
    };

    /* ------------- still local: no tables for these yet ------------- */

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

    const requestWithdrawal = (amount, method) => {
        setWithdrawals((prev) => [
            { id: uid('WD'), amount, method, at: new Date().toISOString(), status: 'Processing' },
            ...prev,
        ]);
        notify(`${money(amount)} on the way to your ${method.toLowerCase()}`);
    };

    const addPaymentMethod = (label, kind) => {
        setPaymentMethods((prev) => [...prev, { id: uid('PM'), label, kind, primary: false }]);
        notify('Payment method added');
    };

    const setPrimaryMethod = (id) => {
        setPaymentMethods((prev) => prev.map((m) => ({ ...m, primary: m.id === id })));
        notify('Primary payment method updated');
    };

    /* The client's own details, read straight off the signed-in account. */
    const clientProfile = currentUser && currentUser.role === 'client'
        ? {
            company: currentUser.company,
            contact: currentUser.name,
            role: currentUser.title,
            location: currentUser.location,
            since: currentUser.joinedAt,
        }
        : null;

    const value = {
        loading, notify, reload: loadWorkspace,
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
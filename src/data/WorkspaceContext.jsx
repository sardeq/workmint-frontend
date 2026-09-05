import React, { createContext, useContext, useState, useEffect } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

import { useAuth } from './AuthContext';
import { uid, money } from './freelancerData';
import {
    ordersApi, jobsApi, proposalsApi, milestonesApi, messagesApi, disputesApi, usersApi,
    portfolioApi, withdrawalsApi, paymentMethodsApi,
} from '../api/api';
import {
    toOrder, toJob, toProposal, toDispute, toTalent, toProfile, errorText,
    toPortfolioItem, toWithdrawal, toPaymentMethod,
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


    const [portfolio, setPortfolio] = useState([]);
    const [withdrawals, setWithdrawals] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);

    const notify = (text, tone = 'success') => setToast({ id: uid('T'), text, tone });


    const scope = () => {
        if (!currentUser) return {};
        if (currentUser.role === 'client') return { client_id: currentUser.id };
        if (currentUser.role === 'freelancer') return { freelancer_id: currentUser.id };
        return {};
    };

    const loadWorkspace = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const params = scope();

            const orderRows = await ordersApi.getAll(params);
            const jobRows = await jobsApi.getAll();
            const proposalRows = await proposalsApi.getAll(params);
            const disputeRows = await disputesApi.getAll();

            /* The list endpoint gives the order rows only. Ask for each one
               again to get its milestones, messages and activity with it. */
            const full = [];
            for (let i = 0; i < orderRows.length; i++) {
                const one = await ordersApi.getOne(orderRows[i].id);
                full.push(toOrder(one));
            }

            setOrders(full);
            setJobs(jobRows.map(toJob));
            setProposals(proposalRows.map(toProposal));
            setDisputes(disputeRows.map(toDispute));

            if (currentUser.role === 'client') {
                const people = await usersApi.getAll({ role: 'freelancer', status: 'active' });
                const methodRows = await paymentMethodsApi.getAll(currentUser.id);
                setTalent(people.map(toTalent));
                setPaymentMethods(methodRows.map(toPaymentMethod));
            }
            if (currentUser.role === 'freelancer') {
                const me = await usersApi.getOne(currentUser.id);
                const portfolioRows = await portfolioApi.getAll(currentUser.id);
                const withdrawalRows = await withdrawalsApi.getAll(currentUser.id);
                setProfile(toProfile(me));
                setPortfolio(portfolioRows.map(toPortfolioItem));
                setWithdrawals(withdrawalRows.map(toWithdrawal));
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
            setPortfolio([]); setWithdrawals([]); setPaymentMethods([]);
        }
    }, [currentUser]);

    useEffect(() => {
        // An entry written by the client is news for the freelancer, and vice versa.
        const audienceOf = (actor) => (actor === 'client' ? 'freelancer' : 'client');

        const rows = [];
        orders.forEach((order) => {
            order.activity.forEach((a) => {
                rows.push({
                    id: `N-${order.id}-${a.id}`,
                    at: a.at,
                    text: a.text,
                    orderId: order.id,
                    audience: audienceOf(a.actor),
                    read: false,
                });
            });
        });

        rows.sort((a, b) => new Date(b.at) - new Date(a.at));
        setNotifications(rows.slice(0, 12));
    }, [orders]);

    const markNotificationsRead = (audience) =>
        setNotifications((prev) => prev.map((n) => (n.audience === audience ? { ...n, read: true } : n)));

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
            console.error(errorText(err));
        }
    };


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

    const acceptProposal = async (proposalId) => {
        try {
            const proposal = proposals.find((p) => p.id === proposalId);
            const row = await proposalsApi.accept(proposalId);
            await refreshProposals();
            await refreshJobs();

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
            await refreshOrder(orderId);
            await refreshDisputes();
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

    /* ---------------- portfolio ---------------- */

    const savePortfolioItem = async (item) => {
        try {
            const body = {
                title: item.title,
                tech: item.tech,
                link: item.link,
                description: item.description,
            };

            if (item.id) {
                const row = await portfolioApi.update(item.id, body);
                const saved = toPortfolioItem(row);
                setPortfolio((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
                notify('Project updated');
            } else {
                const row = await portfolioApi.create({ ...body, user_id: currentUser.id });
                setPortfolio((prev) => [...prev, toPortfolioItem(row)]);
                notify('Project added to your portfolio');
            }
        } catch (err) {
            notify(errorText(err, 'Could not save that project.'), 'warn');
        }
    };

    const deletePortfolioItem = async (id) => {
        try {
            await portfolioApi.remove(id);
            setPortfolio((prev) => prev.filter((p) => p.id !== id));
            notify('Project removed', 'warn');
        } catch (err) {
            notify(errorText(err, 'Could not remove that project.'), 'warn');
        }
    };

    /* ---------------- money out ---------------- */

    const requestWithdrawal = async (amount, method) => {
        try {
            const row = await withdrawalsApi.create({
                freelancer_id: currentUser.id,
                amount: Number(amount),
                method,
            });
            setWithdrawals((prev) => [toWithdrawal(row), ...prev]);
            notify(`${money(Number(row.amount))} on the way to your ${method.toLowerCase()}`);
        } catch (err) {
            notify(errorText(err, 'Could not start that withdrawal.'), 'warn');
        }
    };

    const addPaymentMethod = async (label, kind) => {
        try {
            const row = await paymentMethodsApi.create({
                client_id: currentUser.id,
                label,
                kind,
            });
            setPaymentMethods((prev) => [...prev, toPaymentMethod(row)]);
            notify('Payment method added');
        } catch (err) {
            notify(errorText(err, 'Could not add that payment method.'), 'warn');
        }
    };

    const setPrimaryMethod = async (id) => {
        try {
            await paymentMethodsApi.setPrimary(id);
            setPaymentMethods((prev) => prev.map((m) => ({ ...m, primary: m.id === id })));
            notify('Primary payment method updated');
        } catch (err) {
            notify(errorText(err, 'Could not update your payment methods.'), 'warn');
        }
    };

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
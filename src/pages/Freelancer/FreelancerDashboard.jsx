import { useState, useEffect } from 'react';
import { Spinner } from 'react-bootstrap';

import Layout from '../../components/Layout';
import Conversations from '../../components/Conversations';
import { ToastMessage } from '../../components/Shared';

import FreelancerOverview from './components/FreelancerOverview';
import ContractsTable from './components/ContractsTable';
import ProjectWorkspace from './components/ProjectWorkspace';
import AvailableJobs from './components/AvailableJobs';
import MyProposals from './components/MyProposals';
import Earnings from './components/Earnings';
import Portfolio from './components/Portfolio';
import ProfileEdit from './components/ProfileEdit';

import {
  contractsApi, jobsApi, proposalsApi, messagesApi,
  usersApi, portfolioApi, withdrawalsApi, errorText,
} from '../../api/api';
import { freelancerAction, money } from '../../data/helpers';

const PAGE_COPY = {
  'Overview': ['Your workspace', 'Everything waiting on you'],
  'My Contracts': ['My contracts', 'Work you have been hired for'],
  'Available Jobs': ['Find work', 'Open jobs on the marketplace'],
  'My Proposals': ['My proposals', 'Bids you have sent and where they stand'],
  'Messages': ['Messages', 'One thread per contract'],
  'Earnings': ['Earnings', 'Released, held in escrow, and paid out'],
  'Portfolio': ['Portfolio', 'What clients see before they hire you'],
  'Profile': ['Profile', 'Your public profile and availability'],
};

const FreelancerDashboard = ({ user, onLogout, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [contracts, setContracts] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [profile, setProfile] = useState(null);

  const notify = (text, tone = 'success') => setToast({ text, tone });

  const loadContracts = async () => {
    const rows = await contractsApi.getAll({ freelancer_id: user.id });
    const full = [];
    for (const row of rows) {
      full.push(await contractsApi.getOne(row.id));
    }
    setContracts(full);
  };

  const loadProposals = async () => setProposals(await proposalsApi.getAll({ freelancer_id: user.id }));

  useEffect(() => {
    const loadWorkspace = async () => {
      try {
        await loadContracts();
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

  const refreshContract = async (id) => {
    const fresh = await contractsApi.getOne(id);
    setContracts(contracts.map((contract) => (contract.id === id ? fresh : contract)));
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedId(null);
  };

  const openContract = (id) => {
    setActiveTab('My Contracts');
    setSelectedId(id);
  };

  const selected = contracts.find((contract) => contract.id === selectedId) || null;

  const badges = {
    'My Contracts': contracts.filter(freelancerAction).length,
  };

  const deliver = async (id, link, note) => {
    try {
      await contractsApi.deliver(id, link, note);
      await refreshContract(id);
      notify('Delivered. The client has been asked to review it.');
    } catch (err) {
      notify(errorText(err, 'Could not send that delivery.'), 'warn');
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

  const savePortfolioItem = async (item) => {
    try {
      const body = { title: item.title, tech: item.tech, link: item.link, description: item.description };

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
      const row = await withdrawalsApi.create({ freelancer_id: user.id, amount: Number(amount), method });
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
          contracts={contracts}
          proposals={proposals}
          withdrawals={withdrawals}
          profile={profile}
          onOpenContract={openContract}
          onGo={handleTabChange}
        />
      );
    }

    if (activeTab === 'My Contracts') {
      if (selected) {
        return (
          <ProjectWorkspace
            contract={selected}
            onBack={() => setSelectedId(null)}
            onDeliver={deliver}
            onSend={sendMessage}
          />
        );
      }
      return <ContractsTable contracts={contracts} onOpen={openContract} />;
    }

    if (activeTab === 'Available Jobs') {
      return <AvailableJobs jobs={jobs} proposals={proposals} onApply={applyToJob} />;
    }

    if (activeTab === 'My Proposals') {
      return <MyProposals proposals={proposals} onWithdraw={withdrawProposal} onGo={handleTabChange} />;
    }

    if (activeTab === 'Messages') {
      return <Conversations contracts={contracts} role="freelancer" onSend={sendMessage} />;
    }

    if (activeTab === 'Earnings') {
      return <Earnings contracts={contracts} withdrawals={withdrawals} onWithdraw={requestWithdrawal} />;
    }

    if (activeTab === 'Portfolio') {
      return <Portfolio items={portfolio} onSave={savePortfolioItem} onDelete={deletePortfolioItem} />;
    }

    if (activeTab === 'Profile') {
      return <ProfileEdit profile={profile} onSave={saveProfile} />;
    }

    return null;
  };

  const [pageTitle, pageSub] = PAGE_COPY[activeTab];
  const firstName = user.name.split(' ')[0];

  let title = pageTitle;
  let subtitle = pageSub;

  if (selected) {
    title = selected.title;
    subtitle = `For ${selected.client}`;
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

export default FreelancerDashboard;

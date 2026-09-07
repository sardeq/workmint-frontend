// Small pure functions shared by the dashboards. Nothing here talks to the API
// or to React - each one takes a value and returns a value.

// The two fees Workmint charges.
export const FEE_RATE = 0.1;         // taken out of what the freelancer receives
export const CLIENT_FEE_RATE = 0.03; // added on top of what the client pays

// PostgreSQL returns NUMERIC columns as strings, so wrap anything money-shaped.
export const num = (value) => Number(value || 0);

export const money = (value) =>
  `$${num(value).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

export const netOf = (gross) => Math.round(num(gross) * (1 - FEE_RATE));

export const grossWithClientFee = (amount) => Math.round(num(amount) * (1 + CLIENT_FEE_RATE));

export const initials = (name = '') =>
  name.trim().split(' ').slice(0, 2).map((word) => word[0]).join('').toUpperCase();

export const contractRef = (contract) => `CON-${contract.id}`;

export const shortDate = (value) =>
  new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export const timeAgo = (value) => {
  const minutes = Math.round((Date.now() - new Date(value).getTime()) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.round(minutes / 60)}h ago`;
  if (minutes < 43200) return `${Math.round(minutes / 1440)}d ago`;
  return shortDate(value);
};

export const daysLeft = (value) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(value);
  target.setHours(0, 0, 0, 0);
  return Math.round((target - today) / 86400000);
};

export const deadlineLabel = (value) => {
  const days = daysLeft(value);
  if (days < 0) return `${Math.abs(days)} days overdue`;
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  return `${days} days left`;
};

export const deadlineTone = (value) => {
  const days = daysLeft(value);
  if (days < 0) return 'danger';
  if (days <= 3) return 'warn';
  return 'muted';
};

// A contract has one status. The same status reads differently depending on
// which side of the deal you are on, so each entry holds both wordings.
export const CONTRACT_STATUS = {
  in_progress: { client: 'In progress', freelancer: 'In progress', tone: 'info' },
  delivered: { client: 'Needs your review', freelancer: 'Awaiting client', tone: 'warn' },
  revision: { client: 'Revision requested', freelancer: 'Revision needed', tone: 'danger' },
  approved: { client: 'Completed', freelancer: 'Completed', tone: 'success' },
  cancelled: { client: 'Cancelled', freelancer: 'Cancelled', tone: 'muted' },
};

export const contractStatus = (contract, role = 'freelancer') => {
  const entry = CONTRACT_STATUS[contract.status];
  return { key: contract.status, label: entry[role], tone: entry.tone };
};

export const PROPOSAL_TONE = {
  Pending: 'warn',
  Accepted: 'success',
  Declined: 'danger',
  Withdrawn: 'muted',
};

// Still running: not finished and not called off.
export const isLive = (contract) =>
  contract.status !== 'approved' && contract.status !== 'cancelled';

// Money the client has funded but not yet paid out.
export const escrowOf = (contract) => (isLive(contract) ? num(contract.amount) : 0);

// Money that has actually changed hands.
export const releasedOf = (contract) => (contract.status === 'approved' ? num(contract.amount) : 0);

// Adds up one field across a list: sumBy(contracts, escrowOf)
export const sumBy = (list, pick) => list.reduce((total, item) => total + pick(item), 0);

// The one thing this side of the deal should do next, or null when it is their turn.
export const freelancerAction = (contract) => {
  if (contract.status === 'in_progress') return 'Deliver the work';
  if (contract.status === 'revision') return 'Send a new version';
  return null;
};

export const clientAction = (contract) => {
  if (contract.status === 'delivered') return 'Review the delivery';
  return null;
};

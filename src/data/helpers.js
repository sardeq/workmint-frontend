export const FEE_RATE = 0.1;
export const CLIENT_FEE_RATE = 0.03;

export const num = (value) => Number(value || 0);

export const money = (value) =>
  `$${num(value).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

export const netOf = (gross) => Math.round(num(gross) * (1 - FEE_RATE));

export const grossWithClientFee = (amount) => Math.round(num(amount) * (1 + CLIENT_FEE_RATE));

export const initials = (name = '') =>
  name.trim().split(' ').slice(0, 2).map((word) => word[0]).join('').toUpperCase();

export const orderRef = (order) => `ORD-${order.id}`;

export const shortDate = (value) =>
  new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export const dayOffset = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
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

export const timeAgo = (value) => {
  const mins = Math.round((Date.now() - new Date(value).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.round(mins / 60)}h ago`;
  if (mins < 43200) return `${Math.round(mins / 1440)}d ago`;
  return shortDate(value);
};

export const hoursSince = (value) =>
  Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 3600000));

export const MILESTONE_STATUS = {
  pending: { label: 'Not started', tone: 'muted' },
  active: { label: 'In progress', tone: 'info' },
  submitted: { label: 'Awaiting review', tone: 'warn' },
  revision: { label: 'Revision needed', tone: 'danger' },
  approved: { label: 'Approved', tone: 'success' },
  disputed: { label: 'In dispute', tone: 'danger' },
  refunded: { label: 'Refunded', tone: 'muted' },
};

export const ORDER_STATUS = {
  progress: { freelancer: 'In progress', client: 'In progress', tone: 'info' },
  awaiting: { freelancer: 'Awaiting client', client: 'Needs your review', tone: 'warn' },
  revision: { freelancer: 'Revision needed', client: 'Revision requested', tone: 'danger' },
  disputed: { freelancer: 'In dispute', client: 'In dispute', tone: 'danger' },
  completed: { freelancer: 'Completed', client: 'Completed', tone: 'success' },
  cancelled: { freelancer: 'Cancelled', client: 'Cancelled', tone: 'muted' },
};

export const DISPUTE_STATUS = {
  'Open': { tone: 'danger' },
  'Under review': { tone: 'warn' },
  'Resolved': { tone: 'success' },
};

export const DISPUTE_OUTCOMES = [
  { key: 'release', label: 'Release to freelancer', body: 'The work stands. The full milestone is paid out.' },
  { key: 'refund', label: 'Refund the client', body: 'The milestone is cancelled and the money leaves escrow back to the client.' },
  { key: 'split', label: 'Split it evenly', body: 'Half is released to the freelancer, half is refunded. Used when both sides are partly right.' },
];

export const milestonesOf = (order) => order.milestones || [];

export const changeRequestsOf = (order) => order.change_requests || [];

export const messagesOf = (order) => order.messages || [];

export const activityOf = (order) => order.activity || [];

export const statusKey = (order) => {
  const milestones = milestonesOf(order);
  if (order.cancelled) return 'cancelled';
  if (milestones.some((m) => m.status === 'disputed')) return 'disputed';
  if (milestones.length > 0 && milestones.every((m) => m.status === 'approved' || m.status === 'refunded')) {
    return 'completed';
  }
  if (milestones.some((m) => m.status === 'revision')) return 'revision';
  if (milestones.some((m) => m.status === 'submitted')) return 'awaiting';
  return 'progress';
};

export const orderStatus = (order, role = 'freelancer') => {
  const key = statusKey(order);
  const entry = ORDER_STATUS[key];
  return { key, label: entry[role] || entry.freelancer, tone: entry.tone };
};

const sumBy = (milestones, status) =>
  milestones.filter((m) => m.status === status).reduce((sum, m) => sum + num(m.amount), 0);

export const orderTotal = (order) =>
  milestonesOf(order).reduce((sum, m) => sum + num(m.amount), 0);

export const orderReleased = (order) => sumBy(milestonesOf(order), 'approved');

export const orderRefunded = (order) => sumBy(milestonesOf(order), 'refunded');

export const orderEscrow = (order) =>
  orderTotal(order) - orderReleased(order) - orderRefunded(order);

export const orderProgress = (order) => {
  const payable = orderTotal(order) - orderRefunded(order);
  if (payable === 0) return 0;
  return Math.round((orderReleased(order) / payable) * 100);
};

export const canDispute = (milestone) =>
  milestone.status !== 'approved' &&
  milestone.status !== 'refunded' &&
  milestone.status !== 'disputed';

export const unreadCount = (order, role = 'freelancer') =>
  messagesOf(order).filter((m) => m.sender_role !== role && !m.read).length;

export const nextAction = (order) => {
  if (statusKey(order) === 'completed') return null;
  const milestones = milestonesOf(order);

  const revision = milestones.find((m) => m.status === 'revision');
  if (revision) return { label: `Rework "${revision.title}"`, tone: 'danger', milestoneId: revision.id };

  const active = milestones.find((m) => m.status === 'active');
  if (active) return { label: `Deliver "${active.title}"`, tone: 'info', milestoneId: active.id };

  const pending = milestones.find((m) => m.status === 'pending');
  if (pending) return { label: `Start "${pending.title}"`, tone: 'muted', milestoneId: pending.id };

  return null;
};

export const needsAttention = (order) => {
  if (statusKey(order) === 'completed') return false;
  const milestones = milestonesOf(order);
  const inFlight = milestones.some((m) => m.status === 'revision' || m.status === 'active');
  const nothingStarted = milestones.every((m) => m.status === 'approved' || m.status === 'pending');
  return inFlight || nothingStarted;
};

export const clientNextAction = (order) => {
  if (statusKey(order) === 'completed') return null;

  const submitted = milestonesOf(order).find((m) => m.status === 'submitted');
  if (submitted) return { label: `Review "${submitted.title}"`, tone: 'warn', milestoneId: submitted.id };

  const request = changeRequestsOf(order).find((cr) => cr.status === 'Pending');
  if (request) return { label: 'Decide on a scope change', tone: 'info', changeRequestId: request.id };

  return null;
};

export const clientNeedsAttention = (order) => Boolean(clientNextAction(order));

export const byUrgency = (role = 'freelancer') => (a, b) => {
  const rank = (order) => {
    if (statusKey(order) === 'completed') return 2;
    const waiting = role === 'client' ? clientNeedsAttention(order) : needsAttention(order);
    return waiting ? 0 : 1;
  };

  const diff = rank(a) - rank(b);
  if (diff !== 0) return diff;
  return new Date(a.deadline) - new Date(b.deadline);
};

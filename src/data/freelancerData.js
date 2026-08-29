

/* ---------- ids ---------- */
export const uid = (prefix = 'ID') =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`.toUpperCase();

/* ---------- dates ---------- */
const pad = (n) => String(n).padStart(2, '0');
const isoDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const dayOffset = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return isoDate(d);
};

export const hoursAgo = (hours) => new Date(Date.now() - hours * 3600000).toISOString();

export const shortDate = (value) =>
  new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export const daysLeft = (value) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(value);
  target.setHours(0, 0, 0, 0);
  return Math.round((target - today) / 86400000);
};

export const deadlineLabel = (value) => {
  const d = daysLeft(value);
  if (d < 0) return `${Math.abs(d)} days overdue`;
  if (d === 0) return 'Due today';
  if (d === 1) return 'Due tomorrow';
  return `${d} days left`;
};

export const deadlineTone = (value) => {
  const d = daysLeft(value);
  if (d < 0) return 'danger';
  if (d <= 3) return 'warn';
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

/* ---------- money ---------- */
export const FEE_RATE = 0.1;        // deducted from the freelancer's payout
export const CLIENT_FEE_RATE = 0.03; // added on top when the client funds escrow

export const money = (n) =>
  `$${Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

export const netOf = (gross) => Math.round(gross * (1 - FEE_RATE));
export const grossWithClientFee = (amount) => Math.round(amount * (1 + CLIENT_FEE_RATE));

export const initials = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

/* ---------- status vocabulary ----------
   One label per state. Some states read differently depending on which side
   of the contract you are standing on, so orderStatus() takes a role.        */
export const MILESTONE_STATUS = {
  pending:   { label: 'Not started',     tone: 'muted'   },
  active:    { label: 'In progress',     tone: 'info'    },
  submitted: { label: 'Awaiting review', tone: 'warn'    },
  revision:  { label: 'Revision needed', tone: 'danger'  },
  approved:  { label: 'Approved',        tone: 'success' },
  disputed:  { label: 'In dispute',      tone: 'danger'  },
  refunded:  { label: 'Refunded',        tone: 'muted'   },
};

const ORDER_LABELS = {
  progress:  { freelancer: 'In progress',     client: 'In progress',        tone: 'info'    },
  awaiting:  { freelancer: 'Awaiting client', client: 'Needs your review',  tone: 'warn'    },
  revision:  { freelancer: 'Revision needed', client: 'Revision requested', tone: 'danger'  },
  disputed:  { freelancer: 'In dispute',      client: 'In dispute',         tone: 'danger'  },
  completed: { freelancer: 'Completed',       client: 'Completed',          tone: 'success' },
  cancelled: { freelancer: 'Cancelled',       client: 'Cancelled',          tone: 'muted'   },
};

export const ORDER_STATUS = ORDER_LABELS;

const settled = (m) => m.status === 'approved' || m.status === 'refunded';

const statusKey = (order) => {
  if (order.cancelled) return 'cancelled';
  const ms = order.milestones;
  if (ms.some((m) => m.status === 'disputed')) return 'disputed';
  if (ms.length && ms.every(settled)) return 'completed';
  if (ms.some((m) => m.status === 'revision')) return 'revision';
  if (ms.some((m) => m.status === 'submitted')) return 'awaiting';
  return 'progress';
};

/** Derived from the milestones, never stored, so the badge cannot disagree. */
export const orderStatus = (order, role = 'freelancer') => {
  const key = statusKey(order);
  const entry = ORDER_LABELS[key];
  return { key, label: entry[role] || entry.freelancer, tone: entry.tone };
};

export const orderTotal = (order) => order.milestones.reduce((sum, m) => sum + m.amount, 0);

export const orderReleased = (order) =>
  order.milestones.filter((m) => m.status === 'approved').reduce((sum, m) => sum + m.amount, 0);

export const orderRefunded = (order) =>
  order.milestones.filter((m) => m.status === 'refunded').reduce((sum, m) => sum + m.amount, 0);

/** Money still sitting with Workmint: funded, not yet released or refunded. */
export const orderEscrow = (order) =>
  orderTotal(order) - orderReleased(order) - orderRefunded(order);

export const orderProgress = (order) => {
  const payable = orderTotal(order) - orderRefunded(order);
  return payable === 0 ? 0 : Math.round((orderReleased(order) / payable) * 100);
};

/** A milestone can be disputed by either side while the money is still held. */
export const canDispute = (milestone) =>
  milestone.status !== 'approved' && milestone.status !== 'refunded' && milestone.status !== 'disputed';

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

/* ---------- messages ----------
   `from` is a role. A message is "read" once the other side has opened the
   thread, so unread counts work from either seat.                           */
export const unreadCount = (order, role = 'freelancer') =>
  order.messages.filter((m) => m.from !== role && !m.read).length;

/* ---------- what each side owes the other ---------- */
export const nextAction = (order) => {
  if (statusKey(order) === 'completed') return null;
  const revision = order.milestones.find((m) => m.status === 'revision');
  if (revision) return { label: `Rework "${revision.title}"`, tone: 'danger', milestoneId: revision.id };
  const active = order.milestones.find((m) => m.status === 'active');
  if (active) return { label: `Deliver "${active.title}"`, tone: 'info', milestoneId: active.id };
  const pending = order.milestones.find((m) => m.status === 'pending');
  if (pending) return { label: `Start "${pending.title}"`, tone: 'muted', milestoneId: pending.id };
  return null;
};

export const needsAttention = (order) => {
  if (statusKey(order) === 'completed') return false;
  const inFlight = order.milestones.some((m) => m.status === 'revision' || m.status === 'active');
  const nothingStarted = order.milestones.every((m) => m.status === 'approved' || m.status === 'pending');
  return inFlight || nothingStarted;
};

/** The client's version: a delivery to review, or a scope change to decide. */
export const clientNextAction = (order) => {
  if (statusKey(order) === 'completed') return null;
  const submitted = order.milestones.find((m) => m.status === 'submitted');
  if (submitted) return { label: `Review "${submitted.title}"`, tone: 'warn', milestoneId: submitted.id };
  const request = order.changeRequests.find((cr) => cr.status === 'Pending');
  if (request) return { label: 'Decide on a scope change', tone: 'info', changeRequestId: request.id };
  return null;
};

export const clientNeedsAttention = (order) => Boolean(clientNextAction(order));

/** List order for both portals: what needs you, then by deadline, done last.
    Sorting on deadline alone put finished (and therefore "overdue") contracts
    at the top of the list. */
export const byUrgency = (role = 'freelancer') => (a, b) => {
  const rank = (order) => {
    if (statusKey(order) === 'completed') return 2;
    const waiting = role === 'client' ? clientNeedsAttention(order) : needsAttention(order);
    return waiting ? 0 : 1;
  };
  const diff = rank(a) - rank(b);
  return diff !== 0 ? diff : new Date(a.deadline) - new Date(b.deadline);
};

/* =========================================================================
   Seed data
   ========================================================================= */
const SADEQ = { name: 'Sadeq Odeh', title: 'Full-stack developer - React & .NET', rating: 4.9, jobs: 38 };
const LAYLA = { name: 'Layla Nasser', title: 'Data visualisation engineer', rating: 4.8, jobs: 22 };
const KARIM = { name: 'Karim Aziz', title: 'DevOps and platform engineer', rating: 4.7, jobs: 51 };

export const CLIENT_COMPANY = 'TechCorp';

export const buildSeed = () => ({
  /* ---------- the freelancer's own profile ---------- */
  profile: {
    name: 'Sadeq Odeh',
    title: 'Full-stack developer - React & .NET',
    location: 'Amman, Jordan',
    timezone: 'GMT+3',
    rate: 45,
    available: true,
    responseHours: 2,
    languages: 'Arabic (native), English (fluent)',
    skills: ['React.js', 'C++', '.NET', 'Express.js', 'Oracle SQL', 'PostgreSQL'],
    bio: 'I build scalable web applications, REST APIs and the database layer underneath them. Six years across systems programming and full-stack product work. Comfortable owning a project from schema design to deployment.',
  },

  /* ---------- the client's own profile ---------- */
  clientProfile: {
    company: CLIENT_COMPANY,
    contact: 'Rana Haddad',
    role: 'Head of engineering',
    industry: 'B2B data infrastructure',
    location: 'Amman, Jordan',
    since: dayOffset(-420),
  },

  /* ---------- orders: shared between both dashboards ---------- */
  orders: [
    {
      id: 'ORD-892',
      client: CLIENT_COMPANY,
      clientContact: 'Rana Haddad',
      freelancer: SADEQ,
      project: 'C++ Systems Architecture',
      brief: 'Refactor the ingestion pipeline into modular services and document the threading model.',
      startedOn: dayOffset(-21),
      deadline: dayOffset(11),
      revisionsIncluded: 3,
      milestones: [
        { id: 'MS-1', title: 'Architecture & schema', amount: 800, dueDate: dayOffset(-9), status: 'approved', revisionsUsed: 0, approvedOn: hoursAgo(200), deliverable: { link: 'https://github.com/demo/ingest-arch', note: 'Diagrams and schema DDL in /docs.', at: hoursAgo(220) } },
        { id: 'MS-2', title: 'Core service refactor', amount: 1200, dueDate: dayOffset(2), status: 'revision', revisionsUsed: 1, revisionNote: 'Worker pool looks good, but the retry logic needs exponential backoff and the config should be env-driven, not compiled in.', deliverable: { link: 'https://github.com/demo/ingest-core/pull/14', note: 'Worker pool + retry queue.', at: hoursAgo(30) } },
        { id: 'MS-3', title: 'Load testing & handover', amount: 1400, dueDate: dayOffset(11), status: 'pending', revisionsUsed: 0 },
      ],
      messages: [
        { id: 'M-1', from: 'client', text: 'Left comments on PR #14 - mainly around the retry path.', at: hoursAgo(26), read: true },
        { id: 'M-2', from: 'freelancer', text: 'Got it. Moving the backoff into a policy class and pulling the config out to env vars. Should be back with you tomorrow.', at: hoursAgo(25), read: true },
        { id: 'M-3', from: 'client', text: 'Perfect. Also, can we talk about adding a metrics endpoint before handover?', at: hoursAgo(3), read: false },
      ],
      activity: [
        { id: 'A-1', at: hoursAgo(26), actor: 'client', text: 'TechCorp requested a revision on "Core service refactor"' },
        { id: 'A-2', at: hoursAgo(30), actor: 'freelancer', text: 'Sadeq Odeh delivered "Core service refactor"' },
        { id: 'A-3', at: hoursAgo(200), actor: 'client', text: 'TechCorp approved "Architecture & schema" - $800 released' },
      ],
      changeRequests: [],
    },

    {
      id: 'ORD-910',
      client: CLIENT_COMPANY,
      clientContact: 'Rana Haddad',
      freelancer: LAYLA,
      project: 'Customer Analytics Dashboard',
      brief: 'Usage analytics for the admin console: cohort retention, funnel drop-off, CSV export.',
      startedOn: dayOffset(-16),
      deadline: dayOffset(6),
      revisionsIncluded: 2,
      milestones: [
        { id: 'MS-A', title: 'Data model & queries', amount: 900, dueDate: dayOffset(-6), status: 'approved', revisionsUsed: 0, approvedOn: hoursAgo(130) },
        { id: 'MS-B', title: 'Dashboard screens', amount: 1100, dueDate: dayOffset(-1), status: 'submitted', revisionsUsed: 0, deliverable: { link: 'https://staging.techcorp.dev/analytics', note: 'All four charts live. Export button is stubbed until the next milestone.', at: hoursAgo(14) } },
        { id: 'MS-C', title: 'CSV export & polish', amount: 1000, dueDate: dayOffset(6), status: 'pending', revisionsUsed: 0 },
      ],
      messages: [
        { id: 'M-7', from: 'freelancer', text: 'Dashboard screens are on staging. The cohort chart needed a different query shape, details in the PR.', at: hoursAgo(14), read: false },
      ],
      activity: [
        { id: 'A-7', at: hoursAgo(12), actor: 'freelancer', text: 'Layla Nasser requested a scope change' },
        { id: 'A-8', at: hoursAgo(14), actor: 'freelancer', text: 'Layla Nasser delivered "Dashboard screens"' },
        { id: 'A-9', at: hoursAgo(130), actor: 'client', text: 'TechCorp approved "Data model & queries" - $900 released' },
      ],
      changeRequests: [
        { id: 'CR-2', reason: 'You asked for funnel drop-off by acquisition channel, which needs a second query layer and a new chart type. That was not in the original brief.', extraCost: 450, extraDays: 4, status: 'Pending', at: hoursAgo(12) },
      ],
    },

    {
      id: 'ORD-901',
      client: 'Northwind Retail',
      clientContact: 'Dana Fares',
      freelancer: SADEQ,
      project: 'React Native Storefront',
      brief: 'Customer-facing storefront with offline cart and Stripe checkout.',
      startedOn: dayOffset(-8),
      deadline: dayOffset(3),
      revisionsIncluded: 2,
      milestones: [
        { id: 'MS-4', title: 'Catalogue & cart screens', amount: 1500, dueDate: dayOffset(-1), status: 'disputed', revisionsUsed: 0, deliverable: { link: 'https://expo.dev/@demo/northwind-preview', note: 'Expo build, test account in the shared doc.', at: hoursAgo(20) } },
        { id: 'MS-5', title: 'Checkout & payments', amount: 1800, dueDate: dayOffset(3), status: 'pending', revisionsUsed: 0 },
      ],
      messages: [
        { id: 'M-4', from: 'freelancer', text: 'Preview build is up. Cart persists offline, checkout is stubbed until the next milestone.', at: hoursAgo(20), read: true },
        { id: 'M-5', from: 'client', text: 'Downloading now, will review with the team today.', at: hoursAgo(18), read: false },
      ],
      activity: [
        { id: 'A-4', at: hoursAgo(20), actor: 'freelancer', text: 'Sadeq Odeh delivered "Catalogue & cart screens"' },
        { id: 'A-5', at: hoursAgo(190), actor: 'system', text: 'Northwind Retail funded $3,300 into escrow' },
      ],
      changeRequests: [
        { id: 'CR-1', reason: 'Client asked for Apple Pay in addition to card checkout.', extraCost: 400, extraDays: 3, status: 'Approved', at: hoursAgo(70) },
      ],
    },

    {
      id: 'ORD-894',
      client: 'Enterprise LLC',
      clientContact: 'Mahmoud Zayd',
      freelancer: SADEQ,
      project: '.NET Backend Integration',
      brief: 'Integrate the legacy ERP with the new order service.',
      startedOn: dayOffset(-60),
      deadline: dayOffset(-6),
      revisionsIncluded: 2,
      milestones: [
        { id: 'MS-6', title: 'ERP connector', amount: 1600, dueDate: dayOffset(-30), status: 'approved', revisionsUsed: 1, approvedOn: hoursAgo(700) },
        { id: 'MS-7', title: 'Order sync & tests', amount: 1800, dueDate: dayOffset(-8), status: 'approved', revisionsUsed: 0, approvedOn: hoursAgo(150) },
      ],
      messages: [
        { id: 'M-6', from: 'client', text: 'All signed off. Great work, we will be back for phase two.', at: hoursAgo(148), read: true },
      ],
      activity: [
        { id: 'A-6', at: hoursAgo(150), actor: 'client', text: 'Enterprise LLC approved "Order sync & tests" - $1,800 released' },
      ],
      changeRequests: [],
    },

    {
      id: 'ORD-877',
      client: CLIENT_COMPANY,
      clientContact: 'Rana Haddad',
      freelancer: KARIM,
      project: 'CI Pipeline Migration',
      brief: 'Move the build pipeline off Jenkins onto GitHub Actions with cached container builds.',
      startedOn: dayOffset(-95),
      deadline: dayOffset(-40),
      revisionsIncluded: 2,
      milestones: [
        { id: 'MS-D', title: 'Pipeline audit & plan', amount: 600, dueDate: dayOffset(-80), status: 'approved', revisionsUsed: 0, approvedOn: hoursAgo(1900) },
        { id: 'MS-E', title: 'Migration & cutover', amount: 1700, dueDate: dayOffset(-42), status: 'approved', revisionsUsed: 1, approvedOn: hoursAgo(980) },
      ],
      messages: [
        { id: 'M-8', from: 'client', text: 'Build times are down 60%. Thanks Karim.', at: hoursAgo(975), read: true },
      ],
      activity: [
        { id: 'A-10', at: hoursAgo(980), actor: 'client', text: 'TechCorp approved "Migration & cutover" - $1,700 released' },
      ],
      changeRequests: [],
    },
  ],

  /* ---------- open jobs on the marketplace ---------- */
  jobs: [
    { id: 'JOB-101', postedBy: CLIENT_COMPANY, title: 'Realtime metrics service', client: CLIENT_COMPANY, clientRating: 4.9, clientJobs: 14, budget: 4500, days: 30, level: 'Expert', postedHours: 30, proposals: 3, skills: ['Go', 'Kafka', 'PostgreSQL'], description: 'Stream ingestion events into a rollup service that powers per-second dashboards. Existing Kafka topics, we need the consumer and the storage layer.' },
    { id: 'JOB-102', postedBy: CLIENT_COMPANY, title: 'Internal admin panel rebuild', client: CLIENT_COMPANY, clientRating: 4.9, clientJobs: 14, budget: 2000, days: 18, level: 'Intermediate', postedHours: 52, proposals: 1, skills: ['React.js', 'Bootstrap', 'REST API'], description: 'Replace an ageing internal tool with a React panel. Designs are done, 9 screens, the API already exists.' },
    { id: 'JOB-001', postedBy: 'MobileFirst', title: 'React Native app for field technicians', client: 'MobileFirst', clientRating: 4.8, clientJobs: 12, budget: 3000, days: 30, level: 'Intermediate', postedHours: 4, proposals: 6, skills: ['React Native', 'Firebase', 'Offline sync'], description: 'Offline-first job sheet app for 40 field technicians. Sync when back on network, photo attachments, signature capture.' },
    { id: 'JOB-002', postedBy: 'Levant Logistics', title: 'Oracle to PostgreSQL migration', client: 'Levant Logistics', clientRating: 4.9, clientJobs: 31, budget: 5200, days: 45, level: 'Expert', postedHours: 11, proposals: 3, skills: ['PostgreSQL', 'Oracle SQL', 'Data migration'], description: 'Migrate a 90-table Oracle schema, rewrite 40 stored procedures, keep the reporting layer running through the cutover.' },
    { id: 'JOB-003', postedBy: 'Sahara Travel', title: '.NET Core API for a booking platform', client: 'Sahara Travel', clientRating: 4.4, clientJobs: 5, budget: 2400, days: 21, level: 'Intermediate', postedHours: 26, proposals: 14, skills: ['.NET', 'REST API', 'SQL Server'], description: 'Availability search, hold-and-book flow, payment webhooks. Existing front end, we only need the API.' },
    { id: 'JOB-004', postedBy: 'Medlab Analytics', title: 'Dashboard rebuild in React + Bootstrap', client: 'Medlab Analytics', clientRating: 5.0, clientJobs: 8, budget: 1800, days: 18, level: 'Entry', postedHours: 40, proposals: 22, skills: ['React.js', 'Bootstrap', 'Charts'], description: 'Replace a jQuery admin panel with React. Design is done in Figma, 11 screens, no backend work needed.' },
    { id: 'JOB-005', postedBy: 'Pixelworks Studio', title: 'C++ performance audit on an image pipeline', client: 'Pixelworks Studio', clientRating: 4.7, clientJobs: 19, budget: 2600, days: 14, level: 'Expert', postedHours: 52, proposals: 4, skills: ['C++', 'Profiling', 'Multithreading'], description: 'Our batch renderer got 3x slower after a refactor. Find it, fix it, write up what happened.' },
  ],

  /* ---------- proposals: outgoing (Sadeq's) and incoming (on TechCorp jobs) ---------- */
  proposals: [
    { id: 'PROP-501', jobId: 'JOB-003', job: '.NET Core API for a booking platform', client: 'Sahara Travel', freelancer: SADEQ, amount: 2400, days: 21, status: 'Pending', sentAt: hoursAgo(50), cover: 'I have shipped three booking APIs with hold-and-book semantics, including the race conditions that come with them. I would start with the availability model since everything else depends on it.' },
    { id: 'PROP-502', jobId: 'JOB-005', job: 'C++ performance audit on an image pipeline', client: 'Pixelworks Studio', freelancer: SADEQ, amount: 2600, days: 14, status: 'Declined', sentAt: hoursAgo(120), cover: 'Happy to profile this with perf and flamegraphs before touching any code.' },
    { id: 'PROP-503', jobId: 'JOB-002', job: 'Oracle to PostgreSQL migration', client: 'Levant Logistics', freelancer: SADEQ, amount: 4800, days: 40, status: 'Interviewing', sentAt: hoursAgo(30), cover: 'I did a 70-table Oracle to Postgres cutover last year with zero reporting downtime. Same playbook applies here.' },

    { id: 'PROP-601', jobId: 'JOB-101', job: 'Realtime metrics service', client: CLIENT_COMPANY, freelancer: { name: 'Layla Nasser', title: 'Data visualisation engineer', rating: 4.8, jobs: 22, rate: 52, skills: ['Go', 'Kafka', 'PostgreSQL', 'Grafana'] }, amount: 4200, days: 28, status: 'Pending', sentAt: hoursAgo(20), cover: 'I built the rollup layer for a metrics product doing 40k events/sec on Kafka. The trap here is late-arriving events breaking your per-second buckets, so I would settle the windowing strategy with you before writing the consumer.', plan: [{ title: 'Consumer + windowing', amount: 1800 }, { title: 'Rollup storage', amount: 1400 }, { title: 'Load test & handover', amount: 1000 }] },
    { id: 'PROP-602', jobId: 'JOB-101', job: 'Realtime metrics service', client: CLIENT_COMPANY, freelancer: { name: 'Karim Aziz', title: 'DevOps and platform engineer', rating: 4.7, jobs: 51, rate: 48, skills: ['Go', 'Kubernetes', 'Kafka'] }, amount: 3600, days: 35, status: 'Pending', sentAt: hoursAgo(26), cover: 'Cheapest path here is not a new service. I would run the consumer as a sidecar on your existing cluster and reuse the Postgres you already pay for. Happy to argue the case on a call.', plan: [{ title: 'Consumer service', amount: 2000 }, { title: 'Deploy & observability', amount: 1600 }] },
    { id: 'PROP-603', jobId: 'JOB-101', job: 'Realtime metrics service', client: CLIENT_COMPANY, freelancer: { name: 'Omar Darwish', title: 'Backend engineer', rating: 4.5, jobs: 9, rate: 38, skills: ['Go', 'Redis', 'gRPC'] }, amount: 5000, days: 21, status: 'Pending', sentAt: hoursAgo(6), cover: 'Fastest delivery of the three, using Redis streams for the hot window and Postgres for cold storage. Priced for the shorter timeline.' },
    { id: 'PROP-604', jobId: 'JOB-102', job: 'Internal admin panel rebuild', client: CLIENT_COMPANY, freelancer: { name: 'Noor Salem', title: 'Frontend developer', rating: 4.9, jobs: 17, rate: 34, skills: ['React.js', 'Bootstrap', 'Testing Library'] }, amount: 1900, days: 14, status: 'Pending', sentAt: hoursAgo(40), cover: 'Nine screens against an existing API is a well-understood job. I would deliver in three batches so you can review the shared components before the rest is built on top of them.', plan: [{ title: 'Component library & shell', amount: 700 }, { title: 'Screens 1-5', amount: 700 }, { title: 'Screens 6-9 & tests', amount: 500 }] },
  ],

  /* ---------- talent directory for the client's search ---------- */
  talent: [
    { id: 'FL-1', name: 'Sadeq Odeh', title: 'Full-stack developer - React & .NET', location: 'Amman, Jordan', rate: 45, rating: 4.9, jobs: 38, available: true, responseHours: 2, skills: ['React.js', '.NET', 'C++', 'PostgreSQL'], bio: 'Owns projects from schema design to deployment. Systems background, strong on APIs and data layers.' },
    { id: 'FL-2', name: 'Layla Nasser', title: 'Data visualisation engineer', location: 'Beirut, Lebanon', rate: 52, rating: 4.8, jobs: 22, available: false, responseHours: 4, skills: ['Go', 'Kafka', 'PostgreSQL', 'Grafana'], bio: 'Builds analytics pipelines and the dashboards on top of them. Comfortable owning both ends.' },
    { id: 'FL-3', name: 'Karim Aziz', title: 'DevOps and platform engineer', location: 'Cairo, Egypt', rate: 48, rating: 4.7, jobs: 51, available: true, responseHours: 6, skills: ['Kubernetes', 'Terraform', 'GitHub Actions', 'Go'], bio: 'Pipeline migrations, cost work and on-call setup. Leaves runbooks behind, not just infrastructure.' },
    { id: 'FL-4', name: 'Noor Salem', title: 'Frontend developer', location: 'Amman, Jordan', rate: 34, rating: 4.9, jobs: 17, available: true, responseHours: 1, skills: ['React.js', 'TypeScript', 'Bootstrap', 'Testing Library'], bio: 'Component-first React work with tests included by default. Fast on design-to-code.' },
    { id: 'FL-5', name: 'Omar Darwish', title: 'Backend engineer', location: 'Dubai, UAE', rate: 38, rating: 4.5, jobs: 9, available: true, responseHours: 3, skills: ['Go', 'Redis', 'gRPC', 'Docker'], bio: 'Service work with an eye on latency. Newer on the platform but moves quickly.' },
    { id: 'FL-6', name: 'Hana Barakat', title: 'Mobile developer', location: 'Istanbul, Turkey', rate: 44, rating: 4.8, jobs: 26, available: true, responseHours: 5, skills: ['React Native', 'Swift', 'Firebase'], bio: 'Offline-first mobile apps and the sync layers that make them behave.' },
  ],

  /* ---------- freelancer portfolio and payouts ---------- */
  portfolio: [
    { id: 'PF-1', title: 'Employee task tracking system', tech: ['React', 'Node.js', 'PostgreSQL'], link: 'https://github.com/demo/task-tracker', description: 'Role-based access control, audit trail, and an analytics dashboard for a 200-person operations team.' },
    { id: 'PF-2', title: 'AI transport digitization', tech: ['Python', 'OCR', 'PostgreSQL'], link: '', description: 'Document digitization platform using OCR for the Ministry of Transport. Cut manual entry time by roughly 70%.' },
    { id: 'PF-3', title: 'Zyro browser engine shell', tech: ['C++', 'CEF3', 'GTK3'], link: 'https://github.com/demo/zyro', description: 'Multi-process browser shell on CEF3 with a V8 IPC bridge and request interception layer.' },
  ],

  withdrawals: [
    { id: 'WD-1', amount: 1440, method: 'Bank transfer', at: hoursAgo(500), status: 'Paid' },
  ],

  /* ---------- disputes raised on live contracts ---------- */
  disputes: [
    {
      id: 'DSP-901',
      orderId: 'ORD-901',
      milestoneId: 'MS-4',
      project: 'React Native Storefront',
      client: 'Northwind Retail',
      freelancer: 'Sadeq Odeh',
      raisedBy: 'client',
      amount: 1500,
      reason: 'Delivery does not match the brief',
      detail: 'The offline cart loses items when the app is killed mid-session, which was the whole point of the milestone. Freelancer says the brief only covered background suspension.',
      status: 'Open',
      openedAt: hoursAgo(16),
    },
    {
      id: 'DSP-902',
      orderId: 'ORD-877',
      milestoneId: 'MS-E',
      project: 'CI Pipeline Migration',
      client: 'TechCorp',
      freelancer: 'Karim Aziz',
      raisedBy: 'freelancer',
      amount: 1700,
      reason: 'Approval withheld after delivery',
      detail: 'Cutover completed and running in production for three weeks before approval came through. Raised to get the release moving.',
      status: 'Resolved',
      resolution: 'release',
      resolutionNote: 'Pipeline verified as live in production. Released in full.',
      openedAt: hoursAgo(1010),
      resolvedAt: hoursAgo(985),
    },
  ],

  /* ---------- the client's payment methods ---------- */
  paymentMethods: [
    { id: 'PM-1', label: 'Visa ending 4417', kind: 'Card', primary: true },
    { id: 'PM-2', label: 'Arab Bank transfer', kind: 'Bank', primary: false },
  ],
});
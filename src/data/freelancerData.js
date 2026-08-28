/* =========================================================================
   Workmint - freelancer data layer
   Seed data + pure helpers. No React in here on purpose: components stay
   about rendering, this file stays about the shape of the data.

   RULE: money is stored as a NUMBER everywhere. Format only at render time
   with money(). (The old code stored "$2,200" and parsed it back with
   replace(',','') which silently broke on values over $9,999.)
   ========================================================================= */

/* ---------- ids ---------- */
export const uid = (prefix = 'ID') =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`.toUpperCase();

/* ---------- dates ---------- */
const pad = (n) => String(n).padStart(2, '0');
const isoDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** 'YYYY-MM-DD' n days from today. Keeps the demo alive instead of hardcoding "Oct 15". */
export const dayOffset = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return isoDate(d);
};

/** Full timestamp n hours ago, for activity feeds and chat. */
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
export const FEE_RATE = 0.1; // Workmint keeps 10% of every released milestone

export const money = (n) =>
  `$${Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

export const netOf = (gross) => Math.round(gross * (1 - FEE_RATE));

export const initials = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

/* ---------- status vocabulary ----------
   One label per state, used identically in every screen. The key is what the
   code compares against; the label is the only thing a user ever reads.      */
export const MILESTONE_STATUS = {
  pending:   { label: 'Not started',    tone: 'muted'   },
  active:    { label: 'In progress',    tone: 'info'    },
  submitted: { label: 'Awaiting client',tone: 'warn'    },
  revision:  { label: 'Revision needed',tone: 'danger'  },
  approved:  { label: 'Approved',       tone: 'success' },
};

export const ORDER_STATUS = {
  progress:  { label: 'In progress',      tone: 'info'    },
  awaiting:  { label: 'Awaiting client',  tone: 'warn'    },
  revision:  { label: 'Revision needed',  tone: 'danger'  },
  completed: { label: 'Completed',        tone: 'success' },
  cancelled: { label: 'Cancelled',        tone: 'muted'   },
};

/* ---------- derived order values ----------
   Order status is DERIVED from its milestones, never stored. That kills a
   whole class of bugs where the badge and the milestones disagree.           */
export const orderStatus = (order) => {
  if (order.cancelled) return { key: 'cancelled', ...ORDER_STATUS.cancelled };
  const ms = order.milestones;
  if (ms.length && ms.every((m) => m.status === 'approved'))
    return { key: 'completed', ...ORDER_STATUS.completed };
  if (ms.some((m) => m.status === 'revision'))
    return { key: 'revision', ...ORDER_STATUS.revision };
  if (ms.some((m) => m.status === 'submitted'))
    return { key: 'awaiting', ...ORDER_STATUS.awaiting };
  return { key: 'progress', ...ORDER_STATUS.progress };
};

export const orderTotal = (order) => order.milestones.reduce((sum, m) => sum + m.amount, 0);

/** Money the client already released to you (gross). */
export const orderReleased = (order) =>
  order.milestones.filter((m) => m.status === 'approved').reduce((sum, m) => sum + m.amount, 0);

/** Money the client funded but Workmint is still holding. */
export const orderEscrow = (order) => orderTotal(order) - orderReleased(order);

export const orderProgress = (order) => {
  const total = orderTotal(order);
  return total === 0 ? 0 : Math.round((orderReleased(order) / total) * 100);
};

export const unreadCount = (order) =>
  order.messages.filter((m) => m.from === 'client' && !m.read).length;

/** The single next thing this order is waiting on you for, or null. */
export const nextAction = (order) => {
  if (orderStatus(order).key === 'completed') return null;
  const revision = order.milestones.find((m) => m.status === 'revision');
  if (revision) return { label: `Rework "${revision.title}"`, tone: 'danger', milestoneId: revision.id };
  const active = order.milestones.find((m) => m.status === 'active');
  if (active) return { label: `Deliver "${active.title}"`, tone: 'info', milestoneId: active.id };
  const pending = order.milestones.find((m) => m.status === 'pending');
  if (pending) return { label: `Start "${pending.title}"`, tone: 'muted', milestoneId: pending.id };
  return null;
};

/** True when the ball is in your court right now. Drives the sidebar badge. */
export const needsAttention = (order) => {
  if (orderStatus(order).key === 'completed') return false;
  const inFlight = order.milestones.some((m) => m.status === 'revision' || m.status === 'active');
  const nothingStarted = order.milestones.every((m) => m.status === 'approved' || m.status === 'pending');
  return inFlight || nothingStarted;
};

/* =========================================================================
   Seed data. Swap this for an axios GET once the backend exists - the shapes
   below are exactly what the API should return.
   ========================================================================= */
export const buildSeed = () => ({
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

  orders: [
    {
      id: 'ORD-892',
      client: 'TechCorp',
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
        { id: 'M-2', from: 'you', text: 'Got it. Moving the backoff into a policy class and pulling the config out to env vars. Should be back with you tomorrow.', at: hoursAgo(25), read: true },
        { id: 'M-3', from: 'client', text: 'Perfect. Also, can we talk about adding a metrics endpoint before handover?', at: hoursAgo(3), read: false },
      ],
      activity: [
        { id: 'A-1', at: hoursAgo(26), actor: 'client', text: 'TechCorp requested a revision on "Core service refactor"' },
        { id: 'A-2', at: hoursAgo(30), actor: 'you', text: 'You delivered "Core service refactor"' },
        { id: 'A-3', at: hoursAgo(200), actor: 'client', text: 'TechCorp approved "Architecture & schema" - $800 released' },
      ],
      changeRequests: [],
    },
    {
      id: 'ORD-901',
      client: 'Northwind Retail',
      project: 'React Native Storefront',
      brief: 'Customer-facing storefront with offline cart and Stripe checkout.',
      startedOn: dayOffset(-8),
      deadline: dayOffset(3),
      revisionsIncluded: 2,
      milestones: [
        { id: 'MS-4', title: 'Catalogue & cart screens', amount: 1500, dueDate: dayOffset(-1), status: 'submitted', revisionsUsed: 0, deliverable: { link: 'https://expo.dev/@demo/northwind-preview', note: 'Expo build, test account in the shared doc.', at: hoursAgo(20) } },
        { id: 'MS-5', title: 'Checkout & payments', amount: 1800, dueDate: dayOffset(3), status: 'pending', revisionsUsed: 0 },
      ],
      messages: [
        { id: 'M-4', from: 'you', text: 'Preview build is up. Cart persists offline, checkout is stubbed until the next milestone.', at: hoursAgo(20), read: true },
        { id: 'M-5', from: 'client', text: 'Downloading now, will review with the team today.', at: hoursAgo(18), read: false },
      ],
      activity: [
        { id: 'A-4', at: hoursAgo(20), actor: 'you', text: 'You delivered "Catalogue & cart screens"' },
        { id: 'A-5', at: hoursAgo(190), actor: 'system', text: 'Northwind Retail funded $3,300 into escrow' },
      ],
      changeRequests: [
        { id: 'CR-1', reason: 'Client asked for Apple Pay in addition to card checkout.', extraCost: 400, extraDays: 3, status: 'Approved', at: hoursAgo(70) },
      ],
    },
    {
      id: 'ORD-894',
      client: 'Enterprise LLC',
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
  ],

  jobs: [
    { id: 'JOB-001', title: 'React Native app for field technicians', client: 'MobileFirst', clientRating: 4.8, clientJobs: 12, budget: 3000, days: 30, level: 'Intermediate', postedHours: 4, proposals: 6, skills: ['React Native', 'Firebase', 'Offline sync'], description: 'Offline-first job sheet app for 40 field technicians. Sync when back on network, photo attachments, signature capture.' },
    { id: 'JOB-002', title: 'Oracle to PostgreSQL migration', client: 'Levant Logistics', clientRating: 4.9, clientJobs: 31, budget: 5200, days: 45, level: 'Expert', postedHours: 11, proposals: 3, skills: ['PostgreSQL', 'Oracle SQL', 'Data migration'], description: 'Migrate a 90-table Oracle schema, rewrite 40 stored procedures, keep the reporting layer running through the cutover.' },
    { id: 'JOB-003', title: '.NET Core API for a booking platform', client: 'Sahara Travel', clientRating: 4.4, clientJobs: 5, budget: 2400, days: 21, level: 'Intermediate', postedHours: 26, proposals: 14, skills: ['.NET', 'REST API', 'SQL Server'], description: 'Availability search, hold-and-book flow, payment webhooks. Existing front end, we only need the API.' },
    { id: 'JOB-004', title: 'Dashboard rebuild in React + Bootstrap', client: 'Medlab Analytics', clientRating: 5.0, clientJobs: 8, budget: 1800, days: 18, level: 'Entry', postedHours: 40, proposals: 22, skills: ['React.js', 'Bootstrap', 'Charts'], description: 'Replace a jQuery admin panel with React. Design is done in Figma, 11 screens, no backend work needed.' },
    { id: 'JOB-005', title: 'C++ performance audit on an image pipeline', client: 'Pixelworks Studio', clientRating: 4.7, clientJobs: 19, budget: 2600, days: 14, level: 'Expert', postedHours: 52, proposals: 4, skills: ['C++', 'Profiling', 'Multithreading'], description: 'Our batch renderer got 3x slower after a refactor. Find it, fix it, write up what happened.' },
    { id: 'JOB-006', title: 'Express + MongoDB REST API for a delivery app', client: 'Sprint Couriers', clientRating: 4.2, clientJobs: 3, budget: 1500, days: 20, level: 'Entry', postedHours: 70, proposals: 18, skills: ['Express.js', 'MongoDB', 'JWT'], description: 'Driver assignment, route history, JWT auth. Small scope, clear spec attached.' },
  ],

  proposals: [
    { id: 'PROP-501', jobId: 'JOB-003', job: '.NET Core API for a booking platform', client: 'Sahara Travel', amount: 2400, days: 21, status: 'Pending', sentAt: hoursAgo(50), cover: 'I have shipped three booking APIs with hold-and-book semantics, including the race conditions that come with them. I would start with the availability model since everything else depends on it.' },
    { id: 'PROP-502', jobId: 'JOB-005', job: 'C++ performance audit on an image pipeline', client: 'Pixelworks Studio', amount: 2600, days: 14, status: 'Declined', sentAt: hoursAgo(120), cover: 'Happy to profile this with perf and flamegraphs before touching any code.' },
    { id: 'PROP-503', jobId: 'JOB-002', job: 'Oracle to PostgreSQL migration', client: 'Levant Logistics', amount: 4800, days: 40, status: 'Interviewing', sentAt: hoursAgo(30), cover: 'I did a 70-table Oracle to Postgres cutover last year with zero reporting downtime. Same playbook applies here.' },
  ],

  portfolio: [
    { id: 'PF-1', title: 'Employee task tracking system', tech: ['React', 'Node.js', 'PostgreSQL'], link: 'https://github.com/demo/task-tracker', description: 'Role-based access control, audit trail, and an analytics dashboard for a 200-person operations team.' },
    { id: 'PF-2', title: 'AI transport digitization', tech: ['Python', 'OCR', 'PostgreSQL'], link: '', description: 'Document digitization platform using OCR for the Ministry of Transport. Cut manual entry time by roughly 70%.' },
    { id: 'PF-3', title: 'Zyro browser engine shell', tech: ['C++', 'CEF3', 'GTK3'], link: 'https://github.com/demo/zyro', description: 'Multi-process browser shell on CEF3 with a V8 IPC bridge and request interception layer.' },
  ],

  withdrawals: [
    { id: 'WD-1', amount: 1440, method: 'Bank transfer', at: hoursAgo(500), status: 'Paid' },
  ],
});
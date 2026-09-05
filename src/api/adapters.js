

const num = (value) => Number(value || 0);

export const toUser = (row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    status: row.status,
    company: row.company || undefined,
    title: row.title || undefined,
    bio: row.bio || '',
    skills: row.skills || [],
    rate: num(row.hourly_rate),
    available: row.available,
    location: row.location || '',
    rating: num(row.rating),
    portfolio: row.portfolio_url || '',
    pitch: row.pitch || '',
    suspendedReason: row.suspended_reason || undefined,
    joinedAt: row.joined_at,
    lastActive: row.last_active,
    volume: num(row.volume),
});

export const toProfile = (row) => ({
    name: row.name,
    title: row.title || '',
    location: row.location || '',
    timezone: row.timezone || 'GMT+3',
    rate: num(row.hourly_rate),
    available: row.available !== false,
    responseHours: row.response_hours || 4,
    languages: row.languages || '',
    skills: row.skills || [],
    bio: row.bio || '',
});

export const toMilestone = (row) => ({
    id: row.id,
    title: row.title,
    amount: num(row.amount),
    dueDate: row.due_date,
    status: row.status,
    revisionsUsed: row.revisions_used || 0,
    revisionNote: row.revision_note || undefined,
    approvedOn: row.approved_on || undefined,
    refundedOn: row.refunded_on || undefined,
    deliverable: row.deliverable_link
        ? { link: row.deliverable_link, note: row.deliverable_note || '', at: row.delivered_at }
        : undefined,
});

export const toMessage = (row) => ({
    id: row.id,
    from: row.sender_role,
    text: row.body,
    at: row.sent_at,
    read: row.read,
});

export const toActivity = (row) => ({
    id: row.id,
    actor: row.actor,
    text: row.text,
    at: row.at,
});

export const toChangeRequest = (row) => ({
    id: row.id,
    reason: row.reason,
    extraCost: num(row.extra_cost),
    extraDays: row.extra_days,
    status: row.status,
    at: row.created_at,
});

export const toOrder = (row) => ({
    id: row.id,
    ref: `ORD-${row.id}`,
    clientId: row.client_id,
    freelancerId: row.freelancer_id,
    client: row.client,
    clientContact: row.client_contact,
    freelancer: {
        id: row.freelancer_id,
        name: row.freelancer_name,
        title: row.freelancer_title,
        rating: num(row.rating),
    },
    project: row.project,
    brief: row.brief || '',
    startedOn: row.started_on,
    deadline: row.deadline,
    revisionsIncluded: row.revisions_included,
    cancelled: row.cancelled,
    milestones: (row.milestones || []).map(toMilestone),
    messages: (row.messages || []).map(toMessage),
    activity: (row.activity || []).map(toActivity),
    changeRequests: (row.change_requests || []).map(toChangeRequest),
});

export const toJob = (row) => ({
    id: row.id,
    postedBy: row.client,
    client: row.client,
    clientRating: num(row.client_rating),
    clientJobs: 0,
    title: row.title,
    description: row.description,
    budget: num(row.budget),
    days: row.days,
    level: row.level,
    skills: row.skills || [],
    proposals: Number(row.proposal_count || 0),
    postedHours: Math.max(0, Math.round((Date.now() - new Date(row.created_at).getTime()) / 3600000)),
});

export const toProposal = (row) => ({
    id: row.id,
    jobId: row.job_id,
    job: row.job_title,
    client: row.client,
    amount: num(row.amount),
    days: row.days,
    cover: row.cover,
    status: row.status,
    sentAt: row.sent_at,
    plan: [],
    freelancerId: row.freelancer_id,
    freelancer: {
        name: row.freelancer_name,
        title: row.freelancer_title,
        rating: num(row.rating),
        jobs: 0,
        skills: row.skills || [],
    },
});

export const toDispute = (row) => ({
    id: row.id,
    orderId: row.order_id,
    milestoneId: row.milestone_id,
    project: row.project,
    client: row.client,
    freelancer: row.freelancer,
    raisedBy: row.raised_by,
    amount: num(row.amount),
    reason: row.reason,
    detail: row.detail,
    status: row.status,
    resolution: row.resolution || undefined,
    resolutionNote: row.resolution_note || undefined,
    openedAt: row.opened_at,
    resolvedAt: row.resolved_at || undefined,
});

/* The client's talent directory. Same rows as toUser, different field names
   because FindFreelancers was written against the seed shape. */
export const toTalent = (row) => ({
    id: row.id,
    name: row.name,
    title: row.title || '',
    location: row.location || '',
    rate: num(row.hourly_rate),
    rating: num(row.rating),
    jobs: 0,
    available: row.available !== false,
    responseHours: row.response_hours || 4,
    skills: row.skills || [],
    bio: row.bio || '',
});


export const toPortfolioItem = (row) => ({
    id: row.id,
    title: row.title,
    tech: row.tech || [],
    link: row.link || '',
    description: row.description || '',
});

export const toWithdrawal = (row) => ({
    id: row.id,
    amount: num(row.amount),
    method: row.method,
    status: row.status,
    at: row.at,
});

export const toPaymentMethod = (row) => ({
    id: row.id,
    label: row.label,
    kind: row.kind,
    primary: row.is_primary,
});


export const errorText = (err, fallback = 'Something went wrong.') => {
    if (err && err.response && err.response.data) {
        return err.response.data.message || err.response.data.error || fallback;
    }
    if (err && err.request) return 'Cannot reach the server. Is it running on port 5000?';
    return fallback;
};
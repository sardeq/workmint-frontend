import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

export default api;


export const usersApi = {
    getAll: (params) => api.get("/users", { params }).then((r) => r.data),
    getOne: (id) => api.get(`/users/${id}`).then((r) => r.data),
    register: (body) => api.post("/users", body).then((r) => r.data),
    login: (email, password) => api.post("/users/login", { email, password }).then((r) => r.data),
    update: (id, body) => api.put(`/users/${id}`, body).then((r) => r.data),
    setStatus: (id, status, reason) => api.put(`/users/${id}/status`, { status, reason }).then((r) => r.data),
    remove: (id) => api.delete(`/users/${id}`).then((r) => r.data),
};

export const jobsApi = {
    getAll: (params) => api.get("/jobs", { params }).then((r) => r.data),
    getOne: (id) => api.get(`/jobs/${id}`).then((r) => r.data),
    create: (body) => api.post("/jobs", body).then((r) => r.data),
    update: (id, body) => api.put(`/jobs/${id}`, body).then((r) => r.data),
    close: (id) => api.delete(`/jobs/${id}`).then((r) => r.data),
};

export const proposalsApi = {
    getAll: (params) => api.get("/proposals", { params }).then((r) => r.data),
    create: (body) => api.post("/proposals", body).then((r) => r.data),
    setStatus: (id, status) => api.put(`/proposals/${id}`, { status }).then((r) => r.data),
    accept: (id) => api.post(`/proposals/${id}/accept`).then((r) => r.data),
};

export const ordersApi = {
    getAll: (params) => api.get("/orders", { params }).then((r) => r.data),
    getOne: (id) => api.get(`/orders/${id}`).then((r) => r.data),
    create: (body) => api.post("/orders", body).then((r) => r.data),
    requestScopeChange: (orderId, body) =>
        api.post(`/orders/${orderId}/change-requests`, body).then((r) => r.data),
    decideScopeChange: (orderId, id, status) =>
        api.put(`/orders/${orderId}/change-requests/${id}`, { status }).then((r) => r.data),
};

export const milestonesApi = {
    getAll: (orderId) => api.get("/milestones", { params: { order_id: orderId } }).then((r) => r.data),
    create: (body) => api.post("/milestones", body).then((r) => r.data),
    start: (id) => api.put(`/milestones/${id}/start`).then((r) => r.data),
    deliver: (id, link, note) => api.put(`/milestones/${id}/deliver`, { link, note }).then((r) => r.data),
    approve: (id) => api.put(`/milestones/${id}/approve`).then((r) => r.data),
    requestRevision: (id, note) => api.put(`/milestones/${id}/revision`, { note }).then((r) => r.data),
};

export const messagesApi = {
    getAll: (orderId) => api.get("/messages", { params: { order_id: orderId } }).then((r) => r.data),
    send: (orderId, senderRole, body) =>
        api.post("/messages", { order_id: orderId, sender_role: senderRole, body }).then((r) => r.data),
    markRead: (orderId, readerRole) =>
        api.put("/messages/read", { order_id: orderId, reader_role: readerRole }).then((r) => r.data),
};

export const disputesApi = {
    getAll: (params) => api.get("/disputes", { params }).then((r) => r.data),
    create: (body) => api.post("/disputes", body).then((r) => r.data),
    claim: (id) => api.put(`/disputes/${id}`, { status: "Under review" }).then((r) => r.data),
    resolve: (id, resolution, note) =>
        api.put(`/disputes/${id}/resolve`, { resolution, note }).then((r) => r.data),
};
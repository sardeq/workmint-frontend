import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.API_URL || "http://localhost:5000/api",
});

export default api;

export const errorText = (err, fallback = "Something went wrong.") => {
  if (err.response && err.response.data) {
    return err.response.data.message || err.response.data.error || fallback;
  }
  if (err.request) return "Cannot reach the server.";
  return fallback;
};

export const usersApi = {
  getAll: (params) => api.get("/users", { params }).then((res) => res.data),
  getOne: (id) => api.get(`/users/${id}`).then((res) => res.data),
  register: (body) => api.post("/users", body).then((res) => res.data),
  login: (email, password) => api.post("/users/login", { email, password }).then((res) => res.data),
  update: (id, body) => api.put(`/users/${id}`, body).then((res) => res.data),
  setStatus: (id, status, reason) =>
    api.put(`/users/${id}/status`, { status, reason }).then((res) => res.data),
  remove: (id) => api.delete(`/users/${id}`).then((res) => res.data),
};

export const jobsApi = {
  getAll: (params) => api.get("/jobs", { params }).then((res) => res.data),
  getOne: (id) => api.get(`/jobs/${id}`).then((res) => res.data),
  create: (body) => api.post("/jobs", body).then((res) => res.data),
  update: (id, body) => api.put(`/jobs/${id}`, body).then((res) => res.data),
  close: (id) => api.delete(`/jobs/${id}`).then((res) => res.data),
};

export const proposalsApi = {
  getAll: (params) => api.get("/proposals", { params }).then((res) => res.data),
  create: (body) => api.post("/proposals", body).then((res) => res.data),
  setStatus: (id, status) => api.put(`/proposals/${id}`, { status }).then((res) => res.data),
  accept: (id) => api.post(`/proposals/${id}/accept`).then((res) => res.data),
};

export const ordersApi = {
  getAll: (params) => api.get("/orders", { params }).then((res) => res.data),
  getOne: (id) => api.get(`/orders/${id}`).then((res) => res.data),
  requestScopeChange: (orderId, body) =>
    api.post(`/orders/${orderId}/change-requests`, body).then((res) => res.data),
  decideScopeChange: (orderId, id, status) =>
    api.put(`/orders/${orderId}/change-requests/${id}`, { status }).then((res) => res.data),
};

export const milestonesApi = {
  start: (id) => api.put(`/milestones/${id}/start`).then((res) => res.data),
  deliver: (id, link, note) =>
    api.put(`/milestones/${id}/deliver`, { link, note }).then((res) => res.data),
  approve: (id) => api.put(`/milestones/${id}/approve`).then((res) => res.data),
  requestRevision: (id, note) =>
    api.put(`/milestones/${id}/revision`, { note }).then((res) => res.data),
};

export const messagesApi = {
  send: (orderId, senderRole, body) =>
    api.post("/messages", { order_id: orderId, sender_role: senderRole, body }).then((res) => res.data),
  markRead: (orderId, readerRole) =>
    api.put("/messages/read", { order_id: orderId, reader_role: readerRole }).then((res) => res.data),
};

export const disputesApi = {
  getAll: (params) => api.get("/disputes", { params }).then((res) => res.data),
  create: (body) => api.post("/disputes", body).then((res) => res.data),
  claim: (id) => api.put(`/disputes/${id}`, { status: "Under review" }).then((res) => res.data),
  resolve: (id, resolution, note) =>
    api.put(`/disputes/${id}/resolve`, { resolution, note }).then((res) => res.data),
};

export const portfolioApi = {
  getAll: (userId) => api.get("/portfolio", { params: { user_id: userId } }).then((res) => res.data),
  create: (body) => api.post("/portfolio", body).then((res) => res.data),
  update: (id, body) => api.put(`/portfolio/${id}`, body).then((res) => res.data),
  remove: (id) => api.delete(`/portfolio/${id}`).then((res) => res.data),
};

export const withdrawalsApi = {
  getAll: (freelancerId) =>
    api.get("/withdrawals", { params: { freelancer_id: freelancerId } }).then((res) => res.data),
  create: (body) => api.post("/withdrawals", body).then((res) => res.data),
};

export const paymentMethodsApi = {
  getAll: (clientId) =>
    api.get("/payment-methods", { params: { client_id: clientId } }).then((res) => res.data),
  create: (body) => api.post("/payment-methods", body).then((res) => res.data),
  setPrimary: (id) => api.put(`/payment-methods/${id}/primary`).then((res) => res.data),
  remove: (id) => api.delete(`/payment-methods/${id}`).then((res) => res.data),
};

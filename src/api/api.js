import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const saved = localStorage.getItem("user");
  if (saved) {
    config.headers["x-user-role"] = JSON.parse(saved).role;
  }
  return config;
});

export default api;

export const errorText = (err, fallback = "Something went wrong.") => {
  if (err.response && err.response.data) {
    return err.response.data.message || fallback;
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

export const portfolioApi = {
  getAll: (userId) => api.get("/portfolio", { params: { user_id: userId } }).then((res) => res.data),
  create: (body) => api.post("/portfolio", body).then((res) => res.data),
  update: (id, body) => api.put(`/portfolio/${id}`, body).then((res) => res.data),
  remove: (id) => api.delete(`/portfolio/${id}`).then((res) => res.data),
};

export const jobsApi = {
  getAll: (params) => api.get("/jobs", { params }).then((res) => res.data),
  create: (body) => api.post("/jobs", body).then((res) => res.data),
  close: (id) => api.put(`/jobs/${id}/close`).then((res) => res.data),
  remove: (id) => api.delete(`/jobs/${id}`).then((res) => res.data),
};

export const proposalsApi = {
  getAll: (params) => api.get("/proposals", { params }).then((res) => res.data),
  create: (body) => api.post("/proposals", body).then((res) => res.data),
  setStatus: (id, status) => api.put(`/proposals/${id}`, { status }).then((res) => res.data),
  accept: (id) => api.post(`/proposals/${id}/accept`).then((res) => res.data),
};

export const contractsApi = {
  getAll: (params) => api.get("/contracts", { params }).then((res) => res.data),
  getOne: (id) => api.get(`/contracts/${id}`).then((res) => res.data),
  deliver: (id, link, note) =>
    api.put(`/contracts/${id}/deliver`, { link, note }).then((res) => res.data),
  approve: (id) => api.put(`/contracts/${id}/approve`).then((res) => res.data),
  requestRevision: (id, note) =>
    api.put(`/contracts/${id}/revision`, { note }).then((res) => res.data),
  cancel: (id) => api.put(`/contracts/${id}/cancel`).then((res) => res.data),
};

export const messagesApi = {
  send: (contractId, senderRole, body) =>
    api.post("/messages", { contract_id: contractId, sender_role: senderRole, body })
      .then((res) => res.data),
};

export const paymentsApi = {
  getAll: (clientId) => api.get("/payments", { params: { client_id: clientId } }).then((res) => res.data),
  create: (body) => api.post("/payments", body).then((res) => res.data),
};

export const paymentMethodsApi = {
  getAll: (clientId) =>
    api.get("/payment-methods", { params: { client_id: clientId } }).then((res) => res.data),
  create: (body) => api.post("/payment-methods", body).then((res) => res.data),
  remove: (id) => api.delete(`/payment-methods/${id}`).then((res) => res.data),
};

export const withdrawalsApi = {
  getAll: (freelancerId) =>
    api.get("/withdrawals", { params: { freelancer_id: freelancerId } }).then((res) => res.data),
  create: (body) => api.post("/withdrawals", body).then((res) => res.data),
};

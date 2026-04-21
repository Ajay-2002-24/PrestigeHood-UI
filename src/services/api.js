import axios from 'axios';

const BASE = 'https://localhost:7084/api';

const http = axios.create({ baseURL: BASE, headers: { 'Content-Type': 'application/json' } });

// Auto-attach token
http.interceptors.request.use(cfg => {
  const t = localStorage.getItem('ph_token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

// Auto-logout on 401
http.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login:    d => http.post('/Auth/login', d),
  register: d => http.post('/Auth/register', d),
};

export const expenseAPI = {
  getAll:     (m,y)      => http.get(`/Expenses?month=${m}&year=${y}`),
  getSummary: (m,y)      => http.get(`/Expenses/summary?month=${m}&year=${y}`),
  add:        d          => http.post('/Expenses', d),
  remove:     id         => http.delete(`/Expenses/${id}`),
  setBudgets: (m,y,data) => http.post(`/Expenses/budgets?month=${m}&year=${y}`, data),
};

export const visitorAPI = {
  getAll:   status => http.get(`/Visitors${status ? `?status=${status}` : ''}`),
  getTypes: ()     => http.get('/Visitors/types'),
  create:   d      => http.post('/Visitors', d),
  approve:  (id,d) => http.put(`/Visitors/${id}/approve`, d),
  checkout: id     => http.put(`/Visitors/${id}/checkout`),
};

export const complaintAPI = {
  getAll:        status  => http.get(`/Complaints${status ? `?status=${status}` : ''}`),
  getCategories: ()      => http.get('/Complaints/categories'),
  create:        d       => http.post('/Complaints', d),
  updateStatus:  (id, d) => http.put(`/Complaints/${id}/status`, d),
  addComment:    (id, c) => http.post(`/Complaints/${id}/comments?comment=${encodeURIComponent(c)}`),
}

export const notificationAPI = {
  getAll:      () => http.get('/Notifications'),
  getUnread:   () => http.get('/Notifications/unread-count'),
  markRead:    id => http.put(`/Notifications/${id}/read`),
  markAllRead: () => http.put('/Notifications/read-all'),
};

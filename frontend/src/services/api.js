import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle unauthorized (401) responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired, clear and optionally redirect
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me')
};

export const reportApi = {
  getReports: (params) => api.get('/reports', { params }),
  getReportById: (id) => api.get(`/reports/${id}`),
  saveDraft: (data) => api.post('/reports/draft', data),
  submitReport: (id) => api.post(`/reports/${id}/submit`),
  reviewReport: (id, data) => api.post(`/reports/${id}/review`, data),
  getVersions: (id) => api.get(`/reports/${id}/versions`)
};

export const projectApi = {
  getProjects: (params) => api.get('/projects', { params }),
  getProjectById: (id) => api.get(`/projects/${id}`),
  createProject: (data) => api.post('/projects', data),
  updateProject: (id, data) => api.put(`/projects/${id}`, data),
  deleteProject: (id) => api.delete(`/projects/${id}`)
};

export const userApi = {
  getUsers: (params) => api.get('/users', { params }),
  getUserProfile: (id) => api.get(`/users/${id}/profile`),
  createUser: (data) => api.post('/users', data),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`)
};

export const analyticsApi = {
  getDashboardMetrics: (params) => api.get('/analytics/dashboard', { params }),
  getVisualInsights: (params) => api.get('/analytics/insights', { params }),
  getSectionComparator: (params) => api.get('/analytics/comparator', { params })
};

export const aiApi = {
  chat: (query) => api.post('/ai/chat', { query }),
  getSummary: (params) => api.get('/ai/summary', { params })
};

export default api;

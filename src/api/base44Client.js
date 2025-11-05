import axios from 'axios';

// API Base URL - use environment variable or default to production
const API_URL = import.meta.env.VITE_API_URL || 'https://incredible-embrace-production-1370.up.railway.app';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API wrapper with Base44-compatible interface
export const api = {
  // Auth
  auth: {
    register: async (data) => {
      const response = await apiClient.post('/auth/register', data);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    },
    login: async (email, password) => {
      const response = await apiClient.post('/auth/login', { email, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    },
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    },
    getCurrentUser: async () => {
      const response = await apiClient.get('/auth/me');
      return response.data;
    },
    changePassword: async (currentPassword, newPassword) => {
      const response = await apiClient.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      return response.data;
    },
  },

  // Drivers
  drivers: {
    getAll: async () => {
      const response = await apiClient.get('/drivers');
      return response.data;
    },
    getById: async (id) => {
      const response = await apiClient.get(`/drivers/${id}`);
      return response.data;
    },
    create: async (data) => {
      const response = await apiClient.post('/drivers', data);
      return response.data;
    },
    update: async (id, data) => {
      const response = await apiClient.put(`/drivers/${id}`, data);
      return response.data;
    },
    delete: async (id) => {
      const response = await apiClient.delete(`/drivers/${id}`);
      return response.data;
    },
    bulkUpdateRates: async (updates) => {
      const response = await apiClient.post('/drivers/bulk-update-rates', { updates });
      return response.data;
    },
  },

  // Expenses
  expenses: {
    getAll: async (params = {}) => {
      const response = await apiClient.get('/expenses', { params: { ...params, limit: 1000 } });
      // Handle paginated response - extract data array
      return response.data.data || response.data;
    },
    getById: async (id) => {
      const response = await apiClient.get(`/expenses/${id}`);
      return response.data;
    },
    create: async (data) => {
      const response = await apiClient.post('/expenses', data);
      return response.data;
    },
    update: async (id, data) => {
      const response = await apiClient.put(`/expenses/${id}`, data);
      return response.data;
    },
    softDelete: async (id) => {
      const response = await apiClient.post(`/expenses/${id}/soft-delete`);
      return response.data;
    },
    restore: async (id) => {
      const response = await apiClient.post(`/expenses/${id}/restore`);
      return response.data;
    },
    delete: async (id) => {
      const response = await apiClient.delete(`/expenses/${id}`);
      return response.data;
    },
    bulkDelete: async (ids) => {
      const response = await apiClient.post('/expenses/bulk-delete', { ids });
      return response.data;
    },
    bulkRestore: async (ids) => {
      const response = await apiClient.post('/expenses/bulk-restore', { ids });
      return response.data;
    },
    bulkPermanentDelete: async (ids) => {
      const response = await apiClient.post('/expenses/bulk-permanent-delete', { ids });
      return response.data;
    },
  },

  // Employees
  employees: {
    getAll: async () => {
      const response = await apiClient.get('/employees');
      return response.data;
    },
    getById: async (id) => {
      const response = await apiClient.get(`/employees/${id}`);
      return response.data;
    },
    create: async (data) => {
      const response = await apiClient.post('/employees', data);
      return response.data;
    },
    update: async (id, data) => {
      const response = await apiClient.put(`/employees/${id}`, data);
      return response.data;
    },
    delete: async (id) => {
      const response = await apiClient.delete(`/employees/${id}`);
      return response.data;
    },
  },

  // Expense Types
  expenseTypes: {
    getAll: async () => {
      const response = await apiClient.get('/expense-types');
      return response.data;
    },
    getById: async (id) => {
      const response = await apiClient.get(`/expense-types/${id}`);
      return response.data;
    },
    create: async (data) => {
      const response = await apiClient.post('/expense-types', data);
      return response.data;
    },
    update: async (id, data) => {
      const response = await apiClient.put(`/expense-types/${id}`, data);
      return response.data;
    },
    delete: async (id) => {
      const response = await apiClient.delete(`/expense-types/${id}`);
      return response.data;
    },
  },

  // Settings
  settings: {
    getAll: async () => {
      const response = await apiClient.get('/settings');
      return response.data;
    },
    getByKey: async (key) => {
      const response = await apiClient.get(`/settings/${key}`);
      return response.data;
    },
    set: async (key, value, category = 'general', description = '') => {
      const response = await apiClient.post('/settings', {
        settingKey: key,
        settingValue: value,
        settingCategory: category,
        description,
      });
      return response.data;
    },
    delete: async (key) => {
      const response = await apiClient.delete(`/settings/${key}`);
      return response.data;
    },
  },

  // Print Templates
  printTemplates: {
    getAll: async () => {
      const response = await apiClient.get('/print-templates');
      return response.data;
    },
    getById: async (id) => {
      const response = await apiClient.get(`/print-templates/${id}`);
      return response.data;
    },
    create: async (data) => {
      const response = await apiClient.post('/print-templates', data);
      return response.data;
    },
    update: async (id, data) => {
      const response = await apiClient.put(`/print-templates/${id}`, data);
      return response.data;
    },
    setDefault: async (id) => {
      const response = await apiClient.post(`/print-templates/${id}/set-default`);
      return response.data;
    },
    delete: async (id) => {
      const response = await apiClient.delete(`/print-templates/${id}`);
      return response.data;
    },
  },

  // Users (admin only)
  users: {
    getAll: async () => {
      const response = await apiClient.get('/users');
      return response.data;
    },
    getById: async (id) => {
      const response = await apiClient.get(`/users/${id}`);
      return response.data;
    },
    update: async (id, data) => {
      const response = await apiClient.put(`/users/${id}`, data);
      return response.data;
    },
    delete: async (id) => {
      const response = await apiClient.delete(`/users/${id}`);
      return response.data;
    },
  },

  // File Upload
  upload: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Backup
  backup: {
    export: async (format = 'json', month = null) => {
      const params = { format };
      if (month) params.month = month;
      const response = await apiClient.get('/backup/export', { params });
      return response.data;
    },
    email: async (recipientEmail, format = 'json', month = null) => {
      const response = await apiClient.post('/backup/email', {
        recipientEmail,
        format,
        month,
      });
      return response.data;
    },
  },
};

// For backward compatibility - expose base44 as alias
export const base44 = api;

export default api;

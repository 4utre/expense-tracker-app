# Frontend Migration Guide

## Overview

You need to replace all Base44 SDK calls with your custom API. Here's what needs to be updated:

## Files to Update

### 1. `/src/api/base44Client.js` - COMPLETE REWRITE

**Current:**
```javascript
import { createClient } from '@base44/sdk';

export const base44 = createClient({
  appId: "68fcb523a5bfdd6f980af4ad",
  requiresAuth: true
});
```

**New:**
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

let authToken = localStorage.getItem('auth_token');

export const setAuthToken = (token) => {
  authToken = token;
  localStorage.setItem('auth_token', token);
};

export const clearAuthToken = () => {
  authToken = null;
  localStorage.removeItem('auth_token');
};

const request = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
};

export const api = {
  // Auth
  auth: {
    register: (data) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: async (data) => {
      const result = await request('/api/auth/login', { method: 'POST', body: JSON.stringify(data) });
      setAuthToken(result.token);
      return result;
    },
    me: () => request('/api/auth/me'),
    logout: () => {
      clearAuthToken();
      window.location.href = '/login';
    },
  },

  // Drivers
  drivers: {
    list: () => request('/api/drivers'),
    get: (id) => request(`/api/drivers/${id}`),
    create: (data) => request('/api/drivers', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/api/drivers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/api/drivers/${id}`, { method: 'DELETE' }),
    bulkUpdateRates: (data) => request('/api/drivers/bulk-update-rates', { method: 'POST', body: JSON.stringify(data) }),
  },

  // Expenses
  expenses: {
    list: (params) => {
      const query = new URLSearchParams(params).toString();
      return request(`/api/expenses?${query}`);
    },
    get: (id) => request(`/api/expenses/${id}`),
    create: (data) => request('/api/expenses', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/api/expenses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    softDelete: (id) => request(`/api/expenses/${id}/soft-delete`, { method: 'POST' }),
    restore: (id) => request(`/api/expenses/${id}/restore`, { method: 'POST' }),
    delete: (id) => request(`/api/expenses/${id}`, { method: 'DELETE' }),
    bulkDelete: (ids) => request('/api/expenses/bulk-delete', { method: 'POST', body: JSON.stringify({ ids }) }),
    bulkRestore: (ids) => request('/api/expenses/bulk-restore', { method: 'POST', body: JSON.stringify({ ids }) }),
    bulkPermanentDelete: (ids) => request('/api/expenses/bulk-permanent-delete', { method: 'POST', body: JSON.stringify({ ids }) }),
  },

  // Employees
  employees: {
    list: () => request('/api/employees'),
    get: (id) => request(`/api/employees/${id}`),
    create: (data) => request('/api/employees', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/api/employees/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/api/employees/${id}`, { method: 'DELETE' }),
  },

  // Expense Types
  expenseTypes: {
    list: () => request('/api/expense-types'),
    get: (id) => request(`/api/expense-types/${id}`),
    create: (data) => request('/api/expense-types', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/api/expense-types/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/api/expense-types/${id}`, { method: 'DELETE' }),
  },

  // Settings
  settings: {
    list: () => request('/api/settings'),
    get: (key) => request(`/api/settings/${key}`),
    set: (data) => request('/api/settings', { method: 'POST', body: JSON.stringify(data) }),
    delete: (key) => request(`/api/settings/${key}`, { method: 'DELETE' }),
  },

  // Print Templates
  printTemplates: {
    list: () => request('/api/print-templates'),
    get: (id) => request(`/api/print-templates/${id}`),
    create: (data) => request('/api/print-templates', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/api/print-templates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    setDefault: (id) => request(`/api/print-templates/${id}/set-default`, { method: 'POST' }),
    delete: (id) => request(`/api/print-templates/${id}`, { method: 'DELETE' }),
  },

  // Users
  users: {
    list: () => request('/api/users'),
    get: (id) => request(`/api/users/${id}`),
    update: (id, data) => request(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/api/users/${id}`, { method: 'DELETE' }),
  },

  // Upload
  upload: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
  },

  // Backup
  backup: {
    export: (format, month) => {
      const query = new URLSearchParams({ format, ...(month && { month }) }).toString();
      return fetch(`${API_URL}/api/backup/export?${query}`, {
        headers: { 'Authorization': `Bearer ${authToken}` },
      }).then(r => r.blob());
    },
    email: (data) => request('/api/backup/email', { method: 'POST', body: JSON.stringify(data) }),
  },
};
```

### 2. `/src/api/entities.js` - DELETE THIS FILE

This file is no longer needed. All entity operations are now in `base44Client.js` → `api` object.

### 3. `/src/api/integrations.js` - DELETE THIS FILE

Upload and email are now in the main API client.

### 4. Update ALL Page Components

Search for all occurrences of:
- `base44.auth.*` → Replace with `api.auth.*`
- `base44.entities.Driver.*` → Replace with `api.drivers.*`
- `base44.entities.Expense.*` → Replace with `api.expenses.*`
- `base44.entities.Employee.*` → Replace with `api.employees.*`
- `base44.entities.ExpenseType.*` → Replace with `api.expenseTypes.*`
- `base44.entities.AppSetting.*` → Replace with `api.settings.*`
- `base44.entities.PrintTemplate.*` → Replace with `api.printTemplates.*`
- `base44.entities.User.*` → Replace with `api.users.*`
- `base44.integrations.Core.UploadFile` → Replace with `api.upload`
- `base44.integrations.Core.SendEmail` → Replace with `api.backup.email`

### 5. Update Imports

**Old:**
```javascript
import { base44 } from '../api/base44Client';
import { Driver, Expense } from '../api/entities';
```

**New:**
```javascript
import { api } from '../api/base44Client';
```

### 6. Update Query Hooks

**Old:**
```javascript
const { data: drivers } = useQuery({
  queryKey: ['drivers'],
  queryFn: () => Driver.list()
});
```

**New:**
```javascript
const { data: drivers } = useQuery({
  queryKey: ['drivers'],
  queryFn: api.drivers.list
});
```

### 7. Update Mutations

**Old:**
```javascript
const mutation = useMutation({
  mutationFn: (data) => Driver.create(data),
  onSuccess: () => queryClient.invalidateQueries(['drivers'])
});
```

**New:**
```javascript
const mutation = useMutation({
  mutationFn: api.drivers.create,
  onSuccess: () => queryClient.invalidateQueries(['drivers'])
});
```

## Environment Setup

### 1. Create `.env` file in root:

```env
VITE_API_URL=http://localhost:3000
```

### 2. For production (Railway):

```env
VITE_API_URL=https://your-backend.up.railway.app
```

## Testing Locally

1. **Start backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start frontend:**
   ```bash
   cd ..
   npm run dev
   ```

3. **Test login:**
   - Go to `http://localhost:5173`
   - Try logging in with your credentials

## Common Issues & Solutions

### Issue: "Network Error"
**Solution:** Check that backend is running on port 3000 and VITE_API_URL is correct.

### Issue: "401 Unauthorized"
**Solution:** Token might be expired or not set. Try logging in again.

### Issue: "CORS Error"
**Solution:** Make sure backend FRONTEND_URL matches your frontend URL exactly.

### Issue: "Queries not working"
**Solution:** Check React Query devtools. Make sure queryFn is pointing to the right API method.

## Deployment

After updating all files:

1. **Push to GitHub**
2. **Deploy to Railway** (follow DEPLOYMENT_GUIDE.md Part 2)
3. **Update environment variables:**
   - Set `VITE_API_URL` to your production backend URL
4. **Test everything works**

## Files That Need Updates

Here's a checklist of all files that need changes:

- [ ] `/src/api/base44Client.js` - Complete rewrite
- [ ] `/src/api/entities.js` - Delete
- [ ] `/src/api/integrations.js` - Delete
- [ ] `/src/pages/Dashboard.jsx` - Update queries
- [ ] `/src/pages/AddExpense.jsx` - Update mutations
- [ ] `/src/pages/Drivers.jsx` - Update queries/mutations
- [ ] `/src/pages/Employees.jsx` - Update queries/mutations
- [ ] `/src/pages/Reports.jsx` - Update queries
- [ ] `/src/pages/Calendar.jsx` - Update queries
- [ ] `/src/pages/Settings.jsx` - Update queries/mutations
- [ ] `/src/pages/Users.jsx` - Update queries/mutations
- [ ] `/src/pages/Backup.jsx` - Update export/email
- [ ] `/src/pages/PrintTemplates.jsx` - Update queries/mutations
- [ ] `/src/pages/PrintSettings.jsx` - Update queries/mutations
- [ ] `/src/App.jsx` - Update auth check
- [ ] `/.env` - Create with VITE_API_URL

## Estimated Time

- **API Client rewrite:** 1 hour
- **Page component updates:** 3-4 hours
- **Testing:** 1-2 hours
- **Total:** 5-7 hours

## Need Help?

If you get stuck:
1. Check browser console for errors
2. Check Network tab to see API calls
3. Test API endpoints with Postman/curl first
4. Check React Query devtools

Would you like me to help update specific files? I can start with the most critical ones!

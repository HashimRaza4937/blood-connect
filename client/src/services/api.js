const API_BASE = import.meta.env.VITE_API_URL || '/api';

const getHeaders = (isJson = true) => {
  const token = localStorage.getItem('bc_token');
  const headers = {};
  if (isJson) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data;
};

export const api = {
  // Auth
  auth: {
    login: async (email, password) => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, password })
      });
      return handleResponse(res);
    },
    register: async (userData) => {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(userData)
      });
      return handleResponse(res);
    },
    getMe: async () => {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    getDemoUsers: async () => {
      const res = await fetch(`${API_BASE}/auth/demo-users`);
      return handleResponse(res);
    },
    demoLogin: async (role, email) => {
      const res = await fetch(`${API_BASE}/auth/demo-login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ role, email })
      });
      return handleResponse(res);
    }
  },

  // Blood Banks
  bloodbanks: {
    getAll: async (params = {}) => {
      const qs = new URLSearchParams();
      if (params.bloodGroup) qs.append('bloodGroup', params.bloodGroup);
      if (params.city) qs.append('city', params.city);
      if (params.freeOnly) qs.append('freeOnly', 'true');
      if (params.search) qs.append('search', params.search);
      if (params.status) qs.append('status', params.status);

      const res = await fetch(`${API_BASE}/bloodbanks?${qs.toString()}`);
      return handleResponse(res);
    },
    getById: async (id) => {
      const res = await fetch(`${API_BASE}/bloodbanks/${id}`);
      return handleResponse(res);
    },
    register: async (data) => {
      const res = await fetch(`${API_BASE}/bloodbanks/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },
    updateInventory: async (bankId, inventory) => {
      const res = await fetch(`${API_BASE}/bloodbanks/${bankId}/inventory`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ inventory })
      });
      return handleResponse(res);
    },
    adjustInventory: async (bankId, bloodGroup, regularChange, freeChange) => {
      const res = await fetch(`${API_BASE}/bloodbanks/${bankId}/inventory/adjust`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ bloodGroup, regularChange, freeChange })
      });
      return handleResponse(res);
    }
  },

  // Donations
  donations: {
    submit: async (data) => {
      const res = await fetch(`${API_BASE}/donations`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },
    getMy: async () => {
      const res = await fetch(`${API_BASE}/donations/my`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    getByBank: async (bankId, status) => {
      const qs = status ? `?status=${status}` : '';
      const res = await fetch(`${API_BASE}/donations/bank/${bankId}${qs}`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    verify: async (donationId, status, notes) => {
      const res = await fetch(`${API_BASE}/donations/${donationId}/verify`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status, notes })
      });
      return handleResponse(res);
    },
    getPublicFeed: async () => {
      const res = await fetch(`${API_BASE}/donations/public-feed`);
      return handleResponse(res);
    }
  },

  // Free Blood Claims
  claims: {
    submit: async (data) => {
      const res = await fetch(`${API_BASE}/claims`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },
    getMy: async () => {
      const res = await fetch(`${API_BASE}/claims/my`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    getByBank: async (bankId, status) => {
      const qs = status ? `?status=${status}` : '';
      const res = await fetch(`${API_BASE}/claims/bank/${bankId}${qs}`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    getById: async (id) => {
      const res = await fetch(`${API_BASE}/claims/${id}`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    updateStatus: async (claimId, status, remarks) => {
      const res = await fetch(`${API_BASE}/claims/${claimId}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status, remarks })
      });
      return handleResponse(res);
    }
  },

  // Blood Requests
  requests: {
    getAll: async (params = {}) => {
      const qs = new URLSearchParams();
      if (params.bloodGroup) qs.append('bloodGroup', params.bloodGroup);
      if (params.city) qs.append('city', params.city);
      if (params.status) qs.append('status', params.status);

      const res = await fetch(`${API_BASE}/requests?${qs.toString()}`);
      return handleResponse(res);
    },
    create: async (data) => {
      const res = await fetch(`${API_BASE}/requests`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse(res);
    },
    update: async (id, status) => {
      const res = await fetch(`${API_BASE}/requests/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status })
      });
      return handleResponse(res);
    }
  },

  // Admin
  admin: {
    getStats: async () => {
      const res = await fetch(`${API_BASE}/admin/stats`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    getBanks: async (status) => {
      const qs = status ? `?status=${status}` : '';
      const res = await fetch(`${API_BASE}/admin/bloodbanks${qs}`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    verifyBank: async (bankId, status) => {
      const res = await fetch(`${API_BASE}/admin/bloodbanks/${bankId}/verify`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status })
      });
      return handleResponse(res);
    },
    getUsers: async (role) => {
      const qs = role ? `?role=${role}` : '';
      const res = await fetch(`${API_BASE}/admin/users${qs}`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    getClaims: async () => {
      const res = await fetch(`${API_BASE}/admin/claims`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    resetDemo: async () => {
      const res = await fetch(`${API_BASE}/admin/reset-demo`, {
        method: 'POST',
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    quickReset: async () => {
      const res = await fetch(`${API_BASE}/admin/quick-reset`, {
        method: 'POST'
      });
      return handleResponse(res);
    }
  }
};

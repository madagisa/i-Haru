// API Client for i-Haru backend

const API_BASE = '/api';

// Get token from localStorage
function getToken() {
    const authData = localStorage.getItem('iharu-auth');
    if (authData) {
        try {
            const parsed = JSON.parse(authData);
            return parsed.state?.token || null;
        } catch {
            return null;
        }
    }
    return null;
}

// API request helper
async function apiRequest(endpoint, options = {}) {
    const token = getToken();

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'API request failed');
    }

    return data;
}

// Auth API
export const authApi = {
    signup: (data) => apiRequest('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    login: (email, password) => apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    }),

    me: () => apiRequest('/auth/me'),

    deleteAccount: () => apiRequest('/auth/delete', {
        method: 'DELETE'
    })
};

// Family API
export const familyApi = {
    get: () => apiRequest('/family'),

    join: (inviteCode) => apiRequest('/family', {
        method: 'POST',
        body: JSON.stringify({ inviteCode })
    }),

    addChild: (data) => apiRequest('/family/children', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    removeChild: (childId) => apiRequest('/family/children', {
        method: 'DELETE',
        body: JSON.stringify({ childId })
    })
};

// Schedules API
export const schedulesApi = {
    getAll: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.date) searchParams.set('date', params.date);
        if (params.childId) searchParams.set('childId', params.childId);
        const query = searchParams.toString();
        return apiRequest(`/schedules${query ? '?' + query : ''}`);
    },

    create: (data) => apiRequest('/schedules', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    update: (id, data) => apiRequest(`/schedules/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    delete: (id) => apiRequest(`/schedules/${id}`, {
        method: 'DELETE'
    })
};

// Preparations API
export const preparationsApi = {
    getAll: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.childId) searchParams.set('childId', params.childId);
        if (params.showCompleted !== undefined) searchParams.set('showCompleted', params.showCompleted);
        const query = searchParams.toString();
        return apiRequest(`/preparations${query ? '?' + query : ''}`);
    },

    create: (data) => apiRequest('/preparations', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    update: (id, data) => apiRequest(`/preparations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    toggleCompletion: (id) => apiRequest(`/preparations/${id}`, {
        method: 'PATCH'
    }),

    delete: (id) => apiRequest(`/preparations/${id}`, {
        method: 'DELETE'
    })
};

// Messages API
export const messagesApi = {
    getAll: () => apiRequest('/messages'),

    send: (data) => apiRequest('/messages', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    delete: (messageId) => apiRequest('/messages', {
        method: 'DELETE',
        body: JSON.stringify({ messageId })
    })
};


export default {
    auth: authApi,
    family: familyApi,
    schedules: schedulesApi,
    preparations: preparationsApi,
    messages: messagesApi
};

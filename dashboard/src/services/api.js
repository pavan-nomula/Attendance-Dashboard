// API service for connecting to backend
// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://smart-attendance-backend-beta.vercel.app/';



// https://smart-attendance-backend-beta.vercel.app/

// Get token from localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

// Set token in localStorage
export const setToken = (token) => {
  localStorage.setItem('token', token);
};

// Remove token from localStorage
export const removeToken = () => {
  localStorage.removeItem('token');
};

// Get stored user info
export const getStoredUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Set user info in localStorage
export const setStoredUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

// Remove user info from localStorage
export const removeStoredUser = () => {
  localStorage.removeItem('user');
};

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Non-JSON response:', text.substring(0, 200));
      throw new Error('Server returned an error. Please check backend server logs.');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    if (error.message.includes('JSON')) {
      throw new Error('Server error - backend may not be running or there is a server error. Check backend terminal.');
    }
    throw error;
  }
};

// Auth API
export const authAPI = {
  signup: async (name, email, password, role, inviteCode, activationCode) => {
    return apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role, inviteCode, activationCode }),
    });
  },

  login: async (email, password) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  getMe: async () => {
    return apiRequest('/auth/me', {
      method: 'GET',
    });
  },
};

// Attendance API
export const attendanceAPI = {
  mark: async (uid, studentId, period_id, timestamp) => {
    return apiRequest('/attendance/mark', {
      method: 'POST',
      body: JSON.stringify({ uid, studentId, period_id, timestamp }),
    });
  },

  markManual: async (studentId, period_id, status, date) => {
    return apiRequest('/attendance/manual', {
      method: 'POST',
      body: JSON.stringify({ studentId, period_id, status, date }),
    });
  },

  getToday: async (period_id) => {
    const query = period_id ? `?period_id=${period_id}` : '';
    return apiRequest(`/attendance/today${query}`, {
      method: 'GET',
    });
  },
};

// Permissions API
export const permissionsAPI = {
  create: async (reason, start_date, end_date, faculty_id) => {
    return apiRequest('/permissions', {
      method: 'POST',
      body: JSON.stringify({ reason, start_date, end_date, faculty_id }),
    });
  },

  getMine: async () => {
    return apiRequest('/permissions/mine', {
      method: 'GET',
    });
  },

  getAll: async () => {
    return apiRequest('/permissions', {
      method: 'GET',
    });
  },

  update: async (id, status) => {
    return apiRequest(`/permissions/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
};

// Reports API
export const reportsAPI = {
  getAttendancePercent: async (studentId, from, to) => {
    const params = new URLSearchParams();
    if (studentId) params.append('studentId', studentId);
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/reports/attendance-percent${query}`, {
      method: 'GET',
    });
  },

  getAttendanceHistory: async (studentId, from, to) => {
    const params = new URLSearchParams();
    if (studentId) params.append('studentId', studentId);
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/reports/attendance-history${query}`, {
      method: 'GET',
    });
  },

  getSubjectWise: async (studentId, from, to) => {
    const params = new URLSearchParams();
    if (studentId) params.append('studentId', studentId);
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/reports/subject-wise${query}`, {
      method: 'GET',
    });
  },

  getFacultyStats: async (from, to) => {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/reports/faculty-stats${query}`, {
      method: 'GET',
    });
  },

  getOverallStats: async () => {
    return apiRequest('/reports/overall-stats', {
      method: 'GET',
    });
  },
};

// Users API
export const usersAPI = {
  getMe: async () => {
    return apiRequest('/users/me', {
      method: 'GET',
    });
  },

  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.role) params.append('role', filters.role);
    if (filters.department) params.append('department', filters.department);
    if (filters.class_name) params.append('class_name', filters.class_name);
    if (filters.search) params.append('search', filters.search);

    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/users${query}`, {
      method: 'GET',
    });
  },

  create: async (name, email, role, uid, password, department, class_name) => {
    return apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify({ name, email, role, uid, password, department, class_name }),
    });
  },

  update: async (userId, name, email, role, uid, department, class_name) => {
    return apiRequest(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ name, email, role, uid, department, class_name }),
    });
  },

  delete: async (userId) => {
    return apiRequest(`/users/${userId}`, {
      method: 'DELETE',
    });
  },

  mapUID: async (userId, uid) => {
    return apiRequest(`/users/map-uid/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ uid }),
    });
  },

  changePassword: async (userId, password) => {
    return apiRequest(`/users/reset-password/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ password }),
    });
  },

  toggleStatus: async (userId) => {
    return apiRequest(`/users/toggle-status/${userId}`, {
      method: 'POST',
    });
  },

  promote: async (userId) => {
    return apiRequest(`/users/promote/${userId}`, {
      method: 'POST',
    });
  },

  delete: async (userId) => {
    return apiRequest(`/users/${userId}`, {
      method: 'DELETE',
    });
  },

  demote: async (userId) => {
    return apiRequest(`/users/demote/${userId}`, {
      method: 'POST',
    });
  },
};

// Timetable API
// Timetable API
export const timetableAPI = {
  create: async (day_of_week, subject, start_time, end_time, faculty_email, faculty_name) => {
    return apiRequest('/timetable', {
      method: 'POST',
      body: JSON.stringify({ day_of_week, subject, start_time, end_time, faculty_email, faculty_name }),
    });
  },

  getAll: async (day) => {
    const query = day ? `?day=${day}` : '';
    return apiRequest(`/timetable${query}`, {
      method: 'GET',
    });
  },

  getMySchedule: async () => {
    return apiRequest('/timetable/my-schedule', {
      method: 'GET',
    });
  },

  delete: async (id) => {
    return apiRequest(`/timetable/${id}`, {
      method: 'DELETE',
    });
  },
};

// Complaints API
export const complaintsAPI = {
  create: async (message) => {
    return apiRequest('/complaints', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  getMine: async () => {
    return apiRequest('/complaints/mine', {
      method: 'GET',
    });
  },

  getAll: async () => {
    return apiRequest('/complaints', {
      method: 'GET',
    });
  },

  update: async (id, status) => {
    return apiRequest(`/complaints/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
};

export default {
  auth: authAPI,
  attendance: attendanceAPI,
  permissions: permissionsAPI,
  reports: reportsAPI,
  users: usersAPI,
  timetable: timetableAPI,
  complaints: complaintsAPI,
};
import axios from 'axios';

const api = axios.create({
  baseURL: `http://${window.location.hostname}:4001/api`,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to return data directly
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Extract error message for easier usage in components
    const errorData = error.response?.data;
    const message = errorData?.error || errorData?.message || error.message || 'An unexpected error occurred';

    // Create a new error object with the extracted message
    const customError = new Error(message);
    customError.status = error.response?.status;
    customError.data = errorData;

    return Promise.reject(customError);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  signup: (name, email, password, role, inviteCode, activationCode) =>
    api.post('/auth/signup', { name, email, password, role, inviteCode, activationCode }),
  getMe: () => api.get('/auth/me'),
};

export const usersAPI = {
  getMe: () => api.get('/users/me'),
  getAll: (params) => api.get('/users', { params }),
  create: (name, email, role, uid, id_number, password) =>
    api.post('/users', { name, email, role, uid, id_number, password }),
  update: (id, name, email, role, uid, id_number) =>
    api.put(`/users/${id}`, { name, email, role, uid, id_number }),
  delete: (id) => api.delete(`/users/${id}`),
  toggleStatus: (id) => api.post(`/users/toggle-status/${id}`),
  promote: (id) => api.post(`/users/promote/${id}`),
  demote: (id) => api.post(`/users/demote/${id}`), // Placeholder if needed
  changePassword: (id, newPassword) => api.post(`/users/change-password/${id}`, { newPassword }),
  mapUID: (id, uid) => api.post(`/users/map-uid/${id}`, { uid }),
};

export const attendanceAPI = {
  getToday: (periodId) => api.get('/attendance/today', { params: { period_id: periodId } }),
  getHistory: (studentId) => api.get(`/attendance/history/${studentId}`),
  markManual: (studentId, periodId, status) => api.post('/attendance/manual', { student_id: studentId, period_id: periodId, status }),
  getCSVData: () => api.get('/attendance/csv'),
  getLiveStats: () => api.get('/attendance/live'),
};

export const timetableAPI = {
  getAll: (day) => api.get('/timetable', { params: { day } }),
  getMySchedule: () => api.get('/timetable/my-schedule'),
  create: (day, subject, startTime, endTime, facultyEmail, facultyName, department, className) =>
    api.post('/timetable', {
      day_of_week: day,
      subject,
      start_time: startTime,
      end_time: endTime,
      faculty_email: facultyEmail,
      faculty_name: facultyName,
      department,
      class_name: className
    }),
  delete: (id) => api.delete(`/timetable/${id}`),
};

export const permissionsAPI = {
  getAll: () => api.get('/permissions'),
  getMine: () => api.get('/permissions/mine'),
  create: (reason, startDate, endDate) => api.post('/permissions', { reason, start_date: startDate, end_date: endDate }),
  update: (id, status) => api.put(`/permissions/${id}`, { status }),
};

export const complaintsAPI = {
  getAll: () => api.get('/complaints'),
  getMine: () => api.get('/complaints/mine'),
  create: (message) => api.post('/complaints', { message }),
  update: (id, status) => api.put(`/complaints/${id}`, { status }),
};

export const reportsAPI = {
  getOverallStats: () => api.get('/reports/overall-stats'),
  getFacultyStats: () => api.get('/reports/faculty-stats'),
  getAttendancePercent: (studentId) => api.get(`/reports/attendance-percent/${studentId}`),
  getAttendanceHistory: (studentId) => api.get(`/reports/attendance-history/${studentId}`),
  getSubjectWise: (studentId) => api.get(`/reports/subject-wise/${studentId}`),
};

export const hardwareAPI = {
  uploadCSV: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/hardware/upload-csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

// Export getAttendance for Dashboard component
export const getAttendance = async () => {
  const data = await attendanceAPI.getCSVData();
  if (!data || !Array.isArray(data)) return [];

  // Transform CSV data to match AttendanceTable expected format
  return data.map((record, index) => ({
    studentId: record.regNo || 'N/A',
    studentName: record.name || 'Unknown',
    timestamp: record.time || new Date().toISOString(),
    status: record.status || 'N/A'
  }));
};

export const setToken = (token) => localStorage.setItem('token', token);
export const setStoredUser = (user) => localStorage.setItem('user', JSON.stringify(user));
export const getStoredUser = () => JSON.parse(localStorage.getItem('user'));
export const removeToken = () => localStorage.removeItem('token');
export const removeStoredUser = () => localStorage.removeItem('user');

export default api;

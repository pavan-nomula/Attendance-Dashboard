export const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:4001/api'
    : 'https://smart-attendance-dashboard-backend.onrender.com/api';

export const REFRESH_INTERVAL = 5000; // 5 seconds

import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Safely normalize Base URL to prevent duplicate /api/v1 paths
const resolveBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  const cleanUrl = envUrl.trim().replace(/\/+$/, '');
  return cleanUrl.endsWith('/api/v1') ? cleanUrl : `${cleanUrl}/api/v1`;
};

const api = axios.create({
  baseURL: resolveBaseUrl(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request Interceptor: Auto-attach JWT ──
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor: Handle Errors & 401 ──
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (import.meta.env.DEV || import.meta.env.VITE_DEBUG === 'true') {
      console.warn(
        `[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}:`,
        error.response?.data || error.message
      );
    }

    if (error.response?.status === 401) {
      // Token expired or invalid — clear auth and redirect
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;


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
});

// ── Request Interceptor ──
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    
    // Axios v1.x uses AxiosHeaders class, so .set() is the safe way
    // Omit Authorization header if endpoint is explicitly public
    if (token && !config.isPublic) {
      config.headers.set('Authorization', `Bearer ${token}`);
    } else if (config.isPublic) {
      config.headers.delete('Authorization');
    }

    // Let the browser set Content-Type automatically for FormData
    if (config.data instanceof FormData) {
      config.headers.delete('Content-Type');
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Global flag to prevent multiple redirects on concurrent 401 errors
let isRedirectingToLogin = false;

// ── Response Interceptor ──
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    if (import.meta.env.DEV || import.meta.env.VITE_DEBUG === 'true') {
      console.warn(
        `[API Error] ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}:`,
        error.response?.data || error.message
      );
    }

    // ── Handle 401 Unauthorized ──
    if (error.response?.status === 401) {
      
      // Fix: Do not logout if the failed request was the login endpoint itself
      const isAuthEndpoint = originalRequest?.url?.includes('/auth/login');

      if (!isAuthEndpoint && !isRedirectingToLogin) {
        isRedirectingToLogin = true;
        useAuthStore.getState().logout();

        // SPA-friendly redirect approach via Custom Event
        // (App.jsx me is event ko listen karke 'navigate' call karna best practice hai)
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));

        // Fallback: Agar kisi wajah se event listener attached nahi hai, toh hard redirect
        setTimeout(() => {
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }, 100);

        // Reset flag after delay
        setTimeout(() => {
          isRedirectingToLogin = false;
        }, 1500);
      }
    }

    // ── Handle 403 Forbidden ──
    if (error.response?.status === 403) {
       console.warn('403 Forbidden: You do not have permission to access this resource.');
       // Optional: window.dispatchEvent(new CustomEvent('auth:forbidden'));
    }

    return Promise.reject(error);
  }
);

export default api;
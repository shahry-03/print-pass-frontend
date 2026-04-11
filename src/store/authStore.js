import { create } from 'zustand';

const getStoredAuth = () => {
  try {
    const token = localStorage.getItem('pp_token');
    const role = localStorage.getItem('pp_role');
    const email = localStorage.getItem('pp_email');
    const expiresAt = localStorage.getItem('pp_expiresAt');

    // Check if token has expired
    if (token && expiresAt && Date.now() > Number(expiresAt)) {
      localStorage.removeItem('pp_token');
      localStorage.removeItem('pp_role');
      localStorage.removeItem('pp_email');
      localStorage.removeItem('pp_expiresAt');
      return { token: null, role: null, email: null };
    }

    return { token, role, email };
  } catch {
    return { token: null, role: null, email: null };
  }
};

export const useAuthStore = create((set) => ({
  // Initial state from localStorage
  ...getStoredAuth(),
  isAuthenticated: !!getStoredAuth().token,

  // Login — store token + user info
  setAuth: ({ token, role, email, expiresIn }) => {
    const expiresAt = Date.now() + expiresIn;
    localStorage.setItem('pp_token', token);
    localStorage.setItem('pp_role', role);
    localStorage.setItem('pp_email', email);
    localStorage.setItem('pp_expiresAt', String(expiresAt));

    set({
      token,
      role,
      email,
      isAuthenticated: true,
    });
  },

  // Logout — clear everything
  logout: () => {
    localStorage.removeItem('pp_token');
    localStorage.removeItem('pp_role');
    localStorage.removeItem('pp_email');
    localStorage.removeItem('pp_expiresAt');

    set({
      token: null,
      role: null,
      email: null,
      isAuthenticated: false,
    });
  },
}));

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Auth Store ──────────────────────────────
// Manages JWT token, user role, email, and auth state.
// Persisted in localStorage so login survives page refresh.

interface AuthState {
  token: string | null;
  role: string | null;
  email: string | null;
  isAuthenticated: boolean;
  login: (token: string, role: string, email: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      role: null,
      email: null,
      isAuthenticated: false,

      login: (token, role, email) =>
        set({ token, role, email, isAuthenticated: true }),

      logout: () =>
        set({ token: null, role: null, email: null, isAuthenticated: false }),
    }),
    {
      name: 'printpass-auth', // localStorage key
    }
  )
);

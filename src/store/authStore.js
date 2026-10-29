import { create } from 'zustand';

// ═══════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════

const STORAGE_KEYS = {
  TOKEN: 'pp_token',
  ROLE: 'pp_role',
  EMAIL: 'pp_email',
  EXPIRES_AT: 'pp_expiresAt',
};

const DEFAULT_TTL_MS = 60 * 60 * 1000; // 1 hour fallback if backend omits expiresIn
const MAX_TIMEOUT_MS = 2 ** 31 - 1; // setTimeout overflow guard

// ═══════════════════════════════════════════════════════════
// Storage helpers
// ═══════════════════════════════════════════════════════════

const clearStorage = () => {
  try {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  } catch {
    /* ignore (private mode / quota) */
  }
};

const persistAuth = ({ token, role, email, expiresAt }) => {
  try {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.ROLE, role);
    localStorage.setItem(STORAGE_KEYS.EMAIL, email);
    localStorage.setItem(STORAGE_KEYS.EXPIRES_AT, String(expiresAt));
  } catch {
    /* ignore */
  }
};

/**
 * Reads auth from localStorage with validation:
 *  - Purges on expiry
 *  - Purges on partial/corrupt state (token without role, etc.)
 *  - Returns a fully-normalized snapshot
 */
const getStoredAuth = () => {
  const empty = {
    token: null,
    role: null,
    email: null,
    expiresAt: null,
  };

  try {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const role = localStorage.getItem(STORAGE_KEYS.ROLE);
    const email = localStorage.getItem(STORAGE_KEYS.EMAIL);
    const expiresAtRaw = localStorage.getItem(STORAGE_KEYS.EXPIRES_AT);
    const expiresAt = expiresAtRaw ? Number(expiresAtRaw) : null;

    // No token → nothing to hydrate
    if (!token) {
      // Any orphan role/email without token is corrupt — purge silently
      if (role || email || expiresAtRaw) clearStorage();
      return empty;
    }

    // Invalid expiresAt (NaN or bad number) → treat as broken session
    if (expiresAtRaw && (!Number.isFinite(expiresAt) || expiresAt <= 0)) {
      clearStorage();
      return empty;
    }

    // Expired token → purge immediately
    if (expiresAt && Date.now() >= expiresAt) {
      clearStorage();
      return empty;
    }

    // Partial state (token without role) → corrupt
    if (!role) {
      clearStorage();
      return empty;
    }

    return { token, role, email: email || null, expiresAt: expiresAt || null };
  } catch {
    return empty;
  }
};

// ═══════════════════════════════════════════════════════════
// Proactive expiry scheduler
// ═══════════════════════════════════════════════════════════

let expiryTimer = null;

const clearExpiryTimer = () => {
  if (expiryTimer) {
    clearTimeout(expiryTimer);
    expiryTimer = null;
  }
};

/**
 * Schedules an auto-logout when the token expires.
 * Chunks long delays to avoid setTimeout's 24.8-day overflow.
 */
const scheduleExpiry = (expiresAt) => {
  clearExpiryTimer();
  if (!expiresAt) return;

  const tick = () => {
    const remaining = expiresAt - Date.now();

    if (remaining <= 0) {
      useAuthStore.getState().logout('Token expired');
      // Let the app react (route guard / toast / redirect)
      try {
        window.dispatchEvent(new CustomEvent('auth:unauthorized', {
          detail: { reason: 'expired' },
        }));
      } catch {
        /* ignore (SSR / restricted env) */
      }
      return;
    }

    // Chunked timeout for very long sessions
    expiryTimer = setTimeout(tick, Math.min(remaining, MAX_TIMEOUT_MS));
  };

  expiryTimer = setTimeout(tick, Math.min(expiresAt - Date.now(), MAX_TIMEOUT_MS));
};

// ═══════════════════════════════════════════════════════════
// Store
// ═══════════════════════════════════════════════════════════

const initialAuth = getStoredAuth();

export const useAuthStore = create((set, get) => ({
  // ── State ──
  ...initialAuth,
  isAuthenticated: Boolean(initialAuth.token),
  // Synchronous hydration from localStorage — so we're initialized immediately.
  // Kept for API symmetry with RoleGuard's `isInitialized === false` check.
  isInitialized: true,

  // ── Actions ──

  /**
   * Persist auth after successful login.
   * Falls back to a 1-hour TTL if backend omits `expiresIn`.
   */
  setAuth: ({ token, role, email, expiresIn }) => {
    if (!token || !role) {
      if (import.meta.env.DEV) {
        console.warn(
          '[authStore] setAuth called with missing token or role:',
          { hasToken: Boolean(token), role }
        );
      }
      return;
    }

    const ttl = Number(expiresIn);
    const safeTtl = Number.isFinite(ttl) && ttl > 0 ? ttl : DEFAULT_TTL_MS;
    const expiresAt = Date.now() + safeTtl;

    persistAuth({ token, role, email: email || '', expiresAt });
    scheduleExpiry(expiresAt);

    set({
      token,
      role,
      email: email || null,
      expiresAt,
      isAuthenticated: true,
    });
  },

  /**
   * Clear auth state and storage.
   * @param {string} [reason] - Optional reason for logging / telemetry
   */
  logout: (reason) => {
    clearExpiryTimer();
    clearStorage();

    set({
      token: null,
      role: null,
      email: null,
      expiresAt: null,
      isAuthenticated: false,
    });

    if (reason && import.meta.env.DEV) {
      console.info('[authStore] Logged out:', reason);
    }
  },

  // ── Derived helpers (not persisted) ──

  /**
   * Check if the current user has one of the given roles.
   * @param {string|string[]} roles
   * @returns {boolean}
   */
  hasRole: (roles) => {
    const current = get().role;
    if (!current) return false;
    return Array.isArray(roles) ? roles.includes(current) : roles === current;
  },

  /**
   * Returns true if the token is expired or missing.
   */
  isExpired: () => {
    const { token, expiresAt } = get();
    if (!token) return true;
    if (!expiresAt) return false; // no expiry info → don't assume expired
    return Date.now() >= expiresAt;
  },
}));

// ═══════════════════════════════════════════════════════════
// Cross-tab synchronization
// ═══════════════════════════════════════════════════════════

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    // Ignore unrelated storage changes
    if (!e.key || !Object.values(STORAGE_KEYS).includes(e.key)) return;

    const stored = getStoredAuth();
    const current = useAuthStore.getState();

    const changed =
      stored.token !== current.token ||
      stored.role !== current.role ||
      stored.email !== current.email ||
      stored.expiresAt !== current.expiresAt;

    if (changed) {
      useAuthStore.setState({
        ...stored,
        isAuthenticated: Boolean(stored.token),
      });

      // Re-arm the expiry timer for the new token
      if (stored.expiresAt) scheduleExpiry(stored.expiresAt);
      else clearExpiryTimer();
    }
  });
}

// ── Arm the expiry timer on initial load (if session is still valid) ──
if (initialAuth.expiresAt) {
  scheduleExpiry(initialAuth.expiresAt);
}
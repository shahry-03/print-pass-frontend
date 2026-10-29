import { create } from 'zustand';

// ═══════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════

const STORAGE_KEY = 'pp_theme';
const THEME_ATTR = 'data-theme';
const SYSTEM_QUERY = '(prefers-color-scheme: dark)';

// Valid preferences: 'light' | 'dark' | 'system'
const VALID_PREFERENCES = ['light', 'dark', 'system'];
const DEFAULT_PREFERENCE = 'system';

// ═══════════════════════════════════════════════════════════
// Storage helpers
// ═══════════════════════════════════════════════════════════

/**
 * Reads stored preference.
 * - Returns 'light' / 'dark' / 'system'
 * - Missing/invalid → DEFAULT_PREFERENCE ('system')
 * - Backward compat: old values ('light' / 'dark') are valid
 */
const readPreference = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (VALID_PREFERENCES.includes(saved)) return saved;
  } catch {
    /* ignore (private mode / quota) */
  }
  return DEFAULT_PREFERENCE;
};

const persistPreference = (pref) => {
  try {
    localStorage.setItem(STORAGE_KEY, pref);
  } catch {
    /* ignore */
  }
};

// ═══════════════════════════════════════════════════════════
// System preference helpers
// ═══════════════════════════════════════════════════════════

const getSystemTheme = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light';
  return window.matchMedia(SYSTEM_QUERY).matches ? 'dark' : 'light';
};

// Resolve final theme from preference + system state
const resolveTheme = (pref, sys) => (pref === 'system' ? sys : pref);

// ═══════════════════════════════════════════════════════════
// DOM helper
// ═══════════════════════════════════════════════════════════

const applyTheme = (theme) => {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute(THEME_ATTR, theme);
};

// ═══════════════════════════════════════════════════════════
// Initial snapshot
// ═══════════════════════════════════════════════════════════

const initialPreference = readPreference();
const initialSystemTheme = getSystemTheme();
const initialTheme = resolveTheme(initialPreference, initialSystemTheme);

// ═══════════════════════════════════════════════════════════
// Store
// ═══════════════════════════════════════════════════════════

export const useThemeStore = create((set, get) => ({
  // ── State ──

  /** Resolved theme — always 'light' | 'dark'. Used by UI. */
  theme: initialTheme,

  /** User's explicit choice — 'light' | 'dark' | 'system'. */
  preference: initialPreference,

  /** OS preference snapshot — 'light' | 'dark'. */
  systemTheme: initialSystemTheme,

  // ── Actions ──

  /**
   * Explicitly set the theme preference.
   * @param {'light'|'dark'|'system'} pref
   */
  setTheme: (pref) => {
    if (!VALID_PREFERENCES.includes(pref)) {
      if (import.meta.env.DEV) {
        console.warn(
          `[themeStore] Invalid preference "${pref}". ` +
          `Falling back to "${DEFAULT_PREFERENCE}". Valid: ${VALID_PREFERENCES.join(', ')}.`
        );
      }
      pref = DEFAULT_PREFERENCE;
    }

    const sys = getSystemTheme();
    const resolved = resolveTheme(pref, sys);

    set({ preference: pref, theme: resolved, systemTheme: sys });
    persistPreference(pref);
    applyTheme(resolved);  // side effect OUTSIDE state updater
  },

  /**
   * Flip between 'light' and 'dark'.
   * Note: calling this when preference is 'system' will pin to the opposite
   * of the CURRENT resolved theme (breaking out of system-follow).
   */
  toggleTheme: () => {
    const current = get().theme;
    const next = current === 'dark' ? 'light' : 'dark';

    set({ preference: next, theme: next });
    persistPreference(next);
    applyTheme(next);
  },

  // ── Internal sync helpers (prefixed `_` = not for direct UI use) ──

  /**
   * Called by the matchMedia listener when the OS preference flips.
   * Only affects the resolved theme if the user's preference is 'system'.
   */
  _onSystemThemeChange: (sys) => {
    const state = get();
    set({ systemTheme: sys });

    if (state.preference === 'system' && sys !== state.theme) {
      set({ theme: sys });
      applyTheme(sys);
    }
  },

  /**
   * Called by the `storage` listener when another tab changes the theme.
   * Full re-hydration from a known preference.
   */
  _onExternalPreferenceChange: (pref) => {
    if (!VALID_PREFERENCES.includes(pref)) pref = DEFAULT_PREFERENCE;

    const sys = getSystemTheme();
    const resolved = resolveTheme(pref, sys);

    set({ preference: pref, theme: resolved, systemTheme: sys });
    applyTheme(resolved);
  },

  // ── Initialization ──

  /**
   * Applies the theme to <html> and attaches all listeners.
   * Safe to call multiple times — listeners are attached only once.
   */
  initTheme: () => {
    // Always re-apply (in case inline script didn't run, or state desynced)
    const state = get();
    applyTheme(state.theme);

    if (initialized) return;
    initialized = true;

    // ── OS theme change listener ──
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mq = window.matchMedia(SYSTEM_QUERY);
      const handler = (e) => {
        get()._onSystemThemeChange(e.matches ? 'dark' : 'light');
      };
      // Modern API with legacy fallback (Safari < 14)
      if (mq.addEventListener) mq.addEventListener('change', handler);
      else if (mq.addListener) mq.addListener(handler);
    }

    // ── Cross-tab sync listener ──
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key !== STORAGE_KEY) return;
        // null = key was removed (e.g., user cleared site data) → revert to system
        const nextPref = e.newValue ?? DEFAULT_PREFERENCE;
        get()._onExternalPreferenceChange(nextPref);
      });
    }
  },
}));

// Module-level flag — prevents duplicate listener attachment
let initialized = false;

// ── Apply initial theme to DOM immediately (safety net; inline script also does this) ──
if (typeof document !== 'undefined') {
  applyTheme(initialTheme);
}
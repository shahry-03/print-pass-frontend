import { parseExpirationDate } from '../hooks/useCountdown';
import { STORAGE_KEYS } from './constants';

// ═══════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════

const VOUCHER_STORAGE_KEY = STORAGE_KEYS.VOUCHER;
const VOUCHER_EVENT = 'voucher-updated';
const VOUCHER_SCHEMA_VERSION = 1;

// Purge windows
const MAX_STALE_AFTER_EXPIRY_MS = 48 * 60 * 60 * 1000;   // 48h past expiry
const MAX_LIFETIME_NO_EXPIRY_MS  = 7 * 24 * 60 * 60 * 1000; // 7 days if no expiresAt

// Reasonable caps to avoid localStorage abuse
const MAX_FILENAME_LENGTH = 200;

const isBrowser = typeof window !== 'undefined';

// ═══════════════════════════════════════════════════════════
// Internal helpers
// ═══════════════════════════════════════════════════════════

const dispatch = (action, voucher = null, reason = null) => {
  if (!isBrowser) return;
  try {
    window.dispatchEvent(
      new CustomEvent(VOUCHER_EVENT, {
        detail: { action, voucher, reason },
      })
    );
  } catch {
    // Older browsers: fall back to plain Event
    try {
      window.dispatchEvent(new Event(VOUCHER_EVENT));
    } catch {
      /* ignore */
    }
  }
};

/** Read raw serialized voucher. Prefer session (fast), fall back to local. */
const readRaw = () => {
  try {
    const s = sessionStorage.getItem(VOUCHER_STORAGE_KEY);
    if (s) return s;
  } catch { /* ignore */ }
  try {
    return localStorage.getItem(VOUCHER_STORAGE_KEY);
  } catch {
    return null;
  }
};

/**
 * Persist serialized voucher.
 * @param {string} serialized
 * @param {{ session?: boolean, local?: boolean }} [target]
 *   Defaults to writing both. Pass `{ local: false }` to avoid cross-tab
 *   storage events during `loadVoucher`'s re-cache step.
 */
const writeRaw = (serialized, { session = true, local = true } = {}) => {
  let ok = false;
  if (session) {
    try {
      sessionStorage.setItem(VOUCHER_STORAGE_KEY, serialized);
      ok = true;
    } catch { /* ignore */ }
  }
  if (local) {
    try {
      localStorage.setItem(VOUCHER_STORAGE_KEY, serialized);
      ok = true;
    } catch { /* ignore */ }
  }
  return ok;
};

/** Silent purge — no event dispatch (used from `loadVoucher`). */
const purgeSilent = () => {
  try { sessionStorage.removeItem(VOUCHER_STORAGE_KEY); } catch { /* ignore */ }
  try { localStorage.removeItem(VOUCHER_STORAGE_KEY); } catch { /* ignore */ }
};

/** Normalize + validate a secret key. Returns trimmed string or null. */
const normalizeSecretKey = (key) => {
  if (key === null || key === undefined) return null;
  const str = String(key).trim();
  return str || null;
};

/** Truncate fileName safely (avoid localStorage bloat). */
const normalizeFileName = (name) => {
  const raw = typeof name === 'string' ? name.trim() : '';
  if (!raw) return 'Uploaded Document';
  if (raw.length <= MAX_FILENAME_LENGTH) return raw;
  return `${raw.slice(0, MAX_FILENAME_LENGTH - 3)}...`;
};

/** Clamp savedAt / timestamps to sane values. */
const normalizeTimestamp = (value, { defaultToNow = false } = {}) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) {
    return defaultToNow ? Date.now() : null;
  }
  // Reject future timestamps beyond 60s tolerance (tampering / clock skew)
  const now = Date.now();
  if (n > now + 60_000) return defaultToNow ? now : null;
  return n;
};

/** Returns true if the voucher should be purged due to staleness. */
const isStale = (voucher) => {
  const now = Date.now();

  if (voucher.expiresAt) {
    const exp = parseExpirationDate(voucher.expiresAt);
    if (exp && now - exp.getTime() > MAX_STALE_AFTER_EXPIRY_MS) return true;
  } else if (voucher.savedAt) {
    if (now - voucher.savedAt > MAX_LIFETIME_NO_EXPIRY_MS) return true;
  }

  return false;
};

// ═══════════════════════════════════════════════════════════
// Public API
// ═══════════════════════════════════════════════════════════

/**
 * Save customer voucher to storage.
 * Syncs to both sessionStorage (fast) and localStorage (cross-tab).
 *
 * @param {Object} jobData
 * @returns {boolean} True if persisted successfully
 */
export const saveVoucher = (jobData) => {
  if (!jobData || typeof jobData !== 'object') return false;

  const secretKey = normalizeSecretKey(jobData.secretKey);
  if (!secretKey) return false;

  const payload = {
    _v: VOUCHER_SCHEMA_VERSION,
    id: jobData.id ?? null,
    secretKey,
    fileName: normalizeFileName(jobData.fileName),
    fileSize: Number.isFinite(Number(jobData.fileSize))
      ? Number(jobData.fileSize)
      : null,
    jobStatus:
      typeof jobData.jobStatus === 'string'
        ? jobData.jobStatus.toUpperCase()
        : 'PENDING',
    totalPages: Number.isFinite(Number(jobData.totalPages))
      ? Math.max(0, Math.floor(Number(jobData.totalPages)))
      : (Number.isFinite(Number(jobData.pageCount)) ? Math.max(0, Math.floor(Number(jobData.pageCount))) : 0),
    conversionStatus:
      typeof jobData.conversionStatus === 'string'
        ? jobData.conversionStatus.toUpperCase()
        : null,
    convertedPdfUrl:
      typeof jobData.convertedPdfUrl === 'string' && jobData.convertedPdfUrl
        ? jobData.convertedPdfUrl
        : null,
    fileType: typeof jobData.fileType === 'string' ? jobData.fileType : null,
    expiresAt: jobData.expiresAt ?? null,
    createdAt: jobData.createdAt ?? new Date().toISOString(),
    savedAt: Date.now(),
  };

  const ok = writeRaw(JSON.stringify(payload));

  if (!ok) {
    if (import.meta.env.DEV) {
      console.warn('[VoucherStorage] Failed to persist voucher (storage unavailable).');
    }
    return false;
  }

  dispatch('save', payload);
  return true;
};

/**
 * Load customer voucher from storage.
 * Returns a validated, normalized voucher — or null.
 * Silent-purges stale/corrupt entries (no event dispatch, avoids loops).
 *
 * @returns {Object|null}
 */
export const loadVoucher = () => {
  const raw = readRaw();
  if (!raw) return null;

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    purgeSilent();
    return null;
  }

  if (!parsed || typeof parsed !== 'object') {
    purgeSilent();
    return null;
  }

  // Future schema — can't safely read. Preserve for potential downgrade.
  if (parsed._v && parsed._v > VOUCHER_SCHEMA_VERSION) {
    return null;
  }

  const secretKey = normalizeSecretKey(parsed.secretKey);
  if (!secretKey) {
    purgeSilent();
    return null;
  }

  const voucher = {
    _v: VOUCHER_SCHEMA_VERSION,
    id: parsed.id ?? null,
    secretKey,
    fileName: normalizeFileName(parsed.fileName),
    fileSize: Number.isFinite(Number(parsed.fileSize))
      ? Number(parsed.fileSize)
      : null,
    jobStatus:
      typeof parsed.jobStatus === 'string'
        ? parsed.jobStatus.toUpperCase()
        : 'PENDING',
    totalPages: Number.isFinite(Number(parsed.totalPages))
      ? Math.max(0, Math.floor(Number(parsed.totalPages)))
      : (Number.isFinite(Number(parsed.pageCount)) ? Math.max(0, Math.floor(Number(parsed.pageCount))) : 0),
    conversionStatus:
      typeof parsed.conversionStatus === 'string'
        ? parsed.conversionStatus.toUpperCase()
        : null,
    convertedPdfUrl:
      typeof parsed.convertedPdfUrl === 'string' && parsed.convertedPdfUrl
        ? parsed.convertedPdfUrl
        : null,
    fileType: typeof parsed.fileType === 'string' ? parsed.fileType : null,
    expiresAt: parsed.expiresAt ?? null,
    createdAt: parsed.createdAt ?? null,
    savedAt: normalizeTimestamp(parsed.savedAt, { defaultToNow: true }),
  };

  if (isStale(voucher)) {
    purgeSilent();
    return null;
  }

  // Fast per-tab cache — DO NOT write to localStorage here.
  // Writing to localStorage fires cross-tab `storage` events, which would
  // re-invoke `loadVoucher` in listeners and cause an infinite loop.
  writeRaw(JSON.stringify(voucher), { session: true, local: false });

  return voucher;
};

/**
 * Remove saved voucher from storage and notify listeners.
 *
 * @param {string} [reason='user'] - Reason for logging/telemetry
 */
export const clearVoucher = (reason = 'user') => {
  purgeSilent();
  dispatch('clear', null, reason);
};

/**
 * Quick existence + validity check.
 * Note: calls `loadVoucher()` internally — but that's fine because
 * voucher payloads are tiny (~300 bytes) and parsing is <1ms.
 *
 * @returns {boolean}
 */
export const hasVoucher = () => loadVoucher() !== null;

/**
 * Check if the voucher's expiresAt is in the past.
 * Invalid/missing expiresAt → false (not expired).
 *
 * @param {Object|null} voucher
 * @returns {boolean}
 */
export const isVoucherExpired = (voucher) => {
  if (!voucher?.expiresAt) return false;
  const exp = parseExpirationDate(voucher.expiresAt);
  if (!exp) return false;
  return Date.now() >= exp.getTime();
};

/**
 * Subscribe to voucher changes in the current tab AND other tabs.
 * Handles both custom VOUCHER_EVENT and cross-tab `storage` events.
 *
 * @param {(voucher: Object|null, detail: Object) => void} callback
 * @param {{ immediate?: boolean }} [options] - Call callback once with current value
 * @returns {() => void} Unsubscribe function
 */
export const subscribeVoucher = (callback, { immediate = false } = {}) => {
  if (!isBrowser || typeof callback !== 'function') return () => {};

  const handleCustom = (event) => {
    callback(event?.detail?.voucher ?? null, event?.detail || {});
  };

  const handleStorage = (event) => {
    if (event.key !== VOUCHER_STORAGE_KEY) return;
    callback(loadVoucher(), { action: 'storage-sync' });
  };

  window.addEventListener(VOUCHER_EVENT, handleCustom);
  window.addEventListener('storage', handleStorage);

  if (immediate) callback(loadVoucher(), { action: 'initial' });

  return () => {
    window.removeEventListener(VOUCHER_EVENT, handleCustom);
    window.removeEventListener('storage', handleStorage);
  };
};

// Export event name for consumers
export { VOUCHER_EVENT };
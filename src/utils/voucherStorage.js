import { parseExpirationDate } from '../hooks/useCountdown';

const VOUCHER_STORAGE_KEY = 'pp_customer_voucher';

/**
 * Save customer voucher to storage.
 * Synchronizes with both sessionStorage and localStorage for seamless cross-tab & reload experience.
 */
export const saveVoucher = (jobData) => {
  if (!jobData || !jobData.secretKey) return;

  try {
    const payload = {
      id: jobData.id || null,
      secretKey: String(jobData.secretKey).trim(),
      fileName: jobData.fileName || 'Uploaded Document',
      fileSize: jobData.fileSize || null,
      jobStatus: jobData.jobStatus || 'PENDING',
      expiresAt: jobData.expiresAt || null,
      createdAt: jobData.createdAt || new Date().toISOString(),
      savedAt: Date.now(),
    };

    const serialized = JSON.stringify(payload);
    try {
      sessionStorage.setItem(VOUCHER_STORAGE_KEY, serialized);
    } catch {}
    try {
      localStorage.setItem(VOUCHER_STORAGE_KEY, serialized);
    } catch {}

    // Dispatch update event for active views in the current window
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('voucher-updated'));
    }
  } catch (err) {
    console.warn('[VoucherStorage] Failed to save voucher:', err);
  }
};

/**
 * Load customer voucher from storage.
 * Checks sessionStorage first, falls back to localStorage.
 * Validates payload structure safely.
 *
 * @returns {Object|null} Valid voucher object or null
 */
export const loadVoucher = () => {
  try {
    let raw = null;
    try {
      raw = sessionStorage.getItem(VOUCHER_STORAGE_KEY);
    } catch {}

    if (!raw) {
      try {
        raw = localStorage.getItem(VOUCHER_STORAGE_KEY);
      } catch {}
    }

    if (!raw) return null;

    const parsed = JSON.parse(raw);

    // Minimum validation: secretKey must be present
    if (!parsed || !parsed.secretKey || typeof parsed.secretKey !== 'string') {
      clearVoucher();
      return null;
    }

    // If expiration timestamp is severely stale (e.g., expired > 48h ago), purge it
    if (parsed.expiresAt) {
      const expDate = parseExpirationDate(parsed.expiresAt);
      if (expDate && Date.now() - expDate.getTime() > 48 * 3600 * 1000) {
        clearVoucher();
        return null;
      }
    }

    // Ensure it's cached in sessionStorage for fast access in this tab
    try {
      sessionStorage.setItem(VOUCHER_STORAGE_KEY, JSON.stringify(parsed));
    } catch {}

    return parsed;
  } catch (err) {
    console.warn('[VoucherStorage] Failed to read voucher from storage:', err);
    clearVoucher();
    return null;
  }
};

/**
 * Remove saved voucher from both sessionStorage and localStorage.
 */
export const clearVoucher = () => {
  try {
    sessionStorage.removeItem(VOUCHER_STORAGE_KEY);
  } catch {}
  try {
    localStorage.removeItem(VOUCHER_STORAGE_KEY);
  } catch {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('voucher-updated'));
  }
};

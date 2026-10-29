/**
 * PrintPass — Utilities
 *
 * Central helper functions for error handling, formatting,
 * string/file manipulation, and browser APIs.
 *
 * Organized by category for easy discovery.
 */

// ═══════════════════════════════════════════════════════════
// Error Handling
// ═══════════════════════════════════════════════════════════

/**
 * Check if an error was caused by request cancellation
 * (axios CanceledError, native AbortError, or fetch AbortError).
 */
export const isAbortError = (error) =>
  error?.name === 'CanceledError' ||
  error?.name === 'AbortError' ||
  error?.code === 'ERR_CANCELED';

/**
 * Extract a user-friendly error message from any error shape:
 * Axios errors, plain Error, string throws, network failures.
 *
 * @param {unknown} error
 * @returns {string}
 */
export const getErrorMessage = (error) => {
  if (!error) return 'An unexpected error occurred';

  // Plain string throw
  if (typeof error === 'string') return error;

  // Cancellation
  if (isAbortError(error)) return 'Request cancelled.';

  // Axios errors with a response
  if (error.response) {
    const { data, status } = error.response;

    // Backend ErrorResponse: { message: '...' }
    if (data?.message && typeof data.message === 'string') {
      return data.message;
    }

    // Validation errors in a map or array
    if (data?.details) {
      if (Array.isArray(data.details)) {
        const first = data.details[0];
        const msg = typeof first === 'string' ? first : first?.message;
        if (msg) return msg;
      } else {
        const firstValue = Object.values(data.details)[0];
        if (firstValue) return String(firstValue);
      }
      return 'Validation failed';
    }

    // Plain string response body
    if (typeof data === 'string' && data.length > 0 && data.length < 200) {
      return data;
    }

    // HTTP status fallbacks
    switch (status) {
      case 400: return 'Invalid request. Please check your input.';
      case 401: return 'Your session expired. Please sign in again.';
      case 403: return 'You do not have permission to do this.';
      case 404: return 'Not found.';
      case 409: return 'This item already exists.';
      case 422: return 'Validation failed. Please check your input.';
      case 429: return 'Too many requests. Please wait a moment.';
      default:
        if (status >= 500) return 'Server error. Please try again later.';
    }
  }

  // Timeout (axios ECONNABORTED)
  if (error.code === 'ECONNABORTED') {
    return 'Request timed out. Please try again.';
  }

  // Network failure (no response, has request)
  if (error.message === 'Network Error' || error.request) {
    return 'Unable to connect to server. Please check your connection.';
  }

  // Generic Error
  return error.message || 'An unexpected error occurred';
};


// ═══════════════════════════════════════════════════════════
// Date / Time Formatting
// ═══════════════════════════════════════════════════════════

/**
 * Internal — parse any value into a valid Date or null.
 */
const safeDate = (value) => {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

/**
 * Format a date (YYYY-MM-DD, ISO string, Date, timestamp) as
 * "Oct 24, 2026". Returns "—" for invalid/missing input.
 *
 * @param {string|number|Date} value
 * @param {Intl.DateTimeFormatOptions & { locale?: string }} [options]
 */
export const formatDate = (value, options = {}) => {
  const d = safeDate(value);
  if (!d) return '—';

  const { locale = 'en-US', ...rest } = options;
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...rest,
  });
};

/**
 * Format a datetime as "Oct 24, 2026, 04:40 PM".
 */
export const formatDateTime = (value, options = {}) => {
  const d = safeDate(value);
  if (!d) return '—';

  const { locale = 'en-US', ...rest } = options;
  return d.toLocaleString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...rest,
  });
};

/**
 * Format a timestamp as relative time: "2 minutes ago", "in 3 hours".
 */
export const formatRelativeTime = (value) => {
  const d = safeDate(value);
  if (!d) return '—';

  const diffMs = d.getTime() - Date.now(); // negative = past
  const absMs = Math.abs(diffMs);

  const SEC = 1000;
  const MIN = 60 * SEC;
  const HOUR = 60 * MIN;
  const DAY = 24 * HOUR;
  const WEEK = 7 * DAY;
  const MONTH = 30 * DAY;
  const YEAR = 365 * DAY;

  const pick = (value_, unit) => {
    try {
      return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(value_, unit);
    } catch {
      const plural = Math.abs(value_) === 1 ? unit : `${unit}s`;
      return value_ < 0
        ? `${Math.abs(value_)} ${plural} ago`
        : `in ${value_} ${plural}`;
    }
  };

  if (absMs < MIN) return pick(Math.round(diffMs / SEC), 'second');
  if (absMs < HOUR) return pick(Math.round(diffMs / MIN), 'minute');
  if (absMs < DAY) return pick(Math.round(diffMs / HOUR), 'hour');
  if (absMs < WEEK) return pick(Math.round(diffMs / DAY), 'day');
  if (absMs < MONTH) return pick(Math.round(diffMs / WEEK), 'week');
  if (absMs < YEAR) return pick(Math.round(diffMs / MONTH), 'month');
  return pick(Math.round(diffMs / YEAR), 'year');
};


// ═══════════════════════════════════════════════════════════
// File / Size Formatting
// ═══════════════════════════════════════════════════════════

/**
 * Format raw bytes into a human-readable size (B / KB / MB / GB / TB).
 * Handles 0 → "0 B" and undefined → "".
 *
 * @param {number} bytes
 * @param {number} [decimals=1] - Digits after the decimal point
 */
export const formatFileSize = (bytes, decimals = 1) => {
  if (bytes === null || bytes === undefined || bytes === '') return '';

  const n = Number(bytes);
  if (!Number.isFinite(n) || n < 0) return '';
  if (n < 1024) return `${Math.round(n)} B`;

  const units = ['KB', 'MB', 'GB', 'TB', 'PB'];
  let size = n;
  let unit = -1;

  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit++;
  }

  // Strip trailing zeros ("2.0" → "2")
  return `${parseFloat(size.toFixed(decimals))} ${units[unit]}`;
};

/**
 * Truncate a filename while preserving its extension.
 * Handles edge cases: no extension, short limits, empty names.
 *
 * @param {string} name
 * @param {number} [maxLength=30]
 * @returns {string}
 */
export const truncateFileName = (name, maxLength = 30) => {
  if (!name || typeof name !== 'string') return '';
  if (name.length <= maxLength) return name;
  if (maxLength < 4) return name.slice(0, maxLength);

  // Find extension (only if it looks like a real extension)
  const lastDot = name.lastIndexOf('.');
  const hasExt = lastDot > 0 && lastDot < name.length - 1;
  const ext = hasExt ? name.slice(lastDot) : ''; // includes dot
  const base = hasExt ? name.slice(0, lastDot) : name;

  // Not enough room for at least "a..." + ext
  const minKeep = ext.length + 4;
  if (maxLength < minKeep) {
    return name.slice(0, maxLength);
  }

  const baseBudget = maxLength - ext.length - 3; // 3 for "..."
  return `${base.slice(0, baseBudget)}...${ext}`;
};


// ═══════════════════════════════════════════════════════════
// String Utilities
// ═══════════════════════════════════════════════════════════

/**
 * Truncate arbitrary text with an ellipsis.
 */
export const truncateText = (text, maxLength = 50, suffix = '...') => {
  if (!text || typeof text !== 'string') return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, Math.max(0, maxLength - suffix.length)) + suffix;
};

/**
 * Capitalize the first letter of a string.
 */
export const capitalize = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Get the first letter(s) of a name (for avatars).
 * Handles empty/multi-word names.
 *
 * @param {string} name
 * @param {number} [max=2] - Max initials to return
 * @returns {string} - e.g. "JD" for "John Doe", "?" if invalid
 */
export const getInitials = (name, max = 2) => {
  if (!name || typeof name !== 'string') return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return parts
    .slice(0, max)
    .map((p) => p.charAt(0).toUpperCase())
    .join('');
};

/**
 * Format an E.164-style phone number for display.
 * "+923001234567" → "+92 300 1234567"
 * Falls back to the sanitized input if unrecognized.
 */
export const formatPhoneDisplay = (phone) => {
  if (!phone) return '';

  const digits = String(phone).replace(/[^\d+]/g, '');
  if (!digits) return '';

  // +XX XXX XXXXXXX or +XX XXX XXX XXXX
  const match = digits.match(/^\+(\d{1,3})(\d{3})(\d+)$/);
  if (match) {
    return `+${match[1]} ${match[2]} ${match[3]}`;
  }

  return digits;
};


// ═══════════════════════════════════════════════════════════
// Browser / DOM Utilities
// ═══════════════════════════════════════════════════════════

/**
 * Copy text to clipboard.
 * Uses the modern Clipboard API with a fallback for insecure
 * contexts (HTTP) and older browsers.
 *
 * @param {string} text
 * @returns {Promise<boolean>}
 */
export const copyToClipboard = async (text) => {
  if (text === null || text === undefined) return false;
  const str = String(text);

  // Modern API (secure contexts only)
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(str);
      return true;
    } catch {
      /* fall through to legacy fallback */
    }
  }

  // Fallback — works on HTTP and older browsers
  try {
    const el = document.createElement('textarea');
    el.value = str;
    el.setAttribute('readonly', '');
    el.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;';
    document.body.appendChild(el);
    el.select();
    el.setSelectionRange(0, str.length); // required on iOS
    const ok = document.execCommand('copy');
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
};

/**
 * Download a Blob/File as a file with the given name.
 * Revokes the object URL after the download is triggered.
 */
export const downloadBlob = (blob, filename) => {
  if (!blob || typeof document === 'undefined') return false;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || 'download';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Revoke after a tick to allow the download to start
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
};

/**
 * Trigger a download from a URL (e.g. signed PDF URL from backend).
 */
export const downloadUrl = (url, filename) => {
  if (!url || typeof document === 'undefined') return false;

  const link = document.createElement('a');
  link.href = url;
  if (filename) link.download = filename;
  link.rel = 'noopener noreferrer';
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return true;
};

/**
 * Native share API with clipboard fallback.
 * Resolves to `true` if shared or copied, `false` if cancelled/failed.
 *
 * @param {{ title?: string, text?: string, url?: string }} data
 * @returns {Promise<boolean>}
 */
export const shareLink = async (data) => {
  // Native share (mobile + some desktops)
  if (navigator.share) {
    try {
      await navigator.share(data);
      return true;
    } catch (err) {
      // User cancelled — return false (don't fall back)
      if (err?.name === 'AbortError') return false;
      // Otherwise fall through to clipboard fallback
    }
  }

  // Fallback: copy URL to clipboard
  if (data?.url) {
    return copyToClipboard(data.url);
  }

  return false;
};


// ═══════════════════════════════════════════════════════════
// Async Utilities
// ═══════════════════════════════════════════════════════════

/**
 * Sleep for a given number of milliseconds.
 */
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Debounce a function. Returns a wrapped function with `.cancel()`.
 *
 * @example
 *   const search = debounce((q) => api.search(q), 300);
 *   search('h'); search('he'); search('hel'); // only 'hel' fires after 300ms
 */
export const debounce = (fn, delay = 300) => {
  let timer;
  const debounced = (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
  debounced.cancel = () => clearTimeout(timer);
  return debounced;
};

/**
 * Throttle a function to run at most once per `limit` ms.
 */
export const throttle = (fn, limit = 300) => {
  let inThrottle = false;
  return (...args) => {
    if (inThrottle) return;
    fn(...args);
    inThrottle = true;
    setTimeout(() => {
      inThrottle = false;
    }, limit);
  };
};

/**
 * Retry an async function with exponential backoff.
 * Aborts immediately on cancellation.
 *
 * @param {() => Promise<any>} fn
 * @param {{ attempts?: number, delay?: number, backoff?: number }} [options]
 */
export const retry = async (fn, { attempts = 3, delay = 500, backoff = 2 } = {}) => {
  let lastError;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (isAbortError(err)) throw err; // never retry cancellations
      if (i < attempts - 1) {
        await sleep(delay * Math.pow(backoff, i));
      }
    }
  }
  throw lastError;
};


// ═══════════════════════════════════════════════════════════
// Misc Utilities
// ═══════════════════════════════════════════════════════════

/**
 * Safely parse JSON, returning a fallback on error.
 */
export const safeJsonParse = (str, fallback = null) => {
  if (!str || typeof str !== 'string') return fallback;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
};

/**
 * Clamp a number between min and max.
 */
export const clamp = (value, min, max) =>
  Math.min(Math.max(Number(value) || 0, min), max);
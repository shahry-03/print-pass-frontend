/**
 * PrintPass — Central Constants
 *
 * Single source of truth for roles, statuses, validation rules,
 * storage keys, API endpoints, and app-wide configuration.
 *
 * All exported objects are frozen to prevent accidental mutation.
 */

// ═══════════════════════════════════════════════════════════
// Roles
// ═══════════════════════════════════════════════════════════

/**
 * Canonical user roles — must match backend values exactly.
 * @readonly
 */
export const ROLES = Object.freeze({
  ADMIN: 'ADMIN',
  PRINT_SHOP: 'PRINT_SHOP',
});

/**
 * Human-readable labels for roles (UI display).
 * @readonly
 */
export const ROLE_LABELS = Object.freeze({
  [ROLES.ADMIN]: 'Platform Administrator',
  [ROLES.PRINT_SHOP]: 'Shop Owner',
});

/**
 * Where each role lands after login / on auth failure.
 * Single source of truth — reused by RoleGuard, LoginPage, Navbar.
 * @readonly
 */
export const ROLE_DASHBOARD_MAP = Object.freeze({
  [ROLES.ADMIN]: '/admin',
  [ROLES.PRINT_SHOP]: '/shop',
});

/**
 * Portal label shown in the navbar breadcrumb.
 * @readonly
 */
export const ROLE_PORTAL_LABELS = Object.freeze({
  [ROLES.ADMIN]: 'Admin',
  [ROLES.PRINT_SHOP]: 'Shop Portal',
});

/** @param {string} role */
export const isValidRole = (role) => Object.values(ROLES).includes(role);

/** @param {string} role */
export const isAdmin = (role) => role === ROLES.ADMIN;

/** @param {string} role */
export const isPrintShop = (role) => role === ROLES.PRINT_SHOP;

// ═══════════════════════════════════════════════════════════
// Job Statuses
// ═══════════════════════════════════════════════════════════

/**
 * Canonical job statuses — must match backend values.
 * @readonly
 */
export const JOB_STATUS = Object.freeze({
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  READY: 'READY',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
});

/**
 * Human-readable labels for job statuses.
 * @readonly
 */
export const JOB_STATUS_LABELS = Object.freeze({
  [JOB_STATUS.PENDING]: 'Pending',
  [JOB_STATUS.PROCESSING]: 'Processing',
  [JOB_STATUS.READY]: 'Ready for Pickup',
  [JOB_STATUS.COMPLETED]: 'Completed',
  [JOB_STATUS.CANCELLED]: 'Cancelled',
});

/**
 * Badge variant for each job status.
 * @readonly
 */
export const JOB_STATUS_COLORS = Object.freeze({
  [JOB_STATUS.PENDING]: 'warning',
  [JOB_STATUS.PROCESSING]: 'info',
  [JOB_STATUS.READY]: 'success',
  [JOB_STATUS.COMPLETED]: 'success',
  [JOB_STATUS.CANCELLED]: 'danger',
});

/** @param {string} status */
export const isValidJobStatus = (status) =>
  Object.values(JOB_STATUS).includes(status);

/**
 * Get display label for a job status (falls back to raw value).
 * @param {string} status
 */
export const getJobStatusLabel = (status) =>
  JOB_STATUS_LABELS[status] ?? status;

/**
 * Get badge variant for a job status (falls back to 'neutral').
 * @param {string} status
 */
export const getJobStatusVariant = (status) =>
  JOB_STATUS_COLORS[status] ?? 'neutral';

// ═══════════════════════════════════════════════════════════
// Validation
// ═══════════════════════════════════════════════════════════

/**
 * Regex patterns for client-side validation.
 * Keep in sync with backend validation rules.
 * @readonly
 */
export const VALIDATION = Object.freeze({
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[A-Za-z])(?=.*\d).{8,}$/,
  PHONE: /^\+?[0-9]{10,15}$/,
  PIN: /^[0-9]{6}$/,
});

/**
 * Common string-validation limits (matches backend VARCHAR limits).
 * @readonly
 */
export const VALIDATION_LIMITS = Object.freeze({
  EMAIL_MAX: 254,
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 128,
  SHOP_NAME_MAX: 100,
  OWNER_NAME_MAX: 100,
  ADDRESS_MAX: 255,
  CITY_MAX: 100,
});

/**
 * Phone sanitizer — strips spaces, dashes, parentheses.
 * Must match backend sanitization for consistency.
 * @param {string} phone
 * @returns {string}
 */
export const sanitizePhone = (phone) =>
  String(phone ?? '').replace(/[\s\-()]/g, '');

/** @param {string} email */
export const isValidEmail = (email) =>
  typeof email === 'string' && VALIDATION.EMAIL.test(email.trim());

/** @param {string} phone (sanitizes first) */
export const isValidPhone = (phone) =>
  VALIDATION.PHONE.test(sanitizePhone(phone));

/** @param {string} password */
export const isStrongPassword = (password) =>
  typeof password === 'string' && VALIDATION.PASSWORD.test(password);

/** @param {string|number} pin */
export const isValidPin = (pin) => VALIDATION.PIN.test(String(pin ?? '').trim());

// ═══════════════════════════════════════════════════════════
// PIN / OTP config
// ═══════════════════════════════════════════════════════════

/**
 * Pickup PIN configuration.
 * @readonly
 */
export const PIN_CONFIG = Object.freeze({
  LENGTH: 6,
  RESEND_COOLDOWN_MS: 60_000,
  MAX_ATTEMPTS_HINT: 'If your PIN is incorrect, ask the shop clerk to verify it.',
});

/**
 * OTP resend cooldown (for OtpVerifyPage).
 * @readonly
 */
export const OTP_CONFIG = Object.freeze({
  LENGTH: 6,
  RESEND_COOLDOWN_MS: 60_000,
  RESEND_STORAGE_KEY: 'pp_otp_resend_until',
});

// ═══════════════════════════════════════════════════════════
// File Upload
// ═══════════════════════════════════════════════════════════

/**
 * File upload limits and accepted types.
 * @readonly
 */
export const FILE_UPLOAD = Object.freeze({
  MAX_SIZE_BYTES: 50 * 1024 * 1024, // 50 MB
  UPLOAD_TIMEOUT_MS: 120_000, // 2 minutes
  ACCEPTED: Object.freeze({
    'application/pdf': ['.pdf'],
    'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/vnd.ms-powerpoint': ['.ppt'],
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
  }),
});

// ═══════════════════════════════════════════════════════════
// HTTP / API
// ═══════════════════════════════════════════════════════════

/**
 * Common HTTP status codes — used in interceptors / conditional error UX.
 * @readonly
 */
export const HTTP_STATUS = Object.freeze({
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
});

/**
 * API base path (relative to axios baseURL).
 * @readonly
 */
export const API_ROUTES = Object.freeze({
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    REFRESH: '/auth/refresh',
  },
  SHOP: {
    REGISTER: '/shops/register',
    MY_SHOPS: '/shops/my-shops',
    UPDATE: (id) => `/shops/${encodeURIComponent(id)}`,
  },
  ADMIN: {
    SHOPS: '/admin/shops',
    VERIFY: (id) => `/admin/shops/${encodeURIComponent(id)}/verify`,
    TOGGLE_STATUS: (id) => `/admin/shops/${encodeURIComponent(id)}/toggle-status`,
  },
  JOB: {
    UPLOAD: '/jobs/upload',
    REPRINT: (pin) => `/jobs/reprint/${encodeURIComponent(pin)}`,
    BY_PIN: (pin) => `/jobs/${encodeURIComponent(pin)}`,
    PRINT: (pin) => `/jobs/${encodeURIComponent(pin)}/print`,
  },
  OTP: {
    VERIFY: '/otp/verify',
    RESEND: '/otp/resend',
  },
});

// ═══════════════════════════════════════════════════════════
// Storage keys
// ═══════════════════════════════════════════════════════════

/**
 * All localStorage / sessionStorage keys.
 * Keep central so bulk-clear and testing work cleanly.
 * @readonly
 */
export const STORAGE_KEYS = Object.freeze({
  TOKEN: 'pp_token',
  ROLE: 'pp_role',
  EMAIL: 'pp_email',
  EXPIRES_AT: 'pp_expiresAt',
  REMEMBERED_EMAIL: 'pp_remembered_email',
  THEME: 'pp_theme',
  VOUCHER: 'pp_customer_voucher',
  OTP_RESEND_UNTIL: 'pp_otp_resend_until',
});

// ═══════════════════════════════════════════════════════════
// Theme
// ═══════════════════════════════════════════════════════════

/**
 * Theme values and OS-color-scheme query.
 * @readonly
 */
export const THEMES = Object.freeze({
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
});

/** @readonly */
export const THEME_PREFERENCES = Object.freeze([
  THEMES.LIGHT,
  THEMES.DARK,
  THEMES.SYSTEM,
]);

/** @readonly */
export const SYSTEM_THEME_QUERY = '(prefers-color-scheme: dark)';

// ═══════════════════════════════════════════════════════════
// Responsive / Layout
// ═══════════════════════════════════════════════════════════

/**
 * Breakpoints — must match media queries in CSS.
 * @readonly
 */
export const BREAKPOINTS = Object.freeze({
  XS: 480,
  SM: 600,
  MD: 768,   // mobile → desktop (sidebar drawer)
  LG: 960,
  XL: 1024,  // wide desktop
});

/**
 * Check if we're currently on a mobile-sized viewport.
 * @returns {boolean}
 */
export const isMobileViewport = () =>
  typeof window !== 'undefined' && window.innerWidth < BREAKPOINTS.MD;

/**
 * Check if we're currently on a desktop viewport.
 * @returns {boolean}
 */
export const isDesktopViewport = () =>
  typeof window !== 'undefined' && window.innerWidth >= BREAKPOINTS.MD;

// ═══════════════════════════════════════════════════════════
// Error messages (centralized)
// ═══════════════════════════════════════════════════════════

/**
 * Common user-facing error messages.
 * @readonly
 */
export const ERROR_MESSAGES = Object.freeze({
  NETWORK: 'Unable to connect to server. Please check your connection.',
  UNKNOWN: 'An unexpected error occurred. Please try again.',
  UNAUTHORIZED: 'Your session expired. Please sign in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  RATE_LIMITED: 'Too many requests. Please wait a moment before retrying.',
  FILE_TOO_LARGE: 'File is too large. Please upload a smaller file.',
  FILE_INVALID_TYPE: 'File type not supported.',
  FILE_EMPTY: 'File is empty. Please upload a valid document.',
  PIN_INVALID: 'Please enter a valid 6-digit PIN.',
  OTP_INVALID: 'Please enter the 6-digit code from your email.',
  PASSWORDS_DONT_MATCH: 'Passwords do not match.',
});

// ═══════════════════════════════════════════════════════════
// App metadata
// ═══════════════════════════════════════════════════════════

/**
 * Application metadata.
 * @readonly
 */
export const APP_META = Object.freeze({
  NAME: 'PrintPass',
  VERSION: '1.0.0',
  TAGLINE: 'PRINT • PICKUP • DONE',
  SUPPORT_EMAIL: 'support@printpass.app',
});

/**
 * Pagination defaults — for future list endpoints.
 * @readonly
 */
export const DEFAULT_PAGINATION = Object.freeze({
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
});
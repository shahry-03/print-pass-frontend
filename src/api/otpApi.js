import api from './axios';

// ═══════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_REGEX = /^\d{6}$/;

/**
 * Validates and sanitizes an email address.
 */
const validateEmail = (email, actionName) => {
  const sanitized = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!sanitized || !EMAIL_REGEX.test(sanitized)) {
    throw new Error(`A valid email address is required for ${actionName}.`);
  }
  return sanitized;
};

/**
 * Validates and normalizes a 6-digit OTP.
 * 
 * IMPORTANT: Always pass OTP as a STRING from UI inputs.
 * JavaScript numbers strip leading zeroes (e.g., "012345" becomes 12345),
 * which silently breaks verification. This function warns in dev mode
 * if a numeric OTP is received to catch developer mistakes early.
 * 
 * @param {string} otp - The 6-digit OTP (always string)
 * @param {string} actionName - Used for readable error messages
 * @returns {string} Validated 6-digit OTP string
 */
const validateOtp = (otp, actionName) => {
  // Dev-time warning: OTP should always come in as a string
  if (import.meta.env.DEV && typeof otp === 'number') {
    console.warn(
      `[otpApi] OTP received as number (${otp}). This strips leading zeroes. ` +
      `Always pass OTP as a string from the UI input.`
    );
  }

  const strOtp = String(otp ?? '').trim();
  if (!OTP_REGEX.test(strOtp)) {
    throw new Error(`A valid 6-digit OTP is required for ${actionName}.`);
  }
  return strOtp;
};

// ═══════════════════════════════════════════════════════════
// OTP API Service
// ═══════════════════════════════════════════════════════════

export const otpApi = {
  /**
   * Verify a user's email using the 6-digit OTP sent to their inbox.
   * 
   * @param {Object} data - Verification payload
   * @param {string} data.email - User's email address
   * @param {string} data.otp - The 6-digit OTP code (always pass as STRING, not number)
   * @param {AbortSignal} [signal] - Optional AbortSignal to cancel the request
   * @returns {Promise<Object>} API response data confirming verification
   */
  verify: async (data, signal) => {
    if (!data || typeof data !== 'object') {
      throw new Error('Valid verification payload is required.');
    }

    const email = validateEmail(data.email, 'OTP verification');
    const otp = validateOtp(data.otp, 'OTP verification');

    const payload = { email, otp };
    const response = await api.post('/otp/verify', payload, { signal });
    return response.data;
  },

  /**
   * Resend a fresh OTP to the user's email address.
   * 
   * Backend typically enforces rate limiting (HTTP 429) on this endpoint.
   * UI should implement a cooldown timer (e.g., 60 seconds) to prevent spam.
   * 
   * @param {Object} data - Resend payload
   * @param {string} data.email - User's email address
   * @param {AbortSignal} [signal] - Optional AbortSignal to cancel the request
   * @returns {Promise<Object>} API response data confirming the resend
   */
  resend: async (data, signal) => {
    if (!data || typeof data !== 'object') {
      throw new Error('Valid resend payload is required.');
    }

    const email = validateEmail(data.email, 'OTP resend');

    const payload = { email };
    const response = await api.post('/otp/resend', payload, { signal });
    return response.data;
  },
};
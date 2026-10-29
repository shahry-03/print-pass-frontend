import api from './axios';

// ═══════════════════════════════════════════════════════════
// Validation Helpers
// ═══════════════════════════════════════════════════════════

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
const PHONE_REGEX = /^\+?[0-9]{10,15}$/;

/**
 * Validates and sanitizes an email address.
 */
const validateEmail = (email) => {
  const sanitized = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!sanitized || !EMAIL_REGEX.test(sanitized)) {
    throw new Error('A valid email address is required.');
  }
  return sanitized;
};

/**
 * Validates password strength.
 * NOTE: Never trim passwords — spaces may be valid characters.
 */
const validatePassword = (password) => {
  if (typeof password !== 'string' || !PASSWORD_REGEX.test(password)) {
    throw new Error('Password must be at least 8 characters with 1 letter and 1 number.');
  }
  return password;
};

/**
 * Validates and sanitizes phone numbers.
 * Strips spaces, dashes, and parentheses for formatting tolerance.
 * 
 * Examples accepted: "+92 300 1234567", "+1-555-0199", "(0300) 1234567"
 */
const validatePhone = (phone) => {
  const raw = typeof phone === 'string' ? phone.trim() : '';
  // Remove spaces, dashes, and parentheses before validation
  const clean = raw.replace(/[\s\-()]/g, '');
  if (!clean || !PHONE_REGEX.test(clean)) {
    throw new Error('A valid phone number is required (10-15 digits, optional + prefix).');
  }
  return clean;
};

/**
 * Validates a required string field with optional max length.
 */
const validateString = (value, fieldName, maxLength = 255) => {
  const sanitized = typeof value === 'string' ? value.trim() : '';
  if (!sanitized) {
    throw new Error(`${fieldName} is required.`);
  }
  if (sanitized.length > maxLength) {
    throw new Error(`${fieldName} must be ${maxLength} characters or less.`);
  }
  return sanitized;
};

/**
 * Validates a shop ID.
 * Rejects null/undefined/empty strings/booleans/objects.
 * Allows 0 as a valid numeric ID.
 */
const validateShopId = (shopId) => {
  const type = typeof shopId;
  if (
    shopId === undefined ||
    shopId === null ||
    shopId === '' ||
    type === 'boolean' ||
    type === 'object'
  ) {
    throw new Error('A valid Shop ID is required.');
  }
  return shopId;
};

/**
 * Defense-in-depth path safety.
 */
const safePath = (segment) => encodeURIComponent(String(segment));

// ═══════════════════════════════════════════════════════════
// Shop API Service
// ═══════════════════════════════════════════════════════════

export const shopApi = {
  /**
   * Register a new print shop.
   * 
   * @param {Object} data - Shop registration payload
   * @param {string} data.email - Owner's email address
   * @param {string} data.password - Account password (min 8 chars, letter + number)
   * @param {string} data.shopName - Name of the shop
   * @param {string} data.ownerName - Owner's full name
   * @param {string} data.phone - Contact phone number
   * @param {string} data.address - Shop address
   * @param {string} data.city - Shop city
   * @param {AbortSignal} [signal] - Optional AbortSignal to cancel the request
   * @returns {Promise<Object>} Registration response (triggers OTP verification)
   */
  register: async (data, signal) => {
    if (!data || typeof data !== 'object') {
      throw new Error('Valid registration payload is required.');
    }

    const payload = {
      email: validateEmail(data.email),
      password: validatePassword(data.password),
      shopName: validateString(data.shopName, 'Shop name', 100),
      ownerName: validateString(data.ownerName, 'Owner name', 100),
      phone: validatePhone(data.phone),
      address: validateString(data.address, 'Address', 255),
      city: validateString(data.city, 'City', 100),
    };

    const response = await api.post('/shops/register', payload, { signal });
    return response.data;
  },

  /**
   * Fetch all shops belonging to the authenticated owner.
   * 
   * @param {AbortSignal} [signal] - Optional AbortSignal to cancel the request
   * @returns {Promise<Array>} List of shop objects
   */
  getMyShops: async (signal) => {
    const response = await api.get('/shops/my-shops', { signal });
    return response.data;
  },

  /**
   * Update an existing shop's profile details.
   * 
   * Supports partial updates: only fields provided in `data` will be validated and sent.
   * Email and password are intentionally immutable through this endpoint.
   * 
   * @param {string|number} shopId - The unique identifier of the shop
   * @param {Object} data - Fields to update (any subset of: shopName, ownerName, phone, address, city)
   * @param {AbortSignal} [signal] - Optional AbortSignal to cancel the request
   * @returns {Promise<Object>} Updated shop details
   */
  updateShop: async (shopId, data, signal) => {
    const validId = validateShopId(shopId);

    if (!data || typeof data !== 'object') {
      throw new Error('Valid update payload is required.');
    }

    // Partial-update friendly: only validate fields that are actually provided
    const payload = {};
    if (data.shopName !== undefined) payload.shopName = validateString(data.shopName, 'Shop name', 100);
    if (data.ownerName !== undefined) payload.ownerName = validateString(data.ownerName, 'Owner name', 100);
    if (data.phone !== undefined) payload.phone = validatePhone(data.phone);
    if (data.address !== undefined) payload.address = validateString(data.address, 'Address', 255);
    if (data.city !== undefined) payload.city = validateString(data.city, 'City', 100);

    if (Object.keys(payload).length === 0) {
      throw new Error('At least one field is required for update.');
    }

    const response = await api.put(`/shops/${safePath(validId)}`, payload, { signal });
    return response.data;
  },
};
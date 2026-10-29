import api from './axios';

/**
 * Authentication API Service
 * Handles user authentication, session management, and profile fetching.
 */
export const authApi = {
  /**
   * Authenticate a user with their credentials.
   * 
   * @param {Object} credentials - User login credentials
   * @param {string} credentials.email - User's email address
   * @param {string} credentials.password - User's password
   * @param {AbortSignal} [signal] - Optional AbortSignal to cancel the request
   * @returns {Promise<Object>} API response data (token, role, email, expiresIn)
   */
  login: async (credentials, signal) => {
    if (!credentials || typeof credentials !== 'object') {
      throw new Error('Valid credentials object is required for login.');
    }

    // Sanitize email: trim whitespace and convert to lowercase
    const email = typeof credentials.email === 'string' ? credentials.email.trim().toLowerCase() : '';
    
    // Do NOT trim password (spaces can be valid characters in passwords)
    const password = credentials.password;

    if (!email || !password) {
      throw new Error('Valid email and password are required.');
    }

    const payload = { email, password };
    const response = await api.post('/auth/login', payload, { signal });
    return response.data;
  },

  /**
   * Invalidate the current session / logout the user.
   * (Useful if backend maintains a blacklist or session table)
   * 
   * @param {AbortSignal} [signal] - Optional AbortSignal
   * @returns {Promise<Object>} API response data
   */
  logout: async (signal) => {
    const response = await api.post('/auth/logout', null, { signal });
    return response.data;
  },

  /**
   * Fetch the currently authenticated user's profile.
   * Useful for restoring session state on page refresh.
   * 
   * @param {AbortSignal} [signal] - Optional AbortSignal
   * @returns {Promise<Object>} User profile data
   */
  getMe: async (signal) => {
    const response = await api.get('/auth/me', { signal });
    return response.data;
  },

  /**
   * Refresh an expired access token using a refresh token.
   * 
   * @param {string} refreshToken - The refresh token
   * @param {AbortSignal} [signal] - Optional AbortSignal
   * @returns {Promise<Object>} New token payload
   */
  refreshToken: async (refreshToken, signal) => {
    if (!refreshToken || typeof refreshToken !== 'string') {
      throw new Error('Valid refresh token is required.');
    }

    const response = await api.post('/auth/refresh', { refreshToken }, { signal });
    return response.data;
  },
};
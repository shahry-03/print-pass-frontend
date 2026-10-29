import api from './axios';

/**
 * Admin API Service
 * Handles all platform management endpoints for administrators.
 */
export const adminApi = {
  /**
   * Fetch all registered shops.
   * Supports pagination, filtering, and sorting.
   * 
   * @param {Object} [params] - Query parameters (e.g., { page: 1, limit: 10, search: 'xyz' })
   * @param {AbortSignal} [signal] - Optional AbortSignal for React Query cancellation
   * @returns {Promise<Object>} API response data
   */
  getAllShops: async (params = {}, signal) => {
    const response = await api.get('/admin/shops', {
      params,
      signal,
    });
    return response.data;
  },

  /**
   * Verify a specific shop by its ID.
   * 
   * @param {string|number} shopId - The unique identifier of the shop
   * @param {AbortSignal} [signal] - Optional AbortSignal to cancel the request
   * @returns {Promise<Object>} API response data
   */
  verifyShop: async (shopId, signal) => {
    // Safe falsy check (allows 0 as a valid numeric ID)
    if (shopId === undefined || shopId === null || shopId === '') {
      throw new Error('Valid Shop ID is required for verification.');
    }
    
    // PATCH request body is null, passing signal in config
    const response = await api.patch(`/admin/shops/${shopId}/verify`, null, { signal });
    return response.data;
  },

  /**
   * Toggle the active/blocked status of a shop.
   * 
   * @param {string|number} shopId - The unique identifier of the shop
   * @param {Object} [payload] - Optional payload if backend requires a reason (e.g., { reason: 'Violation' })
   * @param {AbortSignal} [signal] - Optional AbortSignal to cancel the request
   * @returns {Promise<Object>} API response data
   */
  toggleShopStatus: async (shopId, payload = {}, signal) => {
    // Safe falsy check (allows 0 as a valid numeric ID)
    if (shopId === undefined || shopId === null || shopId === '') {
      throw new Error('Valid Shop ID is required to toggle status.');
    }
    
    const response = await api.patch(`/admin/shops/${shopId}/toggle-status`, payload, { signal });
    return response.data;
  },
};